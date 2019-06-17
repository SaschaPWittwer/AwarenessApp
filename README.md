# AwarenessApp

## Install needed stuff
`npm i -g ionic`

`npm i -g cordova@7.1.0`

## Downgrade Cordova (If already installed)
`npm uninstall -g cordova`

`npm install -g cordova@7.1.0`

## Plugins needed (Should already be installed in package.json)
* https://github.com/jupesoftware/cordova-plugin-geofence
* cordova-plugin-geolocation
* cordova-sqlite-storage

## Run on android device
`ionic cordova platform add android`

`ionic cordova run android`

### Build apk
`ionic cordova build android`

Attach debugger in VS Code with following config:
```json
{
    "name": "Attach to running android on device",
    "type": "cordova",
    "request": "attach",
    "platform": "android",
    "target": "device",
    "port": 9222,
    "sourceMaps": true,
    "cwd": "${workspaceRoot}"
}
```