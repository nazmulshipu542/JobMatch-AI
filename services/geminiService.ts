import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from "../types";

// NOTE: In a production app, never expose your API key in the frontend code.
// This should be proxied through a backend. 
// For this demo, we assume process.env.API_KEY is available or configured.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  analyzeResumeMatch: async (resumeText: string, jobDescription: string): Promise<GeminiAnalysisResult> => {
    try {
      const model = "gemini-2.5-flash";
      const prompt = `
        Act as an expert Technical Recruiter.
        
        Analyze the following Resume text against the Job Description.
        
        Resume:
        "${resumeText.slice(0, 10000)}"
        
        Job Description:
        "${jobDescription.slice(0, 5000)}"
        
        Provide:
        1. A match score from 0 to 100 based on skills, experience, and relevance.
        2. A list of key missing skills/qualifications.
        3. A brief 1-2 sentence summary explaining the score.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.NUMBER },
              missingSkills: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              analysis: { type: Type.STRING }
            },
            required: ["matchScore", "missingSkills", "analysis"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      return {
        matchScore: result.matchScore || 0,
        missingSkills: result.missingSkills || [],
        analysis: result.analysis || "Could not analyze."
      };

    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      // Fallback in case of API error
      return {
        matchScore: 0,
        missingSkills: ["Error analyzing resume"],
        analysis: "Service temporarily unavailable."
      };
    }
  }
};