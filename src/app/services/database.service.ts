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
    this.reloadActions();
  }

  public async saveAction(action: Action): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      actions = new Array<Action>();
    }
    actions.push(action);
    await this.storage.set(this.ACTIONS, actions);
    this.reloadActions();
  }

  public async dropAction(action: Action | string): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      return;
    }

    let id = typeof action === "string" ? action : action.id;
    // Remove action from stored list
    actions = actions.filter(_ => {
      return _.id != id;
    });

    // Save new list to storage again
    await this.storage.set(this.ACTIONS, actions);
    this.reloadActions();
  }

  public async updateAction(action: Action): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      return;
    }

    actions.forEach(a => {
      if (a.id !== action.id)
        return;

      a = action;
    });

    // Save new list to storage again
    await this.storage.set(this.ACTIONS, actions);
    this.reloadActions();
  }

  public async getActions(): Promise<Array<Action>> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      return new Array<Action>();
    }
    return actions;
  }

  private async reloadActions(): Promise<void> {
    let actions = await this.storage.get(this.ACTIONS) as Array<Action>;
    if (!actions) {
      actions = new Array<Action>();
    }
    this._actions.next(actions);
  }
}
