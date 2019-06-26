import { TestBed } from '@angular/core/testing';

import { PublictransportgeoinformationService } from './publictransportgeoinformation.service';

describe('PublictransportgeoinformationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PublictransportgeoinformationService = TestBed.get(PublictransportgeoinformationService);
    expect(service).toBeTruthy();
  });
});
