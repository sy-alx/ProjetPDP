import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PdfService } from '../pdf.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

interface User {
  NumeroSiret: string;
}

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css']
})

export class CreateInvoiceComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload!: FileUpload;

  maxFileSize = 1000000;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  siretInput: string = '';
  siretIsValid: boolean = false;
  siretIsSelected :boolean = false;

  constructor(private router: Router, private pdfService: PdfService, private http: HttpClient, private messageService: MessageService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<User[]>('http://localhost:3000/api/users', { headers }).subscribe(users => {
      this.users = users;
    });
  }

  filterUsers(event: { query: string }): void {
    const filtered: User[] = [];
    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      if (user.NumeroSiret.toLowerCase().indexOf(event.query.toLowerCase()) === 0) {
        filtered.push(user);
      }
    }
    this.filteredUsers = filtered;
  }


  onSelectSiret(event: any) {
    this.siretInput = event.NumeroSiret;
    this.validateSiret();
    console.log(this.siretInput);
  }
  
  validateSiret() {
    const siretExists = this.users.some(user => user.NumeroSiret === this.siretInput);
    if (siretExists) {
      this.siretIsValid = true;
      this.siretIsSelected = true;
    } else {
      this.siretIsValid = false;
    }
    this.cdr.detectChanges();
  }



  clearFile() {
    this.fileUpload.clear();
  }
  clearSiret() {
    this.siretIsSelected = false;
    this.siretIsValid = false;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onUpload(event: any) {
    console.log('File uploaded:', event);
    for(let file of event.files) {
      console.log(file);
      const reader = new FileReader();
      reader.onload = () => {
        const pdfData = reader.result as ArrayBuffer;
        this.pdfService.extractXmlFromPdf(pdfData).then(xmlData => {
          if (xmlData) {
            console.log('XML data:', xmlData);
          } else {
            this.messageService.add({severity:'error', summary:'Erreur', detail:'Le fichier PDF ne contient pas de pièce jointe XML.'});
            this.fileUpload.remove(file, 0);
          }
        });
      };
      reader.readAsArrayBuffer(file);
    }
  }
}
