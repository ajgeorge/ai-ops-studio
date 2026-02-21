import { AIRunStatus } from "@prisma/client";

import { getDefaultPromptVersion } from "./default-prompts.js";
import { MockAIProvider } from "./mock-ai-provider.js";
import { runDemoAIWorkflow } from "./ai-workflow.service.js";
import type { AIRunLogger } from "./ai-run-logger.js";

describe("runDemoAIWorkflow", () => {
  it("runs the mock provider and records the AI run lifecycle", async () => {
    const completedStatuses: AIRunStatus[] = [];
    const logger: AIRunLogger = {
      async start(input) {
        expect(input.promptVersion.key).toBe("requirements.analyzeBrief");
        expect(input.workflow).toBe("AnalyzeBriefWorkflow");

        return {
          runId: "run_demo_1"
        };
      },
      async complete(input) {
        completedStatuses.push(input.status);
        expect(input.runId).toBe("run_demo_1");
        expect(input.output).toBeDefined();

        return {};
      }
    };

    const response = await runDemoAIWorkflow(
      "requirements.analyzeBrief",
      {
        industry: "Garage operations"
      },
      {
        provider: new MockAIProvider(),
        logger,
        async getPrompt(promptKey) {
          const prompt = getDefaultPromptVersion(promptKey);

          if (!prompt) {
            throw new Error(`Missing prompt: ${promptKey}`);
          }

          return { prompt };
        }
      }
    );

    expect(response).toMatchObject({
      runId: "run_demo_1",
      status: "succeeded",
      provider: "mock"
    });
    expect(response.promptVersion).toMatchObject({
      key: "requirements.analyzeBrief",
      source: "default"
    });
    expect(completedStatuses).toEqual([AIRunStatus.SUCCEEDED]);
  });
});
