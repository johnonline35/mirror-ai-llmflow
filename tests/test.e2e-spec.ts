import { LLMFlow, createLLMFlow } from "../src/llm/llm-flow";
import { LLMOptions } from "../src/llm/llm.interface";
import * as fs from "fs/promises";
import { resolveLLM } from "../src/llm/llm-resolver";

// Mock dependencies
jest.mock("fs/promises");
jest.mock("./llm-resolver");
jest.mock("./common/utils/parsing.service");

// Example LLM mock implementation
const mockLLM = {
  execute: jest
    .fn()
    .mockImplementation((prompt: string) =>
      Promise.resolve(`Processed: ${prompt}`)
    ),
};

// Mocking the LLM resolver to return the mock LLM
(resolveLLM as jest.Mock).mockResolvedValue(mockLLM);

// Mocking fs methods to simulate versioning file creation
const mockMkdir = fs.mkdir as jest.Mock;
const mockWriteFile = fs.writeFile as jest.Mock;

describe("LLMFlow E2E Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute the LLM flow and format the prompt correctly', async () => {
  // Use createLLMFlow inline with TypeScript generics and empty object for type validation
  const llmFlow = createLLMFlow(
  "Hello {name}, you are {age} years old and your balance is ${balance}",
  {
    model: "gpt-3.5-turbo-0125",
    maxTokens: 50,
    temperature: 0.5,
  }
);

  const result = await llmFlow.run({ name: "Alice", age: 30, balance: 1000 });

  expect(result).toBe("Processed: Hello John, your balance is 1000");
  expect(mockLLM.execute).toHaveBeenCalledWith("Hello John, your balance is 1000", {
    model: "gpt-3.5-turbo-0125",
    maxTokens: 50,
    temperature: 0.5,
  });
});

  });

  it("should save version when versioning is enabled", async () => {
    // Use createLLMFlow with TypeScript generics, empty object, and versioning enabled
    const llmFlow = createLLMFlow<{ name: string; balance: string }, string>(
      "Hello {name}, your balance is {balance}", // Template inline
      {
        model: "gpt-3.5-turbo-0125", // Options inline
        maxTokens: 50,
        temperature: 0.5,
      },
      {}, // Empty object for type validation
      {
        versioningEnabled: true, // Versioning options inline
        storePath: "./mock-versions",
      }
    );

    await llmFlow.run({ name: "John", balance: "1000" });

    expect(mockMkdir).toHaveBeenCalledWith("./mock-versions", {
      recursive: true,
    });
    expect(mockWriteFile).toHaveBeenCalledTimes(1);

    const versionFileContent = JSON.parse(mockWriteFile.mock.calls[0][1]);
    expect(versionFileContent).toEqual(
      expect.objectContaining({
        template: "Hello {name}, your balance is {balance}",
        options: {
          model: "gpt-3.5-turbo-0125",
          maxTokens: 50,
          temperature: 0.5,
        },
      })
    );
  });

  it("should handle the LLM response when dontParse is set to true", async () => {
    // Use createLLMFlow with dontParse option, TypeScript generics, and empty object
    const llmFlow = createLLMFlow<{ name: string; balance: string }, string>(
      "Hello {name}, your balance is {balance}", // Template inline
      {
        model: "gpt-3.5-turbo-0125", // Options inline
        maxTokens: 50,
        temperature: 0.5,
        dontParse: true, // dontParse inline
      },
      {} // Empty object for type validation
    );

    const result = await llmFlow.run({ name: "John", balance: "1000" });

    expect(result).toBe("Processed: Hello John, your balance is 1000");
    expect(mockLLM.execute).toHaveBeenCalledWith(
      "Hello John, your balance is 1000",
      {
        model: "gpt-3.5-turbo-0125",
        maxTokens: 50,
        temperature: 0.5,
        dontParse: true,
      }
    );
  });

  it("should handle invalid JSON in the LLM response and return cleaned text", async () => {
    // Mock invalid JSON response
    mockLLM.execute.mockResolvedValueOnce("Invalid JSON response");

    // Use createLLMFlow with TypeScript generics and empty object
    const llmFlow = createLLMFlow<{ name: string; balance: string }, string>(
      "Hello {name}, your balance is {balance}", // Template inline
      {
        model: "gpt-3.5-turbo-0125", // Options inline
        maxTokens: 50,
        temperature: 0.5,
      },
      {} // Empty object for type validation
    );

    const result = await llmFlow.run({ name: "John", balance: "1000" });

    expect(result).toBe("Invalid JSON response");
  });
});
