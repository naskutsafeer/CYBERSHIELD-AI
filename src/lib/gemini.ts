import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  threat: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  explanation: string;
  recommendation: string;
}

export const analyzePhishing = async (text: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Act as a cybersecurity AI. Analyze the following message and detect phishing or scam.
Check for: Fake links, Urgency, Threat language, Financial fraud, OTP requests, Bank fraud.
Message: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          threat: { type: Type.STRING },
          risk_level: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ["threat", "risk_level", "confidence", "explanation", "recommendation"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const analyzeURL = async (url: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Act as a cybersecurity AI. Analyze the given URL.
Check for: Domain reputation, Phishing patterns, Suspicious words, Fake domains, Security risk.
URL: ${url}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          threat: { type: Type.STRING },
          risk_level: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ["threat", "risk_level", "confidence", "explanation", "recommendation"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const analyzeLogs = async (logs: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a cybersecurity log analysis AI. Analyze system logs and detect suspicious activity.
Look for: Multiple login attempts, Unknown IP, Brute force, Unusual access time, Unauthorized access.
Logs: ${logs}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          threat: { type: Type.STRING },
          risk_level: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ["threat", "risk_level", "confidence", "explanation", "recommendation"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const analyzeCode = async (code: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a secure code analysis AI. Analyze the following code and detect vulnerabilities.
Check for: SQL injection, XSS, Hardcoded password, Unsafe API, Weak authentication, Memory issues.
Code: ${code}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          threat: { type: Type.STRING },
          risk_level: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ["threat", "risk_level", "confidence", "explanation", "recommendation"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const analyzeDeepfake = async (content: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are an AI media authenticity analyzer. Analyze the given content for deepfakes or misinformation.
Check for: Fake image/video/news, Deepfake indicators, Manipulation.
Content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          threat: { type: Type.STRING },
          risk_level: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          recommendation: { type: Type.STRING },
        },
        required: ["threat", "risk_level", "confidence", "explanation", "recommendation"],
      },
    },
  });
  return JSON.parse(response.text);
};
