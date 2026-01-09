import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorListingsComponent } from './motor-listings';

describe('MotorListings', () => {
  let component: MotorListingsComponent;
  let fixture: ComponentFixture<MotorListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotorListingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorListingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
