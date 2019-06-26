import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Weather } from '../models/weather';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  
  private readonly key: string = '9b1a01a89e354454879123212192606';
  private weather: Weather;

  constructor(private httpClient: HttpClient) { 
    this.getCurrentWeather(7.447447,46.947975);
  }

  public async getCurrentWeather(longitude, latitude) : Promise<Weather>{
    if (this.weather == null || this.weather.timeStamp.getTime() < new Date().setMinutes(-10)) {
      let params = new HttpParams();
      params = params.append('key', this.key);
      params = params.append('q', latitude + ',' + longitude);
      const resp = await this.httpClient.get<any>('https://api.apixu.com/v1/current.json', { params: params }).toPromise();
      this.weather = {
        condition: resp.current.condition.text,
        temp: resp.current.temp_c,
        icon: 'https:' + resp.current.condition.icon,
        timeStamp: new Date(),
      };
    }   
    return this.weather;
  }
}
