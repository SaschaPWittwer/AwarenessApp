import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Geofence } from '@ionic-native/geofence/ngx';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { DatabaseService } from 'src/app/services/database.service';
import { GeoService } from 'src/app/services/geo.service';

@Component({
  selector: 'app-add-action',
  templateUrl: './add-action.component.html',
  styleUrls: ['./add-action.component.scss'],
})
export class AddActionComponent {

  actionForm: FormGroup;

  constructor(private modalController: ModalController, private loadingController: LoadingController,
    public geofence: Geofence, private geoService: GeoService) {
    this.actionForm = new FormGroup({
      name: new FormControl('', Validators.required),
      radius: new FormControl(50, [Validators.required, Validators.min(10), Validators.max(200)]),
      type: new FormControl(null, Validators.required),
      startTracking: new FormControl(false)
    });
  }

  async onSubmit(): Promise<void> {
    let loader = await this.loadingController.create({
      message: 'Saving action'
    });
    await loader.present();
    let name = this.actionForm.value.name as string;
    let radius = this.actionForm.value.radius as number;
    let type = this.actionForm.value.type as 1 | 2;
    let startTracking = this.actionForm.value.startTracking as boolean;
    await this.geoService.addFenceToCurrentLocation(name, radius, type, startTracking);
    await loader.dismiss();
    this.modalController.dismiss();
  }

  onCancel(): void {
    this.modalController.dismiss();
  }

}
