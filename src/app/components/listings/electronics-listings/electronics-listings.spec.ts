import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicsListingsComponent } from './electronics-listings';

describe('ElectronicsListings', () => {
  let component: ElectronicsListingsComponent;
  let fixture: ComponentFixture<ElectronicsListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectronicsListingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronicsListingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
