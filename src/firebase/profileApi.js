import { ref, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from './config';

export function setProfileName(name) {
  return set(ref(database, 'profile/main/name'), name);
}

export function setProfileWeight(date, value) {
  return set(ref(database, `profile/main/weightLog/${date}`), value);
}

export function setProfileAvatarEmoji(emoji) {
  return Promise.all([
    set(ref(database, 'profile/main/avatarEmoji'), emoji),
    set(ref(database, 'profile/main/photoURL'), null),
  ]);
}

export async function uploadProfilePhoto(file) {
  const path = storageRef(storage, `profile/dog-photo-${Date.now()}.jpg`);
  await uploadBytes(path, file);
  const url = await getDownloadURL(path);
  await set(ref(database, 'profile/main/photoURL'), url);
  return url;
}
