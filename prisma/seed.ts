import {
  AIProviderName,
  AIRunStatus,
  AppModule,
  ConfidenceLevel,
  FeatureBucket,
  GeneratedSource,
  HttpMethod,
  JobPriority,
  JobStatus,
  PrismaClient,
  ProjectStatus,
  PromptStatus,
  QuestionStatus,
  RagDocumentStatus,
  RecommendationStatus,
  RequirementCategory,
  RequirementPriority,
  TechnicianStatus,
  UserStoryStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();
const minutesFromNow = (minutes: number) => new Date(now.getTime() + minutes * 60_000);
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000);

async function resetDemoData() {
  await prisma.ragEvaluationRun.deleteMany();
  await prisma.ragTestCase.deleteMany();
  await prisma.ragAnswer.deleteMany();
  await prisma.ragQuestion.deleteMany();
  await prisma.ragChunk.deleteMany();
  await prisma.ragDocument.deleteMany();

  await prisma.dailyOpsReport.deleteMany();
  await prisma.aIRecommendation.deleteMany();
  await prisma.locationPing.deleteMany();
  await prisma.jobEvent.deleteMany();
  await prisma.job.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();

  await prisma.generatedProposal.deleteMany();
  await prisma.apiRouteSuggestion.deleteMany();
  await prisma.dataEntity.deleteMany();
  await prisma.userStory.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.clarifyingQuestion.deleteMany();
  await prisma.clientBrief.deleteMany();
  await prisma.requirementProject.deleteMany();

  await prisma.aIRun.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.promptVersion.deleteMany();
}

async function seedPromptVersions() {
  const promptVersions = [
    {
      key: "requirements.analyzeBrief",
      version: 1,
      module: AppModule.REQUIREMENTS,
      title: "Analyze client brief",
      template:
        "Extract known requirements, missing information, confidence levels, and workflow assumptions from a client brief."
    },
    {
      key: "operations.explainRecommendation",
      version: 1,
      module: AppModule.OPERATIONS,
      title: "Explain technician recommendation",
      template:
        "Explain a deterministic technician assignment recommendation using skill match, availability, distance, workload, and SLA risk."
    },
    {
      key: "rag.answerWithContext",
      version: 1,
      module: AppModule.RAG,
      title: "Answer with retrieved context",
      template:
        "Answer a user question using only retrieved document chunks, include citations, and state uncertainty when context is insufficient."
    }
  ];

  for (const prompt of promptVersions) {
    await prisma.promptVersion.create({
      data: {
        ...prompt,
        status: PromptStatus.ACTIVE,
        metadata: {
          owner: "AI Ops Studio",
          provider: "mock"
        }
      }
    });
  }
}

