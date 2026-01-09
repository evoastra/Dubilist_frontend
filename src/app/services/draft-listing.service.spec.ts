import { TestBed } from '@angular/core/testing';

import { DraftListingService } from './draft-listing.service';

describe('DraftListingService', () => {
  let service: DraftListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DraftListingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
