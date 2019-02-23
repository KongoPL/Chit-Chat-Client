import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatShareModalComponent } from './chat-share-modal.component';

describe('ChatShareModalComponent', () => {
  let component: ChatShareModalComponent;
  let fixture: ComponentFixture<ChatShareModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatShareModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatShareModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
