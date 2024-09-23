# LLMFlow Quickstart Guide
LLMFlow is a powerful and flexible TypeScript-first library for working with Language Models (LLMs) in your Node.js applications. It provides an intuitive, type-safe interface for creating, managing, and executing prompts with various LLM providers.
## Installation
```bash
npm i @mirror-ai/llmflow
```
## TypeScript Support
LLMFlow is built with TypeScript and provides first-class TypeScript support out of the box. This native TypeScript integration offers several key advantages that we'll explore throughout this guide.
## Basic Usage

Import the necessary functions:

```typescript
import { createLLMFlow } from 'llm-flow';
```

Create an LLMFlow instance:

```typescript
const flow = createLLMFlow<{ topic: string; length: number }, string>(
"Write a {length}-word paragraph about {topic}",
['topic', 'length'],
{ model: 'gpt-4o-2024-05-13', maxTokens: 100 }
);
```
This example demonstrates several key advantages of LLMFlow's TypeScript integration:

Type Safety: TypeScript generics define the input type as an object with `topic` (string) and `length` (number) properties, and the output type as a string.
Template Validation: The array `['topic', 'length']` ensures that all placeholders in the template string are accounted for. If you mistype a placeholder or forget to include it in the array, TypeScript will raise an error.

Run the flow:

```typescript
const result = await flow.run({ topic: 'artificial intelligence', length: 50 });
console.log(result);
```
TypeScript ensures that you provide the correct input type (an object with `topic` and `length` properties) and that the `result` is treated as a `string`.
This structure provides a robust, type-safe way to define and use prompt templates, reducing errors and improving developer experience.
## Advanced Features
### Versioning
Prompts in LLMFlow are treated as parameters of a machine learning model. The process of prompt engineering involves multiple iterations, similar to hyperparameter tuning in traditional machine learning.
LLMFlow offers automatic versioning and serialization of prompts through static and dynamic analysis. 
Enable versioning to keep track of your prompt templates and LLM configurations:
```typescript
const flowWithVersioning = createLLMFlow<{ topic: string }, string>(
"Write a short paragraph about {topic}",
['topic'],
{ model: 'gpt-4o-2024-05-13', maxTokens: 100 },
{ versioningEnabled: true, storePath: './prompt-checkpoints' }
);
```
In this example:

`versioningEnabled: true` activates the automatic versioning system.
`storePath: './prompt-checkpoints'` specifies the local directory where prompt versions will be stored, similar to saving model checkpoints.

LLMFlow's TypeScript integration provides intelligent autocompletion for versioning options, catching potential typos or type mismatches at compile-time. This ensures that your prompt versioning configuration is always valid, reducing errors in your ML pipeline.
With this setup, each time you run your flow, LLMFlow will:

Automatically version your prompt template
Generate a commit message describing the changes
Store the versioned prompt in the specified checkpoint directory

This allows you to track the evolution of your prompts over time, rollback to previous versions if needed, and maintain a clear history of your prompt engineering process - all integrated seamlessly into your development workflow.
### Multiple LLM Providers
LLMFlow supports various LLM providers. Simply specify the model in the options:
```typescript
const openAIFlow = createLLMFlow(/* ... */, { model: 'gpt-4o-2024-05-13', /* ... */ });
const anthropicFlow = createLLMFlow(/* ... */, { model: 'claude-3-opus-20240229', /* ... */ });
```
TypeScript's union types ensure that only valid model names are accepted:
```typescript
type Models = "gpt-4o-2024-05-13" | "claude-3-opus-20240229" | /* ... other valid models ... */;
```
### Custom Parsing
By default, LLMFlow attempts to parse JSON responses. You can disable this:
```typescript
const flow = createLLMFlow<InputType, string>(
/* ... */,
{ dontParse: true, /* ... */ }
);
```
When `dontParse` is true, TypeScript ensures the output type is `string`.
## TypeScript Advantages in Detail
### 1. Type-Safe Prompt Templates
LLMFlow leverages TypeScript's generic types to ensure type safety when defining prompt templates:
```typescript
const flow = createLLMFlow<{ name: string; age: number }, UserProfile>(
"Generate a user profile for {name}, age {age}",
['name', 'age'],
{ model: 'gpt-4o-2024-05-13' }
);
```
TypeScript ensures that:

The input object must have `name` (string) and `age` (number) properties.
The output must conform to the `UserProfile` interface.

### 2. Autocomplete and IntelliSense
IDE tools provide intelligent code completion for:

Input variables in your prompt templates
LLM options and their allowed values
Methods and properties of the `LLMFlow` class

### 3. Compile-Time Error Checking
TypeScript catches potential errors at compile-time:
```typescript
// TypeScript will catch these errors:
const flow = createLLMFlow<{ topic: number }, string>( // Error: 'topic' should be string
"Write about {topic}",
['topic'],
{ model: 'invalid-model' } // Error: 'invalid-model' is not a valid model option
);
```
### 4. Enhanced Refactoring and Maintenance
Static typing makes refactoring safer and improves code navigation, especially valuable in large projects using LLMFlow.
### 5. Self-Documenting Code
TypeScript interfaces serve as inline documentation:
```typescript
interface VersioningOptions {
versioningEnabled: boolean;
storePath: string;
}
const flow = createLLMFlow<InputType, OutputType>(
template,
inputVariables,
llmOptions,
versioningOptions
);
```
### 6. Type Inference
TypeScript's type inference works seamlessly with LLMFlow:
```typescript
const flow = createLLMFlow(
"Summarize this text: {text}",
['text'],
{ model: 'gpt-4o-2024-05-13' }
);
// TypeScript infers: LLMFlow<{ text: string }, string>
```
###  API Key Configuration for LLMFlow

LLMFlow uses API keys for OpenAI and Anthropic services. These keys should be set as environment variables:

1. Set `OPENAI_API_KEY` for OpenAI services
2. Set `ANTHROPIC_API_KEY` for Anthropic services

Example:
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

The service automatically loads these keys from environment variables:

## Best Practices

Leverage TypeScript's type system to define clear interfaces for your input and output types.
Use TypeScript's strict mode to catch more potential issues.
Take advantage of IDE features like autocompletion and quick documentation for LLMFlow APIs.
Enable versioning in production to track changes in your prompts and configurations.
Handle errors appropriately, as LLM calls can sometimes fail or produce unexpected results.

## Next Steps

Explore the full API documentation for advanced usage and configuration options.
Check out the examples directory for more complex use cases and patterns.
Join our community forum to ask questions and share your experiences with LLMFlow.

Happy coding with LLMFlow!
