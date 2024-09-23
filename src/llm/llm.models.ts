// OpenAI models - https://platform.openai.com/docs/models/overview
/**
 * Models developed by OpenAI.
 * @company OpenAI
 */
export type OpenAIModels =
  | "gpt-4o-2024-05-13"
  | "gpt-4o-2024-08-06"
  | "gpt-4o-mini-2024-07-18"
  | "gpt-3.5-turbo-0125";

// Anthropic models - https://docs.anthropic.com/en/docs/models-overview
/**
 * Models developed by Anthropic.
 * @company Anthropic
 */
export type AnthropicModels =
  | "claude-3-opus-20240229"
  | "claude-3-sonnet-20240229"
  | "claude-3-haiku-20240307";

// HuggingFace models
/**
 * Models developed by HuggingFace.
 * @company HuggingFace
 */
export type HuggingFaceModels = "gpt-neo-2.7B";

// Google Gemini models
/**
 * Models developed by Google.
 * @company Google
 */
export type GeminiModels = "gemini-1" | "gemini-1.5";

// Cohere models
/**
 * Models developed by Cohere.
 * @company Cohere
 */
export type CohereModels = "cohere-command-xlarge" | "cohere-command-medium";

/**
 * Combined model types from various companies.
 * @company OpenAI | Anthropic | HuggingFace | Google | Cohere
 */
export type Models = OpenAIModels | AnthropicModels;
// | HuggingFaceModels
// | GeminiModels
// | CohereModels;
