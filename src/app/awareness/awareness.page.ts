import { Component, OnInit, OnDestroy } from '@angular/core';
import { AwarenessService, UserAction } from '../services/awareness.service';


@Component({
  selector: 'app-awareness',
  templateUrl: './awareness.page.html',
  styleUrls: ['./awareness.page.scss'],
})
export class AwarenessPage implements OnInit, OnDestroy {

  currentTransportationMethod: string;
  trackingText: string;
  speedInKmh: string;
  userAction: UserAction;
  imageUrl: string;

  constructor(public awarenessService: AwarenessService) {

  }

  ngOnInit() {
    this.awarenessService.isTracking.subscribe(isTracking => {
      if (isTracking) {
        this.trackingText = 'Disable tracking';
      } else {
        this.trackingText = 'Enable tracking';
      }
    });
    this.awarenessService.currentSpeed.subscribe(speed => {
      if (speed <= 0) {
        this.speedInKmh = '-';
      } else {
        this.speedInKmh = Math.round(speed * 3.6).toString();
      }
    });
    this.awarenessService.currentUserAction.subscribe(userAction => {
      this.userAction = userAction;
      if(userAction === UserAction.WALKING){
        this.imageUrl = '../assets/images/bicycle.svg';
      } else if (userAction === UserAction.CYCLING){
        this.imageUrl = '../assets/images/bicycle.svg';
      } else if (userAction === UserAction.PUBLICTRANSPORT){
        this.imageUrl = '../assets/images/train.svg';
      } else if (userAction === UserAction.DRIVING){
        this.imageUrl = '../assets/images/car.svg';
      }
    });
  }

  ngOnDestroy() {
  }

  toggleTracking(): void {
    this.awarenessService.toggleTracking();
  }
}
