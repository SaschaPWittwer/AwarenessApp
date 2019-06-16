import { Geofence } from '@ionic-native/geofence/ngx';

export interface Action {
    lat: number;
    lng: number;
    type: number,
    startTracking: boolean,
    name: string,
    fenceId: string,
    notificationId: number
}