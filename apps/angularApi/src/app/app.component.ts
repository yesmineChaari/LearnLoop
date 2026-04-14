import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalNotificationInitializerService } from './services/global-notification-initializer.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html'
}) 
export class AppComponent implements OnInit {
  title = 'LearnLoop';

  constructor(
    private globalNotificationInitializer: GlobalNotificationInitializerService
  ) {}

  ngOnInit(): void {
    // Initialize global notification listener for entire app session
    this.globalNotificationInitializer.initialize();
    console.log('✓ App started with global notifications enabled');
  }
}
