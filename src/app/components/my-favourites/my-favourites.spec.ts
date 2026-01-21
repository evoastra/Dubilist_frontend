import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFavourites } from './my-favourites';

describe('MyFavourites', () => {
  let component: MyFavourites;
  let fixture: ComponentFixture<MyFavourites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyFavourites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFavourites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
