import { Injectable } from '@angular/core';
import { Geofence } from '@ionic-native/geofence/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import * as uuid from 'uuid';
import { Action } from '../interfaces/action';
import { DatabaseService } from './database.service';
import { ToastController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor(private geolocation: Geolocation, private geofence: Geofence, private database: DatabaseService, private toastController: ToastController) {
    this.geofence.initialize().then(
      // resolved promise does not return a value
      () => console.log('Geofence Plugin Ready'),
      (err) => console.log(err)
    );

    // todo -> Move
    this.geofence.onNotificationClicked().subscribe(async notificationData => {
      const toast = await this.toastController.create({
        message: 'Notification clicked. Id: ' + notificationData.id,
        duration: 2000
      });
      toast.present();
    });
  }

  public async removeFence(id: string): Promise<void> {
    await this.geofence.remove(id);
  }

  public async addFenceToCurrentLocation(name: string, radius: number, type: 1 | 2, startTracking: boolean): Promise<void> {
    let currentPos = await this.geolocation.getCurrentPosition();
    let notificationText = startTracking ? 'Would you like to enable tracking yourself?' : 'Would you like to disable tracking yourself?';
    let fence = {
      id: uuid.v4(),
      latitude: currentPos.coords.latitude,
      longitude: currentPos.coords.longitude,
      radius: radius,
      transitionType: type,
      notification: {
        id: new Date().getMilliseconds(),
        title: "AwarenessApp needs your attention",
        text: notificationText,
        openAppOnClick: true
      }
    }

    this.geofence.addOrUpdate(fence).then(
      () => {
        console.log('Geofence added');
      },
      (err) => {
        console.log('Geofence failed to add');
      }
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
