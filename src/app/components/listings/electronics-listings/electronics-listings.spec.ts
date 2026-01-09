import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicsListings } from './electronics-listings';

describe('ElectronicsListings', () => {
  let component: ElectronicsListings;
  let fixture: ComponentFixture<ElectronicsListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectronicsListings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronicsListings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
