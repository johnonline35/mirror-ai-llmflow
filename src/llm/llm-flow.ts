import { LLM, LLMOptions } from "./llm.interface";
import { resolveLLM } from "./llm-resolver";
import { ParsingService } from "./common/utils/parsing.service";
import {
  PromptTemplate,
  createPromptTemplate,
  formatPrompt,
} from "./prompt-template";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

interface VersioningOptions {
  versioningEnabled: boolean;
  storePath: string;
}

interface PromptVersion<TInput extends Record<string, string>> {
  id: string;
  timestamp: number;
  template: string;
  options: LLMOptions;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

export class LLMFlow<TInput extends Record<string, string>, TOutput = string> {
  private llmPromise: Promise<LLM>;
  private parser: ParsingService;
  private versionId: string | null = null;
  private versioningOptions: VersioningOptions;

  constructor(
    private promptTemplate: PromptTemplate<TInput>,
    private options: LLMOptions,
    versioningOptions?: Partial<VersioningOptions>
  ) {
    if (!options.model) {
      throw new Error("Model not specified in LLM options.");
    }
    this.llmPromise = resolveLLM(options.model);
    this.parser = new ParsingService();
    this.versioningOptions = {
      versioningEnabled: versioningOptions?.versioningEnabled ?? false,
      storePath: versioningOptions?.storePath ?? "./prompt-versions",
    };
    if (this.versioningOptions.versioningEnabled) {
      this.versionId = generateUUID();
    }
  }

  async run(input: TInput): Promise<TOutput> {
    const llm = await this.llmPromise;
    const prompt = formatPrompt(this.promptTemplate, input);
    const response = await llm.execute(prompt, this.options);

    if (this.versioningOptions.versioningEnabled) {
      await this.saveVersion();
    }

    if (this.options.dontParse) {
      return response as TOutput;
    }

    if (typeof response === "string") {
      const cleanedResponse = this.parser.cleanMarkdown(response);
      try {
        const extractedJson = this.parser.extractJsonFromText(cleanedResponse);
        return JSON.parse(extractedJson) as TOutput;
      } catch (error) {
        return cleanedResponse as unknown as TOutput;
      }
    }

    return response as TOutput;
  }

  private async saveVersion(): Promise<void> {
    if (!this.versionId) return;

    const version: PromptVersion<TInput> = {
      id: this.versionId,
      timestamp: Date.now(),
      template: this.promptTemplate.template,
      options: this.options,
    };

    const versionPath = path.join(
      this.versioningOptions.storePath,
      `${this.versionId}.json`
    );
    await fs.mkdir(this.versioningOptions.storePath, { recursive: true });
    await fs.writeFile(versionPath, JSON.stringify(version, null, 2));
  }
}

export function createLLMFlow<
  TInput extends Record<string, string> = Record<string, string>,
  TOutput = string
>(
  template: string,
  options: LLMOptions,
  versioningOptions?: Partial<VersioningOptions>
): LLMFlow<TInput, TOutput> {
  const promptTemplate = createPromptTemplate<TInput>(template);
  return new LLMFlow<TInput, TOutput>(
    promptTemplate,
    options,
    versioningOptions
  );
}
