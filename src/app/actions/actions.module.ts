import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ActionsPage } from './actions.page';
import { AddActionComponent } from './add-action/add-action.component';

const routes: Routes = [
  {
    path: '',
    component: ActionsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ActionsPage, AddActionComponent],
  exports: [AddActionComponent],
  entryComponents: [AddActionComponent]
})
export class ActionsPageModule { }
