import { TechnicianStatus } from "@prisma/client";

import { scoreTechnicianForJob } from "./operations.service.js";

const job = {
  requiredSkill: "Battery",
  latitude: 25.324,
  longitude: 51.531,
  slaDeadline: new Date(Date.now() + 20 * 60_000)
};

describe("scoreTechnicianForJob", () => {
  it("ranks a skilled available technician above a busier mismatch", () => {
    const skilled = scoreTechnicianForJob(
      {
        id: "tech_1",
        name: "Omar Hassan",
        skills: ["Battery", "Electrical"],
        status: TechnicianStatus.AVAILABLE,
        currentJobCount: 0,
        latitude: 25.325,
        longitude: 51.532
      },
      job
    );
    const mismatch = scoreTechnicianForJob(
      {
        id: "tech_2",
        name: "Daniel Reyes",
        skills: ["Tire"],
        status: TechnicianStatus.BUSY,
        currentJobCount: 2,
        latitude: 25.325,
        longitude: 51.532
      },
      job
    );

    expect(skilled.score).toBeGreaterThan(mismatch.score);
    expect(skilled.skillMatch).toBe(1);
    expect(mismatch.skillMatch).toBe(0);
  });

  it("keeps scoring deterministic when location is missing", () => {
    const result = scoreTechnicianForJob(
      {
        id: "tech_3",
        name: "Ahmed Khan",
        skills: ["Battery"],
        status: TechnicianStatus.AVAILABLE,
        currentJobCount: 1,
        latitude: null,
        longitude: null
      },
      job
    );

    expect(result.distanceKm).toBeNull();
    expect(result.distanceScore).toBe(0.35);
    expect(result.score).toBeGreaterThan(0);
  });
});
