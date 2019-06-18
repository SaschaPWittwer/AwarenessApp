import { Component, OnInit, OnDestroy } from '@angular/core';
import { ForegroundService } from '@ionic-native/foreground-service/ngx';
import { AwarenessService } from '../services/awareness.service';

@Component({
  selector: 'app-awareness',
  templateUrl: './awareness.page.html',
  styleUrls: ['./awareness.page.scss'],
})
export class AwarenessPage implements OnInit, OnDestroy {

  currentTransportationMethod: string;
  foregroundServiceRunning: boolean;

  constructor(public awarenessService: AwarenessService, private foregroundService: ForegroundService) {

  }

  ngOnInit() {
    // this.awarenessService.startTracking();
  }

  ngOnDestroy() {
    // this.awarenessService.stopTracking();
  }

  toggleTracking(): void {
    if (this.foregroundServiceRunning) {
      this.awarenessService.stopTracking();
      this.foregroundService.stop();
    } else {
      this.awarenessService.startTracking();
      this.foregroundService.start("Your getting tracked!", "The AwarenessApp is tracking your movement.");
    }

    this.foregroundServiceRunning = !this.foregroundServiceRunning;
  }
}
