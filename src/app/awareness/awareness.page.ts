import { Component, OnInit, OnDestroy } from '@angular/core';
import { AwarenessService, UserAction } from '../services/awareness.service';
import { WeatherService } from '../services/weather.service';
import { Weather } from '../models/weather';


@Component({
  selector: 'app-awareness',
  templateUrl: './awareness.page.html',
  styleUrls: ['./awareness.page.scss'],
})
export class AwarenessPage implements OnInit, OnDestroy {

  currentTransportationMethod: string;
  trackingText: string;
  speedInKmh: string;
  userAction: string;
  imageUrl: string;
  weather: Promise<Weather>;
  longitude: number;
  latitude: number;

  constructor(public awarenessService: AwarenessService, private weatherService: WeatherService) {
    
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
    this.awarenessService.lastPosition.subscribe(pos => {
      this.longitude = pos.coords.longitude;
      this.latitude = pos.coords.latitude;
    });
    this.awarenessService.currentUserAction.subscribe(userAction => {
      this.userAction = UserAction[userAction].toLowerCase();
      this.imageUrl = '../assets/images/' + this.userAction + '.svg';
      this.weather = this.weatherService.getCurrentWeather(this.longitude, this.latitude);
    });
  }

  ngOnDestroy() {
  }

  toggleTracking(): void {
    this.awarenessService.toggleTracking();
  }
}
