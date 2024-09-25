import { LLM, LLMOptions } from "./llm.interface";
import { resolveLLM } from "./llm-resolver";
import { ParsingService } from "./common/utils/parsing.service";
import {
  PromptTemplate,
  PromptTemplateType,
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

interface PromptVersion<T extends string> {
  id: string;
  timestamp: number;
  template: T;
  options: LLMOptions;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

export class LLMFlow<T extends string, TOutput = string> {
  private llmPromise: Promise<LLM>;
  private parser: ParsingService;
  private versionId: string | null = null;
  private versioningOptions: VersioningOptions;

  constructor(
    private promptTemplate: PromptTemplate<T>,
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

  async run(input: PromptTemplateType<T>): Promise<TOutput> {
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

    const version: PromptVersion<T> = {
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

export function createLLMFlow<T extends string, TOutput = string>(
  template: T,
  options: LLMOptions,
  versioningOptions?: Partial<VersioningOptions>
): LLMFlow<T, TOutput> {
  const promptTemplate = createPromptTemplate(template);
  return new LLMFlow<T, TOutput>(promptTemplate, options, versioningOptions);
}
