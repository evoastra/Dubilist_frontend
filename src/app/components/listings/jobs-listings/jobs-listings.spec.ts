import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsListings } from './jobs-listings';

describe('JobsListings', () => {
  let component: JobsListings;
  let fixture: ComponentFixture<JobsListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobsListings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsListings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
