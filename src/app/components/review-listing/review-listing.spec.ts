import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewListing } from './review-listing';

describe('ReviewListing', () => {
  let component: ReviewListing;
  let fixture: ComponentFixture<ReviewListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
