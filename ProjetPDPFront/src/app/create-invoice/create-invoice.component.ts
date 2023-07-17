import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PdfService } from '../pdf.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmationService, ConfirmEventType } from 'primeng/api';


import { InvoiceService } from '../services/invoice-service.service'; 
import { InvoiceData } from '../invoice-data.model';

interface User {
  NumeroSiret: string;
}

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.css']
})

export class CreateInvoiceComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload!: FileUpload;

  maxFileSize = 1000000;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  siretInput: string = '';
  siretIsValid: boolean = false;
  siretIsSelected :boolean = false;

  correspondantData: any = {};
  matchingEmetteurData: any = {};
  matchingCorrespondantData: any = {};
  matchingCountryCode: string = '';
  matchingdeviseCode: string = '';
  invoiceData: { invoiceNumber: string | null, currencyCode: string | null, totalHT: string | null, totalVAT: string | null, totalTTC: string | null, remainingToPay: string | null } = { invoiceNumber: null, currencyCode: null, totalHT: null, totalVAT: null, totalTTC: null, remainingToPay: null };

  unusedDataInvoiceNumber: {label: string, value: string}[] = [];
  unusedDataCurrencyCode: {label: string, value: string}[] = [];
  unusedDataTotalHT: {label: string, value: string}[] = [];
  unusedDataTotalVAT: {label: string, value: string}[] = [];
  unusedDataTotalTTC: {label: string, value: string}[] = [];
  unusedDataRemainingToPay: {label: string, value: string}[] = [];
  selectedValues: string[] = [];

  unusedData: {label: string, value: string}[] = [];
  unusedDataWithoutLetters: { label: string, value: string }[] = [];



  
  matchingData: any[] = []; 

  emetteur: any = {};
  correspondant: any = {};


  constructor(private router: Router, private pdfService: PdfService, private http: HttpClient, private messageService: MessageService, private cdr: ChangeDetectorRef, private invoiceService: InvoiceService, private confirmationService: ConfirmationService) { }


  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<User[]>('http://localhost:3000/api/users', { headers }).subscribe(users => {
      this.users = users;
    });

    
    this.http.get('http://localhost:3000/api/user', { headers }).subscribe(user => {
      this.correspondantData = user;
    });

  }

  filterUsers(event: { query: string }): void {
    const filtered: User[] = [];
    for (let i = 0; i < this.users.length; i++) {
      const user = this.users[i];
      if (user.NumeroSiret.toLowerCase().indexOf(event.query.toLowerCase()) === 0) {
        filtered.push(user);
      }
    }
    this.filteredUsers = filtered;
  }


  onSelectSiret(event: any) {
    this.siretInput = event.NumeroSiret;
    this.validateSiret();
    console.log(this.siretInput);
    console.log('Selected SIRET:', this.siretInput);
    this.getUserBySiret(this.siretInput).subscribe(user => {
      this.selectedUser = user;
    });
  }
  
  validateSiret() {
    const siretExists = this.users.some(user => user.NumeroSiret === this.siretInput);
    if (siretExists) {
      this.siretIsValid = true;
      this.siretIsSelected = true;
    } else {
      this.siretIsValid = false;
    }
    this.cdr.detectChanges();
  }

 

  getUserBySiret(siret: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`http://localhost:3000/api/users/${siret}`, { headers });
  }

  clearFile() {
    this.fileUpload.clear();
  }
  clearSiret() {
    this.siretIsSelected = false;
    this.siretIsValid = false;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onUpload(event: any) {
    console.log('File uploaded:', event);
    for(let file of event.files) {
      console.log(file);
      this.pdfService.readFile(file).then(data => {
        console.log('File data:', data); // log JSON or XML data read from file

        // Extract all values from the file data
        let fileDataValues = this.pdfService.extractAllValues(data);
        console.log('File data values:', fileDataValues);

        // Get the data of the logged-in user and the selected user from the database
        this.pdfService.getLoggedInUserData().subscribe(loggedInUserData => {
          this.pdfService.getUserData(this.siretInput).subscribe(selectedUserData => {
            // Compare the file data with the database data
            this.compareDataWithDatabase(fileDataValues, loggedInUserData, selectedUserData);
          });
        });
      }).catch(error => {
        this.messageService.add({severity:'error', summary:'Erreur', detail:error});
        this.fileUpload.remove(file, 0);
      });
    }
  }


  compareDataWithDatabase(fileDataValues: any[], loggedInUserData: any, selectedUserData: any) {
    // Extract the values of the database data
    let loggedInUserDataValues = this.pdfService.extractAllValues(loggedInUserData);
    let selectedUserDataValues = this.pdfService.extractAllValues(selectedUserData);
  
    // Compare the file data values with the database data values
    this.matchingData = fileDataValues.filter(value => loggedInUserDataValues.includes(value) || selectedUserDataValues.includes(value));
    console.log('Matching data:', this.matchingData);
  
    // Fill matchingEmetteurData and matchingCorrespondantData with the matching data
    for (let key in loggedInUserData) {
      if (loggedInUserData.hasOwnProperty(key) && this.matchingData.includes(loggedInUserData[key])) {
        this.matchingEmetteurData[key] = loggedInUserData[key];
      }
    }
    for (let key in selectedUserData) {
      if (selectedUserData.hasOwnProperty(key) && this.matchingData.includes(selectedUserData[key])) {
        this.matchingCorrespondantData[key] = selectedUserData[key];
      }
    }
   // Votre code existant
      const countryCodes = ['AF', 'AL', 'AQ', 'DZ', 'AS', 'AD', 'AO', 'AG', 'AZ', 'AR', 'AU', 'AT', 'BS', 'BH', 'BD', 'AM', 'BB', 'BE', 'BM', 'BT', 'BO', 'BA', 'BW', 'BV', 'BR', 'BZ', 'IO', 'SB', 'VG', 'BN', 'BG', 'MM', 'BI', 'BY', 'KH', 'CM', 'CA', 'CV', 'KY', 'CF', 'LK', 'TD', 'CL', 'CN', 'TW', 'CX', 'CC', 'CO', 'KM', 'YT', 'CG', 'CD', 'CK', 'CR', 'HR', 'CU', 'CY', 'CZ', 'BJ', 'DK', 'DM', 'DO', 'EC', 'SV', 'GQ', 'ET', 'ER', 'EE', 'FO', 'FK', 'GS', 'FJ', 'FI', 'AX', 'FR', 'GF', 'PF', 'TF', 'DJ', 'GA', 'GE', 'GM', 'PS', 'DE', 'GH', 'GI', 'KI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GN', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'CI', 'JM', 'JP', 'KZ', 'JO', 'KE', 'KP', 'KR', 'KW', 'KG', 'LA', 'LB', 'LS', 'LV', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MQ', 'MR', 'MU', 'MX', 'MC', 'MN', 'MD', 'MS', 'MA', 'MZ', 'OM', 'NA', 'NR', 'NP', 'NL', 'AN', 'AW', 'NC', 'VU', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'NO', 'MP', 'UM', 'FM', 'MH', 'PW', 'PK', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'GW', 'TL', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'SH', 'KN', 'AI', 'LC', 'PM', 'VC', 'SM', 'ST', 'SA', 'SN', 'SC', 'SL', 'SG', 'SK', 'VN', 'SI', 'SO', 'ZA', 'ZW', 'ES', 'EH', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TJ', 'TH', 'TG', 'TK', 'TO', 'TT', 'AE', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'MK', 'EG', 'GB', 'IM', 'TZ', 'US', 'VI', 'BF', 'UY', 'UZ', 'VE', 'WF', 'WS', 'YE', 'CS', 'ZM'];
      this.matchingCountryCode = fileDataValues.find(value => countryCodes.includes(value));

      const deviseCodes = ['ADP', 'AFA', 'ALL', 'AMD', 'ANG', 'AON', 'AOR', 'ARP', 'ARS', 'ATS', 'AUD', 'AWF', 'AWG', 'AZM', 'BAK', 'BAM', 'BBD', 'BDT', 'BEF', 'BGL', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BTR', 'BWP', 'BYR', 'BZD', 'CAD', 'CDF', 'CHF', 'CLF', 'CLP', 'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'CYP', 'DEM', 'DJF', 'DKK', 'DOP', 'DZD', 'ECS', 'EEK', 'EGP', 'ERN', 'ESP', 'ETB', 'EUR', 'FIM', 'FJD', 'FKP', 'FRF', 'GBP', 'GEL', 'GHC', 'GIP', 'GMD', 'GNF', 'GRD', 'GTQ', 'GWP', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'IEP', 'ILS', 'INR', 'IQD', 'IRR', 'ISK', 'ITL', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KMF', 'KPW', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LTL', 'LUF', 'LVL', 'LYD', 'MAD', 'MDL', 'MGF', 'MKD', 'MMK', 'MNT', 'MOP', 'MRO', 'MTL', 'MUR', 'MVR', 'MWK', 'MXN', 'MXP', 'MYR', 'MZM','NAD', 'NGN', 'NIO', 'NLG', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PLZ', 'PTE', 'PYG', 'QAR', 'ROL', 'RON', 'RSD', 'RUB', 'RUR', 'RWF', 'SAR', 'SBD', 'SBL', 'SCR', 'SDD', 'SDP', 'SEK', 'SGD', 'SHP', 'SIT', 'SKK', 'SLL', 'SOS', 'SRG', 'STD', 'SVC', 'SYP', 'SZL', 'THB', 'TJS', 'TMM', 'TND', 'TOP', 'TPE', 'TRL', 'TTD', 'TWD', 'TZS', 'UAH', 'UAK', 'UGX', 'USD', 'UVC', 'UYU', 'UZS', 'VEB', 'VND', 'VUV', 'WST', 'XAF', 'XAG', 'XAU', 'XCD', 'XDR', 'XEU', 'XPD', 'XPF', 'XPT', 'YER', 'YTL', 'YUN', 'ZAL', 'ZAR', 'ZMK', 'ZRN', 'ZWD']
      this.matchingdeviseCode = fileDataValues.find(value => deviseCodes.includes(value));

      // Ajoutez matchingCountryCode et matchingDeviseCode à matchingData
      if (this.matchingCountryCode) {
        this.matchingData.push(this.matchingCountryCode);
      }
      if (this.matchingdeviseCode) {
        this.matchingData.push(this.matchingdeviseCode);
      }

      let unusedData = fileDataValues.filter(value => !this.matchingData.includes(value) && value.length <= 25);
      this.unusedData = unusedData.map(value => ({ label: value, value: value }));
      console.log("Les données non utilisé :", this.unusedData)

      // Initialize the dropdown options with unusedData
      this.unusedDataInvoiceNumber = [{label: '', value: ''}, ...this.unusedData];

      // Filtrer les données non utilisées pour éliminer celles qui contiennent des lettres
      let unusedDataWithoutLetters = unusedData.filter(value => !/[a-zA-Z]/.test(value));
      this.unusedDataWithoutLetters = unusedDataWithoutLetters.map(value => ({ label: value, value: value }));

      this.unusedDataCurrencyCode = [{label: '', value: ''}, ...this.unusedDataWithoutLetters];
      this.unusedDataTotalHT = [{label: '', value: ''}, ...this.unusedDataWithoutLetters];
      this.unusedDataTotalVAT = [{label: '', value: ''}, ...this.unusedDataWithoutLetters];
      this.unusedDataTotalTTC = [{label: '', value: ''}, ...this.unusedDataWithoutLetters];
      this.unusedDataRemainingToPay = [{label: '', value: ''}, ...this.unusedDataWithoutLetters];

      
                    

  }

 onDataSelected(event: any, field: keyof typeof this.invoiceData) {
  // Assign the selected value to the corresponding property in invoiceData
  this.invoiceData[field] = event.value;
  
  // Update the dropdown options
  this.updateDropdownOptions();
}

  
  
updateDropdownOptions() {
  let dropdownOptions = [{label: '', value: ''}, ...this.unusedDataWithoutLetters];
  this.unusedDataInvoiceNumber = this.unusedData.some(data => data.value === this.invoiceData.invoiceNumber) ? this.unusedData : [{label: '', value: ''}, ...this.unusedData];
  this.unusedDataCurrencyCode = this.unusedDataWithoutLetters.some(data => data.value === this.invoiceData.currencyCode) ? this.unusedDataWithoutLetters : dropdownOptions;
  this.unusedDataTotalHT = this.unusedDataWithoutLetters.some(data => data.value === this.invoiceData.totalHT) ? this.unusedDataWithoutLetters : dropdownOptions;
  this.unusedDataTotalVAT = this.unusedDataWithoutLetters.some(data => data.value === this.invoiceData.totalVAT) ? this.unusedDataWithoutLetters : dropdownOptions;
  this.unusedDataTotalTTC = this.unusedDataWithoutLetters.some(data => data.value === this.invoiceData.totalTTC) ? this.unusedDataWithoutLetters : dropdownOptions;
  this.unusedDataRemainingToPay = this.unusedDataWithoutLetters.some(data => data.value === this.invoiceData.remainingToPay) ? this.unusedDataWithoutLetters : dropdownOptions;

  // Force change detection
  this.cdr.detectChanges();
}



  isFormValid(): boolean {
    return !!this.invoiceData.invoiceNumber &&
           !!this.invoiceData.totalHT &&
           !!this.invoiceData.totalVAT &&
           !!this.invoiceData.totalTTC &&
           !!this.invoiceData.remainingToPay;
  }
  
  
  
  onSubmit() {
    this.confirmationService.confirm({
        message: 'Êtes-vous sûr de vouloir soumettre cette facture ?',
        header: 'Confirmation',
        icon: 'pi pi-spin pi-spinner',
        acceptLabel: 'Oui',
        rejectLabel: 'Non',
        accept: () => {
            const invoiceData: InvoiceData = {
                emetteur: {
                    NomEntreprise: this.matchingEmetteurData.NomEntreprise,
                    NumeroSiret: this.matchingEmetteurData.NumeroSiret,
                    NumeroTVA: this.matchingEmetteurData.NumeroTVA,
                    CodePays: this.matchingCountryCode,
                },
                correspondant: {
                    NomEntreprise: this.matchingCorrespondantData.NomEntreprise,
                    NumeroSiret: this.matchingCorrespondantData.NumeroSiret,
                    NumeroTVA: this.matchingCorrespondantData.NumeroTVA,
                    CodePays: this.matchingCountryCode,
                },
                facture: {
                    CodeDevise: this.matchingdeviseCode,
                    NumeroFacture: this.invoiceData.invoiceNumber,
                    TotalHT: this.invoiceData.totalHT,
                    TotalTVA: this.invoiceData.totalVAT,
                    TotalTTC: this.invoiceData.totalTTC,
                    RestantAPayer: this.invoiceData.remainingToPay,
                },
                status: 'En cours'
            };

            this.invoiceService.submitInvoiceData(invoiceData).subscribe(response => {
                // Gérez la réponse ici
                this.messageService.add({severity:'success', summary:'Succès', detail:`La facture a été transmise à ${this.matchingCorrespondantData.NomEntreprise}`});
                setTimeout(() => {
                    location.reload();
                }, 3000); 
            });
        }
    });
}

  
 
}
