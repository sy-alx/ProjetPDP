import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilComponent } from './profil.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

describe('ProfilComponent', () => {
  let component: ProfilComponent;
  let fixture: ComponentFixture<ProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        MessageService,
        ConfirmationService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user data', () => {
    component.user = {
      UtilisateursNom: 'John',
      UtilisateursPrenom: 'Doe',
      NumeroSiret: '1234567890',
      NomEntreprise: 'Acme Corp',
      NumeroTelephone: '1234567890',
      Email: 'john.doe@example.com',
      MotDePasse: 'password',
      AdressePostal: '1234 Main St',
      NumeroTVA: '9876543210',
      RCS: 'ABC123'
    };
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.querySelector('strong').textContent).toContain('Nom:');
    expect(element.querySelector('p:nth-child(2)').textContent).toContain('Prénom:');
    expect(element.querySelector('p:nth-child(3)').textContent).toContain('Nom de l\'entreprise:');
    expect(element.querySelector('p:nth-child(4)').textContent).toContain('Adresse de l\'entreprise:');
    expect(element.querySelector('p:nth-child(5)').textContent).toContain('Numéro Siret:');
    expect(element.querySelector('p:nth-child(6)').textContent).toContain('Numéro de TVA:');
    expect(element.querySelector('p:nth-child(7)').textContent).toContain('Référence RCS:');
    expect(element.querySelector('p:nth-child(9)').textContent).toContain('Numéro de téléphone:');
    expect(element.querySelector('p:nth-child(11)').textContent).toContain('Email:');
  });

  it('should enter edit mode', () => {
    component.enterEditMode();
    expect(component.editMode).toBe(true);
    expect(component.originalUser).toEqual(component.user);
  });

  it('should exit edit mode', () => {
    component.originalUser = {
      UtilisateursNom: 'John',
      UtilisateursPrenom: 'Doe',
      NumeroSiret: '1234567890',
      NomEntreprise: 'Acme Corp',
      NumeroTelephone: '1234567890',
      Email: 'john.doe@example.com',
      MotDePasse: 'password',
      AdressePostal: '1234 Main St',
      NumeroTVA: '9876543210',
      RCS: 'ABC123'
    };
    component.exitEditMode();
    expect(component.editMode).toBe(false);
    expect(component.user).toEqual(component.originalUser);
    expect(component.originalUser).toBeNull();
  });
});

