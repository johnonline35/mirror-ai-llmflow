type ExtractVariables<T extends string> =
  T extends `${string}{{${infer Var}}}${infer Rest}`
    ? Var | ExtractVariables<Rest>
    : never;

type PromptTemplateType<T extends string> = {
  [K in ExtractVariables<T>]: any;
};

export type PromptTemplate<T extends string> = {
  template: T;
  inputVariables: Array<keyof PromptTemplateType<T>>;
};

export function createPromptTemplate<T extends string>(
  template: T
): PromptTemplate<T> {
  const inputVariables = [...template.matchAll(/{{(\w+)}}/g)].map(
    (match) => match[1]
  ) as Array<keyof PromptTemplateType<T>>;
  return { template, inputVariables };
}

export function formatPrompt<T extends string, V extends PromptTemplateType<T>>(
  promptTemplate: PromptTemplate<T>,
  input: V
): string {
  return promptTemplate.template.replace(/{{(\w+)}}/g, (_, key) => {
    const value = input[key as keyof V];
    return value !== undefined ? String(value) : "";
  });
}

// type ExtractVariables<T extends string> =
//   T extends `${string}{{${infer Var}}}${infer Rest}`
//     ? Var | ExtractVariables<Rest>
//     : never;

// export type PromptTemplateType<
//   T extends string,
//   V = string | number | boolean
// > = {
//   [K in ExtractVariables<T>]: V;
// };

// export type PromptTemplate<T extends string> = {
//   template: T;
//   inputVariables: Array<keyof PromptTemplateType<T>>;
// };

// export function createPromptTemplate<T extends string>(
//   template: T
// ): PromptTemplate<T> {
//   const inputVariables = [...template.matchAll(/{{(\w+)}}/g)].map(
//     (match) => match[1]
//   ) as Array<keyof PromptTemplateType<T>>;
//   return { template, inputVariables };
// }

// export function formatPrompt<T extends string>(
//   promptTemplate: PromptTemplate<T>,
//   input: PromptTemplateType<T>
// ): string {
//   return promptTemplate.template.replace(/{{(\w+)}}/g, (_, key) => {
//     const value = input[key as keyof PromptTemplateType<T>];
//     return value !== undefined ? String(value) : "";
//   });
// }
