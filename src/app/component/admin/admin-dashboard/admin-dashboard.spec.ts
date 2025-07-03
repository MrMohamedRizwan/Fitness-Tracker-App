// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { AdminDashboard } from './admin-dashboard';
// import { UserService } from '../../../services/UserService';
// import { Router } from '@angular/router';
// import { ChangeDetectorRef } from '@angular/core';
// import { of, throwError } from 'rxjs';
// import { CommonModule } from '@angular/common';

// describe('AdminDashboard', () => {
//   let component: AdminDashboard;
//   let fixture: ComponentFixture<AdminDashboard>;
//   let mockUserService: any;
//   let mockRouter: any;

//   const mockCoachesResponse = {
//     items: {
//       $values: [
//         {
//           id: '65db16e6-8d40-43c9-93fe-c092b4915efd',
//           name: 'james',
//           yearsOfExperience: 32,
//           email: 'james@gmail.com',
//         },
//         {
//           id: 'fd41d56a-7db6-409b-860b-c1d0c6cf6caf',
//           name: 'ChrisBumstead',
//           yearsOfExperience: 45,
//           email: 'cbum@gmail.com',
//         },
//         {
//           id: '96c3b95a-418d-42d7-8728-b568a6573acf',
//           name: 'Nandha Kumar',
//           yearsOfExperience: 12,
//           email: 'Nandhssakumar@gmail.com',
//         },
//       ],
//     },
//   };

//   beforeEach(waitForAsync(() => {
//     mockUserService = jasmine.createSpyObj('UserService', [
//       'getAllCoaches',
//       'deleteCoach',
//     ]);
//     mockRouter = jasmine.createSpyObj('Router', ['navigate']);

//     TestBed.configureTestingModule({
//       imports: [AdminDashboard],
//       providers: [
//         { provide: UserService, useValue: mockUserService },
//         { provide: Router, useValue: mockRouter },
//         ChangeDetectorRef,
//       ],
//     }).compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(AdminDashboard);
//     component = fixture.componentInstance;
//     mockUserService.getAllCoaches.and.returnValue(of(mockCoachesResponse));
//     fixture.detectChanges(); // triggers ngOnInit
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should load coaches on init', () => {
//     const coaches = component.coaches();
//     expect(coaches.length).toBe(3);
//     expect(coaches[1].name).toBe('ChrisBumstead');
//   });

//   // it('should handle errors during coach loading', () => {
//   //   mockUserService.getAllCoaches.and.returnValue(
//   //     throwError(() => new Error('Load failed'))
//   //   );
//   //   component.loadCoaches();
//   //   expect(component.coaches().length).toBe(0);
//   // });

//   it('should navigate to coach details', () => {
//     const coachId = 'fd41d56a-7db6-409b-860b-c1d0c6cf6caf';
//     component.viewCoach(coachId);
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/coach', coachId]);
//   });

//   it('should confirm and call deleteCoach', () => {
//     spyOn(window, 'confirm').and.returnValue(true);
//     mockUserService.deleteCoach.and.returnValue(of({ message: 'deleted' }));
//     spyOn(component['cdRef'], 'detectChanges');

//     const coachId = '65db16e6-8d40-43c9-93fe-c092b4915efd';
//     component.deleteCoach(coachId);

//     expect(mockUserService.deleteCoach).toHaveBeenCalledWith(coachId);
//     expect(component['cdRef'].detectChanges).toHaveBeenCalled();
//   });

//   it('should not call deleteCoach if confirmation is canceled', () => {
//     spyOn(window, 'confirm').and.returnValue(false);

//     const coachId = 'some-id';
//     component.deleteCoach(coachId);

//     expect(mockUserService.deleteCoach).not.toHaveBeenCalled();
//   });
// });
