import 'package:cloud_firestore/cloud_firestore.dart';

class Appointment {
  final String? id;
  final String patient;
  final String phone;
  final String date;
  final String time;
  final String clinic;
  final String treatment;
  final String? treatmentProvided;
  final String? medication;
  final String? medicalHistory;
  final String? allergies;
  final String? notes;
  final String? complaint;
  final Map<String, dynamic> clinicalFindings;
  final Map<String, dynamic> advisedTreatment;
  final String status;
  final bool isNewPatient;
  final String createdAt;
  final String updatedAt;

  Appointment({
    this.id,
    required this.patient,
    required this.phone,
    required this.date,
    required this.time,
    required this.clinic,
    required this.treatment,
    this.treatmentProvided,
    this.medication,
    this.medicalHistory,
    this.allergies,
    this.notes,
    this.complaint,
    this.clinicalFindings = const {},
    this.advisedTreatment = const {},
    this.status = 'upcoming',
    this.isNewPatient = true,
    String? createdAt,
    String? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now().toIso8601String(),
        updatedAt = updatedAt ?? DateTime.now().toIso8601String();

  factory Appointment.fromFirestore(DocumentSnapshot doc) {
    try {
      final data = doc.data() as Map<String, dynamic>? ?? {};
      return Appointment(
        id: doc.id,
        patient: data['patient']?.toString() ?? data['name']?.toString() ?? data['patientName']?.toString() ?? 'Unknown Patient',
        phone: data['phone']?.toString() ?? '',
        date: data['date']?.toString() ?? '',
        time: data['time']?.toString() ?? data['timeSlot']?.toString() ?? '',
        clinic: data['clinic']?.toString() ?? '',
        treatment: data['treatment']?.toString() ?? '',
        treatmentProvided: data['treatmentProvided']?.toString(),
        medication: data['medication']?.toString(),
        medicalHistory: data['medicalHistory']?.toString(),
        allergies: data['allergies']?.toString(),
        notes: data['notes']?.toString(),
        complaint: data['complaint']?.toString(),
        clinicalFindings: data['clinicalFindings'] is Map ? (data['clinicalFindings'] as Map).cast<String, dynamic>() : {},
        advisedTreatment: data['advisedTreatment'] is Map ? (data['advisedTreatment'] as Map).cast<String, dynamic>() : {},
        status: data['status']?.toString() ?? 'upcoming',
        isNewPatient: data['isNewPatient'] is bool ? data['isNewPatient'] as bool : true,
        createdAt: data['createdAt']?.toString() ?? '',
        updatedAt: data['updatedAt']?.toString() ?? '',
      );
    } catch (e) {
      print('Error parsing Appointment ${doc.id}: $e');
      return Appointment(
        id: doc.id,
        patient: 'Error Loading Patient',
        phone: '',
        date: '',
        time: '',
        clinic: '',
        treatment: 'Error: $e',
      );
    }
  }

  Map<String, dynamic> toMap() {
    return {
      'patient': patient,
      'phone': phone,
      'date': date,
      'time': time,
      'clinic': clinic,
      'treatment': treatment,
      if (treatmentProvided != null) 'treatmentProvided': treatmentProvided,
      if (medication != null) 'medication': medication,
      if (medicalHistory != null) 'medicalHistory': medicalHistory,
      if (allergies != null) 'allergies': allergies,
      if (notes != null) 'notes': notes,
      if (complaint != null) 'complaint': complaint,
      'clinicalFindings': clinicalFindings,
      'advisedTreatment': advisedTreatment,
      'status': status,
      'isNewPatient': isNewPatient,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  Appointment copyWith({
    String? id,
    String? patient,
    String? phone,
    String? date,
    String? time,
    String? clinic,
    String? treatment,
    String? treatmentProvided,
    String? medication,
    String? medicalHistory,
    String? allergies,
    String? notes,
    String? status,
    bool? isNewPatient,
    String? createdAt,
    String? updatedAt,
  }) {
    return Appointment(
      id: id ?? this.id,
      patient: patient ?? this.patient,
      phone: phone ?? this.phone,
      date: date ?? this.date,
      time: time ?? this.time,
      clinic: clinic ?? this.clinic,
      treatment: treatment ?? this.treatment,
      treatmentProvided: treatmentProvided ?? this.treatmentProvided,
      medication: medication ?? this.medication,
      medicalHistory: medicalHistory ?? this.medicalHistory,
      allergies: allergies ?? this.allergies,
      notes: notes ?? this.notes,
      status: status ?? this.status,
      isNewPatient: isNewPatient ?? this.isNewPatient,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
