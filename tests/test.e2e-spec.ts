import { createLLMFlow } from "../src/llm/llm-flow";
import { LLMOptions } from "../src/llm/llm.interface";

describe("LLM Flow E2E Test with Mixed JSON and String Output (Non-NestJS)", () => {
  jest.setTimeout(30000); // Increase timeout for API calls

  it("should call the OpenAI API and return a valid complex JSON response", async () => {
    interface CountryResponse {
      countries: Array<{
        name: string;
        capital: string;
        population: number;
        area: number;
        languages: string[];
      }>;
    }

    const options: LLMOptions = {
      model: "gpt-4o-2024-08-06",
      responseFormat: "json_object",
      maxTokens: 300,
      temperature: 0.7,
    };

    const jsonFlow = createLLMFlow<Record<string, never>, CountryResponse>(
      "Return a JSON object with the details of three countries, including the capital, population, area, and languages spoken for each country.",
      options
    );

    const response = await jsonFlow.run({});

    expect(response).toHaveProperty("countries");
    expect(Array.isArray(response.countries)).toBe(true);
    expect(response.countries.length).toBe(3);

    response.countries.forEach((country) => {
      expect(country).toMatchObject({
        name: expect.any(String),
        capital: expect.any(String),
        population: expect.any(Number),
        area: expect.any(Number),
        languages: expect.arrayContaining([expect.any(String)]),
      });
    });
  });

  it("should handle plain text responses", async () => {
    const textFlow = createLLMFlow<Record<string, never>, string>(
      "Tell me a random fact about the Eiffel Tower.",
      {
        model: "gpt-4o-2024-08-06",
        responseFormat: "text",
        maxTokens: 100,
        temperature: 0.7,
      }
    );

    const response = await textFlow.run({});
    expect(typeof response).toBe("string");
    expect(response.toLowerCase()).toContain("eiffel tower");
    console.log("Plain text response:", response);
  });

  it("should handle JSON responses with markdown formatting", async () => {
    const markdownJsonFlow = createLLMFlow<Record<string, never>, any>(
      "Return a JSON object with details of a book, including title, author, and publication year. Wrap the JSON in markdown code blocks.",
      {
        model: "gpt-4o-2024-08-06",
        responseFormat: "text",
        maxTokens: 200,
        temperature: 0.7,
      }
    );

    const response = await markdownJsonFlow.run({});
    expect(typeof response).toBe("object");
    expect(response).toHaveProperty("title");
    expect(response).toHaveProperty("author");
    expect(response).toHaveProperty("publication_year");
  });

  it("should handle potential errors gracefully", async () => {
    const options: LLMOptions = {
      model: "gpt-4o-2024-08-06",
      responseFormat: "json_object",
      maxTokens: 10,
      temperature: 0.7,
    };

    const errorFlow = createLLMFlow<Record<string, never>, string>(
      "This is an intentionally long and complex prompt that might cause issues. ".repeat(
        50
      ),
      options
    );

    const response = await errorFlow.run({});
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
    expect(response.toLowerCase()).toMatch(/repeat|same|phrase|multiple/);
  });

  it("should handle responses with varying levels of detail", async () => {
    const options: LLMOptions = {
      model: "gpt-4o-2024-08-06",
      responseFormat: "json_object",
      maxTokens: 200,
      temperature: 0.9,
    };

    const detailFlow = createLLMFlow<Record<string, never>, string>(
      "Provide information about a random city. The level of detail may vary.",
      options
    );

    const response = await detailFlow.run({});
    expect(typeof response).toBe("string");
    expect(response.length).toBeGreaterThan(0);
    expect(response).toContain("city");
  });
});
