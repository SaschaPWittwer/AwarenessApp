import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Geofence } from '@ionic-native/geofence/ngx';
import { ModalController } from '@ionic/angular';
import { Action } from '../interfaces/action';
import { AddActionComponent } from './add-action/add-action.component';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage implements OnInit {

  actions: Array<Action>;

  constructor(private storage: Storage, private geofence: Geofence, private modalController: ModalController) {
    this.actions = new Array<Action>();
    this.actions.push({
      lat: 0,
      lng: 0,
      startTracking: true,
      type: this.geofence.TransitionType.EXIT,
      name: 'Home'
    });
    this.actions.push({
      lat: 0,
      lng: 0,
      startTracking: false,
      type: this.geofence.TransitionType.ENTER,
      name: 'Home'
    });
  }

  ngOnInit() {

  }

  async addNewAction(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddActionComponent
    });
    return await modal.present();
  }

  deleteAction(action: Action): void {
    console.log(`Drop action ${action.name}`);
  }

}
