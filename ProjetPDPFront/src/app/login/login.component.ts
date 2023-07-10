import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

interface LoginResponse {
  token: string;
  UtilisateursPrenom: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
  }

  login(Email: string, MotDePasse: string) {
    console.log(`Attempting to login with Email: ${Email} and Password: ${MotDePasse}`);
    this.http.post<LoginResponse>('http://localhost:3000/login', { Email, MotDePasse })
      .subscribe(response => {
        console.log('Réponse du serveur:', response);
        localStorage.setItem('welcomeMessageShown', 'false');
        localStorage.setItem('token', response.token);
        localStorage.setItem('UtilisateursPrenom', response.UtilisateursPrenom);
        this.router.navigate(['/dashboard']);
      }, error => {
        console.log("Erreur lors de la connexion:", error);
        this.messageService.add({severity:'error', summary:'Erreur de connexion', detail:'E-mail ou mot de passe incorrect. Veuillez réessayer.'});
      });
  }
  
  
  

}
