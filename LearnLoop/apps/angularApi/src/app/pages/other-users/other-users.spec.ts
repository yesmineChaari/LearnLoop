import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherUsers } from './other-users';

describe('OtherUsers', () => {
  let component: OtherUsers;
  let fixture: ComponentFixture<OtherUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
