import { randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

for (const envPath of [
  resolve(workspaceRoot, ".env.local"),
  resolve(workspaceRoot, ".env"),
]) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false, quiet: true });
  }
}

const seedUsers = [
  {
    name: "Customer",
    email: "customer@test.com",
    role: "CUSTOMER" as const,
  },
  {
    name: "Admin",
    email: "admin@test.com",
    role: "ADMIN" as const,
  },
  {
    name: "Collector",
    email: "collector@test.com",
    role: "COLLECTOR" as const,
  },
];

const seedPassword = "ADae21!!";
const seedIds = {
  completedPickup: "11111111-1111-4111-8111-111111111111",
  ampangPickup: "99999999-9999-4999-8999-999999999999",
  cherasPickup: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  shahAlamPickup: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  puchongPickup: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  subangPickup: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  verifiedPickup: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  cancelledPickup: "ffffffff-ffff-4fff-8fff-ffffffffffff",
  cafeVoucher: "22222222-2222-4222-8222-222222222222",
  groceryVoucher: "33333333-3333-4333-8333-333333333333",
  inactiveVoucher: "44444444-4444-4444-8444-444444444444",
  groceryRedemption: "55555555-5555-4555-8555-555555555555",
  pickupEarnedLedger: "66666666-6666-4666-8666-666666666666",
  voucherRedeemedLedger: "77777777-7777-4777-8777-777777777777",
  adminAdjustmentLedger: "88888888-8888-4888-8888-888888888888",
};

const seedPickupRequestIds = [
  seedIds.completedPickup,
  seedIds.ampangPickup,
  seedIds.cherasPickup,
  seedIds.shahAlamPickup,
  seedIds.puchongPickup,
  seedIds.subangPickup,
  seedIds.verifiedPickup,
  seedIds.cancelledPickup,
];

const seedWasteCategories = [
  {
    name: "Plastic",
    pointsPerKg: 2,
    averageWeightKg: "0.030",
    isBanned: false,
    isHazardous: false,
    isAiDetectable: true,
    description: "Plastic bottles, containers, and clean recyclable plastic items",
  },
  {
    name: "Metal",
    pointsPerKg: 3,
    averageWeightKg: "0.100",
    isBanned: false,
    isHazardous: false,
    isAiDetectable: true,
    description: "Aluminum cans, steel tins, and other recyclable metal waste",
  },
  {
    name: "Paper",
    pointsPerKg: 1,
    averageWeightKg: "0.020",
    isBanned: false,
    isHazardous: false,
    isAiDetectable: true,
    description: "Paper, newspapers, magazines, and cardboard",
  },
  {
    name: "Glass",
    pointsPerKg: 1,
    averageWeightKg: "0.150",
    isBanned: false,
    isHazardous: false,
    isAiDetectable: true,
    description: "Glass bottles and jars",
  },
  {
    name: "Organic",
    pointsPerKg: 1,
    averageWeightKg: "0.050",
    isBanned: false,
    isHazardous: false,
    isAiDetectable: false,
    description: "Food waste and biodegradable material",
  },
  {
    name: "E-Waste",
    pointsPerKg: 2,
    averageWeightKg: "0.300",
    isBanned: false,
    isHazardous: true,
    isAiDetectable: false,
    description: "Electronic waste that requires special hazardous handling",
  },
  {
    name: "Medical Waste",
    pointsPerKg: 0,
    averageWeightKg: "0.050",
    isBanned: true,
    isHazardous: true,
    isAiDetectable: false,
    description: "Banned medical or biohazard waste",
  },
];

export async function seedLocalData() {
  await seedLocalUsers();
  await seedLocalCustomerAddress();
  await seedLocalWasteCategories();
  await seedLocalVouchersAndRewards();
}

export async function seedLocalUsers() {
  const { prisma } = await import("../src/prisma.js");
  const passwordHash = hashPassword(seedPassword);

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
  }

  console.log("Seeded local users: customer@test.com, admin@test.com, collector@test.com");
}

