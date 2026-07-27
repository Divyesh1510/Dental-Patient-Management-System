import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

class FirestoreService {
  static appointmentsColl = collection(db, 'appointments');
  static orthoColl = collection(db, 'ortho_patients');
  static consultationsColl = collection(db, 'consultations');
  static blogsColl = collection(db, 'blogs');

  static sanitize(obj) {
    if (!obj) return obj;
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
  }

  static getBlogs(callback) {
    const q = query(this.blogsColl, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const blogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(blogs);
    });
  }

  static async getBlogById(id) {
    const docSnap = await getDoc(doc(db, 'blogs', id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  static async addBlog(data) {
    return await addDoc(this.blogsColl, this.sanitize({
      ...data,
      createdAt: new Date().toISOString()
    }));
  }

  static async updateBlog(id, data) {
    await updateDoc(doc(db, 'blogs', id), this.sanitize(data));
  }

  static async deleteBlog(id) {
    await deleteDoc(doc(db, 'blogs', id));
  }

  static getAppointments(date, callback) {
    const q = query(
      this.appointmentsColl, 
      where('date', '==', date)
    );
    return onSnapshot(q, (snapshot) => {
      const appointments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by createdAt desc in memory to avoid index requirement
      const sorted = appointments.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      callback(sorted);
    });
  }

  static getOrthoPatients(callback) {
    const q = query(this.orthoColl, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(patients);
    });
  }

  static async updateAppointment(id, data) {
    await updateDoc(doc(db, 'appointments', id), this.sanitize(data));
  }

  static async deleteAppointment(id) {
    await deleteDoc(doc(db, 'appointments', id));
  }

  static async addAppointment(appt) {
    await addDoc(this.appointmentsColl, this.sanitize(appt));
  }

  static async addOrthoVisit(id, visit, currentVisits) {
    const updatedVisits = [...currentVisits, visit];
    await updateDoc(doc(db, 'ortho_patients', id), { visits: updatedVisits });
  }

  static async addOrthoPatient(patient) {
    await addDoc(this.orthoColl, {
      ...patient,
      visits: [],
      status: 'active',
      createdAt: new Date().toISOString()
    });
  }

  static getPatientHistory(phone, callback) {
    const q = query(
      this.appointmentsColl,
      where('phone', '==', phone)
    );
    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = history.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      callback(sorted);
    });
  }

  static getConsultations(date, callback) {
    let q;
    if (date && typeof date === 'string') {
      q = query(this.consultationsColl, where('date', '==', date));
    } else {
      q = query(this.consultationsColl, orderBy('createdAt', 'desc'));
    }
    
    // If we have a callback as the second arg, or if date was actually the callback
    const actualCallback = typeof date === 'function' ? date : callback;

    return onSnapshot(q, (snapshot) => {
      const consultations = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = consultations.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      if (actualCallback) actualCallback(sorted);
    });
  }

  static async addConsultation(consultation) {
    return await addDoc(this.consultationsColl, this.sanitize({
      ...consultation,
      createdAt: new Date().toISOString()
    }));
  }

  static async updateConsultation(id, data) {
    await updateDoc(doc(db, 'consultations', id), this.sanitize(data));
  }

  static async deleteConsultation(id) {
    await deleteDoc(doc(db, 'consultations', id));
  }

  static async updateOrthoPatient(id, data) {
    await updateDoc(doc(db, 'ortho_patients', id), this.sanitize(data));
  }

  static async updatePatientAppointmentsAndConsultations(oldPhone, newDetails) {
    const batch = writeBatch(db);

    const apptQ = query(this.appointmentsColl, where('phone', '==', oldPhone));
    const apptSnapshot = await getDocs(apptQ);
    apptSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const updates = { phone: newDetails.phone };
      if (data.name !== undefined) updates.name = newDetails.name;
      if (data.patient !== undefined) updates.patient = newDetails.name;
      if (data.patientName !== undefined) updates.patientName = newDetails.name;
      if (data.Patient !== undefined) updates.Patient = newDetails.name;
      updates.name = newDetails.name;
      updates.patient = newDetails.name;
      batch.update(docSnap.ref, this.sanitize(updates));
    });

    const consultQ = query(this.consultationsColl, where('phone', '==', oldPhone));
    const consultSnapshot = await getDocs(consultQ);
    consultSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const updates = { phone: newDetails.phone };
      if (data.patientName !== undefined) updates.patientName = newDetails.name;
      if (data.name !== undefined) updates.name = newDetails.name;
      updates.patientName = newDetails.name;
      batch.update(docSnap.ref, this.sanitize(updates));
    });

    await batch.commit();
  }
}

export default FirestoreService;
