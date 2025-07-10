import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaochSidebar } from './caoch-sidebar';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('CaochSidebar', () => {
  let component: CaochSidebar;
  let fixture: ComponentFixture<CaochSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaochSidebar, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CaochSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create the component', () => {
  //   expect(component).toBeTruthy();
  // });

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
