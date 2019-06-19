import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Observable, BehaviorSubject, timer, Subscription } from 'rxjs';
import { ForegroundService } from '@ionic-native/foreground-service/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import * as uuid from 'uuid';
import { DatabaseService } from './database.service';
import { Action } from '../interfaces/action';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AwarenessService {

  private readonly earthRadius: number = 637100; // In meters
  private trackerSub: Subscription;

  private _isTracking: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isTracking: Observable<boolean> = this._isTracking.asObservable();

  private _currentSpeed: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
  public readonly currentSpeed: Observable<number> = this._currentSpeed.asObservable();

  private _lastPosition: BehaviorSubject<Geoposition> = new BehaviorSubject<Geoposition>(null);
  public lastPosition: Observable<Geoposition> = this._lastPosition.asObservable();


  constructor(private geolocation: Geolocation, private database: DatabaseService,
    private foregroundService: ForegroundService, private localNotifications: LocalNotifications) {
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
    this.localNotifications.schedule({
      title: `Entered fence: ${action.name}`,
      text: action.notificationText,
      launch: true
    });
  }

  public toggleTracking(): void {
    if (this._isTracking.value) {
      this.stopTracking();
    } else {
      this.startTracking();
    }
  }

  private startTracking(): void {
    this.foregroundService.start("Your getting tracked!", "The AwarenessApp is tracking your movement.");
    this.trackerSub = timer(0, 5000).subscribe(async () => {
      let pos = await this.getBestPossibleGeolocation();
      if (!pos)
        return;
      // While calculating the speed we can async check for fences
      this.checkFences(pos);

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

  private stopTracking(): void {
    if (!this.isTracking)
      return;

    this.trackerSub.unsubscribe();
    this.foregroundService.stop();
    this._isTracking.next(false);
  }

  public async addFenceToCurrentLocation(name: string, radius: number, type: 1 | 2, startTracking: boolean): Promise<void> {
    let currentPos = await this.geolocation.getCurrentPosition();
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
}