export async function seedLocalCustomerAddress() {
  const { prisma } = await import("../src/prisma.js");
  const { createAddress } = await import("../src/services/address.service.js");

  const customer = await prisma.user.findUnique({
    where: {
      email: "customer@test.com",
    },
  });

  if (!customer) {
    throw new Error("Customer user must be seeded before customer address.");
  }

  const existingHomeAddress = await prisma.address.findFirst({
    where: {
      userId: customer.id,
      label: "Home",
    },
  });

  if (!existingHomeAddress) {
    await createAddress(customer.id, {
      label: "Home",
      street: "123 Main Street",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postalCode: "50000",
      formattedAddress: "123 Main Street, Kuala Lumpur, Kuala Lumpur 50000",
      latitude: 3.1543,
      longitude: 101.7042,
      notes: "Default customer seed address",
    });
  }

  const existingOfficeAddress = await prisma.address.findFirst({
    where: {
      userId: customer.id,
      label: "Office",
    },
  });

  if (!existingOfficeAddress) {
    await createAddress(customer.id, {
      label: "Office",
      street: "88 Jalan Bukit Bintang",
      city: "Kuala Lumpur",
      state: "Kuala Lumpur",
      postalCode: "55100",
      formattedAddress: "88 Jalan Bukit Bintang, Kuala Lumpur, Kuala Lumpur 55100",
      latitude: 3.1466,
      longitude: 101.7116,
      notes: "Secondary customer seed address",
    });
  }

  console.log("Seeded customer address for customer@test.com.");
}

