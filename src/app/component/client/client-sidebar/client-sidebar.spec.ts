import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientSidebar } from './client-sidebar';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('ClientSidebar', () => {
  let component: ClientSidebar;
  let fixture: ComponentFixture<ClientSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientSidebar, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // it('should render all sidebar links', () => {
  //   const links = fixture.debugElement.queryAll(By.css('.bi'));
  //   expect(links.length).toBe(component.links.length);
  // });

  it('should clear localStorage and navigate to / on logout', () => {
    const navigateSpy = spyOn((component as any).router, 'navigate');
    const clearSpy = spyOn(localStorage, 'clear');

    component.handleLogout();

    expect(clearSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
