import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import * as fastXmlParser from 'fast-xml-parser';
import * as xmljs from 'xml-js';

// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';





@Injectable({
  providedIn: 'root'
})
export class PdfService {
  

  constructor( private messageService: MessageService ) { pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';}


  extractAllValues(obj: any): any[] {
    let values: any[] = [];
    for (let i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
        values = values.concat(this.extractAllValues(obj[i]));
      } else {
        values.push(obj[i]);
      }
    }
    return values;
  }


  compareDataWithDatabase(data: any) {
    // Implement your logic here to compare the data with your SQL database
    // and return the result.
  }
  

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
          if (xmlData) {
            // Convert XML to JSON
            const jsonData = xmljs.xml2js(xmlData, { compact: true });
            console.log(jsonData); // log the converted JSON data
            console.log(JSON.stringify(jsonData, null, 2))

            // Extract all values
            let allValues = this.extractAllValues(jsonData);
            console.log('Tableau des valeurs',allValues); // log all values
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

  readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        if (event.target) {
          const fileContent = event.target.result;
  
          if (file.type === 'application/json') {
            try {
              const jsonData = JSON.parse(fileContent as string);
              resolve(jsonData);
              console.log(JSON.stringify(jsonData, null, 2))

              // Extract all values
              let allValues = this.extractAllValues(jsonData);
              console.log(allValues); // log all values
            } catch (error) {
              reject('Invalid JSON file.');
            }
          } else if (file.type === 'text/xml') {
            const xmlData = fileContent as string;
  
            // Convert XML to JSON
            const jsonData = xmljs.xml2js(xmlData, { compact: true });
            console.log(jsonData); // log the converted JSON data
            console.log(JSON.stringify(jsonData, null, 2))

            // Extract all values
            let allValues = this.extractAllValues(jsonData);
            console.log('Tableau des valeurs',allValues); // log all values
  
            resolve(jsonData);
          } else {
            reject('Unsupported file type.');
          }
        } else {
          reject('Error reading file.');
        }
      };
  
      reader.onerror = (error) => {
        reject('Error reading file.');
      };
  
      reader.readAsText(file);
    });
  }
  
}
  

