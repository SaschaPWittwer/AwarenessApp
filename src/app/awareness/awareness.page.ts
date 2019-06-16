import { Component, OnInit, OnDestroy } from '@angular/core';
import { AwarenessService } from '../services/awareness.service';

@Component({
  selector: 'app-awareness',
  templateUrl: './awareness.page.html',
  styleUrls: ['./awareness.page.scss'],
})
export class AwarenessPage implements OnInit, OnDestroy {

  currentTransportationMethod: string;

  constructor(public awarenessService: AwarenessService) {

  }

  ngOnInit() {
    this.awarenessService.startTracking();
  }

  ngOnDestroy() {
    this.awarenessService.stopTracking();
  }
}
