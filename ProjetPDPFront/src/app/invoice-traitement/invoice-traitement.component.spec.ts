import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTraitementComponent } from './invoice-traitement.component';

describe('InvoiceTraitementComponent', () => {
  let component: InvoiceTraitementComponent;
  let fixture: ComponentFixture<InvoiceTraitementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceTraitementComponent]
    });
    fixture = TestBed.createComponent(InvoiceTraitementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
