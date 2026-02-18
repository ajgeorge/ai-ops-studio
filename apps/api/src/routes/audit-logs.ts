import { Router } from "express";

import { prisma } from "../db/prisma.js";

export const auditLogsRouter = Router();

auditLogsRouter.get("/", async (_request, response, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });

    response.json(
      logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString()
      }))
    );
  } catch (error) {
    next(error);
  }
});
