import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  
  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }

  login(Email: string, MotDePasse: string) {
    this.http.post<LoginResponse>('http://localhost:3000/login', { Email, MotDePasse })
      .subscribe(response => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard']);
      }, error => {
          console.log("ça marche pas")
      });
  }
}
