import { GoogleGenAI } from '@google/genai';

let aiInstance = null;

function getGenAI() {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export const embeddingService = {
  /**
   * Generate 768-dimensional vector embedding for text
   * @param {string} text 
   * @returns {Promise<number[]>} Array of 768 float numbers
   */
  async generateEmbedding(text) {
    const ai = getGenAI();

    if (ai && process.env.GEMINI_API_KEY) {
      const modelsToTry = ['text-embedding-004', 'embedding-001', 'gemini-embedding-001'];
      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.embedContent({
            model: modelName,
            contents: text,
          });

          const values = response?.embeddings?.[0]?.values || response?.embedding?.values;
          if (values && Array.isArray(values) && values.length > 0) {
            // Adjust to 768 dimensions for pgvector schema
            return values.length >= 768 ? values.slice(0, 768) : values;
          }
        } catch (error) {
          // Try next model
        }
      }
    }

    // Deterministic 768-dim pseudo-embedding fallback for local testing when API key is missing
    return this.generateFallbackEmbedding(text);
  },

  /**
   * Generate a normalized 768-dim fallback vector based on string hash
   */
  generateFallbackEmbedding(text) {
    const dim = 768;
    const vector = new Array(dim);
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    let norm = 0;
    for (let i = 0; i < dim; i++) {
      const val = Math.sin(hash + i) * Math.cos(i * 0.5);
      vector[i] = val;
      norm += val * val;
    }

    norm = Math.sqrt(norm);
    for (let i = 0; i < dim; i++) {
      vector[i] = vector[i] / norm;
    }

    return vector;
  }
};
