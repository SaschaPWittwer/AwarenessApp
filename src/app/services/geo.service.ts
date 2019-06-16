import { Injectable } from '@angular/core';
import { Geofence } from '@ionic-native/geofence/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import * as uuid from 'uuid';
import { Action } from '../interfaces/action';
import { DatabaseService } from './database.service';


@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor(private geolocation: Geolocation, private geofence: Geofence, private database: DatabaseService) {
    this.geofence.initialize().then(
      // resolved promise does not return a value
      () => console.log('Geofence Plugin Ready'),
      (err) => console.log(err)
    );
  }

  public async addFenceToCurrentLocation(name: string, radius: number, type: 1 | 2, startTracking: boolean): Promise<void> {
    let currentPos = await this.geolocation.getCurrentPosition();
    let fence = {
      id: uuid.v4(),
      latitude: currentPos.coords.latitude,
      longitude: currentPos.coords.longitude,
      radius: radius,
      transitionType: type,
      notification: {
        id: Math.random() * Math.random() * 1000,
        title: 'You crossed a fence',
        text: `${startTracking ? 'Start' : 'End'} tracking yourself?`,
        openAppOnClick: true
      }
    }

    await this.geofence.addOrUpdate(fence).then(
      () => console.log('Geofence added'),
      (err) => console.log('Geofence failed to add')
    );

    let action: Action = {
      fenceId: fence.id,
      lat: fence.latitude,
      lng: fence.longitude,
      name: name,
      notificationId: fence.notification.id,
      startTracking: startTracking,
      type: type
    };

    await this.database.saveAction(action);

  }


}
