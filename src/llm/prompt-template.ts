type ExtractVariables<T extends string> =
  T extends `${string}{${infer Var}}${infer Rest}`
    ? Var | ExtractVariables<Rest>
    : never;

type ErrorMessage<T extends string> = `Missing required properties: ${T}`;

export type ValidateTemplate<
  Template extends string,
  Input extends Record<string, unknown>
> = ExtractVariables<Template> extends keyof Input
  ? keyof Input extends ExtractVariables<Template>
    ? Input
    : ErrorMessage<Exclude<ExtractVariables<Template>, keyof Input> & string>
  : ErrorMessage<Exclude<ExtractVariables<Template>, keyof Input> & string>;

export type PromptTemplate<Template extends string> = {
  template: Template;
};

export function createPromptTemplate<Template extends string>(
  template: Template
): PromptTemplate<Template> {
  return { template };
}

export function formatPrompt<
  Template extends string,
  TInput extends Record<string, unknown>
>(
  promptTemplate: PromptTemplate<Template>,
  input: ValidateTemplate<Template, TInput>
): string {
  return promptTemplate.template.replace(/{(\w+)}/g, (_, key) => {
    const typedKey = key as Extract<keyof TInput, string>;
    return String((input as TInput)[typedKey]) || "";
  });
}

// export type PromptTemplate<TInput extends Record<string, string>> = {
//   template: string;
// };

// export function createPromptTemplate<TInput extends Record<string, string>>(
//   template: string
// ): PromptTemplate<TInput> {
//   return { template };
// }

// export function formatPrompt<TInput extends Record<string, string>>(
//   promptTemplate: PromptTemplate<TInput>,
//   input: TInput
// ): string {
//   return promptTemplate.template.replace(
//     /{(\w+)}/g,
//     (_, key) => String(input[key as keyof TInput]) || ""
//   );
// }
