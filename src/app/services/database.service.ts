import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Action } from '../interfaces/action';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private readonly ACTIONS: string = "actions";

  private _actions: BehaviorSubject<Array<Action>> = new BehaviorSubject(new Array<Action>());
  public actions: Observable<Array<Action>> = this._actions.asObservable();

  constructor(private storage: Storage) {
    this.updateActions();
  }

  public async saveAction(action: Action): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      actions = new Array<Action>();
    }
    actions.push(action);
    await this.storage.set(this.ACTIONS, actions);
    this.updateActions();
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
    this.updateActions();
  }

  private async updateActions(): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      actions = new Array<Action>();
    }
    this._actions.next(actions);
  }
}
