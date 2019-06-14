import { Component, OnInit } from '@angular/core';
import { AwarenessService } from '../services/awareness.service';

@Component({
  selector: 'app-awareness',
  templateUrl: './awareness.page.html',
  styleUrls: ['./awareness.page.scss'],
})
export class AwarenessPage implements OnInit {

  constructor(public awarenessService: AwarenessService) {

  }

  ngOnInit() {
  }

}
