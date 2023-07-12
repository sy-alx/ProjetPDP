import { Injectable } from '@angular/core';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';}

  extractXmlFromPdf(pdfData: ArrayBuffer): Promise<any> {
    console.log('Extracting XML from PDF...');
    return pdfjsLib.getDocument({data: pdfData}).promise.then((doc: any) => {
      console.log('PDF document loaded, getting attachments...');
      return doc.getAttachments().then((attachments: any) => {
        if (attachments) {
          console.log('Attachments found:', attachments);
          let xmlData;
for (const [filename, file] of Object.entries(attachments)) {
  if (filename.endsWith('.xml')) {
    xmlData = new TextDecoder().decode(new Uint8Array((file as any).content));
  }
}
return xmlData; // Return the XML data

        } else {
          console.log('No attachments found in PDF.');
          return null; // Return null if no attachments were found
        }
      });
    }).catch((error: any) => {
      console.error('Error extracting XML from PDF:', error);
      return null; // Return null if an error occurred
    });
  }
  
  
  
}
