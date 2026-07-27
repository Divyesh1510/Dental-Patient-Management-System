import { db } from './src/firebase.js';
import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

async function migrate() {
  console.log('Starting migration...');
  
  const apptSnap = await getDocs(collection(db, 'appointments'));
  const consSnap = await getDocs(collection(db, 'consultations'));
  const orthoSnap = await getDocs(collection(db, 'ortho_patients'));

  const uniquePatients = new Map();

  const addRecord = (docSnap) => {
    const data = docSnap.data();
    if (data.phone) {
      const name = data.name || data.patientName || data.patient || data.Patient || 'Unknown';
      const phone = data.phone.replace(/\D/g, ''); 
      if (phone.length >= 10 && !uniquePatients.has(phone)) {
        uniquePatients.set(phone, name);
      }
    }
  };

  apptSnap.docs.forEach(addRecord);
  consSnap.docs.forEach(addRecord);
  orthoSnap.docs.forEach(addRecord);

  let count = 0;
  for (const [phone, name] of uniquePatients.entries()) {
    const patientRef = doc(db, 'patients', phone);
    const snap = await getDoc(patientRef);
    if (!snap.exists()) {
      await setDoc(patientRef, {
        name: name,
        phone: phone,
        createdAt: serverTimestamp(),
      });
      console.log(`Registered ${name} (${phone})`);
      count++;
    }
  }

  console.log(`Successfully migrated ${count} new patients!`);
  process.exit(0);
}

migrate().catch(console.error);
