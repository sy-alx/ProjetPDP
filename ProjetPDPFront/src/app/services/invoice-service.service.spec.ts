import { TestBed } from '@angular/core/testing';
import { InvoiceService } from './invoice-service.service';

describe('InvoiceServiceService', () => {
  let service: InvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
