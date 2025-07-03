import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClientDetails } from './client-details';
import { UserService } from '../../../services/UserService';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('ClientDetails Component', () => {
  let component: ClientDetails;
  let fixture: ComponentFixture<ClientDetails>;
  let userServiceMock: any;

  const mockCoachesResponse = {
    items: {
      $values: [
        { id: '1', name: 'Coach A' },
        { id: '2', name: 'Coach B' },
      ],
    },
  };

  const mockUpdateResponse = {
    message: 'Client updated successfully',
  };

  beforeEach(waitForAsync(() => {
    userServiceMock = {
      getAllCoaches: jasmine
        .createSpy()
        .and.returnValue(of(mockCoachesResponse)),
      UpdateClientDetails: jasmine
        .createSpy()
        .and.returnValue(of(mockUpdateResponse)),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    })
      .overrideComponent(ClientDetails, {
        set: {
          imports: [ReactiveFormsModule, CommonModule],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load coaches on init', () => {
    expect(userServiceMock.getAllCoaches).toHaveBeenCalled();
    expect(component.coaches.length).toBe(2);
    expect(component.filteredCoaches.length).toBe(2);
  });

  // it('should filter coaches based on search term', () => {
  //   component.updateForm.get('coachSearch')?.setValue('coach a');
  //   expect(component.filteredCoaches.length).toBe(1);
  //   expect(component.filteredCoaches[0].name).toBe('Coach A');
  // });

  // it('should patch coach ID when a coach is selected', () => {
  //   // component.selectCoach({ id: '2', name: 'Coach B' });
  //   expect(component.updateForm.value.coachId).toBe('2');
  // });

  it('should submit the form and update client details', () => {
    component.updateForm.setValue({
      gender: 'Male',
      goal: 'Lose weight',
      height: 170,
      weight: 70,
      coachSearch: '',
      coachId: '1',
    });

    component.onSubmit();

    expect(userServiceMock.UpdateClientDetails).toHaveBeenCalledWith({
      gender: 'Male',
      goal: 'Lose weight',
      height: 170,
      weight: 70,
      coachId: '1',
    });

    expect(component.successMessage).toBe('Client updated successfully');
    expect(component.errorMessage).toBe('');
  });

  it('should not submit if form is invalid', () => {
    component.updateForm.reset();
    component.onSubmit();
    expect(userServiceMock.UpdateClientDetails).not.toHaveBeenCalled();
  });

  it('should handle error on update failure', () => {
    userServiceMock.UpdateClientDetails.and.returnValue(
      throwError(() => ({
        error: { message: 'Server error' },
      }))
    );

    component.updateForm.setValue({
      gender: 'Female',
      goal: 'Build muscle',
      height: 165,
      weight: 60,
      coachSearch: '',
      coachId: '2',
    });

    component.onSubmit();

    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('Server error');
  });
});
