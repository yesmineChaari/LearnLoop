import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Myfriends } from './myfriends';

describe('Myfriends', () => {
  let component: Myfriends;
  let fixture: ComponentFixture<Myfriends>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Myfriends]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Myfriends);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
