import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const DOC_PATHS = [
  { path: '/docs/rbi_customer_service.pdf', name: 'RBI Master Circular on Customer Service' },
  { path: '/docs/rbi_grievance_redressal.pdf', name: 'RBI Grievance Redressal Guidelines' },
];

// Returns combined text from all PDFs, truncated to 15,000 chars
export async function loadPolicyDocuments(): Promise<{ text: string; sources: string[] }> {
  let combinedText = '';
  const sources: string[] = [];

  for (const docInfo of DOC_PATHS) {
    try {
      const loadingTask = pdfjsLib.getDocument(docInfo.path);
      const pdf = await loadingTask.promise;
      let docText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        docText += strings.join(' ') + '\n';
      }
      combinedText += `\n--- START OF DOCUMENT: ${docInfo.name} ---\n${docText}\n--- END OF DOCUMENT ---\n`;
      sources.push(docInfo.name);
    } catch (e: any) {
      console.error(`Failed to load ${docInfo.path}: ${e?.message || e}`);
    }
  }

  return { text: combinedText.substring(0, 15000), sources };
}

// Module-level cache — load once, reuse everywhere
let cachedDocs: { text: string; sources: string[] } | null = null;
export async function getDocuments(): Promise<{ text: string; sources: string[] }> {
  if (cachedDocs) return cachedDocs;
  cachedDocs = await loadPolicyDocuments();
  console.log(`Policy documents loaded: ${cachedDocs.text.length} chars`);
  return cachedDocs;
}

// Loading state for UI
export type DocLoadState = 'idle' | 'loading' | 'ready' | 'error';
