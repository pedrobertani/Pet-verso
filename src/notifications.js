import {Capacitor} from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications';
import {App} from '@capacitor/app';
import {notificationManager} from './notification-plan.js';
export function setupNotifications({getPet,onStatus,onResume}){
 const manager=notificationManager({api:LocalNotifications,platform:Capacitor.getPlatform(),storage:localStorage,onStatus});
 if(Capacitor.isNativePlatform()){
  App.addListener('appStateChange',({isActive})=>{if(isActive)onResume();manager.sync(getPet());}).catch(()=>onStatus('error'));
  LocalNotifications.addListener('localNotificationActionPerformed',()=>{onResume();manager.sync(getPet());}).catch(()=>onStatus('error'));
 }
 return manager;
}
