import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/appointment.dart';
import '../models/ortho_patient.dart';
import '../models/consultation.dart';

class FirestoreService {
  static final FirebaseFirestore _db = FirebaseFirestore.instance;
  static final CollectionReference _appointmentsRef = _db.collection('appointments');
  static final CollectionReference _orthoColl = _db.collection('ortho_patients');
  static final CollectionReference _consultationsRef = _db.collection('consultations');

  /// Add a new appointment
  static Future<DocumentReference> addAppointment(Appointment appointment) {
    return _appointmentsRef.add(appointment.toMap());
  }

  /// Update an existing appointment
  static Future<void> updateAppointment(String id, Appointment appointment) {
    return _appointmentsRef.doc(id).update({
      ...appointment.toMap(),
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  /// Delete an appointment
  static Future<void> deleteAppointment(String id) {
    return _appointmentsRef.doc(id).delete();
  }

  /// Get all appointments as a stream
  static Stream<List<Appointment>> getAppointmentsStream() {
    return _appointmentsRef.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Appointment.fromFirestore(doc)).toList();
    });
  }

  /// Get appointments for a specific date
  static Stream<List<Appointment>> getAppointmentsByDate(String date) {
    return _appointmentsRef.where('date', isEqualTo: date).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Appointment.fromFirestore(doc)).toList();
    });
  }

  /// Get appointments by phone number
  static Future<List<Appointment>> getAppointmentsByPhone(String phone) async {
    final snapshot = await _appointmentsRef.where('phone', isEqualTo: phone).get();
    return snapshot.docs.map((doc) => Appointment.fromFirestore(doc)).toList();
  }

  /// Get all appointments once
  static Future<List<Appointment>> getAllAppointments() async {
    final snapshot = await _appointmentsRef.get();
    return snapshot.docs.map((doc) => Appointment.fromFirestore(doc)).toList();
  }

  /// Mark appointment as completed
  static Future<void> markCompleted(String id) {
    return _appointmentsRef.doc(id).update({
      'status': 'completed',
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  /// Update appointment status
  static Future<void> updateStatus(String id, String status) {
    return _appointmentsRef.doc(id).update({
      'status': status,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  // --- Ortho Patients ---

  static Stream<List<OrthoPatient>> getOrthoPatientsStream() {
    return _orthoColl.orderBy('createdAt', descending: true).snapshots().map((s) => s.docs.map((d) => OrthoPatient.fromMap(d.id, d.data() as Map<String, dynamic>)).toList());
  }

  static Future<void> addOrthoPatient(OrthoPatient p) => _orthoColl.add(p.toMap());

  static Future<void> deleteOrthoPatient(String id) => _orthoColl.doc(id).delete();

  static Future<void> addOrthoVisit(String id, OrthoVisit visit) async {
    final doc = await _orthoColl.doc(id).get();
    if (doc.exists) {
      final data = doc.data() as Map<String, dynamic>;
      final visits = (data['visits'] as List? ?? []);
      visits.add(visit.toMap());
      await _orthoColl.doc(id).update({'visits': visits});
    }
  }

  // --- Consultations ---

  static Future<DocumentReference> addConsultation(Consultation consultation) {
    return _consultationsRef.add(consultation.toMap());
  }

  static Stream<List<Consultation>> getConsultationsStream() {
    return _consultationsRef.orderBy('createdAt', descending: true).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Consultation.fromFirestore(doc)).toList();
    });
  }

  static Stream<List<Consultation>> getConsultationsByDate(String date) {
    return _consultationsRef.where('date', isEqualTo: date).snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Consultation.fromFirestore(doc)).toList();
    });
  }

  static Future<void> deleteConsultation(String id) {
    return _consultationsRef.doc(id).delete();
  }
}
