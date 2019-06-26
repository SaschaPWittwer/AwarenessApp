import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Weather } from '../models/weather';
import { BehaviorSubject, Observable } from 'rxjs';
import { AwarenessService } from './awareness.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  
  private readonly key: string = '9b1a01a89e354454879123212192606';
  private _weathter: BehaviorSubject<Weather> = new BehaviorSubject<Weather>(null);
  public weather: Observable<Weather> = this._weathter.asObservable();
  // private weather: Weather;

  constructor(private httpClient: HttpClient, private awarenessService: AwarenessService) { 
    this.getCurrentWeather(7.447447,46.947975);
    this.awarenessService.lastPosition.subscribe(pos => {
      this.getCurrentWeather(pos.coords.longitude, pos.coords.latitude);
    });
  }

  public async getCurrentWeather(longitude, latitude) : Promise<void>{
    if (this._weathter.value == null || this._weathter.value.timeStamp.getTime() < new Date().setMinutes(-10)) {
      let params = new HttpParams();
      params = params.append('key', this.key);
      params = params.append('q', latitude + ',' + longitude);
      const resp = await this.httpClient.get<any>('https://api.apixu.com/v1/current.json', { params: params }).toPromise();
      let newWeather: Weather = {
        condition: resp.current.condition.text,
        temp: resp.current.temp_c,
        icon: 'https:' + resp.current.condition.icon,
        timeStamp: new Date(),
      };

      this._weathter.next(newWeather);
    }
  }
}
