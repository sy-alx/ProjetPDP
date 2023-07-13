import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';



@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor( private messageService: MessageService ) { pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';}

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

  verifyPdf(pdfData: ArrayBuffer): Promise<boolean> {
    console.log('Verifying PDF...');
    return pdfjsLib.getDocument({data: pdfData}).promise.then((doc: any) => {
      console.log('PDF document loaded, checking for XML attachments...');
      return doc.getAttachments().then((attachments: any) => {
        if (attachments) {
          console.log('Attachments found:', attachments);
          for (const filename of Object.keys(attachments)) {
            if (filename.endsWith('.xml')) {
              console.log('XML attachment found in PDF.');
              return true; // Return true if an XML attachment was found
            }
          }
        }
        console.log('No XML attachments found in PDF.');
        return false; // Return false if no XML attachments were found
      });
    }).catch((error: any) => {
      console.error('Error verifying PDF:', error);
      return false; // Return false if an error occurred
    });
  }
}

