import 'package:cloud_firestore/cloud_firestore.dart';

class Consultation {
  final String? id;
  final String patientName;
  final String phone;
  final String date;
  final String? time;
  final String complaint;
  final String treatment;
  final String? treatmentProvided;
  final String? medication;
  final String? medicalHistory;
  final String? allergies;
  final String? notes;
  final Map<String, dynamic> clinicalFindings;
  final Map<String, dynamic> advisedTreatment;
  final String fee;
  final String clinic;
  final String createdAt;

  Consultation({
    this.id,
    required this.patientName,
    required this.phone,
    required this.date,
    this.time,
    required this.complaint,
    required this.treatment,
    this.treatmentProvided,
    this.medication,
    this.medicalHistory,
    this.allergies,
    this.notes,
    this.clinicalFindings = const {},
    this.advisedTreatment = const {},
    required this.fee,
    required this.clinic,
    String? createdAt,
  }) : createdAt = createdAt ?? DateTime.now().toIso8601String();

  factory Consultation.fromFirestore(DocumentSnapshot doc) {
    try {
      final data = doc.data() as Map<String, dynamic>? ?? {};
      return Consultation(
        id: doc.id,
        patientName: data['patientName']?.toString() ?? data['patient']?.toString() ?? data['name']?.toString() ?? 'Unknown Patient',
        phone: data['phone']?.toString() ?? '',
        date: data['date']?.toString() ?? '',
        time: data['time']?.toString() ?? data['timeSlot']?.toString() ?? '',
        complaint: data['complaint']?.toString() ?? '',
        treatment: data['treatment']?.toString() ?? '',
        treatmentProvided: data['treatmentProvided']?.toString(),
        medication: data['medication']?.toString(),
        medicalHistory: data['medicalHistory']?.toString(),
        allergies: data['allergies']?.toString(),
        notes: data['notes']?.toString(),
        clinicalFindings: data['clinicalFindings'] is Map ? (data['clinicalFindings'] as Map).cast<String, dynamic>() : {},
        advisedTreatment: data['advisedTreatment'] is Map ? (data['advisedTreatment'] as Map).cast<String, dynamic>() : {},
        fee: data['fee']?.toString() ?? '',
        clinic: data['clinic']?.toString() ?? '',
        createdAt: data['createdAt']?.toString() ?? '',
      );
    } catch (e) {
      print('Error parsing Consultation ${doc.id}: $e');
      return Consultation(
        id: doc.id,
        patientName: 'Error Loading Patient',
        phone: '',
        date: '',
        complaint: 'Error: $e',
        treatment: '',
        fee: '',
        clinic: '',
      );
    }
  }

  Map<String, dynamic> toMap() {
    return {
      'patientName': patientName,
      'phone': phone,
      'date': date,
      'time': time,
      'complaint': complaint,
      'treatment': treatment,
      if (treatmentProvided != null) 'treatmentProvided': treatmentProvided,
      if (medication != null) 'medication': medication,
      if (medicalHistory != null) 'medicalHistory': medicalHistory,
      if (allergies != null) 'allergies': allergies,
      if (notes != null) 'notes': notes,
      'clinicalFindings': clinicalFindings,
      'advisedTreatment': advisedTreatment,
      'fee': fee,
      'clinic': clinic,
      'createdAt': createdAt,
    };
  }
}
