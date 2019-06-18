import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AwarenessService {

  private readonly earthRadius: number = 6371;
  private lastPosition: Geoposition;
  private tracker: any;

  private _currentSpeed: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
  public readonly currentSpeed: Observable<number> = this._currentSpeed.asObservable();


  constructor(private geolocation: Geolocation) {
  }

  public startTracking(): void {
    this.tracker = setInterval(async () => {
      let newPos = await this.geolocation.getCurrentPosition();
      // We need two points to calculate the speed
      if (this.lastPosition) {
        let speed = this.calculateSpeed(this.lastPosition, newPos);
        console.log(speed);
        // // Cannot be slower than zero m/s
        // if (speed < 0)
        //   speed = 0.0;
        this._currentSpeed.next(speed);
      }
      this.lastPosition = newPos;
    }, 5000);
  }

  public stopTracking(): void {
    if (!this.tracker)
      return;

    clearInterval(this.tracker);
  }

  private calculateSpeed(pos1: Geoposition, pos2: Geoposition): number {

    var dLat = this.toRad(pos1.coords.latitude - pos2.coords.latitude);
    var dLon = this.toRad(pos1.coords.longitude - pos2.coords.longitude);
    var lat1 = this.toRad(pos1.coords.latitude);
    var lat2 = this.toRad(pos2.coords.latitude);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = this.earthRadius * c;
    return distance / (pos2.timestamp / 1000) - (pos1.timestamp / 1000);
  }

  private toRad(n: number): number {
    return n * Math.PI / 180;
  }
}
