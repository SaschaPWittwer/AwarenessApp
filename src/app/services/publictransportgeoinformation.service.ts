import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import { type } from 'os';
import { HttpClient } from '@angular/common/http';
import { LineString, Feature } from '@turf/turf';

@Injectable({
  providedIn: 'root'
})
export class PublictransportgeoinformationService {

  private geoJson: Array<Feature<LineString>> = new Array<Feature<LineString>>();
  constructor(private httpClient:HttpClient) {
    httpClient.get<any>('../../assets/geodata/train.json').subscribe(res => {
      res.features.forEach(f => {
        if(f.geometry.type === 'LineString'){
          this.geoJson.push(turf.lineString(f.geometry.coordinates));
        }else if(f.geometry.type === 'MultiLineString'){
          //f.geometry.coo
        }
        
      });
    });


   }

   public findPointOnLineStrings(lon: number, lat: number): boolean {
     let point = turf.point([lon, lat]);
     this.geoJson.forEach(l => {
      let actualDistance = turf.pointToLineDistance(point,l, {units: "kilometers"});
      if (actualDistance < 0.005){
        return true;
      }
     });


     /*turf.geojsonType(this.geoJson)
     return booleanPointOnLine(point, )
     pointToLineDistance*/
     return false;

   }
}
