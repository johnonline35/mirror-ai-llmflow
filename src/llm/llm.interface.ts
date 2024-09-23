import { Models } from "./llm.models";

export interface LLM {
  chatCompletion(messages: any[], options?: LLMOptions): Promise<string>;
  execute(prompt: string, options?: LLMOptions): any;
}

export interface ChatCompletionTool {
  /**
   * The name of the tool (function) the model may call.
   */
  name: string;

  /**
   * A description of what the tool (function) does. This helps the model understand when to use it.
   */
  description: string;

  /**
   * The parameters schema for the tool (function), described in a JSON schema-like format.
   */
  parameters: {
    type: "object";
    properties: {
      [key: string]: {
        type: string;
        description?: string;
        enum?: string[]; // Optional enum for possible values
      };
    };
    required?: string[]; // Optional required fields for the function
  };
}

/**
 * Range of valid values for temperature.
 */
type Temperature = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

/**
 * Options for configuring the behavior of the Language Model (LLM).
 */
export interface LLMOptions {
  dontParse?: boolean;
  /**
   * The model to use for the completion request.
   *
   * @remarks
   * Examples include OpenAI's 'gpt-3.5-turbo-0125', Anthropic's 'claude-3-opus-20240229', HuggingFace's 'gpt-neo-2.7B', Google's 'gemini-1', and Cohere's 'cohere-command-xlarge'.
   */
  model?: Models;

  /**
   * The maximum number of tokens to generate in the completion.
   *
   * @remarks
   * The number of tokens impacts the length of the generated response. Higher values will result in longer responses.
   *
   * @default 50
   */
  maxTokens?: number;

  /**
   * Controls the randomness of the generated response.
   *
   * @remarks
   * Values range from 0 to 1. Lower values make the output more deterministic, while higher values increase the randomness.
   *
   * @default 0
   */
  temperature?: Temperature;

  /**
   * Controls the diversity of the generated response.
   *
   * @remarks
   * Higher values reduce the likelihood of repeating tokens. Used in conjunction with temperature for fine-tuning the output.
   *
   * @default 1
   */
  topP?: number;

  /**
   * Penalizes new tokens based on their frequency in the generated text so far.
   *
   * @remarks
   * Higher values reduce the likelihood of repeating the same tokens frequently.
   *
   * @default 0
   * @minimum -2.0
   * @maximum 2.0
   */
  frequencyPenalty?: number;

  /**
   * Penalizes new tokens based on whether they appear in the text so far.
   *
   * @remarks
   * Higher values make the model more likely to introduce new topics.
   *
   * @default 0
   * @minimum -2.0
   * @maximum 2.0
   */
  presencePenalty?: number;

  /**
   * Specifies sequences where the generation should stop.
   *
   * @remarks
   * The model will stop generating further tokens once it encounters any of these sequences.
   */
  stopSequences?: string[];

  /**
   * Indicates whether the response should be streamed.
   *
   * @remarks
   * If true, the response will be returned as a stream.
   *
   * @default false
   */
  stream?: boolean;

  /**
   * Defines a system message for the model.
   *
   * @remarks
   * This can be used to provide context or instructions to the model before generating the completion.
   */
  system?: string;

  /**
   * The format that the model must output.
   *
   * @remarks
   * Setting to `{ "type": "json_object" }` enables JSON mode, which guarantees the message the model generates is valid JSON.
   */
  responseFormat?: "json_object" | "text";

  /**
   * Whether to return log probabilities of the output tokens or not.
   *
   * @remarks
   * If true, returns the log probabilities of each output token returned in the `content` of `message`.
   */
  logprobs?: boolean;

  /**
   * An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability.
   */
  topLogprobs?: number;

  /**
   * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
   */
  user?: string;

  /**
   * Controls which (if any) tool is called by the model.
   *
   * @remarks
   * `none` means the model will not call any tool and instead generates a message. `auto` means the model can pick between generating a message or calling one or more tools. `required` means the model must call one or more tools. Specifying a particular tool via `{"type": "function", "function": {"name": "my_function"}}` forces the model to call that tool.
   */
  toolChoice?: "none" | "auto" | "required";

  /**
   * A list of tools the model may call. Currently, only functions are supported as a tool. Use this to provide a list of functions the model may generate JSON inputs for. A max of 128 functions are supported.
   */
  tools?: Array<ChatCompletionTool>;

  /**
   * Controls which function is called by the model.
   *
   * @remarks
   * `none` means the model will not call a function and instead generates a message. `auto` means the model can pick between generating a message or calling a function. Specifying a particular function via `{"name": "my_function"}` forces the model to call that function.
   */
  functionCall?: "none" | "auto" | { name: string };

  /**
   * This feature is in Beta. If specified, our system will make a best effort to
   * sample deterministically, such that repeated requests with the same `seed` and
   * parameters should return the same result. Determinism is not guaranteed, and you
   * should refer to the `system_fingerprint` response parameter to monitor changes
   * in the backend.
   */
  seed?: number | null;
}

// Define the maximum token limits for each provider
const MAX_TOKENS: { [key in Models]: number } = {
  "gpt-3.5-turbo-0125": 4096,
  "gpt-4o-mini-2024-07-18": 4096,
  "gpt-4o-2024-05-13": 4096,
  "gpt-4o-2024-08-06": 4096,
  "claude-3-opus-20240229": 9000,
  "claude-3.5-sonnet-20240307": 9000,
  "claude-3-haiku-20240307": 9000,
  // "gpt-neo-2.7B": 2048,
  // "gemini-1": 4096,
  // "gemini-1.5": 4096,
  // "cohere-command-xlarge": 2048,
  // "cohere-command-medium": 2048,
};

export function createLLMOptions(options: LLMOptions): LLMOptions {
  if (options.model) {
    const maxTokensLimit = MAX_TOKENS[options.model];
    if (
      options.maxTokens !== undefined &&
      (options.maxTokens < 1 || options.maxTokens > maxTokensLimit)
    ) {
      throw new Error(
        `maxTokens for model ${options.model} must be between 1 and ${maxTokensLimit}`
      );
    }
  } else {
    const defaultMaxTokensLimit = 2048;
    if (
      options.maxTokens !== undefined &&
      (options.maxTokens < 1 || options.maxTokens > defaultMaxTokensLimit)
    ) {
      throw new Error(
        `maxTokens must be between 1 and ${defaultMaxTokensLimit}`
      );
    }
  }

  if (
    options.temperature !== undefined &&
    (options.temperature < 0 || options.temperature > 1)
  ) {
    throw new Error("temperature must be between 0 and 1");
  }

  if (options.topP !== undefined && (options.topP < 0 || options.topP > 1)) {
    throw new Error("topP must be between 0 and 1");
  }

  if (
    options.frequencyPenalty !== undefined &&
    (options.frequencyPenalty < -2.0 || options.frequencyPenalty > 2.0)
  ) {
    throw new Error("frequencyPenalty must be between -2.0 and 2.0");
  }

  if (
    options.presencePenalty !== undefined &&
    (options.presencePenalty < -2.0 || options.presencePenalty > 2.0)
  ) {
    throw new Error("presencePenalty must be between -2.0 and 2.0");
  }

  if (
    options.topLogprobs !== undefined &&
    (options.topLogprobs < 0 || options.topLogprobs > 20)
  ) {
    throw new Error("topLogprobs must be between 0 and 20");
  }

  if (options.stream === undefined) {
    options.stream = false;
  }

  return options;
}
