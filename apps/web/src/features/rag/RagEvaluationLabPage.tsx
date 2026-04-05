import type { AskRagQuestionResponse, RagDocumentSummary } from "@ai-ops-studio/shared";
import {
  FileQuestion,
  FileSearch,
  Layers,
  MessageSquareText,
  Plus,
  Sparkles
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  useAskRagQuestionMutation,
  useCreateRagDocumentMutation,
  useGetRagDocumentQuery,
  useGetRagDocumentsQuery
} from "../../app/api";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { MetricCard } from "../../components/ui/MetricCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusPill } from "../../components/ui/StatusPill";

const sampleDocument = `# Roadside Assistance SLA Policy
Battery and tire requests should receive first technician contact within 30 minutes. Dispatchers should prioritize urgent jobs when customers are stranded in active traffic.

## Escalation Policy
Urgent jobs should be escalated after 45 minutes without assignment. A supervisor should review delayed jobs and approve any exception to the target response time.

## Technician Dispatch SOP
Dispatchers should match technicians by required skill, current workload, distance to the customer, and SLA risk. The system should record who approved the final assignment.

## Customer Communication
Customers should receive clear status updates when a job is assigned, when the technician is en route, and when there is a delay.`;

const initialForm = {
  title: "Roadside Assistance SLA Policy",
  source: "sample-policy.md",
  content: sampleDocument
};

function statusTone(status: string) {
  if (status === "READY") {
    return "green" as const;
  }

  if (status === "FAILED") {
    return "red" as const;
  }

  return "amber" as const;
}

const documentColumns: Array<
  DataTableColumn<RagDocumentSummary & { onSelect: () => void; selected: boolean }>
> = [
  {
    header: "Document",
    cell: (document) => (
      <button type="button" onClick={document.onSelect} className="text-left">
        <span className="font-medium text-ink">{document.title}</span>
        <span className="block text-sm text-ink-muted">{document.source ?? "manual input"}</span>
      </button>
    )
  },
  {
    header: "Status",
    cell: (document) => <StatusPill label={document.status} tone={statusTone(document.status)} />
  },
  {
    header: "Chunks",
    align: "right",
    cell: (document) => document.chunkCount
  },
  {
    header: "Answers",
    align: "right",
    cell: (document) => document.answerCount
  }
];

function EvaluationMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{Math.round(value * 100)}%</p>
    </div>
  );
}

