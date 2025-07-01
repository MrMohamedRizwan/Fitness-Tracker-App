import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { UserService } from './services/UserService';
import { provideHttpClient } from '@angular/common/http';

import { ToastService } from './services/ToastService';
import { CoachService } from './services/CoachService';
import { WorkoutLogService } from './services/WorkoutLogService';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    UserService,
    ToastService,
    CoachService,
    WorkoutLogService,
    provideAnimations(),
    provideToastr(), // ✅ add toastr this way
  ],
};
