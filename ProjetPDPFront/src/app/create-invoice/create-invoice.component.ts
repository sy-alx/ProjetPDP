import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PdfService } from '../pdf.service';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css']
})
export class CreateInvoiceComponent implements OnInit {

  maxFileSize = 1000000;

  constructor(private router: Router, private pdfService: PdfService) { }

  ngOnInit(): void {
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onUpload(event: any) {
    console.log('File uploaded:', event);
    // L'événement contient les données du fichier téléchargé
    for(let file of event.files) {
        console.log(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.pdfService.extractXmlFromPdf(reader.result as ArrayBuffer).then((attachments: any) => {
            console.log(attachments);
            // Ici, vous pouvez traiter les pièces jointes comme vous le souhaitez
          });
        };
        reader.readAsArrayBuffer(file);
    }
}

}
