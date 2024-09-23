export class ParsingService {
  private log(message: string, data?: any) {
    console.log(message, data ? JSON.stringify(data) : "");
  }

  parseJson<T>(input: string, keysToFind: (keyof T)[]): Partial<T> {
    try {
      this.log("Received input for parsing:", input);

      let cleanedInput = this.cleanMarkdown(input);

      const jsonContent = this.extractJsonFromText(cleanedInput);

      const parsedJson: T = JSON.parse(jsonContent);

      const foundKeys = this.findKeys(parsedJson, keysToFind);

      if (Object.keys(foundKeys).length > 0) {
        return foundKeys;
      } else {
        this.log("Failed to find any matching keys in the JSON");
        return {};
      }
    } catch (error) {
      this.log("Failed to parse input JSON", error);
      this.log(`Invalid JSON: ${input}`);
      return {};
    }
  }

  cleanMarkdown(text: string): string {
    return text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/Corrected Schema:\n/g, "")
      .trim();
  }

  extractJsonFromText(text: string): string {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No valid JSON object found in text");
    }
    return text.substring(jsonStart, jsonEnd + 1);
  }

  findKeys<T>(obj: T, keys: (keyof T)[]): Partial<T> {
    const result: Partial<T> = {};
    const helper = (currentObj: any) => {
      if (currentObj && typeof currentObj === "object") {
        for (const key in currentObj) {
          if (keys.includes(key as keyof T)) {
            result[key as keyof T] = currentObj[key];
          }
          if (typeof currentObj[key] === "object") {
            helper(currentObj[key]);
          }
        }
      }
    };
    helper(obj);
    return result;
  }
}
