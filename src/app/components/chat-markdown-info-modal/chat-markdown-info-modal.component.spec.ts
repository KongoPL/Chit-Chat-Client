import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMarkdownInfoModalComponent } from './chat-markdown-info-modal.component';

describe('ChatMarkdownInfoModalComponent', () => {
  let component: ChatMarkdownInfoModalComponent;
  let fixture: ComponentFixture<ChatMarkdownInfoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatMarkdownInfoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMarkdownInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
