import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  items: MenuItem[] = [];

  

  ngOnInit() {
    const welcomeMessageShown = localStorage.getItem('welcomeMessageShown');
    if (welcomeMessageShown === 'false') {
      setTimeout(() => {
        this.messageService.add({severity:'success',life: 5000, summary:'Bonjour', detail:`Bienvenue sur votre plateforme de dématérialisation partenaire !`});
      }, 900);
      localStorage.setItem('welcomeMessageShown', 'true');
    }
    
    this.items = [
      {
        label: 'Emettre une facture',
        icon: 'pi pi-fw pi-plus',
        command: () => {
          this.router.navigate(['/create-invoice']);
        }
      },
      {
        label: 'Traiter mes factures',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          this.router.navigate(['/invoice-traitement']);
        }
      },
      {
        label: 'Historique des factures',
        icon: 'pi pi-fw pi-file',
        command: () => {
          this.router.navigate(['/invoice-history']);
        }
      },
      {
        label: 'Profil',
        icon: 'pi pi-fw pi-user',
        command: () => {
          this.router.navigate(['/profil']);
        }
      },
      {
        label: 'Déconnexion',
        icon: 'pi pi-fw pi-power-off',
        command: () => {
          this.logout();
        }
      }
    ];
  }


  constructor(private router: Router, private confirmationService: ConfirmationService, private messageService: MessageService) { }
  logout() {
   this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non', 
      accept: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      reject: () => {
        // l'utilisateur a refusé la déconnexion
      }
    });
  }

}

