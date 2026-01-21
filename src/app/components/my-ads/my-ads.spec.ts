import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAds } from './my-ads';

describe('MyAds', () => {
  let component: MyAds;
  let fixture: ComponentFixture<MyAds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAds]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAds);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
