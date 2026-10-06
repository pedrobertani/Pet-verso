import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = { appId: 'br.app.petverso', appName: 'PetVerso', webDir: 'dist', plugins: { LocalNotifications: { smallIcon: 'ic_pet_notification', iconColor: '#4BAFC1', presentationOptions: ['badge','sound','banner','list'] } } };
export default config;
