import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Progress } from './progress';
import { ProgressService } from '../../../services/ProgressService';

import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { CalenderComponent } from '../../calender-component/calender-component';
import { WorkoutLogService } from '../../../services/WorkoutLogService';

describe('Progress Component', () => {
  let component: Progress;
  let fixture: ComponentFixture<Progress>;

  const mockProgressService = {
    getAllProgress: jasmine.createSpy('getAllProgress'),
    createProgress: jasmine.createSpy('createProgress'),
  };

  const mockWorkoutLogService = {
    getWorkoutLog: jasmine.createSpy('getWorkoutLog').and.returnValue(of([])),
    getWorkoutLogByid: jasmine
      .createSpy('getWorkoutLogByid')
      .and.returnValue(of({})),
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Progress,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgChartsModule,
        CalenderComponent,
      ],
      providers: [
        { provide: ProgressService, useValue: mockProgressService },
        { provide: WorkoutLogService, useValue: mockWorkoutLogService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Progress);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    mockProgressService.getAllProgress.calls.reset();
    mockProgressService.createProgress.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load progress data and update chart', fakeAsync(() => {
    const mockData = [
      {
        uploadedAt: new Date('2025-07-01T10:00:00Z').toISOString(),
        height: 170,
        weight: 65,
      },
      {
        uploadedAt: new Date('2025-07-06T10:00:00Z').toISOString(),
        height: 171,
        weight: 66,
      },
    ];

    mockProgressService.getAllProgress.and.returnValue(
      of({ $values: mockData })
    );

    fixture.detectChanges();
    tick();

    expect(component.progressList.length).toBe(2);
    expect(component.lineChartLabels.length).toBe(2);
    expect(component.lineChartData[0].data).toEqual([170, 171]);
    expect(component.lineChartData[1].data).toEqual([65, 66]);
  }));

  it('should handle invalid form states correctly', () => {
    component.height = 0;
    component.weight = 60;
    component.selectedFile = new File([], 'test.png');
    expect(component.isFormValid).toBeFalse();

    component.height = 170;
    component.weight = 0;
    expect(component.isFormValid).toBeFalse();

    component.height = 170;
    component.weight = 60;
    component.selectedFile = null;
    expect(component.isFormValid).toBeFalse();
  });

  it('should detect lower height compared to last entry as invalid', () => {
    component.selectedFile = new File([], 'test.png');
    component.height = 160;
    component.weight = 60;
    component.heightData = [165];
    expect(component.isFormValid).toBeFalse();
  });

  it('should pass validation for valid form', () => {
    component.selectedFile = new File([], 'test.png');
    component.height = 170;
    component.weight = 60;
    component.heightData = [160];
    expect(component.isFormValid).toBeTrue();
  });


  //   it('should set preview on file select', fakeAsync(() => {
  //     const file = new File(['dummy'], 'pic.png', { type: 'image/png' });

  //     const mockResult = 'data:image/png;base64,test';

  //     const fileReaderMock = {
  //       readAsDataURL(this: FileReader) {
  //         const event = {
  //           target: { result: mockResult },
  //         } as ProgressEvent<FileReader>;

  //         if (this.onload) {
  //           this.onload.call(this, event);
  //         }
  //       },
  //       onload: null,
  //     };

  //     Object.setPrototypeOf(fileReaderMock, FileReader.prototype); // 🔥 fix context

  //     spyOn(window as any, 'FileReader').and.callFake(() => fileReaderMock);

  //     const event = {
  //       target: {
  //         files: [file],
  //       },
  //     };

  //     component.onFileSelected(event);
  //     tick();

  //     expect(component.selectedFile).toBe(file);
  //     expect(component.selectedFilePreview).toBe(mockResult);
  //   }));

  //   it('should submit form successfully and reset fields', fakeAsync(() => {
  //     component.selectedFile = new File(['img'], 'file.png');
  //     component.height = 170;
  //     component.weight = 60;
  //     component.heightData = [160];

  //     mockProgressService.createProgress.and.returnValue(of({}));
  //     mockProgressService.getAllProgress.and.returnValue(of({ $values: [] }));

  //     component.onSubmit();
  //     tick();

  //     expect(mockProgressService.createProgress).toHaveBeenCalled();
  //     expect(mockRouter.navigate).toHaveBeenCalledWith(['stats-analytics']);
  //     expect(component.height).toBe(0);
  //     expect(component.weight).toBe(0);
  //     expect(component.selectedFile).toBeNull();
  //     expect(component.selectedFilePreview).toBeNull();
  //     expect(component.loading).toBeFalse();
  //   }));

  it('should show error on failed upload', fakeAsync(() => {
    spyOn(window, 'alert');
    component.selectedFile = new File(['img'], 'file.png');
    component.height = 170;
    component.weight = 60;
    component.heightData = [160];

    mockProgressService.createProgress.and.returnValue(
      throwError(() => new Error('fail'))
    );

    component.onSubmit();
    tick();

    expect(window.alert).toHaveBeenCalledWith('Upload failed');
    expect(component.loading).toBeFalse();
  }));
});
