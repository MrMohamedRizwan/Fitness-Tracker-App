import { Component } from '@angular/core';
import { CaochSidebar } from '../../coach/caoch-sidebar/caoch-sidebar';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-coach-layout',
  imports: [CaochSidebar, RouterOutlet],
  templateUrl: './coach-layout.html',
  styleUrl: './coach-layout.css',
})
export class CoachLayout {}
