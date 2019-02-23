import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileManageComponent } from './user-profile-manage.component';

describe('UserProfileManageComponent', () => {
  let component: UserProfileManageComponent;
  let fixture: ComponentFixture<UserProfileManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
