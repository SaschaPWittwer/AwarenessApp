import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Observable, BehaviorSubject, timer, Subscription } from 'rxjs';
import { ForegroundService } from '@ionic-native/foreground-service/ngx';

@Injectable({
  providedIn: 'root'
})
export class AwarenessService {

  private readonly earthRadius: number = 637100; // In meters
  private lastPosition: Geoposition;
  private trackerSub: Subscription;

  private _isTracking: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isTracking: Observable<boolean> = this._isTracking.asObservable();

  private _currentSpeed: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
  public readonly currentSpeed: Observable<number> = this._currentSpeed.asObservable();


  constructor(private geolocation: Geolocation, private foregroundService: ForegroundService) {

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
      let pos = await this.geolocation.getCurrentPosition({
        timeout: 2000,
        maximumAge: 1000,
        enableHighAccuracy: true
      });
      if (pos.coords.speed) {
        this._currentSpeed.next(pos.coords.speed);
      } else {
        // We need two points to calculate the speed
        if (this.lastPosition) {
          let speed = this.calculateSpeed(this.lastPosition, pos);
          console.log(speed);
          if (!Number.isNaN(speed) && Number.isFinite(speed))
            this._currentSpeed.next(speed);
          else
            this._currentSpeed.next(0);
        }
      }
      this.lastPosition = pos;
    });
    this._isTracking.next(true);
  }

  private stopTracking(): void {
    if (!this.isTracking)
      return;

    this.trackerSub.unsubscribe();
    this.foregroundService.stop();
    this._isTracking.next(false);
  }

  private calculateSpeed(pos1: Geoposition, pos2: Geoposition): number {
    // Convert degrees to radians
    let lon1 = this.toRad(pos1.coords.longitude);
    let lon2 = this.toRad(pos2.coords.longitude);
    let lat1 = this.toRad(pos1.coords.latitude);
    let lat2 = this.toRad(pos2.coords.latitude);

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

    // Time in seconds
    let time = (pos2.timestamp - pos1.timestamp) / 1000;

    // return speed as meters per second
    return distance / time;
  }

  private toRad(n: number): number {
    return n * Math.PI / 180;
  }
}
