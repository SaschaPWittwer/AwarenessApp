import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private geolocation: Geolocation) { }

  ngOnInit(): void {
    this.test();
  }

  private async test(): Promise<void> {
    setInterval(async () => {
      let pos = await this.geolocation.getCurrentPosition();
      console.log(pos.coords.latitude, pos.coords.longitude);
    }, 2000);

  }

}
