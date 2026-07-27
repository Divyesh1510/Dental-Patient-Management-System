import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, deleteDoc } from 'firebase/firestore';
import FirestoreService from './firestore';

/**
 * Ensure a patient document exists. If it doesn't, create it with the phone as password.
 */
export async function ensurePatientExists(name, phone) {
  const patientRef = doc(db, 'patients', phone);
  const snap = await getDoc(patientRef);
  if (!snap.exists()) {
    await setDoc(patientRef, {
      name: name || 'Unknown',
      phone,
      createdAt: serverTimestamp(),
    });
  }
}

/**
 * Sign in a patient by verifying the phone (username) and password (phone).
 */
export async function signInPatient(phone, password) {
  if (phone !== password) {
    throw new Error('Password must match phone number');
  }
  const patientRef = doc(db, 'patients', phone);
  const snap = await getDoc(patientRef);
  if (!snap.exists()) {
    throw new Error('Patient not found');
  }
  const data = snap.data();
  return { name: data.name, phone: data.phone };
}

/**
 * Get all portal patients
 */
export async function getPatients() {
  const snap = await getDocs(collection(db, 'patients'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Update patient details. If phone changes, we must migrate the document.
 */
export async function updatePatient(oldPhone, newName, newPhone) {
  if (oldPhone !== newPhone) {
    const oldRef = doc(db, 'patients', oldPhone);
    const newRef = doc(db, 'patients', newPhone);
    const oldSnap = await getDoc(oldRef);
    
    if (oldSnap.exists()) {
      const data = oldSnap.data();
      await setDoc(newRef, { ...data, name: newName, phone: newPhone });
      await deleteDoc(oldRef);
    } else {
      await setDoc(newRef, { name: newName, phone: newPhone, createdAt: serverTimestamp() });
    }
    // Migrate associated records
    await FirestoreService.updatePatientAppointmentsAndConsultations(oldPhone, { name: newName, phone: newPhone });
  } else {
    // Only name changed
    const ref = doc(db, 'patients', oldPhone);
    await setDoc(ref, { name: newName, phone: oldPhone }, { merge: true });
    await FirestoreService.updatePatientAppointmentsAndConsultations(oldPhone, { name: newName, phone: oldPhone });
  }
}

/**
 * Delete a patient portal account (does not cascade to appointments).
 */
export async function deletePatient(phone) {
  await deleteDoc(doc(db, 'patients', phone));
}
