// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Progress } from './progress';
// import { ProgressService } from '../../../services/ProgressService';
// import { Router } from '@angular/router';
// import { of } from 'rxjs';
// import { CalenderComponent } from '../../calender-component/calender-component';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { NgChartsModule } from 'ng2-charts';

// // Mock services
// const mockProgressService = {
//   getAllProgress: jasmine.createSpy('getAllProgress').and.returnValue(
//     of({
//       $values: [
//         {
//           uploadedAt: new Date().toISOString(),
//           height: 175,
//           weight: 70,
//         },
//       ],
//     })
//   ),
//   createProgress: jasmine.createSpy('createProgress').and.returnValue(of({})),
// };

// const mockRouter = {
//   navigate: jasmine.createSpy('navigate'),
// };

// const mockWorkoutLogService2 = {
//   // If CalenderComponent uses any methods, define spies here
// };

// describe('Progress Component', () => {
//   let component: Progress;
//   let fixture: ComponentFixture<Progress>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [
//         Progress,
//         CommonModule,
//         FormsModule,
//         ReactiveFormsModule,
//         NgChartsModule,
//         CalenderComponent, // 👈 required for standalone import
//       ],
//       providers: [
//         { provide: ProgressService, useValue: mockProgressService },
//         { provide: Router, useValue: mockRouter },
//       ],
//     }).compileComponents();

//     fixture = TestBed.createComponent(Progress);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create the Progress component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should load progress data on init', () => {
//     expect(mockProgressService.getAllProgress).toHaveBeenCalled();
//     expect(component.progressList.length).toBeGreaterThan(0);
//     expect(component.lineChartLabels.length).toBe(1);
//   });

//   it('should call createProgress on submit if all inputs are valid', () => {
//     const fakeFile = new File(['dummy'], 'photo.png', { type: 'image/png' });
//     component.selectedFile = fakeFile;
//     component.height = 180;
//     component.weight = 75;
//     component.heightData = [170]; // for height validation

//     component.onSubmit();

//     expect(mockProgressService.createProgress).toHaveBeenCalled();
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['stats-analytics']);
//   });

//   it('should not allow height less than previous record', () => {
//     component.heightData = [180];
//     component.height = 170; // less than last
//     component.weight = 75;
//     component.selectedFile = new File(['test'], 'photo.jpg', {
//       type: 'image/jpg',
//     });

//     spyOn(window, 'alert');

//     component.onSubmit();

//     expect(window.alert).toHaveBeenCalledWith(
//       'Height cannot be less than the previous entry.'
//     );
//     expect(mockProgressService.createProgress).not.toHaveBeenCalled();
//   });
// });
