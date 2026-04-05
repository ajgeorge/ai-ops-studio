import { AppModule, Prisma, RagDocumentStatus } from "@prisma/client";
import type {
  AskRagQuestionResponse,
  CreateRagDocumentRequest,
  RagAnswerRecord,
  RagChunkRecord,
  RagDocumentDetail,
  RagDocumentSummary,
  RetrievedChunkRecord
} from "@ai-ops-studio/shared";

import { prisma } from "../../db/prisma.js";
import { runDemoAIWorkflow } from "../ai/ai-workflow.service.js";
import { ragAnswerSchema } from "../ai/workflow-schemas.js";

export class RagEntityNotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = "RagEntityNotFoundError";
  }
}

type ChunkDraft = {
  chunkIndex: number;
  heading: string | null;
  content: string;
  tokenCount: number;
};

type ChunkForRetrieval = {
  id: string;
  documentId: string;
  chunkIndex: number;
  heading: string | null;
  content: string;
  tokenCount: number;
  createdAt: Date;
};

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "are",
  "should",
  "into",
  "when",
  "what",
  "where",
  "which",
  "will",
  "can",
  "any",
  "after",
  "before",
  "without"
]);

function estimateTokenCount(text: string) {
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.25));
}

function normalizeTerms(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.has(term))
  );
}

function splitIntoWordWindows(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const windows: string[] = [];

  for (let index = 0; index < words.length; index += maxWords) {
    windows.push(words.slice(index, index + maxWords).join(" "));
  }

  return windows.length > 0 ? windows : [text.trim()];
}

export function chunkDocument(content: string): ChunkDraft[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const sections: Array<{ heading: string | null; content: string }> = [];
  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);

    if (headingMatch) {
      if (currentLines.join("\n").trim()) {
        sections.push({
          heading: currentHeading,
          content: currentLines.join("\n").trim()
        });
      }

      currentHeading = headingMatch[1]!.trim();
      currentLines = [];
      continue;
    }

    currentLines.push(line);
  }

  if (currentLines.join("\n").trim()) {
    sections.push({
      heading: currentHeading,
      content: currentLines.join("\n").trim()
    });
  }

  const baseSections =
    sections.length > 0
      ? sections
      : content
          .split(/\n\s*\n/)
          .map((paragraph) => ({ heading: null, content: paragraph.trim() }))
          .filter((section) => section.content);

  return baseSections.flatMap((section, sectionIndex) =>
    splitIntoWordWindows(section.content, 90).map((chunkContent, chunkOffset) => ({
      chunkIndex: sectionIndex * 10 + chunkOffset,
      heading: section.heading,
      content: chunkContent,
      tokenCount: estimateTokenCount(chunkContent)
    }))
  );
}

function mapChunk(chunk: ChunkForRetrieval): RagChunkRecord {
  return {
    id: chunk.id,
    documentId: chunk.documentId,
    chunkIndex: chunk.chunkIndex,
    heading: chunk.heading,
    content: chunk.content,
    tokenCount: chunk.tokenCount,
    createdAt: chunk.createdAt.toISOString()
  };
}

function mapAnswer(answer: {
  id: string;
  documentId: string;
  questionId: string;
  answer: string;
  citations: Prisma.JsonValue;
  latencyMs: number | null;
  score: number | null;
  createdAt: Date;
  question: { question: string };
  evaluations: Array<{
    id: string;
    faithfulness: number;
    completeness: number;
    citationCoverage: number;
    notes: string | null;
    createdAt: Date;
  }>;
}): RagAnswerRecord {
  return {
    id: answer.id,
    documentId: answer.documentId,
    questionId: answer.questionId,
    question: answer.question.question,
    answer: answer.answer,
    citations: answer.citations,
    latencyMs: answer.latencyMs,
    score: answer.score,
    createdAt: answer.createdAt.toISOString(),
    evaluations: answer.evaluations.map((evaluation) => ({
      id: evaluation.id,
      faithfulness: evaluation.faithfulness,
      completeness: evaluation.completeness,
      citationCoverage: evaluation.citationCoverage,
      notes: evaluation.notes,
      createdAt: evaluation.createdAt.toISOString()
    }))
  };
}

function mapDocumentSummary(document: {
  id: string;
  title: string;
  source: string | null;
  status: RagDocumentStatus;
  updatedAt: Date;
  _count: {
    chunks: number;
    answers: number;
  };
}): RagDocumentSummary {
  return {
    id: document.id,
    title: document.title,
    source: document.source,
    status: document.status,
    chunkCount: document._count.chunks,
    answerCount: document._count.answers,
    updatedAt: document.updatedAt.toISOString()
  };
}

