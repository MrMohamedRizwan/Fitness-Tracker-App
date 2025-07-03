import 'zone.js'; // Required for Angular
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing'; // ✅ UPDATED IMPORTS

getTestBed().initTestEnvironment(
  BrowserTestingModule, // ✅ UPDATED MODULE
  platformBrowserTesting(), // ✅ UPDATED PLATFORM
  {
    teardown: { destroyAfterEach: true },
  }
);
