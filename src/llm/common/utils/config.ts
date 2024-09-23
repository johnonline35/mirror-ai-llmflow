export interface Config {
  openai: {
    apiKey: string;
  };
  anthropic: {
    apiKey: string;
  };
}

export const config: Config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  },
};

export default config;
