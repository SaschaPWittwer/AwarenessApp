import { Component } from '@angular/core';
import { AwarenessService } from '../services/awareness.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  isTracking: boolean;
  isFencing: boolean;

  constructor(public awarenessService: AwarenessService) {
    this.awarenessService.isTracking.subscribe(val => {
      this.isTracking = val;
    })
    this.awarenessService.isFencing.subscribe(val => {
      this.isFencing = val;
    })
  }

  toggleTracking(checked: boolean): void {
    if (checked !== this.isTracking) {
      this.awarenessService.toggleTracking();
    }
  }

  toggleFencing(checked: boolean): void {
    if (checked !== this.isFencing) {
      this.awarenessService.toggleFencing();
    }
  }
}
