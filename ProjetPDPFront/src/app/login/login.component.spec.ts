import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let httpMock: HttpTestingController;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [MessageService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard on successful login', () => {
    spyOn(router, 'navigate');
    component.login('admin@example.com', 'admin123');

    const req = httpMock.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'fakeToken', UtilisateursPrenom: 'John' });

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(localStorage.getItem('welcomeMessageShown')).toBe('false');
    expect(localStorage.getItem('token')).toBe('fakeToken');
    expect(localStorage.getItem('UtilisateursPrenom')).toBe('John');
  });

  it('should display error message on failed login', () => {
    spyOn(router, 'navigate');
    spyOn(messageService, 'add');
    component.login('invalid@example.com', 'invalid123');

    const req = httpMock.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Unauthorized'));

    expect(router.navigate).not.toHaveBeenCalled();
    expect(messageService.add).toHaveBeenCalledWith({ severity: 'error', summary: 'Erreur de connexion', detail: 'E-mail ou mot de passe incorrect. Veuillez réessayer.' });
  });
});
