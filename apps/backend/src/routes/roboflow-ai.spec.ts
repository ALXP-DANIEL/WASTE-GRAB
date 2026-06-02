import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import roboflowAI from "./roboflow-ai.js";
import axios from "axios";
import sharp from "sharp";
import { getCurrentUserFromRequest } from "../services/auth.service.js";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn(() => false),
  },
}));

vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    rotate: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from("processed-image")),
  })),
}));

vi.mock("../prisma.js", () => ({
  prisma: {
    wasteCategory: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "plastic-id",
          name: "Plastic",
          pointsPerKg: 2,
          averageWeightKg: 1,
        },
        {
          id: "paper-id",
          name: "Paper",
          pointsPerKg: 1,
          averageWeightKg: 2,
        },
      ]),
    },
  },
}));

vi.mock("../services/auth.service.js", () => ({
  getCurrentUserFromRequest: vi.fn(),
}));

describe("roboflow AI route", () => {
  const app = express().use("/api/roboflow-ai", roboflowAI);

  beforeEach(() => {
    process.env.ROBOFLOW_API_KEY = "test-key";
    vi.clearAllMocks();
    vi.mocked(getCurrentUserFromRequest).mockResolvedValue({
      id: "user-id",
      name: "Test User",
      email: "test@example.com",
      phone: null,
      role: "CUSTOMER",
      profileImageUrl: null,
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    });
  });

  it("rejects anonymous image analysis requests", async () => {
    vi.mocked(getCurrentUserFromRequest).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/roboflow-ai/analyze-image")
      .attach("images", Buffer.from("first"), {
        filename: "first.jpg",
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(401);
    expect(axios.post).not.toHaveBeenCalled();
    expect(sharp).not.toHaveBeenCalled();
  });

  it("analyzes every uploaded image and aggregates detected categories", async () => {
    vi.mocked(axios.post)
      .mockResolvedValueOnce({
        data: {
          outputs: [
            {
              predictions: {
                predictions: [{ class: "Plastic" }],
              },
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          outputs: [
            {
              predictions: {
                predictions: [{ class: "Plastic" }, { class: "Paper" }],
              },
            },
          ],
        },
      });

    const response = await request(app)
      .post("/api/roboflow-ai/analyze-image")
      .attach("images", Buffer.from("first"), {
        filename: "first.jpg",
        contentType: "image/jpeg",
      })
      .attach("images", Buffer.from("second"), {
        filename: "second.jpg",
        contentType: "image/jpeg",
      });

    expect(response.status).toBe(200);
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(sharp).toHaveBeenCalledTimes(2);
    expect(response.body).toMatchObject({
      success: true,
      result: {
        detectedWaste: ["Plastic", "Paper"],
        images: [
          {
            index: 0,
            totalItems: 1,
            detectedCategories: [
              {
                id: "plastic-id",
                name: "Plastic",
                count: 1,
                estimatedWeight: 1,
                points: 2,
              },
            ],
          },
          {
            index: 1,
            totalItems: 2,
            detectedCategories: [
              {
                id: "plastic-id",
                name: "Plastic",
                count: 1,
                estimatedWeight: 1,
                points: 2,
              },
              {
                id: "paper-id",
                name: "Paper",
                count: 1,
                estimatedWeight: 2,
                points: 2,
              },
            ],
          },
        ],
        counts: {
          Plastic: 2,
          Paper: 1,
        },
        totalItems: 3,
        estimatedWeight: 4,
        points: 6,
        size: "Small",
        recyclable: "Yes",
      },
    });
    expect(response.body.result.detectedCategories).toEqual([
      {
        id: "plastic-id",
        name: "Plastic",
        count: 2,
        estimatedWeight: 2,
        points: 4,
      },
      {
        id: "paper-id",
        name: "Paper",
        count: 1,
        estimatedWeight: 2,
        points: 2,
      },
    ]);
  });
});
