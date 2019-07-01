import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Observable, BehaviorSubject, timer, Subscription } from 'rxjs';
import { ForegroundService } from '@ionic-native/foreground-service/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import * as uuid from 'uuid';
import { DatabaseService } from './database.service';
import { Action } from '../interfaces/action';
import { ToastController } from '@ionic/angular';
import { PublictransportgeoinformationService } from './publictransportgeoinformation.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WeatherService } from './weather.service';

@Injectable({
  providedIn: 'root'
})


export class AwarenessService {


  private readonly earthRadius: number = 6371000; // In meters
  private trackerSub: Subscription;
  private fenceSub: Subscription;
  private userActionSub: Subscription;

  private _isTracking: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isTracking: Observable<boolean> = this._isTracking.asObservable();

  private _isFencing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isFencing: Observable<boolean> = this._isFencing.asObservable();

  private _currentSpeed: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
  public readonly currentSpeed: Observable<number> = this._currentSpeed.asObservable();

  private _lastPosition: BehaviorSubject<Geoposition> = new BehaviorSubject<Geoposition>(null);
  public lastPosition: Observable<Geoposition> = this._lastPosition.asObservable();

  private _currentUserAction: BehaviorSubject<UserAction> = new BehaviorSubject<UserAction>(UserAction.STANDING);
  public currentUserAction: Observable<UserAction> = this._currentUserAction.asObservable();

  private readonly cyclingThreshold: number = 7;
  private readonly drivingThreshold: number = 25;


  constructor(private geolocation: Geolocation, private database: DatabaseService,
    private foregroundService: ForegroundService, private localNotifications: LocalNotifications, private publicTransPortGeoInformationService: PublictransportgeoinformationService, private httpClient: HttpClient) {
    this.localNotifications.on('yes').subscribe(notification => {
      let shouldStartTracking = notification.data.startTracking;
      if (shouldStartTracking) {
        this.startTracking();
      } else {
        this.stopTracking();
      }
    });
  }

  public toggleTracking(): void {
    if (this._isTracking.value) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
  }

  public toggleFencing(): void {
    if (this._isFencing.value) {
      this.stopFencing();
    } else {
      this.startFencing();
    }
  }

  private stopTracking(): void {
    if (!this._isTracking.value)
      return;

    this.trackerSub.unsubscribe();
    this.userActionSub.unsubscribe();
    this._isTracking.next(false);
    this.handleForegroundService();
  }

  private stopFencing(): void {
    if (!this._isFencing.value)
      return;

    this.fenceSub.unsubscribe();
    this._isFencing.next(false);
    this.handleForegroundService();
  }

  private handleForegroundService(): void {
    if (!this._isFencing.value && !this._isTracking.value) {
      this.foregroundService.stop();
    } else {
      this.foregroundService.start("AwarenessApp is running", "Your geolocations are getting tracked!");
    }
  }

  private startTracking(): void {
    this.trackerSub = timer(0, 3000).subscribe(async () => {
      let pos = await this.getBestPossibleGeolocation();
      if (!pos)
        return;

      if (pos.coords.speed) {
        this._currentSpeed.next(pos.coords.speed);
      } else {
        // We need two points to calculate the speed
        if (this._lastPosition.value) {
          let speed = this.calculateSpeed(this._lastPosition.value, pos);
          console.log(speed);
          if (!Number.isNaN(speed) && Number.isFinite(speed))
            this._currentSpeed.next(speed);
          else
            this._currentSpeed.next(0);
        }
      }
      this._lastPosition.next(pos);
    });
    this._isTracking.next(true);
    this.handleForegroundService();
    // Start tracking user transportation mode
    this.userActionSub = this.lastPosition.subscribe(lPos => {
      this.decideUserAction(lPos);
    });
  }

  private startFencing(): void {
    this.fenceSub = timer(0, 30000).subscribe(async () => {
      let pos = await this.getBestPossibleGeolocation();
      if (!pos)
        return;

      await this.checkFences(pos);
      this._lastPosition.next(pos);
    });
    this._isFencing.next(true);
    this.handleForegroundService();
  }

  private async checkFences(currentPos: Geoposition): Promise<void> {
    // Iterate through actions and check if something must be triggered
    let actions = await this.database.getActions();
    actions.forEach(async action => {
      let distance = this.getDistance(action.lat, currentPos.coords.latitude, action.lng, currentPos.coords.longitude);
      // Check for enter
      if (action.type === 1 && distance <= action.radius && !action.within) {
        this.scheduleNotification(action);
        action.within = true;
        await this.database.updateAction(action);
      }
      // Check for leave
      else if (action.type === 2 && distance >= action.radius && action.within) {
        this.scheduleNotification(action);
        action.within = false;
        await this.database.updateAction(action);
      }
    });
  }

