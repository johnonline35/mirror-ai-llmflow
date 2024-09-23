import OpenAI from "openai";
import { LLM, LLMOptions } from "../../llm.interface";
import { Logger, ErrorHandler, CallerDetailsFetcher } from "../../llm-utils";
import { config } from "../../common/utils/config";

export class OpenAiService implements LLM {
  private openai: OpenAI;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private callerDetailsFetcher: CallerDetailsFetcher;

  constructor() {
    const apiKey = config.openai.apiKey;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in the environment variables");
    }

    this.openai = new OpenAI({ apiKey: apiKey });
    this.logger = new Logger();
    this.errorHandler = new ErrorHandler();
    this.callerDetailsFetcher = new CallerDetailsFetcher();
  }

  async execute(prompt: string, options?: LLMOptions): Promise<string> {
    return this.chatCompletion([{ role: "user", content: prompt }], options);
  }

  async chatCompletion(
    messages: any[],
    options: LLMOptions = {}
  ): Promise<string> {
    const callerDetails = this.callerDetailsFetcher.getCallerFunctionDetails();
    const startTime = this.logger.logApiCallStart(callerDetails);

    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || "gpt-3.5-turbo",
        messages,
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stop: options.stopSequences,
      });

      const duration = this.logger.logApiCallComplete(
        callerDetails,
        response.usage,
        options,
        startTime
      );

      const content = response.choices[0].message?.content;
      if (!content) {
        console.error("Message content is null or undefined");
        return "Message content is null or undefined";
      }

      this.logger.logTokenUsage(
        messages,
        content,
        response.usage,
        callerDetails,
        options,
        duration
      );

      return content;
    } catch (error) {
      return this.errorHandler.handleApiError(error, callerDetails);
    }
  }
}
