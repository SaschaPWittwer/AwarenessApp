import { Geofence } from '@ionic-native/geofence/ngx';

export interface Action {
    lat: number;
    lng: number;
    type: number,
    startTracking: boolean,
    name: string,
    id: string,
    notificationText: string,
    radius: number,
    within: boolean // Value which determines if the user is currently within this geofence
}