  private async scheduleNotification(action: Action): Promise<void> {
    let title = action.type === 1 ? `You entered ${action.name}` : `You left ${action.name}`;
    this.localNotifications.schedule({
      title: title,
      text: action.notificationText,
      launch: true,
      data: {
        startTracking: action.type === 2
      },
      actions: [
        {
          id: 'yes',
          title: 'Yes'
        }
      ]
    });
  }

  private async getBestPossibleGeolocation(): Promise<Geoposition> {
    let targetedAccuracy = this._lastPosition.value ? this._lastPosition.value.coords.accuracy : 50;
    let nextViablePos: Geoposition = null;
    let counter: number = 0;
    // Try to get the best location but stop after 5 iterations
    while (nextViablePos === null && counter < 5) {
      let pos = await this.geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });

      // Check if position is viable
      if (pos.coords.accuracy <= targetedAccuracy) {
        nextViablePos = pos;
      }

      // Raise targeted accuracy. Otherwise it could loop infinitely
      targetedAccuracy += 5;
      counter++;
    }

    return nextViablePos;
  }

  public async addFenceToCurrentLocation(name: string, radius: number, type: 1 | 2, startTracking: boolean): Promise<void> {
    let currentPos = await this.getBestPossibleGeolocation();
    while (currentPos === null) {
      currentPos = await this.getBestPossibleGeolocation();
    }
    let notificationText = startTracking ? 'Would you like to enable tracking yourself?' : 'Would you like to disable tracking yourself?';

    let action: Action = {
      id: uuid.v4(),
      lat: currentPos.coords.latitude,
      lng: currentPos.coords.longitude,
      name: name,
      notificationText: notificationText,
      startTracking: startTracking,
      type: type,
      radius: radius,
      within: true // Always start with true since we take the current location and will therefore always start within
    };

    await this.database.saveAction(action);
  }

  private calculateSpeed(pos1: Geoposition, pos2: Geoposition): number {
    // Distance in meters
    let distance = this.getDistance(pos1.coords.latitude, pos2.coords.latitude, pos1.coords.longitude, pos2.coords.longitude);

    // Time in seconds
    let time = (pos2.timestamp - pos1.timestamp) / 1000;

    // return speed as meters per second
    return distance / time;
  }

  private getDistance(lat1: number, lat2: number, lon1: number, lon2: number): number {
    // Convert degrees to radians
    lon1 = this.toRad(lon1);
    lon2 = this.toRad(lon2);
    lat1 = this.toRad(lat1);
    lat2 = this.toRad(lat2);

    // P
    let z1 = this.earthRadius * Math.sin(lat1);
    let x1 = this.earthRadius * Math.cos(lat1) * Math.cos(lon1);
    let y1 = this.earthRadius * Math.cos(lat1) * Math.sin(lon1);

    // Q
    let z2 = this.earthRadius * Math.sin(lat2);
    let x2 = this.earthRadius * Math.cos(lat2) * Math.cos(lon2);
    let y2 = this.earthRadius * Math.cos(lat2) * Math.sin(lon2);

    // Product
    let cos_theta = (x1 * x2 + y1 * y2 + z1 * z2) / (this.earthRadius * this.earthRadius);
    let theta = Math.acos(cos_theta);

    // Distance in meters
    let distance = this.earthRadius * theta;
    return distance;
  }

  private toRad(n: number): number {
    return n * Math.PI / 180;
  }

  //Decide if the user is standing, walking, driving and using public transport
  private async decideUserAction(pos: Geoposition) {
    const currentSpeed = this._currentSpeed.value;
    const longitude = pos.coords.longitude;
    const latitude = pos.coords.latitude;

    if (currentSpeed >= this.cyclingThreshold && currentSpeed < this.drivingThreshold) {
      this._currentUserAction.next(UserAction.CYCLING);
    } else if (currentSpeed >= this.drivingThreshold && !this.publicTransPortGeoInformationService.findPointOnLineStrings(longitude, latitude)) {
      this._currentUserAction.next(UserAction.DRIVING);
    } else if (currentSpeed >= this.drivingThreshold && this.publicTransPortGeoInformationService.findPointOnLineStrings(longitude, latitude)) {
      this._currentUserAction.next(UserAction.PUBLICTRANSPORT);
    } else if (currentSpeed > 1 && currentSpeed < this.cyclingThreshold) {
      this._currentUserAction.next(UserAction.WALKING);
    } else {
      this._currentUserAction.next(UserAction.STANDING);
    }
  }
}

export enum UserAction {
  WALKING,
  PUBLICTRANSPORT,
  DRIVING,
  CYCLING,
  STANDING
}