export function RagEvaluationLabPage() {
  const [form, setForm] = useState(initialForm);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [question, setQuestion] = useState("When should an urgent roadside job be escalated?");
  const [lastAnswer, setLastAnswer] = useState<AskRagQuestionResponse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: documents, isError: documentsError } = useGetRagDocumentsQuery();
  const { data: selectedDocument } = useGetRagDocumentQuery(selectedDocumentId ?? "", {
    skip: !selectedDocumentId
  });
  const [createDocument, createState] = useCreateRagDocumentMutation();
  const [askQuestion, askState] = useAskRagQuestionMutation();

  useEffect(() => {
    if (!selectedDocumentId && documents?.[0]) {
      setSelectedDocumentId(documents[0].id);
    }
  }, [documents, selectedDocumentId]);

  const documentRows = useMemo(
    () =>
      (documents ?? []).map((document) => ({
        ...document,
        selected: document.id === selectedDocumentId,
        onSelect: () => {
          setSelectedDocumentId(document.id);
          setLastAnswer(null);
        }
      })),
    [documents, selectedDocumentId]
  );

  const latestEvaluation = lastAnswer?.answer.evaluations[0] ?? selectedDocument?.answers[0]?.evaluations[0];
  const metrics = [
    {
      label: "Documents",
      value: String(documents?.length ?? 0),
      detail: "Indexed policy or SOP sources",
      tone: "teal" as const
    },
    {
      label: "Chunks",
      value: String(documents?.reduce((total, document) => total + document.chunkCount, 0) ?? 0),
      detail: "Searchable context sections",
      tone: "blue" as const
    },
    {
      label: "Answers",
      value: String(documents?.reduce((total, document) => total + document.answerCount, 0) ?? 0),
      detail: "Saved RAG responses",
      tone: "green" as const
    },
    {
      label: "Last score",
      value: `${Math.round((lastAnswer?.answer.score ?? selectedDocument?.answers[0]?.score ?? 0) * 100)}%`,
      detail: "Lightweight evaluation average",
      tone: "amber" as const
    }
  ];

  async function handleCreateDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);

    try {
      const document = await createDocument(form).unwrap();
      setSelectedDocumentId(document.id);
      setLastAnswer(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not create document.");
    }
  }

  async function handleAskQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDocumentId) {
      setActionError("Select a document before asking a question.");
      return;
    }

    setActionError(null);

    try {
      const answer = await askQuestion({ documentId: selectedDocumentId, question }).unwrap();
      setLastAnswer(answer);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not answer question.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RAG Evaluation Lab"
        title="Document Q&A with retrieved context"
        actions={<StatusPill label="Mock retrieval + evaluation" tone="blue" />}
      />

      {documentsError ? <ErrorState title="RAG documents are unavailable." /> : null}
      {actionError ? <ErrorState title={actionError} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={handleCreateDocument}
          className="rounded-md border border-slate-200 bg-white p-4 shadow-panel"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Add document</h3>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-medium text-ink">
              Title
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Source
              <input
                value={form.source}
                onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Content
              <textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                className="min-h-72 resize-y rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={createState.isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-signal-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Layers className="h-4 w-4" aria-hidden="true" />
              {createState.isLoading ? "Chunking" : "Create and chunk"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {documentRows.length > 0 ? (
            <DataTable columns={documentColumns} rows={documentRows} getRowKey={(document) => document.id} />
          ) : (
            <EmptyState icon={FileSearch} title="No RAG documents found" />
          )}

          <form onSubmit={handleAskQuestion} className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <h3 className="font-semibold text-ink">Ask selected document</h3>
            </div>
            <label className="mt-4 grid gap-1 text-sm font-medium text-ink">
              Question
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="min-h-24 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={askState.isLoading || !selectedDocumentId}
                className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {askState.isLoading ? "Retrieving" : "Ask question"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Retrieved chunks</h3>
          </div>
          <div className="mt-4 space-y-3">
            {(lastAnswer?.retrievedChunks ?? selectedDocument?.chunks.slice(0, 4) ?? []).map((chunk) => (
              <div key={chunk.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{chunk.heading ?? `Chunk ${chunk.chunkIndex}`}</p>
                  {"score" in chunk && typeof chunk.score === "number" ? (
                    <StatusPill label={`${Math.round(chunk.score * 100)}% match`} tone="blue" />
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-ink-muted">{chunk.content}</p>
              </div>
            ))}
            {!lastAnswer && !selectedDocument?.chunks.length ? (
              <EmptyState icon={FileSearch} title="No chunks available" />
            ) : null}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-ink">Answer and evaluation</h3>
          </div>
          {lastAnswer ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-sm text-ink-muted">{lastAnswer.answer.question}</p>
                <p className="mt-2 font-medium leading-7 text-ink">{lastAnswer.answer.answer}</p>
              </div>
              {latestEvaluation ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <EvaluationMetric label="Faithfulness" value={latestEvaluation.faithfulness} />
                  <EvaluationMetric label="Completeness" value={latestEvaluation.completeness} />
                  <EvaluationMetric label="Citations" value={latestEvaluation.citationCoverage} />
                </div>
              ) : null}
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-50">
                {JSON.stringify(lastAnswer.answer.citations, null, 2)}
              </pre>
            </div>
          ) : selectedDocument?.answers[0] ? (
            <div className="mt-4 rounded-md bg-slate-50 p-4">
              <p className="text-sm text-ink-muted">{selectedDocument.answers[0].question}</p>
              <p className="mt-2 font-medium leading-7 text-ink">{selectedDocument.answers[0].answer}</p>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState icon={FileQuestion} title="No answer generated yet" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
