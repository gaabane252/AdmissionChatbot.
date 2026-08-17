import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');

export const pdfService = {
  /**
   * Extract text from PDF buffer
   * @param {Buffer} pdfBuffer 
   * @returns {Promise<{ text: string, numPages: number, info: object }>}
   */
  async extractText(pdfBuffer) {
    try {
      // 1. Support pdf-parse v2+ (PDFParse class)
      if (pdfParseModule?.PDFParse || (typeof pdfParseModule === 'function' && pdfParseModule.prototype?.getText)) {
        const PDFParserClass = pdfParseModule.PDFParse || pdfParseModule;
        const uint8 = new Uint8Array(pdfBuffer);
        const parser = new PDFParserClass({ data: uint8 });
        const result = await parser.getText();
        
        return {
          text: result?.text || '',
          numPages: result?.total || result?.pages?.length || 1,
          info: {},
        };
      }

      // 2. Support legacy pdf-parse v1 (functional call)
      if (typeof pdfParseModule === 'function') {
        const data = await pdfParseModule(pdfBuffer);
        return {
          text: data.text || '',
          numPages: data.numpages || 1,
          info: data.info || {},
        };
      }

      // 3. Fallback if exported under default property
      if (typeof pdfParseModule?.default === 'function') {
        const data = await pdfParseModule.default(pdfBuffer);
        return {
          text: data.text || '',
          numPages: data.numpages || 1,
          info: data.info || {},
        };
      }

      throw new Error('Unsupported PDF parse library export format');
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`Failed to parse PDF document content: ${error.message}`);
    }
  }
};
