import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component'; // le composant Dashboard
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './services/auth.guard';
import { ProfilComponent } from './profil/profil.component'; // le composant profil
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component'; // le composant CreateInvoice

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'create-invoice', component: CreateInvoiceComponent, canActivate: [AuthGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
