import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
const dir='android/app/src/main/res/drawable';await mkdir(dir,{recursive:true});await copyFile('native-resources/android/ic_pet_notification.xml',`${dir}/ic_pet_notification.xml`);
const file='android/app/src/main/AndroidManifest.xml';let xml=await readFile(file,'utf8');
// Care reminders use inexact scheduling, never the Alarms & reminders permission.
if(!xml.includes('xmlns:tools='))xml=xml.replace('<manifest ', '<manifest xmlns:tools="http://schemas.android.com/tools" ');
if(!xml.includes('tools:node="remove"'))xml=xml.replace('</manifest>', '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" tools:node="remove" /></manifest>');await writeFile(file,xml);
