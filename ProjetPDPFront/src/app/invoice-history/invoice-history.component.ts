import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';


interface User {
  NumeroSiret: string;
  
}

@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.css']
})
export class InvoiceHistoryComponent {

  user!: User;
  invoices: any[] = [];
  displayDialog = false;
  currentInvoice: any;

  constructor(private router: Router, private http: HttpClient, private confirmationService: ConfirmationService, private messageService: MessageService) { }


  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  showInvoiceDetails(invoice: any) {
    this.currentInvoice = invoice;
    this.displayDialog = true;
  }


  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<User>('http://localhost:3000/api/user', { headers }).subscribe(user => {
      this.user = user;
      this.loadInvoices(user.NumeroSiret); // Chargez les factures une fois que vous avez le numéro de SIRET
    });
}

loadInvoices(siret: string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`http://localhost:3000/api/invoices/closed/${siret}`, { headers }).subscribe((invoices: any[]) => {
        this.invoices = invoices.filter(invoice => 
            (invoice.emetteur.NumeroSiret === siret || invoice.correspondant.NumeroSiret === siret) && 
            (invoice.status === 'Accepté' || invoice.status === 'Refusé')
        );
    }); 
}


}
