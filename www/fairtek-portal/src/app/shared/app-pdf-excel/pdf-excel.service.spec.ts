import { TestBed, inject } from '@angular/core/testing';

import { PdfExcelService } from './pdf-excel.service';

describe('PdfExcelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfExcelService]
    });
  });

  it('should be created', inject([PdfExcelService], (service: PdfExcelService) => {
    expect(service).toBeTruthy();
  }));
});
