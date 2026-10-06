import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
const res='android/app/src/main/res',dir=`${res}/drawable`;await mkdir(dir,{recursive:true});
await copyFile('native-resources/android/ic_pet_notification.xml',`${dir}/ic_pet_notification.xml`);
const logo=await readFile('native-resources/android/ic_pet_logo.xml','utf8');
await writeFile(`${dir}/ic_pet_logo.xml`,logo);
// A default vector overrides density PNGs, including launchers on Android <26.
for(const density of ['mipmap-anydpi','mipmap-anydpi-v26']){
 const mip=`${res}/${density}`;await mkdir(mip,{recursive:true});
 for(const name of ['ic_launcher','ic_launcher_round'])await writeFile(`${mip}/${name}.xml`,logo);
}
// The manifest uses the same artwork for square and round launcher masks.
const file='android/app/src/main/AndroidManifest.xml';let xml=await readFile(file,'utf8');
if(!xml.includes('xmlns:tools='))xml=xml.replace('<manifest ', '<manifest xmlns:tools="http://schemas.android.com/tools" ');
if(!xml.includes('tools:node="remove"'))xml=xml.replace('</manifest>', '<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" tools:node="remove" /></manifest>');
await writeFile(file,xml);
