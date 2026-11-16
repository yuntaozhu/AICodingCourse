import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function reviewCode(code: string) {
  if (!ai) {
    throw new Error("AI Coding API key not found. Please check your environment variables.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Act as a Principal Software Engineer and Security Auditor. 
Review the following code diff or snippet for:
1. Architectural Adherence (DDD, modularity, decoupling)
2. Security Vulnerabilities (SQLi, XSS, CSRF, sensitive data leaks)
3. Performance Issues (O(n) queries, memory leaks, unnecessary re-renders)
4. Best Practices (naming, readability, maintainability)

Provide the feedback in a structured format with clear headings for each category.

Code to review:
\`\`\`
${code}
\`\`\`
`,
    config: {
      temperature: 0.2,
      topP: 0.95,
      topK: 64,
    },
  });

  return response.text;
}
