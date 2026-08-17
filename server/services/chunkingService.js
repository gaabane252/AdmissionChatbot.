export const chunkingService = {
  /**
   * Split raw text into semantic chunks with overlap
   * @param {string} text 
   * @param {number} chunkSize Maximum characters per chunk (default 1200)
   * @param {number} chunkOverlap Overlap characters between chunks (default 200)
   * @returns {Array<{ content: string, chunk_index: number }>}
   */
  createChunks(text, chunkSize = 1200, chunkOverlap = 200) {
    if (!text || typeof text !== 'string') return [];

    // Clean whitespace
    const cleanedText = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    if (cleanedText.length === 0) return [];

    const chunks = [];
    let start = 0;
    let index = 0;

    while (start < cleanedText.length) {
      let end = start + chunkSize;

      // If not at the end of text, try to break at paragraph or sentence boundary
      if (end < cleanedText.length) {
        const lastParagraph = cleanedText.lastIndexOf('\n\n', end);
        const lastPeriod = cleanedText.lastIndexOf('. ', end);

        if (lastParagraph > start + chunkSize / 2) {
          end = lastParagraph + 2;
        } else if (lastPeriod > start + chunkSize / 2) {
          end = lastPeriod + 2;
        }
      }

      const chunkContent = cleanedText.slice(start, end).trim();
      if (chunkContent.length > 0) {
        chunks.push({
          content: chunkContent,
          chunk_index: index++,
        });
      }

      start = end - chunkOverlap;
      if (start >= cleanedText.length) break;
    }

    return chunks;
  }
};
