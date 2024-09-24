type ExtractVariables<T extends string> =
  T extends `${string}{${infer Var}}${infer Rest}`
    ? Var | ExtractVariables<Rest>
    : never;

export type ValidateTemplate<
  Template extends string,
  Input extends Record<string, unknown>
> = ExtractVariables<Template> extends keyof Input
  ? keyof Input extends ExtractVariables<Template>
    ? Input
    : never
  : never;

export type PromptTemplate<
  Template extends string,
  TInput extends Record<string, unknown>
> = {
  template: Template;
};

export function createPromptTemplate<
  Template extends string,
  TInput extends Record<string, unknown>
>(
  template: Template,
  _input: ValidateTemplate<Template, TInput>
): PromptTemplate<Template, TInput> {
  return { template };
}

export function formatPrompt<
  Template extends string,
  TInput extends Record<string, unknown>
>(promptTemplate: PromptTemplate<Template, TInput>, input: TInput): string {
  return promptTemplate.template.replace(
    /{(\w+)}/g,
    (_, key) => String(input[key as keyof TInput]) || ""
  );
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
