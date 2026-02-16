import request from "supertest";

import { createApp } from "../app.js";

describe("GET /api/health", () => {
  it("returns the API health payload", async () => {
    const response = await request(createApp()).get("/api/health").expect(200);

    expect(response.body).toMatchObject({
      status: "ok",
      service: "ai-ops-studio-api",
      version: "0.1.0"
    });
    expect(response.body.modules).toContain("requirements");
    expect(response.body.modules).toContain("operations");
    expect(response.body.modules).toContain("rag");
  });
});
