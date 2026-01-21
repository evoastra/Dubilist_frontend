import { TestBed } from '@angular/core/testing';

import { AiDescriptionService } from './ai-description-service';

describe('AiDescriptionService', () => {
  let service: AiDescriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiDescriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
