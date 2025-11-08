export interface AiConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  dailyLimit: number;
}

const config = {
  model: "gpt-3.5-turbo",
  temperature: 0.5,
  maxTokens: 500,
  dailyLimit: 50,
} satisfies AiConfig;

export default config;
