import type {
  CreateRequirementProjectRequest,
  RequirementProjectListItem
} from "@ai-ops-studio/shared";
import { ClipboardCheck, HelpCircle, ListChecks, Sparkles } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import {
  useAnalyzeRequirementProjectMutation,
  useCreateRequirementProjectMutation,
  useGetRequirementProjectQuery,
  useGetRequirementProjectsQuery
} from "../../app/api";
import { DataTable, type DataTableColumn } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { MetricCard } from "../../components/ui/MetricCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusPill } from "../../components/ui/StatusPill";

const initialForm = {
  name: "Garage Management System",
  industry: "Automotive services",
  clientType: "Small business",
  businessDescription:
    "A garage needs to manage customers, vehicles, jobs, departments, inventory, payments, credit customers, and reports.",
  currentWorkflow:
    "Service advisors coordinate work through spreadsheets, calls, and manual status updates.",
  painPoints:
    "Managers lack job visibility, inventory is reconciled manually, and customers call repeatedly for updates.",
  requiredModules: "Jobs, Customers, Vehicles, Inventory, Payments, Reports",
  knownUsers: "Admin, Service advisor, Technician, Accountant",
  rawBrief:
    "We need a garage management system for jobs, customers, vehicles, inventory, staff, payments, credit customers, reports, and departments like wash, detailing, repairs, and wrapping.",
  budgetRange: "$15k-$25k",
  additionalNotes: "Synthetic portfolio demo project."
};

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCreatePayload(form: typeof initialForm): CreateRequirementProjectRequest {
  return {
    name: form.name,
    industry: form.industry,
    clientType: form.clientType || undefined,
    businessDescription: form.businessDescription,
    currentWorkflow: form.currentWorkflow || undefined,
    painPoints: form.painPoints || undefined,
    requiredModules: splitCsv(form.requiredModules),
    knownUsers: splitCsv(form.knownUsers),
    rawBrief: form.rawBrief,
    budgetRange: form.budgetRange || undefined,
    additionalNotes: form.additionalNotes || undefined
  };
}

function projectStatusTone(status: string) {
  if (status === "PROPOSAL_READY" || status === "ANALYZED") {
    return "green" as const;
  }

  if (status === "NEEDS_CLARIFICATION") {
    return "amber" as const;
  }

  return "gray" as const;
}

const projectColumns: Array<
  DataTableColumn<RequirementProjectListItem & { onSelect: () => void; selected: boolean }>
> = [
  {
    header: "Project",
    cell: (project) => (
      <button type="button" onClick={project.onSelect} className="text-left">
        <span className="font-medium text-ink">{project.name}</span>
        <span className="block text-sm text-ink-muted">{project.industry}</span>
      </button>
    )
  },
  {
    header: "Status",
    cell: (project) => <StatusPill label={project.status} tone={projectStatusTone(project.status)} />
  },
  {
    header: "Requirements",
    align: "right",
    cell: (project) => project.requirementCount
  },
  {
    header: "Questions",
    align: "right",
    cell: (project) => project.unansweredQuestionCount
  }
];

