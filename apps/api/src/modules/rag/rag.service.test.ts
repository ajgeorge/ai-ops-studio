import { chunkDocument, retrieveChunksForQuestion, scoreChunkForQuestion } from "./rag.service.js";

const createdAt = new Date("2026-05-23T10:00:00.000Z");

describe("chunkDocument", () => {
  it("creates heading-aware chunks from markdown content", () => {
    const chunks = chunkDocument(`# SLA Policy
Battery requests should receive contact within 30 minutes.

## Escalation
Urgent jobs should be escalated after 45 minutes without assignment.`);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toMatchObject({
      heading: "SLA Policy",
      chunkIndex: 0
    });
    expect(chunks[1]).toMatchObject({
      heading: "Escalation",
      chunkIndex: 10
    });
  });
});

describe("retrieveChunksForQuestion", () => {
  it("ranks chunks by lexical overlap with the question", () => {
    const chunks = [
      {
        id: "chunk_1",
        documentId: "doc_1",
        chunkIndex: 0,
        heading: "Inventory",
        content: "Inventory items are reconciled at the end of each shift.",
        tokenCount: 12,
        createdAt
      },
      {
        id: "chunk_2",
        documentId: "doc_1",
        chunkIndex: 1,
        heading: "Escalation",
        content: "Urgent roadside jobs should be escalated after 45 minutes without assignment.",
        tokenCount: 14,
        createdAt
      }
    ];

    const results = retrieveChunksForQuestion("When should urgent jobs be escalated?", chunks);

    expect(results[0]?.id).toBe("chunk_2");
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0);
  });

  it("returns a stable score for individual chunks", () => {
    const score = scoreChunkForQuestion("battery request response", {
      heading: "Response targets",
      content: "Battery requests should receive first technician contact within 30 minutes."
    });

    expect(score).toBeGreaterThan(0.3);
  });
});
