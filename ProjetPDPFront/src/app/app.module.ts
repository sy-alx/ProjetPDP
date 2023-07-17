import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppRoutingModule } from './app-routing.module';
import { MenubarModule } from 'primeng/menubar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfilComponent } from './profil/profil.component';
import { FieldsetModule } from 'primeng/fieldset';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { FileUploadModule } from 'primeng/fileupload';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { InvoiceTraitementComponent } from './invoice-traitement/invoice-traitement.component';
import { TableModule} from 'primeng/table';
import { DialogModule } from 'primeng/dialog';





@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    ProfilComponent,
    CreateInvoiceComponent,
    InvoiceTraitementComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    HttpClientModule,
    AppRoutingModule,
    MenubarModule,
    ConfirmDialogModule,
    BrowserAnimationsModule,
    FieldsetModule,
    ToastModule,
    FileUploadModule,
    AutoCompleteModule,
    DropdownModule,
    TableModule,
    DialogModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

