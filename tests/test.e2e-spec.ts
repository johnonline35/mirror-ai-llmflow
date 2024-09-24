import { createLLMFlow, LLMFlow } from "../src/llm/llm-flow";
import { LLM } from "../src/llm/llm.interface";
// import * as fs from "fs/promises";
// import * as path from "path";

jest.mock("./llm-resolver", () => ({
  resolveLLM: jest.fn(),
}));

jest.mock("./common/utils/parsing.service", () => ({
  ParsingService: jest.fn().mockImplementation(() => ({
    cleanMarkdown: jest.fn((text) => text),
    extractJsonFromText: jest.fn((text) => text),
  })),
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

describe("LLMFlow E2E Integration Test", () => {
  let mockLLM: jest.Mocked<LLM>;

  beforeEach(() => {
    mockLLM = {
      execute: jest.fn(),
    };

    (require("./llm-resolver").resolveLLM as jest.Mock).mockResolvedValue(
      mockLLM
    );
  });

  it("should create an LLMFlow instance and run it successfully", async () => {
    // Define the prompt template and input
    const template = "Hello {name}, welcome to {place}!";
    const input = { name: "Alice", place: "Wonderland" };

    // Create the LLMFlow instance
    const llmFlow = createLLMFlow(
      template,
      { model: "claude-3.5-sonnet-20240307" },
      input
    );

    // Mock the LLM response
    mockLLM.execute.mockResolvedValue(
      '{"message": "Hello Alice, welcome to Wonderland!"}'
    );

    // Run the LLMFlow
    const result = await llmFlow.run(input);

    // Assertions
    expect(mockLLM.execute).toHaveBeenCalledWith(
      "Hello Alice, welcome to Wonderland!",
      { model: "test-model" }
    );
    expect(result).toEqual({ message: "Hello Alice, welcome to Wonderland!" });
  });

  it("should handle non-JSON responses", async () => {
    const template = "Greet {name}";
    const input = { name: "Bob" };

    const llmFlow = createLLMFlow(
      template,
      { model: "claude-3-haiku-20240307", dontParse: true },
      input
    );

    mockLLM.execute.mockResolvedValue("Hello, Bob!");

    const result = await llmFlow.run(input);

    expect(mockLLM.execute).toHaveBeenCalledWith("Greet Bob", {
      model: "test-model",
      dontParse: true,
    });
    expect(result).toBe("Hello, Bob!");
  });

  // Add more test cases as needed
});
