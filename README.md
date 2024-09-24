# LLMFlow Quickstart Guide
LLMFlow is a powerful and flexible TypeScript-first library for working with Language Models (LLMs) in your Node.js applications. It provides an intuitive, type-safe interface for creating, managing, and executing prompts with various LLM providers.
## Installation
```bash
npm i @mirror-ai/llmflow
```
## API Key Configuration

LLMFlow uses API keys for OpenAI and Anthropic services. These keys should be set as environment variables:

* Set `OPENAI_API_KEY` for OpenAI services
* Set `ANTHROPIC_API_KEY` for Anthropic services

Example:

```
OPENAI_API_KEY=your_openai_api_key ANTHROPIC_API_KEY=your_anthropic_api_key
```

The service automatically loads these keys from environment variables.

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
  { model: 'gpt-4-2024-05-13', maxTokens: 100 }
);
```
This example demonstrates several key advantages of LLMFlow's TypeScript integration:

Type Safety: TypeScript generics define the input type as an object with `topic` (string) and `length` (number) properties, and the output type as a string.

Run the flow:

```typescript
const result = await flow.run({ topic: 'artificial intelligence', length: 50 });
console.log(result);
```
TypeScript ensures that you provide the correct input type (an object with `topic` and `length` properties) and that the `result` is treated as a `string`.
This structure provides a robust, type-safe way to define and use prompt templates, reducing errors and improving developer experience.

## Advanced Usage: JSON Output and Complex Flows

LLMFlow can handle complex scenarios where structured output is required. This example demonstrates how to create a flow that assesses whether a user's prompt is possible given a set of available tools, returning a JSON object with a boolean \`success\` flag and a \`feedback\` string.

### Creating a Complex Flow

```typescript
import { createLLMFlow } from 'llm-flow';

const assessmentFlow = createLLMFlow(
  `Assess whether the user prompt "{prompt}" is possible given the following tools: {tools}.
   Your response should include a valid JSON object with two keys:
   "success": boolean (true if the prompt is possible, false otherwise)
   "feedback": string (explanation of your assessment)
   
   Respond only with the JSON object, no additional text.`,
  {
    model: 'gpt-4-2024-05-13',
    maxTokens: 150,
    temperature: 0.2
  }
);
```

This creates a flow that:
- Takes a user prompt and a list of available tools as input
- Instructs the LLM to assess the feasibility of the prompt
- Returns a JSON object with \`success\` and \`feedback\` fields

### Running the Flow

```typescript
const userPrompt = "Generate a 3D model of a house";
const availableTools = ["Text generation", "Image generation", "Code completion"];

assessmentFlow.run({ prompt: userPrompt, tools: availableTools.join(', ') })
  .then((result) => {
    // The result is already parsed as an object by LlmFlow
    console.log(`Is the prompt possible? ${result.success}`);
    console.log(`Feedback: ${result.feedback}`);
  })
  .catch((error) => {
    console.error('Error in assessment:', error);
  });
```

## Key Features

1. Type Inference: LLMFlow automatically infers input and output types based on the prompt template and expected JSON structure.

2. Structured Output: The flow is designed to return a specific JSON structure, which is automatically parsed by the library.

3. Flexible Input: The flow accepts multiple input parameters (\`prompt\` and \`tools\`) which are inserted into the prompt template.

4. Error Handling: The example includes basic error handling to catch any issues during flow execution.

### Notes

- The library parses the LLM's response as JSON automatically. If parsing fails, it will return the raw string response.
- Adjust the \`maxTokens\` and \`temperature\` settings as needed for your specific use case.
- The actual output depends on the LLM's interpretation of the prompt. You may need to iterate on the prompt template to get consistently well-structured responses.

By leveraging LLMFlow's capabilities, you can create complex, type-safe interactions with language models that produce structured data, making it easier to integrate LLM outputs into your applications.

## Using LLMOptions Inline

LLMFlow allows you to specify options directly when creating a flow. Here's how to use some of the key options inline:

```typescript
import { createLLMFlow } from '@mirror-ai/llmflow';

