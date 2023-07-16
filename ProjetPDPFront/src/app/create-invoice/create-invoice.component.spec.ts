import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateInvoiceComponent } from './create-invoice.component';
import { Router } from '@angular/router';
import { PdfService } from '../pdf.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

describe('CreateInvoiceComponent', () => {
  let component: CreateInvoiceComponent;
  let fixture: ComponentFixture<CreateInvoiceComponent>;
  let router: Router;
  let pdfService: PdfService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CreateInvoiceComponent],
      providers: [PdfService, HttpClient]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateInvoiceComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router); // Injecter le Router
    pdfService = TestBed.inject(PdfService); // Injecter le PdfService
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the dashboard when goToDashboard() is called', () => {
    const routerSpy = spyOn(router, 'navigate'); // Utiliser le router injecté
    component.goToDashboard();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set siretIsValid to true when a valid SIRET is selected', () => {
    const validSiret = '12345678900000';
    component.onSelectSiret({ NumeroSiret: validSiret });
    expect(component.siretIsValid).toBe(true);
  });

  it('should set siretIsValid to false when an invalid SIRET is selected', () => {
    const invalidSiret = '98765432100000';
    component.onSelectSiret({ NumeroSiret: invalidSiret });
    expect(component.siretIsValid).toBe(false);
  });

  it('should set siretIsSelected to true when a SIRET is selected', () => {
    const siret = '12345678900000';
    component.onSelectSiret({ NumeroSiret: siret });
    expect(component.siretIsSelected).toBe(true);
  });

  it('should set siretIsSelected to false when clearSiret() is called', () => {
    component.clearSiret();
    expect(component.siretIsSelected).toBe(false);
  });

  it('should upload a file and call the appropriate methods when onUpload() is called', async () => {
    const fileContent = 'Contenu du fichier PDF factice';
    const file = new File([fileContent], 'filename.pdf', { type: 'application/pdf' });
    const pdfServiceSpy = spyOn(pdfService, 'readFile').and.returnValue(Promise.resolve({}));
    const getUserBySiretSpy = spyOn(component, 'getUserBySiret').and.returnValue(of({}));
    const compareDataWithDatabaseSpy = spyOn(component, 'compareDataWithDatabase');

    await component.onUpload({ files: [file] });

    expect(pdfServiceSpy).toHaveBeenCalledWith(file);
    expect(getUserBySiretSpy).toHaveBeenCalled();
    expect(compareDataWithDatabaseSpy).toHaveBeenCalled();
  });

});