export async function seedLocalWasteCategories() {
  const { prisma } = await import("../src/prisma.js");

  for (const category of seedWasteCategories) {
    const existing = await prisma.wasteCategory.findFirst({
      where: {
        name: category.name,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (existing) {
      await prisma.wasteCategory.update({
        where: {
          id: existing.id,
        },
        data: category,
      });
      continue;
    }

    await prisma.wasteCategory.create({
      data: category,
    });
  }

  console.log("Seeded local waste categories.");
}

export async function seedLocalVouchersAndRewards() {
  const { prisma } = await import("../src/prisma.js");
  const {
    PickupStatus,
    PointLedgerStatus,
    PointLedgerType,
    VoucherRedemptionStatus,
    VoucherStatus,
  } = await import("../src/generated/prisma/enums.js");

  const [customer, collector, paper, glass, plastic] = await Promise.all([
    prisma.user.findUnique({ where: { email: "customer@test.com" } }),
    prisma.user.findUnique({ where: { email: "collector@test.com" } }),
    prisma.wasteCategory.findFirst({ where: { name: "Paper" } }),
    prisma.wasteCategory.findFirst({ where: { name: "Glass" } }),
    prisma.wasteCategory.findFirst({ where: { name: "Plastic" } }),
  ]);

  if (!customer || !collector || !paper || !glass || !plastic) {
    throw new Error("Users and waste categories must be seeded before vouchers and rewards.");
  }

  await prisma.voucher.upsert({
    where: { id: seedIds.cafeVoucher },
    update: {
      title: "Cafe Drink Voucher",
      description: "Redeem for one selected drink at participating cafes.",
      pointsCost: 40,
      code: "CAFE40",
      stock: 25,
      status: VoucherStatus.ACTIVE,
      startsAt: null,
      expiresAt: new Date("2026-12-31T15:59:59.000Z"),
    },
    create: {
      id: seedIds.cafeVoucher,
      title: "Cafe Drink Voucher",
      description: "Redeem for one selected drink at participating cafes.",
      pointsCost: 40,
      code: "CAFE40",
      stock: 25,
      status: VoucherStatus.ACTIVE,
      expiresAt: new Date("2026-12-31T15:59:59.000Z"),
    },
  });

  await prisma.voucher.upsert({
    where: { id: seedIds.groceryVoucher },
    update: {
      title: "Grocery Discount",
      description: "Small grocery rebate for consistent recycling activity.",
      pointsCost: 200,
      code: "GROCERY200",
      stock: 9,
      status: VoucherStatus.ACTIVE,
      startsAt: null,
      expiresAt: new Date("2026-10-31T15:59:59.000Z"),
    },
    create: {
      id: seedIds.groceryVoucher,
      title: "Grocery Discount",
      description: "Small grocery rebate for consistent recycling activity.",
      pointsCost: 200,
      code: "GROCERY200",
      stock: 9,
      status: VoucherStatus.ACTIVE,
      expiresAt: new Date("2026-10-31T15:59:59.000Z"),
    },
  });

  await prisma.voucher.upsert({
    where: { id: seedIds.inactiveVoucher },
    update: {
      title: "Transit Credit",
      description: "Inactive sample reward kept for admin status testing.",
      pointsCost: 300,
      code: null,
      stock: null,
      status: VoucherStatus.INACTIVE,
      startsAt: null,
      expiresAt: null,
    },
    create: {
      id: seedIds.inactiveVoucher,
      title: "Transit Credit",
      description: "Inactive sample reward kept for admin status testing.",
      pointsCost: 300,
      status: VoucherStatus.INACTIVE,
    },
  });

  await prisma.pointLedger.deleteMany({
    where: {
      OR: [
        { id: seedIds.pickupEarnedLedger },
        {
          pickupRequestId: {
            in: seedPickupRequestIds,
          },
        },
      ],
    },
  });

  await prisma.pickupRequest.deleteMany({
    where: {
      id: {
        in: seedPickupRequestIds,
      },
    },
  });

  await prisma.pickupRequest.upsert({
    where: { id: seedIds.completedPickup },
    update: {
      userId: customer.id,
      collectorId: collector.id,
      addressText: "123 Main Street, Kuala Lumpur, Kuala Lumpur 50000",
      latitude: "3.1543000",
      longitude: "101.7042000",
      status: PickupStatus.COMPLETED,
      aiClassificationLabel: "Paper, Glass, Plastic",
      aiSuggestedPayload: {
        source: "seed-ai",
        detectedAt: "2026-05-20T04:00:00.000Z",
        summary: {
          totalItems: 3,
          estimatedWeight: 7,
          points: 9,
        },
        items: [
          {
            categoryId: paper.id,
            categoryName: "Paper",
            detectedCount: 1,
            estimatedWeight: 4,
            points: 4,
          },
          {
            categoryId: glass.id,
            categoryName: "Glass",
            detectedCount: 1,
            estimatedWeight: 2,
            points: 2,
          },
        ],
      },
      notes: "Seed completed pickup for reward ledger demo.",
      completedAt: new Date("2026-05-20T04:30:00.000Z"),
      items: {
        deleteMany: {},
        create: [
          {
            categoryId: paper.id,
            estimatedWeight: "4.00",
            actualWeight: "4.50",
          },
          {
            categoryId: glass.id,
            estimatedWeight: "2.00",
            actualWeight: "2.20",
          },
          {
            categoryId: plastic.id,
            estimatedWeight: "1.00",
            actualWeight: "1.30",
          },
        ],
      },
    },
    create: {
      id: seedIds.completedPickup,
      userId: customer.id,
      collectorId: collector.id,
      addressText: "123 Main Street, Kuala Lumpur, Kuala Lumpur 50000",
      latitude: "3.1543000",
      longitude: "101.7042000",
      status: PickupStatus.COMPLETED,
      aiClassificationLabel: "Paper, Glass, Plastic",
      aiSuggestedPayload: {
        source: "seed-ai",
        detectedAt: "2026-05-20T04:00:00.000Z",
        summary: {
          totalItems: 3,
          estimatedWeight: 7,
          points: 9,
        },
        items: [
          {
            categoryId: paper.id,
            categoryName: "Paper",
            detectedCount: 1,
            estimatedWeight: 4,
            points: 4,
          },
          {
            categoryId: glass.id,
            categoryName: "Glass",
            detectedCount: 1,
            estimatedWeight: 2,
            points: 2,
          },
        ],
      },
      notes: "Seed completed pickup for reward ledger demo.",
      completedAt: new Date("2026-05-20T04:30:00.000Z"),
      items: {
        create: [
          {
            categoryId: paper.id,
            estimatedWeight: "4.00",
            actualWeight: "4.50",
          },
          {
            categoryId: glass.id,
            estimatedWeight: "2.00",
            actualWeight: "2.20",
          },
          {
            categoryId: plastic.id,
            estimatedWeight: "1.00",
            actualWeight: "1.30",
          },
        ],
      },
    },
  });

  const seedPickupRequests = [
    {
      id: seedIds.ampangPickup,
      collectorId: null,
      addressText: "Jalan Ampang, Kuala Lumpur 50450",
      latitude: "3.1599000",
      longitude: "101.7362000",
      status: PickupStatus.PENDING,
      aiClassificationLabel: "Paper, Plastic",
      notes: "Seed available pickup near Ampang.",
      aiSuggestedPayload: null,
      createdAt: new Date("2026-06-01T02:20:00.000Z"),
      completedAt: null,
      items: [
        { categoryId: paper.id, estimatedWeight: "3.20", actualWeight: null },
        { categoryId: plastic.id, estimatedWeight: "1.80", actualWeight: null },
      ],
    },
    {
      id: seedIds.cherasPickup,
      collectorId: null,
      addressText: "Taman Connaught, Cheras, Kuala Lumpur 56000",
      latitude: "3.0804000",
      longitude: "101.7368000",
      status: PickupStatus.PENDING,
      aiClassificationLabel: "Glass, Plastic",
      notes: "Seed available pickup near Cheras.",
      aiSuggestedPayload: null,
      createdAt: new Date("2026-06-01T03:40:00.000Z"),
      completedAt: null,
      items: [
        { categoryId: glass.id, estimatedWeight: "2.40", actualWeight: null },
        { categoryId: plastic.id, estimatedWeight: "2.10", actualWeight: null },
      ],
    },
    {
      id: seedIds.shahAlamPickup,
      collectorId: null,
      addressText: "Seksyen 13, Shah Alam, Selangor 40100",
      latitude: "3.0733000",
      longitude: "101.5304000",
      status: PickupStatus.PENDING,
      aiClassificationLabel: "Paper, Glass",
      notes: "Seed available pickup near Shah Alam.",
      aiSuggestedPayload: null,
      createdAt: new Date("2026-06-01T05:10:00.000Z"),
      completedAt: null,
      items: [
        { categoryId: paper.id, estimatedWeight: "5.50", actualWeight: null },
        { categoryId: glass.id, estimatedWeight: "1.70", actualWeight: null },
      ],
    },
    {
      id: seedIds.puchongPickup,
      collectorId: collector.id,
      addressText: "Bandar Puchong Jaya, Selangor 47100",
      latitude: "3.0477000",
      longitude: "101.6174000",
      status: PickupStatus.ACCEPTED,
      aiClassificationLabel: "Paper, Plastic",
      notes: "Seed assigned pickup near Puchong.",
      aiSuggestedPayload: null,
      createdAt: new Date("2026-06-01T06:30:00.000Z"),
      completedAt: null,
      items: [
        { categoryId: paper.id, estimatedWeight: "4.20", actualWeight: null },
        { categoryId: plastic.id, estimatedWeight: "2.60", actualWeight: null },
      ],
    },
    {
      id: seedIds.subangPickup,
      collectorId: collector.id,
      addressText: "SS15 Subang Jaya, Selangor 47500",
      latitude: "3.0744000",
      longitude: "101.5889000",
      status: PickupStatus.ARRIVED,
      aiClassificationLabel: "Glass, Plastic",
      notes: "Seed assigned pickup near Subang Jaya.",
      aiSuggestedPayload: null,
      createdAt: new Date("2026-06-01T07:45:00.000Z"),
      completedAt: null,
      items: [
        { categoryId: glass.id, estimatedWeight: "2.80", actualWeight: null },
        { categoryId: plastic.id, estimatedWeight: "3.40", actualWeight: null },
      ],
    },
    {
      id: seedIds.verifiedPickup,
      collectorId: collector.id,
      addressText: "Mont Kiara, Kuala Lumpur 50480",
      latitude: "3.1698000",
      longitude: "101.6523000",
      status: PickupStatus.VERIFIED,
      aiClassificationLabel: "Paper, Glass, Plastic",
      notes: "Seed verified pickup awaiting completion.",
      aiSuggestedPayload: {
        source: "seed-ai",
        detectedAt: "2026-06-01T08:00:00.000Z",
        summary: {
          totalItems: 3,
          estimatedWeight: 5.3,
          points: 7,
        },
        items: [
          {
            categoryId: paper.id,
            categoryName: "Paper",
            detectedCount: 1,
            estimatedWeight: 2.5,
            points: 3,
          },
          {
            categoryId: plastic.id,
            categoryName: "Plastic",
            detectedCount: 1,
            estimatedWeight: 1.6,
            points: 3,
          },
        ],
      },
      createdAt: new Date("2026-06-01T08:30:00.000Z"),
      completedAt: null,
      items: [
        { categoryId: paper.id, estimatedWeight: "2.50", actualWeight: "2.70" },
        { categoryId: glass.id, estimatedWeight: "1.20", actualWeight: "1.30" },
        { categoryId: plastic.id, estimatedWeight: "1.60", actualWeight: "1.80" },
      ],
    },
    {
      id: seedIds.cancelledPickup,
      collectorId: null,
      addressText: "Kampung Baru, Kuala Lumpur 50300",
      latitude: "3.1659000",
      longitude: "101.7102000",
      status: PickupStatus.CANCELLED,
      aiClassificationLabel: "Plastic",
      notes: "Seed cancelled pickup for status testing.",
      aiSuggestedPayload: null,
      createdAt: new Date("2026-06-01T09:15:00.000Z"),
      completedAt: null,
      items: [
        { categoryId: plastic.id, estimatedWeight: "2.20", actualWeight: null },
      ],
    },
  ];

  for (const pickup of seedPickupRequests) {
    await prisma.pickupRequest.upsert({
      where: { id: pickup.id },
      update: {
        userId: customer.id,
        collectorId: pickup.collectorId,
        addressText: pickup.addressText,
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        status: pickup.status,
        aiClassificationLabel: pickup.aiClassificationLabel,
        aiSuggestedPayload: pickup.aiSuggestedPayload,
        notes: pickup.notes,
        completedAt: pickup.completedAt,
        createdAt: pickup.createdAt,
        items: {
          deleteMany: {},
          create: pickup.items,
        },
      },
      create: {
        id: pickup.id,
        userId: customer.id,
        collectorId: pickup.collectorId,
        addressText: pickup.addressText,
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        status: pickup.status,
        aiClassificationLabel: pickup.aiClassificationLabel,
        aiSuggestedPayload: pickup.aiSuggestedPayload,
        notes: pickup.notes,
        completedAt: pickup.completedAt,
        createdAt: pickup.createdAt,
        items: {
          create: pickup.items,
        },
      },
    });
  }

  await prisma.voucherRedemption.upsert({
    where: { id: seedIds.groceryRedemption },
    update: {
      userId: customer.id,
      voucherId: seedIds.groceryVoucher,
      pointsSpent: 200,
      status: VoucherRedemptionStatus.REDEEMED,
      redeemedCode: "GROCERY200",
      redeemedAt: new Date("2026-05-22T08:15:00.000Z"),
      cancelledAt: null,
    },
    create: {
      id: seedIds.groceryRedemption,
      userId: customer.id,
      voucherId: seedIds.groceryVoucher,
      pointsSpent: 200,
      status: VoucherRedemptionStatus.REDEEMED,
      redeemedCode: "GROCERY200",
      redeemedAt: new Date("2026-05-22T08:15:00.000Z"),
    },
  });

  await prisma.pointLedger.upsert({
    where: { id: seedIds.pickupEarnedLedger },
    update: {
      userId: customer.id,
      pickupRequestId: seedIds.completedPickup,
      voucherId: null,
      redemptionId: null,
      type: PointLedgerType.PICKUP_EARNED,
      status: PointLedgerStatus.POSTED,
      points: 231,
      balanceAfter: 231,
      description: "Points earned from completed seed pickup.",
      metadata: {
        actualWeightKg: 8,
      },
      createdAt: new Date("2026-05-20T04:30:30.000Z"),
    },
    create: {
      id: seedIds.pickupEarnedLedger,
      userId: customer.id,
      pickupRequestId: seedIds.completedPickup,
      type: PointLedgerType.PICKUP_EARNED,
      status: PointLedgerStatus.POSTED,
      points: 231,
      balanceAfter: 231,
      description: "Points earned from completed seed pickup.",
      metadata: {
        actualWeightKg: 8,
      },
      createdAt: new Date("2026-05-20T04:30:30.000Z"),
    },
  });

  await prisma.pointLedger.upsert({
    where: { id: seedIds.voucherRedeemedLedger },
    update: {
      userId: customer.id,
      pickupRequestId: null,
      voucherId: seedIds.groceryVoucher,
      redemptionId: seedIds.groceryRedemption,
      type: PointLedgerType.VOUCHER_REDEEMED,
      status: PointLedgerStatus.POSTED,
      points: -200,
      balanceAfter: 31,
      description: "Redeemed Grocery Discount.",
      metadata: {
        voucherTitle: "Grocery Discount",
      },
      createdAt: new Date("2026-05-22T08:15:00.000Z"),
    },
    create: {
      id: seedIds.voucherRedeemedLedger,
      userId: customer.id,
      voucherId: seedIds.groceryVoucher,
      redemptionId: seedIds.groceryRedemption,
      type: PointLedgerType.VOUCHER_REDEEMED,
      status: PointLedgerStatus.POSTED,
      points: -200,
      balanceAfter: 31,
      description: "Redeemed Grocery Discount.",
      metadata: {
        voucherTitle: "Grocery Discount",
      },
      createdAt: new Date("2026-05-22T08:15:00.000Z"),
    },
  });

  await prisma.pointLedger.upsert({
    where: { id: seedIds.adminAdjustmentLedger },
    update: {
      userId: customer.id,
      pickupRequestId: null,
      voucherId: null,
      redemptionId: null,
      type: PointLedgerType.ADMIN_ADJUSTMENT,
      status: PointLedgerStatus.POSTED,
      points: 25,
      balanceAfter: 56,
      description: "Seed admin bonus adjustment.",
      metadata: {
        reason: "Demo account setup",
      },
      createdAt: new Date("2026-05-23T02:00:00.000Z"),
    },
    create: {
      id: seedIds.adminAdjustmentLedger,
      userId: customer.id,
      type: PointLedgerType.ADMIN_ADJUSTMENT,
      status: PointLedgerStatus.POSTED,
      points: 25,
      balanceAfter: 56,
      description: "Seed admin bonus adjustment.",
      metadata: {
        reason: "Demo account setup",
      },
      createdAt: new Date("2026-05-23T02:00:00.000Z"),
    },
  });

  console.log("Seeded local vouchers, pickup requests, redemption logs, and point ledger.");
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

async function main() {
  const { prisma } = await import("../src/prisma.js");

  try {
    await seedLocalData();
  } catch (err: unknown) {
    console.error("Unable to seed local data.");
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
