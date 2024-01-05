import { TestBed } from '@angular/core/testing';

import { ExpressApiService } from './express-api.service';

describe('ExpressApiService', () => {
  let service: ExpressApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpressApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
