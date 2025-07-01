import { Component } from '@angular/core';
import { ClientSidebar } from '../../client/client-sidebar/client-sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  imports: [ClientSidebar, RouterOutlet],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css',
})
export class ClientLayout {}
