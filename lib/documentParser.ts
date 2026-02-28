/**
 * documentParser.ts - Office document text extraction
 *
 * Provides client-side text extraction for Office documents (docx, xlsx, pptx).
 * Used as fallback for providers that don't natively support Office files.
 */

// mammoth, xlsx, jszip are dynamically imported inside parse functions
// to avoid bundling them into the main chunk.

export interface ParseResult {
  text: string;
  metadata?: {
    title?: string;
    sheets?: string[];
    wordCount?: number;
  };
}

/**
 * Extract text from a .docx file using mammoth
 */
export async function parseDocx(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const mammoth = (await import('mammoth')).default;
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).filter(Boolean).length,
    },
  };
}

/**
 * Extract text from an .xlsx/.xls file using SheetJS
 * Each sheet is output as CSV format
 */
export async function parseXlsx(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheets: string[] = workbook.SheetNames;
  const parts: string[] = [];

  for (const sheetName of sheets) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    if (csv.trim()) {
      parts.push(`=== Sheet: ${sheetName} ===\n${csv}`);
    }
  }

  const text = parts.join('\n\n');
  return {
    text,
    metadata: {
      sheets,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    },
  };
}

/**
 * Extract text from a .pptx file by parsing XML slide content
 * Uses JSZip to decompress, then extracts <a:t> text nodes from slide XML
 */
export async function parsePptx(arrayBuffer: ArrayBuffer): Promise<ParseResult> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFiles: string[] = [];

  // Collect slide file names (ppt/slides/slide1.xml, slide2.xml, ...)
  zip.forEach((relativePath) => {
    if (/^ppt\/slides\/slide\d+\.xml$/.test(relativePath)) {
      slideFiles.push(relativePath);
    }
  });

  // Sort by slide number
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
    const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
    return numA - numB;
  });

  const parts: string[] = [];

  for (const slidePath of slideFiles) {
    const xml = await zip.file(slidePath)?.async('text');
    if (!xml) continue;

    // Extract text from <a:t> nodes
    const textNodes = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
    if (textNodes) {
      const slideTexts = textNodes
        .map(node => node.replace(/<[^>]+>/g, '').trim())
        .filter(Boolean);
      if (slideTexts.length > 0) {
        const slideNum = slidePath.match(/slide(\d+)/)?.[1] || '?';
        parts.push(`=== Slide ${slideNum} ===\n${slideTexts.join('\n')}`);
      }
    }
  }

  const text = parts.join('\n\n');
  return {
    text: text || '(No text content found in presentation)',
    metadata: {
      wordCount: text.split(/\s+/).filter(Boolean).length,
    },
  };
}

// MIME types for Office documents
const OFFICE_MIME_TYPES: Record<string, 'docx' | 'xlsx' | 'pptx'> = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xlsx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'pptx',
};

/**
 * Check if a MIME type is an Office document
 */
export function isOfficeMimeType(mimeType: string): boolean {
  return mimeType in OFFICE_MIME_TYPES ||
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('spreadsheetml') ||
    mimeType.includes('presentationml') ||
    mimeType.includes('msword') ||
    mimeType.includes('excel') ||
    mimeType.includes('powerpoint');
}

/**
 * Unified entry point for parsing Office documents
 * Returns null for unsupported MIME types
 */
export async function parseOfficeDocument(
  arrayBuffer: ArrayBuffer,
  mimeType: string
): Promise<ParseResult | null> {
  const docType = OFFICE_MIME_TYPES[mimeType];

  // Also check by pattern matching for edge cases
  const isWord = docType === 'docx' || mimeType.includes('wordprocessingml') || mimeType.includes('msword');
  const isExcel = docType === 'xlsx' || mimeType.includes('spreadsheetml') || mimeType.includes('excel');
  const isPpt = docType === 'pptx' || mimeType.includes('presentationml') || mimeType.includes('powerpoint');

  if (isWord) return parseDocx(arrayBuffer);
  if (isExcel) return parseXlsx(arrayBuffer);
  if (isPpt) return parsePptx(arrayBuffer);

  return null;
}
