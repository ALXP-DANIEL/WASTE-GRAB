import express from 'express';
import pino from 'pino';

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';

const PORT = Number(process.env.PORT || 3000);
const AUTH_DIR = process.env.WA_AUTH_DIR || './auth';
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN || '';
const WHATSAPP_GROUP_JID = process.env.WHATSAPP_GROUP_JID || '';
const WA_PAIRING_PHONE_NUMBER = process.env.WA_PAIRING_PHONE_NUMBER || '';

let sock = null;
let isReady = false;
let isConnecting = false;
let pairingRequested = false;

function log(message, data = {}) {
  console.log(
    JSON.stringify({
      time: new Date().toISOString(),
      message,
      ...data,
    }),
  );
}

function cleanPhoneNumber(phoneNumber) {
  return String(phoneNumber || '').replace(/[^\d]/g, '');
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!NOTIFY_TOKEN) {
    return res.status(500).json({
      ok: false,
      error: 'NOTIFY_TOKEN is missing on server',
    });
  }

  if (token !== NOTIFY_TOKEN) {
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized',
    });
  }

  return next();
}

async function listGroups() {
  if (!sock || !isReady) {
    throw new Error('WhatsApp is not ready yet');
  }

  const groups = await sock.groupFetchAllParticipating();

  return Object.entries(groups).map(([jid, group]) => ({
    jid,
    subject: group.subject,
    participants: group.participants?.length || 0,
  }));
}

async function sendGroupMessage(text) {
  if (!sock || !isReady) {
    throw new Error('WhatsApp is not ready yet');
  }

  if (!WHATSAPP_GROUP_JID) {
    throw new Error('WHATSAPP_GROUP_JID is missing');
  }

  if (!WHATSAPP_GROUP_JID.endsWith('@g.us')) {
    throw new Error('WHATSAPP_GROUP_JID must end with @g.us');
  }

  return await sock.sendMessage(WHATSAPP_GROUP_JID, {
    text: text.slice(0, 4096),
  });
}

function buildMessage(payload) {
  const title = payload.title || 'WasteGrab CI/CD';
  const status = payload.status || 'INFO';
  const branch = payload.branch || 'unknown';
  const commit = payload.commit || 'unknown';
  const runUrl = payload.runUrl || '';
  const prUrl = payload.prUrl || '';
  const failedJobs = Array.isArray(payload.failedJobs) ? payload.failedJobs : [];
  const extra = payload.extra || '';

  const lines = [
    title,
    '',
    `Status: ${status}`,
    `Branch: ${branch}`,
    `Commit: ${commit}`,
  ];

  if (failedJobs.length > 0) {
    lines.push(`Failed jobs: ${failedJobs.join(', ')}`);
  }

  if (runUrl) {
    lines.push(`Run: ${runUrl}`);
  }

  if (prUrl) {
    lines.push(`PR: ${prUrl}`);
  }

  if (extra) {
    lines.push('', String(extra));
  }

  return lines.join('\n');
}

async function requestPairingCodeIfNeeded() {
  if (!sock) {
    return;
  }

  if (pairingRequested) {
    return;
  }

  if (sock.authState.creds.registered) {
    return;
  }

  const phoneNumber = cleanPhoneNumber(WA_PAIRING_PHONE_NUMBER);

  if (!phoneNumber) {
    log('No WA_PAIRING_PHONE_NUMBER set. QR login would be needed.');
    return;
  }

  pairingRequested = true;

  setTimeout(async () => {
    try {
      const code = await sock.requestPairingCode(phoneNumber);

      console.log('\n========================================');
      console.log('WhatsApp pairing code:');
      console.log(code);
      console.log('========================================\n');

      log('Pairing code generated', {
        phoneNumber,
      });
    } catch (error) {
      pairingRequested = false;

      log('Failed to generate pairing code', {
        error: error.message,
      });
    }
  }, 3000);
}

async function connectWhatsApp() {
  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: ['WasteGrab CI Bot', 'Chrome', '1.0.0'],
      markOnlineOnConnect: false,
      syncFullHistory: false,
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        await requestPairingCodeIfNeeded();
      }

      if (connection === 'open') {
        isReady = true;
        isConnecting = false;
        pairingRequested = false;

        log('WhatsApp connected');

        try {
          const groups = await listGroups();

          console.log('\nYour WhatsApp groups:\n');

          for (const group of groups) {
            console.log(`${group.subject} => ${group.jid}`);
          }

          console.log('\nCurrent WHATSAPP_GROUP_JID:');
          console.log(WHATSAPP_GROUP_JID || 'not set');
          console.log('');
        } catch (error) {
          log('Could not list groups', {
            error: error.message,
          });
        }
      }

      if (connection === 'close') {
        isReady = false;
        isConnecting = false;

        const code = lastDisconnect?.error?.output?.statusCode;

        log('WhatsApp disconnected', {
          code,
        });

        if (code === DisconnectReason.loggedOut) {
          log('Logged out. Clear auth volume and pair again.');
          return;
        }

        setTimeout(() => {
          connectWhatsApp().catch((error) => {
            log('Reconnect failed', {
              error: error.message,
            });
          });
        }, 3000);
      }
    });
  } catch (error) {
    isReady = false;
    isConnecting = false;

    log('WhatsApp connect failed', {
      error: error.message,
    });

    setTimeout(() => {
      connectWhatsApp().catch((reconnectError) => {
        log('Reconnect failed', {
          error: reconnectError.message,
        });
      });
    }, 5000);
  }
}

const app = express();

app.use(express.json({ limit: '256kb' }));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    whatsappReady: isReady,
    hasGroupJid: Boolean(WHATSAPP_GROUP_JID),
    hasPairingPhoneNumber: Boolean(WA_PAIRING_PHONE_NUMBER),
  });
});

app.post('/groups', requireAuth, async (req, res) => {
  try {
    const groups = await listGroups();

    res.json({
      ok: true,
      groups,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.post('/notify', requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const message = payload.text ? String(payload.text) : buildMessage(payload);

    const result = await sendGroupMessage(message);

    res.json({
      ok: true,
      messageId: result?.key?.id || null,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  log('WA notifier started', {
    port: PORT,
    authDir: AUTH_DIR,
  });
});

connectWhatsApp().catch((error) => {
  log('Initial WhatsApp connect failed', {
    error: error.message,
  });
});