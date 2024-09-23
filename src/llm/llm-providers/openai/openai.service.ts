import OpenAI from "openai";
import { LLM, LLMOptions } from "../../llm.interface";
import { Logger, ErrorHandler, CallerDetailsFetcher } from "../../llm-utils";
import * as dotenv from "dotenv";
dotenv.config();

export class OpenAiService implements LLM {
  private openai: OpenAI;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private callerDetailsFetcher: CallerDetailsFetcher;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
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

// import OpenAI from "openai";
// import { LLM, LLMOptions } from "../../llm.interface";
// import * as dotenv from "dotenv";
// dotenv.config();

// export class OpenAiService implements LLM {
//   private openai: OpenAI;

//   constructor() {
//     // Use environment variables directly
//     const apiKey = process.env.OPENAI_API_KEY;
//     if (!apiKey) {
//       throw new Error("OPENAI_API_KEY is not set in the environment variables");
//     }

//     this.openai = new OpenAI({
//       apiKey: apiKey,
//     });
//   }

//   // This method processes the prompt and calls the OpenAI API for chat completion
//   async execute(prompt: string, options?: LLMOptions): Promise<string> {
//     return this.chatCompletion([{ role: "user", content: prompt }], options);
//   }

//   // Chat Completion method with added support for functions and function calls
//   async chatCompletion(
//     messages: any[],
//     options: LLMOptions = {}
//   ): Promise<string> {
//     const callerDetails = this.getCallerFunctionDetails();
//     const startTime = Date.now();

//     try {
//       // Request chat completion with optional functions and function call behavior
//       const response = await this.openai.chat.completions.create({
//         model: options.model || "gpt-3.5-turbo",
//         messages,
//         max_tokens: options.maxTokens,
//         temperature: options.temperature,
//         top_p: options.topP,
//         frequency_penalty: options.frequencyPenalty,
//         presence_penalty: options.presencePenalty,
//         stop: options.stopSequences,
//       });

//       const duration = Date.now() - startTime;
//       const tokenUsage = response.usage;

//       // Log token usage and duration
//       console.log({
//         message: "Token usage",
//         caller: callerDetails,
//         tokenUsage: tokenUsage,
//         options: options,
//         duration: `${duration}ms`,
//       });

//       const content = response.choices[0].message?.content;
//       if (!content) {
//         console.error("Message content is null or undefined");
//         return "Message content is null or undefined"; // Ensure we return a string here
//       }

//       // Optionally log the token usage for analytics or monitoring purposes
//       await this.logTokenUsage(
//         messages,
//         content,
//         tokenUsage,
//         callerDetails,
//         options,
//         duration
//       );

//       // Handle the response based on whether the function call was made
//       const choice = response.choices[0];
//       if (
//         choice.finish_reason === "function_call" &&
//         choice.message.function_call
//       ) {
//         const { name, arguments: functionArgs } = choice.message.function_call;

//         console.log(
//           `Function called: ${name}, Arguments: ${JSON.stringify(functionArgs)}`
//         );

//         // Add your custom logic to handle the function call here
//         return `Function called: ${name}, Arguments: ${JSON.stringify(
//           functionArgs
//         )}`;
//       }

//       // If there was no function call, return the content of the response
//       return content;
//     } catch (error) {
//       console.error({
//         message: "Error calling OpenAI API",
//         caller: callerDetails,
//         error: error instanceof Error ? error.message : String(error),
//       });

//       // Ensure the function always returns a string even on error
//       return `Error: ${error instanceof Error ? error.message : String(error)}`;
//     }
//   }

//   // Logs token usage and other metrics
//   private async logTokenUsage(
//     messages: any[],
//     response: string,
//     tokenUsage: any,
//     caller: string,
//     options: LLMOptions,
//     duration: number
//   ) {
//     // Log token usage details to the console (can be extended to log into a system)
//     console.log({
//       message: "Token usage details",
//       request: JSON.stringify(messages),
//       response: response,
//       tokenUsage: tokenUsage,
//       endpoint: caller,
//       options: options,
//       duration: `${duration}ms`,
//     });
//   }

//   // This method extracts the calling function details from the stack trace for better logging
//   private getCallerFunctionDetails(): string {
//     const error = new Error();
//     const stack = error.stack?.split("\n");
//     const callerStackLine = stack ? stack[3] : "";
//     const match = callerStackLine.match(
//       /at\s+([^(]+)\s+\(([^:]+):(\d+):(\d+)\)/
//     );
//     if (match && match.length > 1) {
//       return `Function: ${match[1].trim()}, File: ${match[2]}, Line: ${
//         match[3]
//       }, Column: ${match[4]}`;
//     }
//     return `unknown, Full Stack: ${error.stack}`;
//   }
// }
