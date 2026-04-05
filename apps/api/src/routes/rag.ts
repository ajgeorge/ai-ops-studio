import {
  askRagQuestionRequestSchema,
  askRagQuestionResponseSchema,
  createRagDocumentRequestSchema,
  ragDocumentDetailSchema,
  ragDocumentSummarySchema
} from "@ai-ops-studio/shared";
import { Router } from "express";

import {
  askRagQuestion,
  createRagDocument,
  getRagDocument,
  listRagDocuments,
  RagEntityNotFoundError
} from "../modules/rag/rag.service.js";

export const ragRouter = Router();

function handleRagError(error: unknown, response: import("express").Response) {
  if (error instanceof RagEntityNotFoundError) {
    response.status(404).json({
      error: {
        message: error.message
      }
    });
    return true;
  }

  return false;
}

ragRouter.get("/documents", async (_request, response, next) => {
  try {
    const documents = await listRagDocuments();
    response.json(ragDocumentSummarySchema.array().parse(documents));
  } catch (error) {
    next(error);
  }
});

ragRouter.post("/documents", async (request, response, next) => {
  try {
    const payload = createRagDocumentRequestSchema.parse(request.body);
    const document = await createRagDocument(payload);
    response.status(201).json(ragDocumentDetailSchema.parse(document));
  } catch (error) {
    next(error);
  }
});

ragRouter.get("/documents/:documentId", async (request, response, next) => {
  try {
    const document = await getRagDocument(request.params.documentId);
    response.json(ragDocumentDetailSchema.parse(document));
  } catch (error) {
    if (handleRagError(error, response)) {
      return;
    }

    next(error);
  }
});

ragRouter.post("/ask", async (request, response, next) => {
  try {
    const payload = askRagQuestionRequestSchema.parse(request.body);
    const answer = await askRagQuestion(payload.documentId, payload.question);
    response.status(201).json(askRagQuestionResponseSchema.parse(answer));
  } catch (error) {
    if (handleRagError(error, response)) {
      return;
    }

    next(error);
  }
});
