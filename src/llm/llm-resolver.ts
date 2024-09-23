import { Models } from "./llm.models";
import { LLM } from "./llm.interface";

const modelServiceMap: { [key in Models]: () => Promise<LLM> } = {
  "gpt-4o-2024-05-13": () =>
    import("./llm-providers/openai/openai.service").then(
      (m) => new m.OpenAiService()
    ),
  "gpt-4o-2024-08-06": () =>
    import("./llm-providers/openai/openai.service").then(
      (m) => new m.OpenAiService()
    ),
  "gpt-4o-mini-2024-07-18": () =>
    import("./llm-providers/openai/openai.service").then(
      (m) => new m.OpenAiService()
    ),
  "gpt-3.5-turbo-0125": () =>
    import("./llm-providers/openai/openai.service").then(
      (m) => new m.OpenAiService()
    ),
  "claude-3-opus-20240229": () =>
    import("./llm-providers/anthropic/anthropic.service").then(
      (m) => new m.AnthropicService()
    ),
  "claude-3.5-sonnet-20240307": () =>
    import("./llm-providers/anthropic/anthropic.service").then(
      (m) => new m.AnthropicService()
    ),
  "claude-3-haiku-20240307": () =>
    import("./llm-providers/anthropic/anthropic.service").then(
      (m) => new m.AnthropicService()
    ),
};

export async function resolveLLM(model: Models): Promise<LLM> {
  const serviceLoader = modelServiceMap[model];
  if (!serviceLoader) {
    throw new Error(`Unsupported model: ${model}`);
  }
  return serviceLoader();
}
