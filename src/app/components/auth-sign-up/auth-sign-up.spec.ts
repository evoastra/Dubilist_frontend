import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSignUp } from './auth-sign-up';

describe('AuthSignUp', () => {
  let component: AuthSignUp;
  let fixture: ComponentFixture<AuthSignUp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthSignUp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthSignUp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