const flow = createLLMFlow<{ topic: string }, string>(
  "Write a short paragraph about {topic}",
  {
    model: 'gpt-4-2024-05-13',
    maxTokens: 100,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
    stopSequences: ['\n', 'END'],
    responseFormat: 'text',
    stream: false
  }
);

// Usage
const result = await flow.run({ topic: 'artificial intelligence' });
console.log(result);
```

### Key Inline Options:

- `model`: Specifies the LLM (e.g., 'gpt-4-2024-05-13', 'claude-3-opus-20240229')
- `maxTokens`: Limits response length
- `temperature`: Controls randomness (0-1)
- `topP`: Nucleus sampling (0-1)
- `frequencyPenalty` and `presencePenalty`: Adjust repetition (-2.0 to 2.0)
- `stopSequences`: Array of stop strings
- `responseFormat`: 'text' or 'json_object'
- `stream`: Enable streaming (boolean)

## Advanced Inline Examples

### JSON Output

```typescript
const jsonFlow = createLLMFlow<{ key1: string, key2: string }, JsonOutputType>(
  "Generate a JSON object with {key1} and {key2}",
  {
    model: 'gpt-4-2024-05-13',
    maxTokens: 150,
    temperature: 0.5,
    responseFormat: 'json_object'
  }
);
```

### Tool Calling

```typescript
const toolFlow = createLLMFlow<{ task: string }, string>(
  "Use available tools to {task}",
  {
    model: 'gpt-4-2024-05-13',
    maxTokens: 200,
    tools: [{
      name: "get_weather",
      description: "Get current weather",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string" }
        },
        required: ["location"]
      }
    }],
    toolChoice: "auto"
  }
);
```

### Streaming

```typescript
const streamingFlow = createLLMFlow<{ topic: string }, string>(
  "Generate a story about {topic}",
  {
    model: 'gpt-4-2024-05-13',
    maxTokens: 500,
    stream: true
  }
);

// Usage
for await (const chunk of streamingFlow.run({ topic: "space exploration" })) {
  console.log(chunk);
}
```

These examples demonstrate how to use LLMFlow's options inline when creating flow instances. Adjust the options as needed for your specific use cases.

### Other Features
### Versioning
Prompts in LLMFlow are treated as parameters of a machine learning model. The process of prompt engineering involves multiple iterations, similar to hyperparameter tuning in traditional machine learning.
LLMFlow offers automatic versioning and serialization of prompts through static and dynamic analysis. 
Enable versioning to keep track of your prompt templates and LLM configurations:
```typescript
const flowWithVersioning = createLLMFlow<{ topic: string; length: number }, string>(
  "Write a {length}-word paragraph about {topic}",
  { model: 'gpt-4-2024-05-13', maxTokens: 100 },
{ versioningEnabled: true, storePath: './prompt-checkpoints' }
);
```
In this example:

`versioningEnabled: true` activates the automatic versioning system.
`storePath: './prompt-checkpoints'` specifies the local directory where prompt versions will be stored, similar to saving model checkpoints.

LLMFlow's TypeScript integration provides intelligent autocompletion for versioning options, catching potential typos or type mismatches at compile-time. This ensures that your prompt versioning configuration is always valid, reducing errors in your ML pipeline.
With this setup, each time you run your flow, LLMFlow will:

- Automatically version your prompt template
- Generate a commit message describing the changes
- Store the versioned prompt in the specified checkpoint directory

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
llmOptions,
versioningOptions
);
```
### 6. Type Inference
TypeScript's type inference works seamlessly with LLMFlow:
```typescript
const flow = createLLMFlow(
"Summarize this text: {text}",
{ model: 'gpt-4o-2024-05-13' }
);
// TypeScript infers: LLMFlow<{ text: string }, string>
```

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
