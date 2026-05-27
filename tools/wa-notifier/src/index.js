import express from 'express';
import qrcode from 'qrcode-terminal';
import pino from 'pino';

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const AUTH_DIR = process.env.WA_AUTH_DIR || './auth';
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN || '';
const WHATSAPP_GROUP_JID = process.env.WHATSAPP_GROUP_JID || '';

let sock = null;
let isReady = false;
let isConnecting = false;

function log(message, data = {}) {
  console.log(
    JSON.stringify({
      time: new Date().toISOString(),
      message,
      ...data,
    }),
  );
}

function withTimeout(promise, ms, errorMessage) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timeoutId);
  });
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

  const groups = await withTimeout(
    sock.groupFetchAllParticipating(),
    15000,
    'Listing WhatsApp groups timed out',
  );

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

  return await withTimeout(
    sock.sendMessage(WHATSAPP_GROUP_JID, {
      text: String(text).slice(0, 4096),
    }),
    20000,
    'Sending WhatsApp message timed out',
  );
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
        console.log('\nScan this QR code using WhatsApp Linked Devices:\n');
        qrcode.generate(qr, { small: true });
        console.log('');
      }

      if (connection === 'open') {
        isReady = true;
        isConnecting = false;

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
          log('Logged out. Delete auth folder and scan QR again.');
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

app.use((req, res, next) => {
  log('HTTP request', {
    method: req.method,
    url: req.url,
  });

  next();
});

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'WasteGrab WhatsApp notifier',
  });
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    whatsappReady: isReady,
    hasSocket: Boolean(sock),
    hasGroupJid: Boolean(WHATSAPP_GROUP_JID),
    groupJid: WHATSAPP_GROUP_JID || null,
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

    log('Sending WhatsApp notification', {
      groupJid: WHATSAPP_GROUP_JID,
      messageLength: message.length,
    });

    const result = await sendGroupMessage(message);

    res.json({
      ok: true,
      messageId: result?.key?.id || null,
    });
  } catch (error) {
    log('Notify failed', {
      error: error.message,
    });

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found',
    method: req.method,
    path: req.path,
  });
});

app.listen(PORT, HOST, () => {
  log('WA notifier started', {
    host: HOST,
    port: PORT,
    authDir: AUTH_DIR,
  });
});

connectWhatsApp().catch((error) => {
  log('Initial WhatsApp connect failed', {
    error: error.message,
  });
});