import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Geofence } from '@ionic-native/geofence/ngx';
import { ModalController } from '@ionic/angular';
import { Action } from '../interfaces/action';
import { AddActionComponent } from './add-action/add-action.component';
import { DatabaseService } from '../services/database.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage implements OnInit {

  actions: Observable<Array<Action>>;

  constructor(private modalController: ModalController, private dbService: DatabaseService) {

  }

  async ngOnInit() {
    this.actions = this.dbService.actions;
  }

  async addNewAction(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddActionComponent
    });
    await modal.present();
  }

  deleteAction(action: Action): void {
    this.dbService.dropAction(action);
  }

}
