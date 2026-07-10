import { useState, useEffect, useCallback } from 'react';
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp,
} from '@/services/firebase';

/**
 * Subscribe to a Firestore collection in real-time.
 * @param {string} collectionName
 * @param {Array}  constraints  – Firestore query constraints (where, orderBy, limit…)
 */
export function useCollection(collectionName, constraints = []) {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    const ref = collection(db, collectionName);
    const q   = constraints.length > 0 ? query(ref, ...constraints) : ref;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error };
}

/**
 * Subscribe to a single Firestore document in real-time.
 */
export function useDocument(collectionName, docId) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!docId) { setLoading(false); return; }

    const ref         = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, docId]);

  return { data, loading, error };
}

/**
 * CRUD helpers for a Firestore collection.
 */
export function useFirestoreActions(collectionName) {
  const add = useCallback(
    (data) =>
      addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    [collectionName]
  );

  const update = useCallback(
    (docId, data) =>
      updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp(),
      }),
    [collectionName]
  );

  const remove = useCallback(
    (docId) => deleteDoc(doc(db, collectionName, docId)),
    [collectionName]
  );

  return { add, update, remove };
}
