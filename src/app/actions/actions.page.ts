import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Action } from '../interfaces/action';
import { AddActionComponent } from './add-action/add-action.component';
import { DatabaseService } from '../services/database.service';
import { GeoService } from '../services/geo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage implements OnInit {

  actions: Observable<Array<Action>>;

  constructor(private modalController: ModalController, private dbService: DatabaseService, private geeService: GeoService) {

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

  async deleteAction(action: Action): Promise<void> {
    await this.geeService.removeFence(action.fenceId);
    await this.dbService.dropAction(action);
  }

}
