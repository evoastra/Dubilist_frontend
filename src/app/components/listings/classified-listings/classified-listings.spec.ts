import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassifiedListings } from './classified-listings';

describe('ClassifiedListings', () => {
  let component: ClassifiedListings;
  let fixture: ComponentFixture<ClassifiedListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassifiedListings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassifiedListings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
