class OrthoVisit {
  final String date;
  final double paidAmount;
  final String paymentMode; // cash, online, pending
  final String note;

  OrthoVisit({
    required this.date,
    required this.paidAmount,
    required this.paymentMode,
    this.note = '',
  });

  Map<String, dynamic> toMap() => {
        'date': date,
        'paidAmount': paidAmount,
        'paymentMode': paymentMode,
        'note': note,
      };

  factory OrthoVisit.fromMap(Map<String, dynamic> map) => OrthoVisit(
        date: map['date'] ?? '',
        paidAmount: (map['paidAmount'] ?? 0).toDouble(),
        paymentMode: map['paymentMode'] ?? 'cash',
        note: map['note'] ?? '',
      );
}

class OrthoPatient {
  final String? id;
  final String name;
  final String phone;
  final String clinic;
  final List<OrthoVisit> visits;
  final DateTime createdAt;

  OrthoPatient({
    this.id,
    required this.name,
    required this.phone,
    required this.clinic,
    this.visits = const [],
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  double get totalPaid => visits.fold(0, (sum, v) => sum + v.paidAmount);

  Map<String, dynamic> toMap() => {
        'name': name,
        'phone': phone,
        'clinic': clinic,
        'visits': visits.map((v) => v.toMap()).toList(),
        'createdAt': createdAt.toIso8601String(),
      };

  factory OrthoPatient.fromMap(String id, Map<String, dynamic> map) => OrthoPatient(
        id: id,
        name: map['name'] ?? '',
        phone: map['phone'] ?? '',
        clinic: map['clinic'] ?? '',
        visits: (map['visits'] as List? ?? []).map((v) => OrthoVisit.fromMap(v)).toList(),
        createdAt: DateTime.parse(map['createdAt'] ?? DateTime.now().toIso8601String()),
      );
}
