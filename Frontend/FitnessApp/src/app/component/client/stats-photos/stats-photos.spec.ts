import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsPhotos } from './stats-photos';

describe('StatsPhotos', () => {
  let component: StatsPhotos;
  let fixture: ComponentFixture<StatsPhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsPhotos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsPhotos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
