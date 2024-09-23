export type PromptTemplate<TInput extends Record<string, string>> = {
  template: string;
};

export function createPromptTemplate<TInput extends Record<string, string>>(
  template: string
): PromptTemplate<TInput> {
  return { template };
}

export function formatPrompt<TInput extends Record<string, string>>(
  promptTemplate: PromptTemplate<TInput>,
  input: TInput
): string {
  return promptTemplate.template.replace(
    /{(\w+)}/g,
    (_, key) => String(input[key as keyof TInput]) || ""
  );
}
