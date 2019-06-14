import { TestBed } from '@angular/core/testing';

import { AwarenessService } from './awareness.service';

describe('AwarenessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AwarenessService = TestBed.get(AwarenessService);
    expect(service).toBeTruthy();
  });
});
