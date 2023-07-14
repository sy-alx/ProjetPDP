import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PdfService } from '../pdf.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';

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

  correspondantData: any = {};
  
  matchingEmetteurData: any = {};
  matchingCorrespondantData: any = {};

  emetteur: any = {};
  correspondant: any = {};

  constructor(private router: Router, private pdfService: PdfService, private http: HttpClient, private messageService: MessageService, private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<User[]>('http://localhost:3000/api/users', { headers }).subscribe(users => {
      this.users = users;
    });

    this.http.get('http://localhost:3000/api/user', { headers }).subscribe(user => {
      this.correspondantData = user;
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
    console.log('Selected SIRET:', this.siretInput);
    this.getUserBySiret(this.siretInput).subscribe(user => {
      this.selectedUser = user;
    });
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

  compareDataWithDatabase(data: any) {
    // Get the currently logged in user's data
    const loggedInUserData = this.http.get('http://localhost:3000/api/user').toPromise();

    // Get the selected user's data
    const selectedUserData = this.getUserBySiret(this.siretInput).toPromise();

    return Promise.all([loggedInUserData, this.selectedUser]).then(([loggedInUser, selectedUser]) => {
      // Now you have both the logged in user's data and the selected user's data
      // You can compare these with the data parameter as needed
      // ...
    });
  }

  getUserBySiret(siret: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/users/${siret}`);
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
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          const pdfData = reader.result as ArrayBuffer;
          this.pdfService.extractXmlFromPdf(pdfData).then(xmlData => {
            if (xmlData) {
              console.log('XML data:', xmlData); // log XML data extracted from PDF
            } else {
              this.messageService.add({severity:'error', summary:'Erreur', detail:'Le fichier PDF ne contient pas de pièce jointe XML.'});
              this.fileUpload.remove(file, 0);
            }
          });
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/json' || file.type === 'text/xml') {
        this.pdfService.readFile(file).then(data => {
          console.log('File data:', data); // log JSON or XML data read from file
  
          // Convert data to array if it's an object
          if (typeof data === 'object') {
            data = Object.values(data);
          }
  
          // Compare data with database
          this.compareDataWithDatabase(data);
        }).catch(error => {
          this.messageService.add({severity:'error', summary:'Erreur', detail:error});
          this.fileUpload.remove(file, 0);
        });
      } else {
        this.messageService.add({severity:'error', summary:'Erreur', detail:'Type de fichier non pris en charge.'});
        this.fileUpload.remove(file, 0);
      }
    }
  }
  

  
  
}
