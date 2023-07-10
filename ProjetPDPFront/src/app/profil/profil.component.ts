import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface User {
  UtilisateursNom?: string;
  UtilisateursPrenom?: string;
  NumeroSiret?: string;
  NomEntreprise?: string;
  NumeroTelephone?: string;
  Email?: string;
  MotDePasse?: string;
}

interface PasswordResponse {
  isValid: boolean;
}



@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {
  user: User | null = null;
  editMode = false;
  changesMade = false;
  originalUser: User | null = null;

  oldPassword = '';
  newPassword = '';


  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token'); // Récupérez le token de l'utilisateur depuis le localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Créez un objet HttpHeaders avec le token
  
    this.http.get<User>('http://localhost:3000/api/user', { headers }).subscribe(user => {
      this.user = user;
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
  

  updateUser() {
    if (!this.user) {
      console.log('No user to update');
      return;
    }
  
    // Vérifiez que le numéro de téléphone est constitué de 10 chiffres
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(this.user.NumeroTelephone || '')) {
      alert('Le numéro de téléphone doit être constitué de 10 chiffres.');
      return;
    }
  
    // Vérifiez que l'e-mail est au bon format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.user.Email || '')) {
      alert('Veuillez entrer un e-mail valide.');
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Token not found in local storage');
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Token:', token); // Affiche le token
    console.log('Headers:', headers); // Affiche les en-têtes
  
    this.http.put('http://localhost:3000/api/user', this.user, { headers }).subscribe(() => {
      alert('Profil mis à jour avec succès!');
      this.editMode = false;
      this.originalUser = null;
    });
    
    if (this.newPassword.trim() !== '') {
      // Si le champ du nouveau mot de passe n'est pas vide, mettez à jour le mot de passe
      this.updatePassword();
    }
  }
  

  
  updatePassword() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Token not found in local storage');
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Vérifiez l'ancien mot de passe
    this.http.post<PasswordResponse>('http://localhost:3000/api/verifyPassword', { oldPassword: this.oldPassword }, { headers }).subscribe(response => {
      if (response.isValid) {
        // Si l'ancien mot de passe est valide, mettez à jour le nouveau mot de passe
        this.http.put('http://localhost:3000/api/updatePassword', { newPassword: this.newPassword }, { headers }).subscribe(() => {
          alert('Mot de passe mis à jour avec succès!');
        });
      } else {
        alert('L\'ancien mot de passe est incorrect!');
      }
    });
  }
  
  

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
