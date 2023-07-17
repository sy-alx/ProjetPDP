import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { DashboardComponent } from './dashboard.component';
import { Router } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let routerSpy: jasmine.SpyObj<any>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const confirmationServiceSpyObj = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    const messageServiceSpyObj = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: ConfirmationService, useValue: confirmationServiceSpyObj },
        { provide: MessageService, useValue: messageServiceSpyObj },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<any>;
    confirmationServiceSpy = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to create-invoice on menu item click', () => {
    const navigateSpy = routerSpy.navigate as jasmine.Spy<any>;
    const menuItems: MenuItem[] = component.items;
    const createInvoiceMenuItem = menuItems.find((item) => item.label === 'Emettre une facture');

    expect(createInvoiceMenuItem).toBeDefined();

    createInvoiceMenuItem?.command?.({} as any);

    expect(navigateSpy).toHaveBeenCalledWith(['/create-invoice']);
  });

  it('should logout on menu item click', () => {
    const confirmSpy = confirmationServiceSpy.confirm as jasmine.Spy<any>;
    const menuItems: MenuItem[] = component.items;
    const logoutMenuItem = menuItems.find((item) => item.label === 'Déconnexion');

    expect(logoutMenuItem).toBeDefined();

    logoutMenuItem?.command?.({} as any);


    expect(confirmSpy).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled(); // Adjust this expectation based on your implementation
  });
});
