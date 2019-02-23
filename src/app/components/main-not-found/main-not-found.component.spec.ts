import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainNotFoundComponent } from './main-not-found.component';

describe('MainNotFoundComponent', () => {
  let component: MainNotFoundComponent;
  let fixture: ComponentFixture<MainNotFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainNotFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
