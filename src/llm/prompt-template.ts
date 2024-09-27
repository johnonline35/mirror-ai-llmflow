type ExtractVariables<T extends string> =
  T extends `${string}{{${infer Var}}}${infer Rest}`
    ? Var | ExtractVariables<Rest>
    : never;

export type ValidateTemplateVariables<
  Template extends string,
  Input extends Record<string, any>
> =
  // Check if there are any variables in the template that are not in Input
  Exclude<ExtractVariables<Template>, keyof Input> extends never
    ? // Now check if there are any keys in Input that are not used in the template
      Exclude<keyof Input, ExtractVariables<Template>> extends never
      ? Template // All variables match; return the Template type
      : never // Extra keys in Input not used in Template; cause error
    : never; // Variables in Template not present in Input; cause error

export type PromptTemplateType<Template extends string> = {
  [K in ExtractVariables<Template>]: any;
};

export type PromptTemplate<Template extends string> = {
  template: Template;
};

export function createPromptTemplate<T extends string>(
  template: T
): PromptTemplate<T> {
  return { template };
}

export function formatPrompt<T extends string, V extends PromptTemplateType<T>>(
  promptTemplate: PromptTemplate<T>,
  input: V
): string {
  return promptTemplate.template.replace(/{{([\w.]+)}}/g, (_, key) => {
    const keys = key.split(".");
    let value: any = input;
    for (const k of keys) {
      if (value === undefined) break;
      value = value[k];
    }
    return value !== undefined ? String(value) : "";
  });
}

// ---- this version uses TypeScript generics to enforce the correct input object properties----

// type ExtractVariables<T extends string> =
//   T extends `${string}{{${infer Var}}}${infer Rest}`
//     ? Var | ExtractVariables<Rest>
//     : never;

// type PromptTemplateType<T extends string> = {
//   [K in ExtractVariables<T>]: any | any[] | Record<string, any>;
// };

// export type PromptTemplate<T extends string> = {
//   template: T;
//   inputVariables: Array<keyof PromptTemplateType<T>>;
// };

// export function createPromptTemplate<T extends string>(
//   template: T
// ): PromptTemplate<T> {
//   const inputVariables = [...template.matchAll(/{{([\w.]+)(\[\])?}}/g)].map(
//     (match) => match[1].split(".")[0]
//   ) as Array<keyof PromptTemplateType<T>>;
//   return { template, inputVariables };
// }

// export function formatPrompt<T extends string, V extends PromptTemplateType<T>>(
//   promptTemplate: PromptTemplate<T>,
//   input: V
// ): string {
//   return promptTemplate.template.replace(
//     /{{([\w.]+)(\[\])?}}/g,
//     (_, key, isArray) => {
//       const keys = key.split(".");
//       let value = input;
//       for (const k of keys) {
//         if (value === undefined) break;
//         value = value[k as keyof typeof value];
//       }
//       if (isArray && Array.isArray(value)) {
//         return value.join(", ");
//       }
//       return value !== undefined ? String(value) : "";
//     }
//   );
// }

// ---- This version finds missing properties in the input object----

// type ExtractVariables<T extends string> =
//   T extends `${string}{{${infer Var}}}${infer Rest}`
//     ? Var | ExtractVariables<Rest>
//     : never;

// type ErrorMessage<T extends string> = `Missing required properties: ${T}`;

// export type ValidateTemplate<
//   Template extends string,
//   Input extends Record<string, unknown>
// > = ExtractVariables<Template> extends keyof Input
//   ? keyof Input extends ExtractVariables<Template>
//     ? Input
//     : ErrorMessage<Exclude<ExtractVariables<Template>, keyof Input> & string>
//   : ErrorMessage<Exclude<ExtractVariables<Template>, keyof Input> & string>;

// export type PromptTemplate<Template extends string> = {
//   template: Template;
// };

// export function createPromptTemplate<Template extends string>(
//   template: Template
// ): PromptTemplate<Template> {
//   return { template };
// }

// export function formatPrompt<
//   Template extends string,
//   TInput extends Record<string, unknown>
// >(
//   promptTemplate: PromptTemplate<Template>,
//   input: ValidateTemplate<Template, TInput>
// ): string {
//   return promptTemplate.template.replace(/{(\w+)}/g, (_, key) => {
//     const typedKey = key as Extract<keyof TInput, string>;
//     return String((input as TInput)[typedKey]) || "";
//   });
// }
