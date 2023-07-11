import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css']
})
export class CreateInvoiceComponent implements OnInit {

  maxFileSize = 1000000;


  
  constructor(private router: Router) { }

  ngOnInit(): void {
  }


  //-----------------------------------------------------------------------------------------------------

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  //-----------------------------------------------------------------------------------------------------

  onUpload(event: any) {
    // L'événement contient les données du fichier téléchargé
    for(let file of event.files) {
        console.log(file);
    }
}



}
