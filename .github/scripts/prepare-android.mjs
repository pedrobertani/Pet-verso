import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
const res='android/app/src/main/res',dir=`${res}/drawable`;await mkdir(dir,{recursive:true});
await copyFile('native-resources/android/ic_pet_notification.xml',`${dir}/ic_pet_notification.xml`);
await copyFile('native-resources/android/petverso-launcher.png',`${dir}/petverso_launcher.png`);
await writeFile(`${dir}/ic_launcher_transparent.xml`,'<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108"><path android:fillColor="#00000000" android:pathData="M0,0h108v108H0z"/></vector>');
for(const density of ['mipmap-anydpi','mipmap-anydpi-v26']){
 const mip=`${res}/${density}`;await mkdir(mip,{recursive:true});
 const icon=density.endsWith('v26')?'<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@drawable/petverso_launcher"/><foreground android:drawable="@drawable/ic_launcher_transparent"/></adaptive-icon>':'<bitmap xmlns:android="http://schemas.android.com/apk/res/android" android:src="@drawable/petverso_launcher" android:gravity="fill" android:filter="true"/>';
 for(const name of ['ic_launcher','ic_launcher_round'])await writeFile(`${mip}/${name}.xml`,icon);
}
// The manifest uses the same artwork for square and round launcher masks.
const file='android/app/src/main/AndroidManifest.xml';let xml=await readFile(file,'utf8');
if(!xml.includes('xmlns:tools='))xml=xml.replace('<manifest ', '<manifest xmlns:tools="http://schemas.android.com/tools" ');
if(!xml.includes('tools:node="remove"'))xml=xml.replace('</manifest>', '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" tools:node="remove" /></manifest>');
await writeFile(file,xml);
