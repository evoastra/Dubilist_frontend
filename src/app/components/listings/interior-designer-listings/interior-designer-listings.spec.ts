import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteriorDesignerListings } from './interior-designer-listings';

describe('InteriorDesignerListings', () => {
  let component: InteriorDesignerListings;
  let fixture: ComponentFixture<InteriorDesignerListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteriorDesignerListings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteriorDesignerListings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
