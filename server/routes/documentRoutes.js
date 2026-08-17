import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { pdfService } from '../services/pdfService.js';
import { chunkingService } from '../services/chunkingService.js';
import { embeddingService } from '../services/embeddingService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function getSupabase(req = null) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
  
  const options = {};
  const authHeader = req?.headers?.authorization;
  if (authHeader) {
    options.global = {
      headers: {
        Authorization: authHeader,
      },
    };
  }
  return createClient(url, key, options);
}

/**
 * POST /api/documents/process
 */
router.post('/process', upload.single('file'), async (req, res) => {
  try {
    const { documentId, fileUrl } = req.body;
    const supabase = getSupabase(req);

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }

    let pdfBuffer;
    if (req.file) {
      pdfBuffer = req.file.buffer;
    } else if (fileUrl) {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(fileUrl);

      if (error) throw error;
      pdfBuffer = Buffer.from(await data.arrayBuffer());
    } else {
      return res.status(400).json({ error: 'Either file upload or fileUrl is required' });
    }

    await supabase.from('documents').update({ status: 'processing' }).eq('id', documentId);

    const { text, numPages } = await pdfService.extractText(pdfBuffer);
    const chunks = chunkingService.createChunks(text);

    // Fetch document details for metadata
    const { data: docData } = await supabase
      .from('documents')
      .select('title, file_name, category')
      .eq('id', documentId)
      .single();

    const fileName = req.body?.fileName || docData?.file_name || req.file?.originalname || 'Official SNU Document';
    const docTitle = req.body?.title || docData?.title || fileName;

    const chunkRecords = [];
    for (const chunk of chunks) {
      const vector = await embeddingService.generateEmbedding(chunk.content);

      chunkRecords.push({
        document_id: documentId,
        content: chunk.content,
        embedding: vector,
        chunk_index: chunk.chunk_index,
        page_number: Math.min(Math.ceil((chunk.chunk_index + 1) * (numPages / Math.max(chunks.length, 1))), numPages),
        metadata: {
          file_url: fileUrl || '',
          file_name: fileName,
          title: docTitle,
          category: req.body?.category || docData?.category || 'general',
        },
      });
    }

    if (chunkRecords.length > 0) {
      const { error: insertErr } = await supabase.from('document_chunks').insert(chunkRecords);
      if (insertErr) throw insertErr;
    }

    await supabase.from('documents').update({ status: 'ready' }).eq('id', documentId);

    return res.json({
      success: true,
      documentId,
      chunksProcessed: chunkRecords.length,
      status: 'ready',
    });
  } catch (error) {
    console.error('Error processing document:', error);
    if (req.body?.documentId) {
      const supabase = getSupabase();
      await supabase.from('documents').update({ status: 'failed' }).eq('id', req.body.documentId);
    }
    return res.status(500).json({ error: error.message || 'PDF processing failed' });
  }
});

export default router;
