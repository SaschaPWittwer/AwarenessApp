import { Component, OnInit, OnDestroy } from '@angular/core';
import { AwarenessService } from '../services/awareness.service';

@Component({
  selector: 'app-awareness',
  templateUrl: './awareness.page.html',
  styleUrls: ['./awareness.page.scss'],
})
export class AwarenessPage implements OnInit, OnDestroy {

  currentTransportationMethod: string;
  trackingText: string;
  speedInMS: string;

  constructor(public awarenessService: AwarenessService) {

  }

  ngOnInit() {
    this.awarenessService.isTracking.subscribe(isTracking => {
      if (isTracking)
        this.trackingText = 'Disable tracking';
      else
        this.trackingText = 'Enable tracking';
    });
    this.awarenessService.currentSpeed.subscribe(speed => {
      if (speed <= 0)
        this.speedInMS = '-';
      else
        this.speedInMS = speed.toPrecision(6);
    })
  }

  ngOnDestroy() {
  }

  toggleTracking(): void {
    this.awarenessService.toggleTracking();
  }
}
