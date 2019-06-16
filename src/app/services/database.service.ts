import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Action } from '../interfaces/action';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private readonly ACTIONS: string = "actions";

  constructor(private storage: Storage) { }

  public async saveAction(action: Action): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      actions = new Array<Action>();
    }
    actions.push(action);
    await this.storage.set(this.ACTIONS, actions);
  }

  public async dropAction(action: Action | string): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      return;
    }

    let id = typeof action === "string" ? action : action.fenceId;
    let toDelete = actions.findIndex(_ => {
      return _.fenceId == id;
    });

    if (toDelete === -1)
      return;

    actions = actions.splice(toDelete, 1);

    await this.storage.set(this.ACTIONS, actions);
  }
}
