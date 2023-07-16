import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import * as fastXmlParser from 'fast-xml-parser';
import * as xmljs from 'xml-js';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';






@Injectable({
  providedIn: 'root'
})
export class PdfService {
  

  constructor( private messageService: MessageService, private http: HttpClient ) { pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.js';}


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

    getUserData(siret: string): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get(`http://localhost:3000/api/users/${siret}`, { headers });
    }

    getLoggedInUserData(): Observable<any> {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get('http://localhost:3000/api/user', { headers });
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
            return jsonData; // Return the JSON data
          } else {
            console.log('No XML data found in PDF.');
            return null; // Return null if no XML data was found
          }
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
            // Handle JSON files
            const jsonData = JSON.parse(event.target.result as string);
            console.log(jsonData); // log the JSON data
            console.log(JSON.stringify(jsonData, null, 2))
  
            // Extract all values
            let allValues = this.extractAllValues(jsonData);
            console.log('Tableau des valeurs',allValues); // log all values
            resolve(jsonData); // Return the JSON data
          } else if (file.type === 'text/xml') {
            // Handle XML files
            const xmlData = event.target.result as string;
            const jsonData = xmljs.xml2js(xmlData, { compact: true });
            console.log(jsonData); // log the converted JSON data
            console.log(JSON.stringify(jsonData, null, 2))
  
            // Extract all values
            let allValues = this.extractAllValues(jsonData);
            console.log('Tableau des valeurs',allValues); // log all values
            resolve(jsonData); // Return the JSON data
          } else if (file.type === 'application/pdf') {
            // Handle PDF files
            const pdfData = new Uint8Array(fileContent as ArrayBuffer);
            this.extractXmlFromPdf(pdfData).then(jsonData => {
              if (jsonData) {
                resolve(jsonData);
              } else {
                reject('No XML data found in PDF.');
              }
            }).catch(error => {
              reject('Error extracting XML from PDF: ' + error);
            });
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
  
      if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  }
  
  
  
}
  

