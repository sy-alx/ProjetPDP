import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';
import { MessageService } from 'primeng/api';


interface User {
  NumeroSiret: string;
  
}

@Component({
  selector: 'app-invoice-traitement',
  templateUrl: './invoice-traitement.component.html',
  styleUrls: ['./invoice-traitement.component.css']
})
export class InvoiceTraitementComponent implements OnInit{

  user!: User;
  invoices: any[] = [];
  displayDialog = false;
  currentInvoice: any;
  displayDownloadDialog = false;
  decisionMade = false;

  constructor(private router: Router, private http: HttpClient, private confirmationService: ConfirmationService, private messageService: MessageService) { }


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

    this.http.get<any[]>(`http://localhost:3000/api/invoices/${siret}`, { headers }).subscribe((invoices: any[]) => {
    this.invoices = invoices;
    }); 
  }

  showInvoiceDetails(invoice: any) {
    this.currentInvoice = invoice;
    this.displayDialog = true;
  }

  onAccept(invoice: any): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir accepter cette facture ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.put(`http://localhost:3000/api/invoices/${invoice._id}`, { status: 2 }, { headers })
          .subscribe(() => {
            invoice.status = 'Accepté';
            this.decisionMade = true;
            this.messageService.add({severity:'success', summary:'Facture acceptée', detail:'La facture a été acceptée.'});
          });
      }
    });
  }
  
  
  onReject(invoice: any): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir refuser cette facture ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.put(`http://localhost:3000/api/invoices/${invoice._id}`, { status: 3 }, { headers })
          .subscribe(() => {
            invoice.status = 'Refusé';
            this.decisionMade = true;
            this.messageService.add({severity:'error', summary:'Facture refusée', detail:'La facture a été refusée.'});
          });
      }
    });
  }
  

  onDownload(invoice: any): void {
    this.currentInvoice = invoice;
    this.displayDownloadDialog = true;
  }
  

  downloadInvoice(invoiceId: string, format: string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get(`http://localhost:3000/api/invoices/${format}/${invoiceId}`, { headers, responseType: 'blob' })
        .subscribe((data: Blob) => {
            const downloadURL = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = downloadURL;
            link.download = `invoice_${invoiceId}.${format}`;
            link.click();
            this.messageService.add({severity:'info', summary:'Téléchargement de la facture', });
    });
  }



  
  

  goToDashboard() {
    if (this.decisionMade) {
      this.confirmationService.confirm({
        message: 'Si vous revenez au tableau de bord, vous ne pourrez plus modifier votre réponse et vous ne pourrez télécharger votre facture. Êtes-vous sûr de vouloir continuer ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        accept: () => {
          this.router.navigate(['/dashboard']);
        }
      });
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
  
  

}
