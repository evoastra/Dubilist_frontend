import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FurnitureListings } from './furniture-listings';

describe('FurnitureListings', () => {
  let component: FurnitureListings;
  let fixture: ComponentFixture<FurnitureListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FurnitureListings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FurnitureListings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
