import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

interface User {
  UtilisateursNom?: string;
  UtilisateursPrenom?: string;
  NumeroSiret?: string;
  NomEntreprise?: string;
  NumeroTelephone?: string;
  Email?: string;
  MotDePasse?: string;
  AdressePostal?: string;
  NumeroTVA?: string;
  RCS?: string;
}

interface PasswordResponse {
  isValid: boolean;
}

//-----------------------------------------------------------------------------------------------------

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
  providers: [MessageService]
})
export class ProfilComponent implements OnInit {
  user: User | null = null;
  editMode = false;
  changesMade = false;
  originalUser: User | null = null;

  oldPassword = '';
  newPassword = '';
  showPassword = false;

  constructor(private http: HttpClient, private router: Router, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<User>('http://localhost:3000/api/user', { headers }).subscribe(user => {
      this.user = user;
    });
  }

  //-----------------------------------------------------------------------------------------------------

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  //-----------------------------------------------------------------------------------------------------

  updateEverything(): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir enregistrer les modifications ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.updateUser();
        this.updatePassword();
      },
      reject: () => {
        // L'utilisateur a refusé l'enregistrement des modifications
        // Vous pouvez choisir de ne rien faire ici
      }
    });
  }
  

  updateUser() {
        console.log("Confirmation accepted");
  
        if (!this.user) {
          console.log('No user to update');
          return;
        }
  
        console.log("About to check phone and email");
  
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(this.user.NumeroTelephone || '')) {
          this.messageService.add({ severity: 'error', summary: 'Erreur', life: 5000, detail: 'Le numéro de téléphone doit être constitué de 10 chiffres.' });
          return;
        }
  
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(this.user.Email || '')) {
          this.messageService.add({ severity: 'error', summary: 'Erreur', life: 5000, detail: 'Veuillez entrer un e-mail valide.' });
          return;
        }
  
        console.log("About to fetch token from local storage");
  
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token not found in local storage');
          return;
        }
  
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
        console.log("About to make the HTTP request");
  
        this.http.put('http://localhost:3000/api/user', this.user, { headers }).subscribe(() => {
          console.log("HTTP request succeeded");
          this.messageService.add({ severity: 'info', summary: 'Succès', life: 5000, detail: 'Profil mis à jour avec succès!' });
          this.editMode = false;
          this.originalUser = null;
        }, error => {
          console.error('HTTP request failed', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', life: 5000, detail: `Erreur du serveur : ${error.message}` });
        });
  

      }
      
  



  //-----------------------------------------------------------------------------------------------------


  updatePassword() {

        if (!this.user) {
          console.log('No user to update');
          return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token not found in local storage');
          return;
        }

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        if (this.oldPassword.trim() !== '' && this.newPassword.trim() !== '') {
          this.http.post<PasswordResponse>('http://localhost:3000/api/verifyPassword', { oldPassword: this.oldPassword }, { headers }).subscribe(response => {
            if (response.isValid) {
              this.http.put('http://localhost:3000/api/updatePassword', { newPassword: this.newPassword }, { headers }).subscribe(() => {
                this.messageService.add({ severity: 'info', summary: 'Succès', life: 5000, detail: 'Mot de passe mis à jour avec succès!' });
              });
            } else {
              this.messageService.add({ severity: 'error', summary: 'Erreur', life: 5000, detail: 'L\'ancien mot de passe est incorrect!' });
            }
          });
        }
      }

  //-----------------------------------------------------------------------------------------------------


  enterEditMode() {
    this.editMode = true;
    this.originalUser = { ...this.user };
  }
  exitEditMode() {
    this.editMode = false;
    this.user = this.originalUser;
    this.originalUser = null;
  }
}
