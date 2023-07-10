import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  items: MenuItem[] = [];

  

  ngOnInit() {
    this.items = [
      {
        label: 'Emettre une facture',
        icon: 'pi pi-fw pi-plus',
        command: () => {
          // Votre code pour émettre une facture
        }
      },
      {
        label: 'Traiter mes factures',
        icon: 'pi pi-fw pi-pencil',
        command: () => {
          // Votre code pour traiter les factures
        }
      },
      {
        label: 'Historique des factures',
        icon: 'pi pi-fw pi-file',
        command: () => {
          // Votre code pour afficher l'historique des factures
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


  constructor(private router: Router, private confirmationService: ConfirmationService) { }
  logout() {
   this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
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

