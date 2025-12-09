import { GoogleGenAI, Chat } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const summarizeContentStream = async (
  content: string, 
  isFile: boolean = false, 
  mimeType: string = 'text/plain'
) => {
  const modelId = 'gemini-2.5-flash';
  
  const systemInstruction = `
    You are an expert academic researcher and synthesizer. Your task is to analyze the provided research paper or text and produce a high-quality, structured summary in Markdown.
    
    Structure the response exactly as follows:
    1. **Title & Authors**: (If extractable from the text, otherwise omit)
    2. **Executive Summary**: A concise 2-3 sentence overview of the paper's core contribution.
    3. **Problem Statement**: What specific problem or gap is this research addressing?
    4. **Methodology**: Briefly describe the methods, data sources, or experimental setup used.
    5. **Key Findings**: A bulleted list of the most significant results or discoveries.
    6. **Implications**: Why does this matter? What is the impact?
    7. **Limitations**: (If mentioned) Any constraints or limitations noted by the authors.

    Keep the tone professional, objective, and academic yet accessible.
  `;

  let contents;

  if (isFile) {
    // Content here is expected to be the base64 string
    contents = {
      parts: [
        { text: "Please summarize this document according to the system instructions." },
        {
          inlineData: {
            mimeType: mimeType,
            data: content
          }
        }
      ]
    };
  } else {
    contents = {
      parts: [{ text: content }]
    };
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: contents as any, // Type assertion for flexibility with parts
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature for more factual summaries
      }
    });

    return responseStream;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const createChatSession = (
  content: string,
  isFile: boolean,
  mimeType: string = 'text/plain'
): Chat => {
  // Use gemini-2.5-flash-lite for fast responses as requested
  const modelId = 'gemini-2.5-flash-lite';
  
  const history = [
    {
      role: 'user',
      parts: [
        { text: "I am providing a research paper/document below. Please analyze it and prepare to answer my questions about it directly and concisely." },
        isFile 
          ? { inlineData: { mimeType, data: content } }
          : { text: content }
      ]
    },
    {
      role: 'model',
      parts: [{ text: "I have analyzed the document. I am ready to answer your questions about it." }]
    }
  ];

  return ai.chats.create({
    model: modelId,
    history: history,
    config: {
      systemInstruction: "You are a helpful research assistant. Answer questions based ONLY on the provided document. Keep answers concise and direct.",
    }
  });
};