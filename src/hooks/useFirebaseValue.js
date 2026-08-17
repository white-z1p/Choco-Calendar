import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Subscribes to a Realtime Database path and keeps state in sync.
 * Returns the raw value (or {} as a safe default for object-shaped data).
 */
export function useFirebaseValue(path, defaultValue = {}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const dbRef = ref(database, path);
    const unsub = onValue(dbRef, (snapshot) => {
      setValue(snapshot.val() ?? defaultValue);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return value;
}
