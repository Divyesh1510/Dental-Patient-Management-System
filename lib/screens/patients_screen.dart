import 'package:flutter/material.dart';
import '../config/app_theme.dart';
import '../models/appointment.dart';
import '../services/firestore_service.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class PatientsScreen extends StatefulWidget {
  const PatientsScreen({super.key});
  @override
  State<PatientsScreen> createState() => _PatientsScreenState();
}

class _PatientsScreenState extends State<PatientsScreen> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: GradientBackground(
          child: SafeArea(
              child: Column(children: [
        Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
            child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Patient History',
                    style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 24, fontWeight: FontWeight.bold)))),
        Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Manage and search patient records',
                    style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)))),
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              margin: EdgeInsets.zero,
              child: TextField(
                style: TextStyle(color: AppColors.textPrimary(isDark)),
                decoration: InputDecoration(
                  hintText: 'Search by name or phone...',
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  prefixIcon: Icon(Icons.search, color: AppColors.textMuted(isDark)),
                  fillColor: Colors.transparent,
                  hintStyle: TextStyle(color: AppColors.textMuted(isDark)),
                ),
                onChanged: (v) => setState(() => _search = v.toLowerCase()),
              ),
            )),
        const SizedBox(height: 12),
        Expanded(
            child: FutureBuilder<List<Appointment>>(
          future: FirestoreService.getAllAppointments(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator(color: AppColors.primary));
            }
            final allAppts = snapshot.data ?? [];
            final Map<String, Map<String, dynamic>> patients = {};
            for (final a in allAppts) {
              if (!patients.containsKey(a.phone)) {
                patients[a.phone] = {
                  'name': a.patient,
                  'phone': a.phone,
                  'lastVisit': a.date,
                  'visits': 1,
                  'lastCreated': a.createdAt
                };
              } else {
                patients[a.phone]!['visits'] = (patients[a.phone]!['visits'] as int) + 1;
                if (a.createdAt.compareTo(patients[a.phone]!['lastCreated'] as String) > 0) {
                  patients[a.phone]!['lastVisit'] = a.date;
                  patients[a.phone]!['name'] = a.patient;
                  patients[a.phone]!['lastCreated'] = a.createdAt;
                }
              }
            }
            var patientList = patients.values.toList();
            if (_search.isNotEmpty) {
              patientList = patientList
                  .where((p) => (p['name'] as String).toLowerCase().contains(_search) || (p['phone'] as String).contains(_search))
                  .toList();
            }
            if (patientList.isEmpty) {
              return Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.people_outline, color: AppColors.textMuted(isDark).withValues(alpha: 0.4), size: 64),
                const SizedBox(height: 16),
                Text('No patients found', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 16)),
              ]));
            }
            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: patientList.length,
              itemBuilder: (_, i) {
                final p = patientList[i];
                final name = p['name'] as String;
                final phone = p['phone'] as String;
                final initials = name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
                return GlassCard(
                  onTap: () => Navigator.pushNamed(context, '/patientDetail', arguments: {'name': name, 'phone': phone}),
                  padding: const EdgeInsets.all(16),
                  child: Row(children: [
                    Container(
                        width: 50,
                        height: 50,
                        decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: AppColors.primaryGradient)),
                        child: Center(
                            child: Text(initials,
                                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)))),
                    const SizedBox(width: 14),
                    Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(name, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(phone, style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 13)),
                      const SizedBox(height: 2),
                      Text('Last Visit: ${p['lastVisit']}', style: const TextStyle(color: AppColors.primary, fontSize: 12)),
                    ])),
                    const SizedBox(width: 8),
                    // Edit Button
                    GestureDetector(
                      onTap: () {
                        // Logic to edit patient profile
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(10)),
                        child: Icon(Icons.edit_outlined, size: 18, color: AppColors.textPrimary(isDark)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(children: [
                      Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                          child: Text('${p['visits']}',
                              style: const TextStyle(color: AppColors.primary, fontSize: 16, fontWeight: FontWeight.bold))),
                      const SizedBox(height: 4),
                      Text('VISITS', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 10, letterSpacing: 1)),
                    ]),
                  ]),
                );
              },
            );
          },
        )),
      ]))),
    );
  }
}