export function RequirementsEnginePage() {
  const [form, setForm] = useState(initialForm);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { data: projects, isError: projectsError } = useGetRequirementProjectsQuery();
  const { data: selectedProject } = useGetRequirementProjectQuery(selectedProjectId ?? "", {
    skip: !selectedProjectId
  });
  const [createProject, createState] = useCreateRequirementProjectMutation();
  const [analyzeProject, analyzeState] = useAnalyzeRequirementProjectMutation();

  useEffect(() => {
    if (!selectedProjectId && projects?.[0]) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const projectRows = useMemo(
    () =>
      (projects ?? []).map((project) => ({
        ...project,
        selected: project.id === selectedProjectId,
        onSelect: () => setSelectedProjectId(project.id)
      })),
    [projects, selectedProjectId]
  );

  const metrics = useMemo(() => {
    const projectCount = projects?.length ?? 0;
    const requirementCount =
      projects?.reduce((total, project) => total + project.requirementCount, 0) ?? 0;
    const questionCount =
      projects?.reduce((total, project) => total + project.unansweredQuestionCount, 0) ?? 0;

    return [
      {
        label: "Projects",
        value: String(projectCount),
        detail: "Requirement planning workspaces",
        tone: "teal" as const
      },
      {
        label: "Requirements",
        value: String(requirementCount),
        detail: "Structured items generated or seeded",
        tone: "blue" as const
      },
      {
        label: "Open questions",
        value: String(questionCount),
        detail: "Clarifications awaiting answers",
        tone: questionCount > 0 ? ("amber" as const) : ("green" as const)
      }
    ];
  }, [projects]);

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      const project = await createProject(toCreatePayload(form)).unwrap();
      setSelectedProjectId(project.id);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create project.");
    }
  }

  async function handleAnalyzeProject() {
    if (!selectedProjectId) {
      return;
    }

    setFormError(null);

    try {
      await analyzeProject(selectedProjectId).unwrap();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not analyze project brief.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Requirements Engine"
        title="Brief-to-scope workflow"
        actions={<StatusPill label="Structured outputs" tone="blue" />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      {projectsError ? <ErrorState title="Requirement projects are unavailable." /> : null}
      {formError ? <ErrorState title={formError} /> : null}

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={handleCreateProject}
          className="rounded-md border border-slate-200 bg-white p-4 shadow-panel"
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-ink">New project intake</h3>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-medium text-ink">
              Project name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-ink">
                Industry
                <input
                  value={form.industry}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, industry: event.target.value }))
                  }
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-ink">
                Client type
                <input
                  value={form.clientType}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, clientType: event.target.value }))
                  }
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Raw client brief
              <textarea
                value={form.rawBrief}
                onChange={(event) =>
                  setForm((current) => ({ ...current, rawBrief: event.target.value }))
                }
                className="min-h-28 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-ink">
              Business description
              <textarea
                value={form.businessDescription}
                onChange={(event) =>
                  setForm((current) => ({ ...current, businessDescription: event.target.value }))
                }
                className="min-h-24 rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-ink">
                Required modules
                <input
                  value={form.requiredModules}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, requiredModules: event.target.value }))
                  }
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-ink">
                Known users
                <input
                  value={form.knownUsers}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, knownUsers: event.target.value }))
                  }
                  className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-signal-teal focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={createState.isLoading}
              className="inline-flex items-center gap-2 rounded-md bg-signal-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {createState.isLoading ? "Creating" : "Create project"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {projectRows.length > 0 ? (
            <DataTable columns={projectColumns} rows={projectRows} getRowKey={(project) => project.id} />
          ) : (
            <EmptyState icon={ListChecks} title="No requirement projects found" />
          )}

          <section className="rounded-md border border-slate-200 bg-white shadow-panel">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <h3 className="font-semibold text-ink">Selected project</h3>
              {selectedProject ? (
                <StatusPill
                  label={selectedProject.status}
                  tone={projectStatusTone(selectedProject.status)}
                />
              ) : null}
            </div>
            {selectedProject ? (
              <div className="space-y-4 p-4">
                <div>
                  <h4 className="text-lg font-semibold text-ink">{selectedProject.name}</h4>
                  <p className="mt-1 text-sm text-ink-muted">{selectedProject.brief?.rawBrief}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      <p className="font-medium text-ink">Requirements</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      {selectedProject.requirements.slice(0, 4).map((requirement) => (
                        <div key={requirement.id} className="rounded-md bg-slate-50 p-2">
                          <p className="text-sm font-medium text-ink">{requirement.title}</p>
                          <p className="mt-1 text-xs text-ink-muted">{requirement.priority}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      <p className="font-medium text-ink">Clarifying questions</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      {selectedProject.clarifyingQuestions.slice(0, 4).map((question) => (
                        <div key={question.id} className="rounded-md bg-slate-50 p-2">
                          <p className="text-sm font-medium text-ink">{question.question}</p>
                          <p className="mt-1 text-xs text-ink-muted">{question.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAnalyzeProject}
                    disabled={analyzeState.isLoading}
                    className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {analyzeState.isLoading ? "Analyzing" : "Analyze brief"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <EmptyState icon={ClipboardCheck} title="Select or create a project" />
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