export function scoreChunkForQuestion(question: string, chunk: Pick<ChunkForRetrieval, "heading" | "content">) {
  const questionTerms = normalizeTerms(question);
  const chunkTerms = normalizeTerms(`${chunk.heading ?? ""} ${chunk.content}`);

  if (questionTerms.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const term of questionTerms) {
    if (chunkTerms.has(term)) {
      overlap += 1;
    }
  }

  return overlap / questionTerms.size;
}

export function retrieveChunksForQuestion(
  question: string,
  chunks: ChunkForRetrieval[],
  limit = 4
): RetrievedChunkRecord[] {
  const scored = chunks
    .map((chunk) => ({
      ...mapChunk(chunk),
      score: Number(scoreChunkForQuestion(question, chunk).toFixed(3))
    }))
    .sort((left, right) => right.score - left.score || left.chunkIndex - right.chunkIndex);

  const positive = scored.filter((chunk) => chunk.score > 0);

  return (positive.length > 0 ? positive : scored).slice(0, limit);
}

export async function listRagDocuments() {
  const documents = await prisma.ragDocument.findMany({
    orderBy: {
      updatedAt: "desc"
    },
    include: {
      _count: {
        select: {
          chunks: true,
          answers: true
        }
      }
    }
  });

  return documents.map(mapDocumentSummary);
}

export async function getRagDocument(documentId: string): Promise<RagDocumentDetail> {
  const document = await prisma.ragDocument.findUnique({
    where: { id: documentId },
    include: {
      chunks: {
        orderBy: {
          chunkIndex: "asc"
        }
      },
      answers: {
        orderBy: {
          createdAt: "desc"
        },
        include: {
          question: true,
          evaluations: {
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      },
      _count: {
        select: {
          chunks: true,
          answers: true
        }
      }
    }
  });

  if (!document) {
    throw new RagEntityNotFoundError("Document", documentId);
  }

  return {
    ...mapDocumentSummary(document),
    content: document.content,
    chunks: document.chunks.map(mapChunk),
    answers: document.answers.map(mapAnswer)
  };
}

export async function createRagDocument(input: CreateRagDocumentRequest) {
  const chunks = chunkDocument(input.content);
  const document = await prisma.ragDocument.create({
    data: {
      title: input.title,
      source: input.source,
      status: RagDocumentStatus.READY,
      content: input.content,
      chunks: {
        create: chunks.map((chunk) => ({
          heading: chunk.heading,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          metadata: {
            generatedBy: "deterministic-chunker"
          }
        }))
      }
    },
    include: {
      _count: {
        select: {
          chunks: true,
          answers: true
        }
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "rag.document.created",
      module: AppModule.RAG,
      entityType: "RagDocument",
      entityId: document.id,
      metadata: {
        title: document.title,
        chunks: chunks.length
      }
    }
  });

  return getRagDocument(document.id);
}

export async function askRagQuestion(
  documentId: string,
  questionText: string
): Promise<AskRagQuestionResponse> {
  const document = await prisma.ragDocument.findUnique({
    where: { id: documentId },
    include: {
      chunks: {
        orderBy: {
          chunkIndex: "asc"
        }
      }
    }
  });

  if (!document) {
    throw new RagEntityNotFoundError("Document", documentId);
  }

  const retrievedChunks = retrieveChunksForQuestion(questionText, document.chunks);
  const aiRun = await runDemoAIWorkflow("rag.answerWithContext", {
    documentId,
    question: questionText,
    contextChunks: retrievedChunks.map((chunk) => ({
      id: chunk.id,
      heading: chunk.heading,
      content: chunk.content,
      score: chunk.score
    }))
  });
  const generatedAnswer = ragAnswerSchema.parse(aiRun.output);
  const question = await prisma.ragQuestion.create({
    data: {
      question: questionText
    }
  });
  const evaluation = generatedAnswer.evaluation;
  const answer = await prisma.ragAnswer.create({
    data: {
      questionId: question.id,
      documentId,
      answer: generatedAnswer.answer,
      citations: generatedAnswer.citations as Prisma.InputJsonValue,
      latencyMs: aiRun.latencyMs,
      score: Number(
        ((evaluation.faithfulness + evaluation.completeness + evaluation.citationCoverage) / 3).toFixed(
          3
        )
      ),
      evaluations: {
        create: {
          faithfulness: evaluation.faithfulness,
          completeness: evaluation.completeness,
          citationCoverage: evaluation.citationCoverage,
          notes: "Lightweight mock evaluation based on retrieved context and citation coverage."
        }
      }
    },
    include: {
      question: true,
      evaluations: true
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "rag.answer.created",
      module: AppModule.RAG,
      entityType: "RagAnswer",
      entityId: answer.id,
      metadata: {
        documentId,
        questionId: question.id,
        aiRunId: aiRun.runId,
        retrievedChunks: retrievedChunks.map((chunk) => chunk.id)
      }
    }
  });

  return {
    answer: mapAnswer(answer),
    retrievedChunks,
    aiRun
  };
}