async function seedRequirements() {
  const project = await prisma.requirementProject.create({
    data: {
      name: "Garage Management System",
      industry: "Automotive services",
      clientType: "Small business",
      status: ProjectStatus.ANALYZED,
      completionPercentage: 42,
      budgetRange: "$15k-$25k",
      additionalNotes: "Synthetic demo project used for portfolio walkthroughs.",
      brief: {
        create: {
          businessDescription:
            "A garage needs to manage jobs, customers, vehicles, inventory, staff, credit customers, reports, and multiple service departments.",
          currentWorkflow:
            "Service advisors track incoming work with spreadsheets and phone updates.",
          painPoints:
            "Job status visibility is poor, inventory is manually reconciled, and credit customer follow-up is inconsistent.",
          requiredModules: ["Jobs", "Customers", "Vehicles", "Inventory", "Payments", "Reports"],
          knownUsers: ["Admin", "Service advisor", "Technician", "Accountant"],
          rawBrief:
            "We need a garage management system for jobs, customers, vehicles, inventory, staff, payments, credit customers, reports, and departments like wash, detailing, repairs, and wrapping."
        }
      },
      requirements: {
        create: [
          {
            title: "Create and track service jobs",
            description:
              "Admins can create jobs, assign departments, update status, and view status history.",
            category: RequirementCategory.WORKFLOW,
            priority: RequirementPriority.MUST_HAVE,
            confidence: ConfidenceLevel.HIGH,
            source: GeneratedSource.USER_PROVIDED
          },
          {
            title: "Track inventory usage",
            description:
              "Inventory items can be associated with completed jobs for stock visibility.",
            category: RequirementCategory.INVENTORY,
            priority: RequirementPriority.SHOULD_HAVE,
            confidence: ConfidenceLevel.MEDIUM,
            source: GeneratedSource.AI_INFERRED
          }
        ]
      },
      clarifyingQuestions: {
        create: [
          {
            category: "Payments",
            question: "Do credit customers have spending limits or approval rules?",
            status: QuestionStatus.UNANSWERED,
            confidence: ConfidenceLevel.MEDIUM
          },
          {
            category: "Workflow",
            question: "Can one job move between departments before completion?",
            status: QuestionStatus.ANSWERED,
            answer: "Yes, managers can transfer jobs between departments.",
            confidence: ConfidenceLevel.HIGH
          }
        ]
      },
      features: {
        create: [
          {
            title: "Customer and vehicle management",
            description: "Store customer profiles and vehicle history.",
            bucket: FeatureBucket.MVP
          },
          {
            title: "WhatsApp notifications",
            description: "Send customer updates for job status changes.",
            bucket: FeatureBucket.FUTURE
          }
        ]
      },
      userStories: {
        create: [
          {
            title: "Create a new job",
            role: "Admin",
            goal: "create and assign a service job",
            benefit: "work can be tracked from intake to completion",
            priority: RequirementPriority.MUST_HAVE,
            status: UserStoryStatus.DRAFT,
            relatedFeature: "Job management",
            acceptanceCriteria: [
              "Admin can select a customer and vehicle",
              "Admin can assign a department",
              "System creates an initial status history entry"
            ]
          }
        ]
      },
      dataEntities: {
        create: [
          {
            name: "Job",
            fields: {
              id: "string",
              customerId: "string",
              vehicleId: "string",
              status: "enum",
              estimatedCost: "number"
            },
            relationships: {
              customer: "many-to-one",
              vehicle: "many-to-one",
              statusHistory: "one-to-many"
            },
            notes: "Core operational entity for garage work tracking."
          }
        ]
      },
      apiRouteSuggestions: {
        create: [
          {
            method: HttpMethod.POST,
            path: "/api/jobs",
            purpose: "Create a new job",
            permission: "admin",
            requestBody: {
              customerId: "string",
              vehicleId: "string",
              departmentId: "string"
            },
            responseShape: {
              id: "string",
              status: "pending"
            },
            relatedDataModel: "Job"
          }
        ]
      },
      proposals: {
        create: {
          title: "Garage Management System Proposal",
          markdown:
            "# Garage Management System Proposal\n\nBuild a staged internal platform for intake, job tracking, inventory visibility, payments, and reporting."
        }
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "requirements.project.seeded",
      module: AppModule.REQUIREMENTS,
      entityType: "RequirementProject",
      entityId: project.id,
      metadata: {
        name: project.name,
        status: project.status
      }
    }
  });
}

async function seedOperations() {
  const serviceTypes = await Promise.all(
    [
      ["Battery replacement", "Battery", 30],
      ["Tire change", "Tire", 35],
      ["Towing", "Towing", 45],
      ["Fuel delivery", "Mechanical", 30],
      ["Vehicle lockout", "Diagnostics", 40]
    ].map(([name, requiredSkill, targetResponseMin]) =>
      prisma.serviceType.create({
        data: {
          name: String(name),
          requiredSkill: String(requiredSkill),
          targetResponseMin: Number(targetResponseMin)
        }
      })
    )
  );

  const technicians = await Promise.all(
    [
      ["Omar Hassan", ["Battery", "Electrical", "Diagnostics"], TechnicianStatus.AVAILABLE, 25.2854, 51.531],
      ["Daniel Reyes", ["Tire", "Mechanical"], TechnicianStatus.BUSY, 25.31, 51.49],
      ["Ahmed Khan", ["Towing", "Mechanical"], TechnicianStatus.AVAILABLE, 25.27, 51.56],
      ["Faris Ali", ["Battery", "Tire"], TechnicianStatus.ON_BREAK, 25.33, 51.52],
      ["Jason Miller", ["Diagnostics", "Mechanical"], TechnicianStatus.OFFLINE, 25.24, 51.48]
    ].map(([name, skills, status, latitude, longitude], index) =>
      prisma.technician.create({
        data: {
          name: String(name),
          skills: skills as string[],
          status: status as TechnicianStatus,
          currentJobCount: index === 1 ? 2 : 0,
          completedJobsToday: index + 1,
          averageCompletionMin: 35 + index * 4,
          latitude: Number(latitude),
          longitude: Number(longitude),
          pings: {
            create: {
              latitude: Number(latitude),
              longitude: Number(longitude),
              recordedAt: minutesAgo(10 + index)
            }
          }
        }
      })
    )
  );

  const customer = await prisma.customer.create({
    data: {
      name: "Mariam Al-Thani",
      phone: "+974 5555 0101",
      email: "mariam@example.com",
      vehicles: {
        create: {
          make: "Toyota",
          model: "Land Cruiser",
          plate: "QTR-1042"
        }
      }
    },
    include: {
      vehicles: true
    }
  });

  const job = await prisma.job.create({
    data: {
      id: "JOB-1042",
      customerId: customer.id,
      vehicleId: customer.vehicles[0]!.id,
      serviceTypeId: serviceTypes[0]!.id,
      assignedTechnicianId: null,
      status: JobStatus.DELAYED,
      priority: JobPriority.URGENT,
      locationLabel: "West Bay, Doha",
      latitude: 25.324,
      longitude: 51.531,
      slaDeadline: minutesFromNow(20),
      delayRiskScore: 86,
      events: {
        create: [
          {
            status: JobStatus.PENDING,
            note: "Customer requested battery replacement.",
            createdAt: minutesAgo(55)
          },
          {
            status: JobStatus.DELAYED,
            note: "No technician assigned within target response window.",
            createdAt: minutesAgo(15)
          }
        ]
      }
    }
  });

  await prisma.aIRecommendation.create({
    data: {
      jobId: job.id,
      recommendedTechnicianId: technicians[0]!.id,
      score: 91.4,
      confidence: ConfidenceLevel.HIGH,
      explanation:
        "Omar is available, has battery replacement experience, is nearby, and has no active jobs.",
      status: RecommendationStatus.PENDING_APPROVAL
    }
  });

  await prisma.dailyOpsReport.create({
    data: {
      reportDate: new Date(now.toDateString()),
      summary: "Synthetic daily operations report with one urgent delayed battery job.",
      metrics: {
        activeJobs: 1,
        delayedJobs: 1,
        availableTechnicians: 2,
        pendingRecommendations: 1
      }
    }
  });
}

async function seedRag() {
  const document = await prisma.ragDocument.create({
    data: {
      title: "Roadside Assistance SLA Policy",
      source: "sample-policy.md",
      status: RagDocumentStatus.READY,
      content:
        "Battery and tire requests should receive first technician contact within 30 minutes. Escalate any urgent job after 45 minutes without assignment.",
      chunks: {
        create: [
          {
            chunkIndex: 0,
            heading: "Response targets",
            content:
              "Battery and tire requests should receive first technician contact within 30 minutes.",
            tokenCount: 13,
            metadata: {
              section: "SLA"
            }
          },
          {
            chunkIndex: 1,
            heading: "Escalation policy",
            content:
              "Urgent jobs should be escalated after 45 minutes without assignment.",
            tokenCount: 11,
            metadata: {
              section: "Escalation"
            }
          }
        ]
      }
    },
    include: {
      chunks: true
    }
  });

  const question = await prisma.ragQuestion.create({
    data: {
      question: "When should an urgent roadside job be escalated?"
    }
  });

  const answer = await prisma.ragAnswer.create({
    data: {
      questionId: question.id,
      documentId: document.id,
      answer:
        "Urgent jobs should be escalated after 45 minutes if they still have no assignment.",
      citations: [
        {
          chunkId: document.chunks[1]!.id,
          heading: "Escalation policy"
        }
      ],
      latencyMs: 420,
      score: 0.92
    }
  });

  await prisma.ragEvaluationRun.create({
    data: {
      answerId: answer.id,
      faithfulness: 0.95,
      completeness: 0.88,
      citationCoverage: 1,
      notes: "Seeded evaluation for mock RAG workflow."
    }
  });

  await prisma.ragTestCase.create({
    data: {
      documentId: document.id,
      question: "What is the first contact target for battery requests?",
      expectedAnswer: "Battery requests should receive first technician contact within 30 minutes.",
      expectedChunkIds: [document.chunks[0]!.id]
    }
  });
}

async function seedAIRunsAndAudit() {
  const prompts = await prisma.promptVersion.findMany();
  const requirementsPrompt = prompts.find((prompt) => prompt.key === "requirements.analyzeBrief");
  const operationsPrompt = prompts.find((prompt) => prompt.key === "operations.explainRecommendation");
  const ragPrompt = prompts.find((prompt) => prompt.key === "rag.answerWithContext");

  await prisma.aIRun.createMany({
    data: [
      {
        module: AppModule.REQUIREMENTS,
        workflow: "AnalyzeBriefWorkflow",
        step: "extractKnownRequirements",
        provider: AIProviderName.MOCK,
        model: "mock-structured-v1",
        promptVersionId: requirementsPrompt?.id,
        status: AIRunStatus.SUCCEEDED,
        input: {
          project: "Garage Management System"
        },
        output: {
          requirements: 2,
          questions: 2
        },
        latencyMs: 380,
        startedAt: minutesAgo(80),
        completedAt: minutesAgo(79)
      },
      {
        module: AppModule.OPERATIONS,
        workflow: "RecommendTechnicianWorkflow",
        step: "explainRecommendation",
        provider: AIProviderName.MOCK,
        model: "mock-explainer-v1",
        promptVersionId: operationsPrompt?.id,
        status: AIRunStatus.SUCCEEDED,
        input: {
          jobId: "JOB-1042",
          score: 91.4
        },
        output: {
          confidence: "high"
        },
        latencyMs: 240,
        startedAt: minutesAgo(25),
        completedAt: minutesAgo(24)
      },
      {
        module: AppModule.RAG,
        workflow: "RagAnswerWorkflow",
        step: "answerWithContext",
        provider: AIProviderName.MOCK,
        model: "mock-rag-v1",
        promptVersionId: ragPrompt?.id,
        status: AIRunStatus.SUCCEEDED,
        input: {
          question: "When should an urgent roadside job be escalated?"
        },
        output: {
          citations: 1,
          score: 0.92
        },
        latencyMs: 420,
        startedAt: minutesAgo(12),
        completedAt: minutesAgo(11)
      }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      {
        action: "ops.recommendation.created",
        module: AppModule.OPERATIONS,
        entityType: "AIRecommendation",
        entityId: "JOB-1042",
        metadata: {
          jobId: "JOB-1042",
          status: "pending_approval"
        }
      },
      {
        action: "rag.answer.created",
        module: AppModule.RAG,
        entityType: "RagAnswer",
        metadata: {
          document: "Roadside Assistance SLA Policy"
        }
      }
    ]
  });
}

async function main() {
  await resetDemoData();
  await seedPromptVersions();
  await seedRequirements();
  await seedOperations();
  await seedRag();
  await seedAIRunsAndAudit();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeded AI Ops Studio demo data.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
