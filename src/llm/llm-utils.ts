import { LLMOptions } from "./llm.interface";

export class Logger {
  logTokenUsage(
    messages: any[],
    response: string,
    tokenUsage: any,
    caller: string,
    options: LLMOptions,
    duration: number
  ) {
    console.log({
      message: "Token usage details",
      request: JSON.stringify(messages),
      response: response,
      tokenUsage: tokenUsage,
      endpoint: caller,
      options: options,
      duration: `${duration}ms`,
    });
  }

  logApiCallStart(callerDetails: string): number {
    console.log({
      message: "Starting API call",
      caller: callerDetails,
    });
    return Date.now();
  }

  logApiCallComplete(
    callerDetails: string,
    tokenUsage: any,
    options: LLMOptions,
    startTime: number
  ): number {
    const duration = Date.now() - startTime;
    console.log({
      message: "Token usage",
      caller: callerDetails,
      tokenUsage: tokenUsage,
      options: options,
      duration: `${duration}ms`,
    });
    return duration;
  }
}

export class ErrorHandler {
  handleApiError(error: unknown, callerDetails: string): string {
    console.error({
      message: "Error calling LLM API",
      caller: callerDetails,
      error: error instanceof Error ? error.message : String(error),
    });
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export class CallerDetailsFetcher {
  getCallerFunctionDetails(): string {
    const error = new Error();
    const stack = error.stack?.split("\n");
    const callerStackLine = stack ? stack[3] : "";
    const match = callerStackLine.match(
      /at\s+([^(]+)\s+\(([^:]+):(\d+):(\d+)\)/
    );
    if (match && match.length > 1) {
      return `Function: ${match[1].trim()}, File: ${match[2]}, Line: ${
        match[3]
      }, Column: ${match[4]}`;
    }
    return `unknown, Full Stack: ${error.stack}`;
  }
}
