import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
})
export class AddActionComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    setTimeout(() => {
      this.modalController.dismiss();
    }, 5000);
  }

}
