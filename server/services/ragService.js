import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { embeddingService } from './embeddingService.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ppgkeiwxnjnjzacyhdog.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZ2tlaXd4bmpuanphY3loZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTc3NzUsImV4cCI6MjEwMjI5Mzc3NX0.oug1soLLTBoshX7_Z8ENae1_-DLwEsbd-FyW6dCqw04';
  return createClient(url, key);
}

let aiInstance = null;
function getGenAI() {
  if (!aiInstance && process.env.GEMINI_API_KEY) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export const ragService = {
  /**
   * Search knowledge base for relevant chunks with hybrid fallback
   */
  async searchKnowledgeBase(query, matchThreshold = 0.15, matchCount = 5) {
    try {
      const supabase = getSupabase();
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // 1. Vector Semantic Match
      const { data: matchedChunks, error } = await supabase.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
      });

      if (!error && Array.isArray(matchedChunks) && matchedChunks.length > 0) {
        return matchedChunks;
      }

      // 2. Keyword Search Fallback
      const keywords = query
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 3);

      if (keywords.length > 0) {
        let queryBuilder = supabase
          .from('document_chunks')
          .select('id, document_id, content, metadata')
          .limit(matchCount);

        const filterConditions = keywords.map(kw => `content.ilike.%${kw}%`).join(',');
        const { data: keywordChunks } = await queryBuilder.or(filterConditions);

        if (keywordChunks && keywordChunks.length > 0) {
          return keywordChunks;
        }
      }

      // 3. Fallback to Latest Available Knowledge Chunks
      const { data: fallbackDocs } = await supabase
        .from('document_chunks')
        .select('id, document_id, content, metadata')
        .limit(matchCount);

      return fallbackDocs || [];
    } catch (err) {
      console.error('Search Knowledge Base Error:', err);
      return [];
    }
  },

  /**
   * Generate RAG Answer using Gemini AI
   */
  async generateResponse(query, chatHistory = [], onChunk = null) {
    const retrievedChunks = await this.searchKnowledgeBase(query);
    
    const contextText = retrievedChunks.map((c, i) => `[Source ${i + 1}]:\n${c.content}`).join('\n\n');
    const sources = [...new Set(retrievedChunks.map(c => c.metadata?.file_name || 'Official SNU Document'))];

    const systemPrompt = `You are the official SNU AI Admission Assistant for Somali National University (Jaamacadda Ummadda Soomaaliyeed - SNU).

YOUR OBJECTIVE:
Provide welcoming, accurate, well-structured, and helpful admission guidance to prospective and current students strictly grounded in the official SNU documentation context provided below.

CRITICAL INSTRUCTIONS & RULES:
1. MANDATORY OPENING:
Every single response MUST start with:
"Welcome to Somali National University!"
Followed by a line break, and then proceed directly with the helpful, structured answer.

2. LANGUAGE MATCHING & QUALITY:
- If the student's question is in Somali (Af-Soomaali), respond fluently, clearly, and professionally in Somali using natural vocabulary, bullet points, and proper grammar.
- If the student's question is in English, respond in clear, professional, and well-structured English.

3. ANSWERING ADMISSION & REGISTRATION INQUIRIES:
- Ground your answers in the Knowledge Base Context below.
- When students ask about registration requirements, documents needed (such as Secondary School Certificate, transcripts, National ID / birth certificate, passport photos, application fee of US$55, application form, and entrance exams/interviews), faculties, tuition (which is tuition-free for undergraduate programs), administrative charges per faculty, or steps to apply, extract and explain these details clearly.
- If a student specifies an academic year (e.g. 2025, 2026, or current/upcoming year), provide the official admission requirements, required documents, and application steps from the context to guide them fully.

4. MISSING OR OUT-OF-SCOPE QUESTIONS:
- Only if the student's question is completely unrelated to SNU / university admissions or cannot be answered from the context:
  * In Somali, respond: "Xogtaan ma hayo maadaama aysan ku jirin dukumiintiyada rasmiga ah ee jaamacadda SNU. Fadlan wixii faahfaahin dheeraad ah kala xiriir Xafiiska Admission-ka SNU (admissions@snu.edu.so)."
  * In English, respond: "I do not have this information in the official SNU documents. For further details, please contact the SNU Admissions Office at admissions@snu.edu.so."

Official Knowledge Base Context:
---
${contextText || 'No specific document context found.'}
---
`;

    const ai = getGenAI();

    if (ai && process.env.GEMINI_API_KEY) {
      const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.7-flash'];
      
      for (const modelName of modelsToTry) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemPrompt}\n\nStudent Question: ${query}\n\nReminder:\n- Start response with "Welcome to Somali National University!"\n- Match the student's language (Somali for Somali, English for English).\n- Provide clear, helpful, bulleted details based on the context.`
                  }
                ]
              }
            ]
          });

          let fullText = '';
          for await (const chunk of responseStream) {
            const textChunk = typeof chunk.text === 'function' ? chunk.text() : (chunk.text || '');
            fullText += textChunk;
            if (onChunk) onChunk(textChunk);
          }

          if (fullText && fullText.trim()) {
            return { answer: fullText.trim(), sources, retrievedChunks };
          }
        } catch (err) {
          console.warn(`Gemini generation with ${modelName} failed, trying next:`, err.message || err);
        }
      }
    }

    const isSomali = /(maxay|sidee|waa|iyo|ku|ah|ma|yahay|tahay|fadlan|kulliyad|jaamacad|shuruud|lacag|dufcad|dhigasho|waxbarasho|somal|keen|qab|maalin|dukument|shahaado)/i.test(query);

    const fallbackAnswer = isSomali
      ? `Welcome to Somali National University!\n\n${retrievedChunks.length > 0 ? 'Iyadoo lagu saleynayo dukumiintiyada rasmiga ah ee SNU:\n\n' + retrievedChunks.map(c => c.content).join('\n\n').slice(0, 500) + '...' : 'Xogtaan ma hayo maadaama aysan ku jirin dukumiintiyada rasmiga ah ee jaamacadda SNU. Fadlan wixii faahfaahin dheeraad ah kala xiriir Xafiiska Admission-ka SNU (admissions@snu.edu.so).'}`
      : `Welcome to Somali National University!\n\n${retrievedChunks.length > 0 ? 'Based on official SNU documents:\n\n' + retrievedChunks.map(c => c.content).join('\n\n').slice(0, 500) + '...' : 'I do not have this information in the official SNU documents. For further details, please contact the SNU Admissions Office at admissions@snu.edu.so.'}`;

    if (onChunk) {
      onChunk(fallbackAnswer);
    }

    return { answer: fallbackAnswer, sources, retrievedChunks };
  }
};
