import { db } from './src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkPhone() {
  const phoneToFind = '7893625999';
  console.log(`Checking for phone: ${phoneToFind}...`);
  
  let found = false;
  
  const checkColl = async (collName) => {
    const snap = await getDocs(collection(db, collName));
    snap.forEach(doc => {
      const data = doc.data();
      if (data.phone && data.phone.includes(phoneToFind)) {
        console.log(`Found in ${collName}! ID: ${doc.id}, Data:`, data);
        found = true;
      }
      // Also check normalized phone
      const normalized = data.phone ? data.phone.replace(/\D/g, '') : '';
      if (normalized === phoneToFind || normalized.includes(phoneToFind)) {
        console.log(`Found normalized in ${collName}! ID: ${doc.id}, Data:`, data);
        found = true;
      }
    });
  };

  await checkColl('patients');
  await checkColl('appointments');
  await checkColl('consultations');
  await checkColl('ortho_patients');
  
  if (!found) {
    console.log('Phone number not found in any collection.');
  }
  process.exit(0);
}

checkPhone().catch(console.error);
