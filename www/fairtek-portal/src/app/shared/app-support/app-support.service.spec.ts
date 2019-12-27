import { TestBed, inject } from '@angular/core/testing';

import { AppSupportService } from './app-support.service';

describe('AppSupportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppSupportService]
    });
  });

  it('should be created', inject([AppSupportService], (service: AppSupportService) => {
    expect(service).toBeTruthy();
  }));
});
