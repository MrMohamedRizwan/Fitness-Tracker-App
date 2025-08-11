import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatCoach } from './chat-coach';

describe('ChatCoach', () => {
  let component: ChatCoach;
  let fixture: ComponentFixture<ChatCoach>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatCoach]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatCoach);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
