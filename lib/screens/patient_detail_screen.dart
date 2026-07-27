import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_theme.dart';
import '../models/appointment.dart';
import '../services/firestore_service.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class PatientDetailScreen extends StatelessWidget {
  const PatientDetailScreen({super.key});

  void _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  bool _isDatePast(String dateStr) {
    try {
      final d = DateFormat('d MMM yyyy').parse(dateStr);
      final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
      return d.isBefore(today);
    } catch (_) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final name = args['name'] as String;
    final phone = args['phone'] as String;
    final initials = name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();

    return Scaffold(
      body: GradientBackground(
          child: SafeArea(
              child: Column(children: [
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(children: [
              IconButton(icon: Icon(Icons.arrow_back_ios, color: AppColors.textPrimary(isDark)), onPressed: () => Navigator.pop(context)),
              Expanded(
                  child: Text(name,
                      style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 20, fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis)),
            ])),
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GlassCard(
              padding: const EdgeInsets.all(24),
              margin: EdgeInsets.zero,
              child: Column(children: [
                Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: AppColors.primaryGradient)),
                    child: Center(
                        child: Text(initials,
                            style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)))),
                const SizedBox(height: 16),
                Text(name, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                Text(phone, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 15)),
                const SizedBox(height: 20),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Expanded(child: _bigActionBtn(Icons.call, Colors.blue, 'Call', () => _launch('tel:$phone'))),
                  const SizedBox(width: 8),
                  Expanded(child: _bigActionBtn(Icons.sms_outlined, Colors.orange, 'SMS', () => _launch('sms:$phone'))),
                  const SizedBox(width: 8),
                  Expanded(child: _bigActionBtn(Icons.message_outlined, AppColors.whatsapp, 'WA', () => _launch('https://wa.me/${phone.replaceAll(RegExp(r'\D'), '')}'))),
                ]),
              ]),
            )),
        const SizedBox(height: 20),
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Appointment History',
                    style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 18, fontWeight: FontWeight.w600)))),
        const SizedBox(height: 12),
        Expanded(
            child: FutureBuilder<List<Appointment>>(
          future: FirestoreService.getAppointmentsByPhone(phone),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator(color: AppColors.primary));
            }
            final appts = snapshot.data ?? [];
            appts.sort((a, b) => b.createdAt.compareTo(a.createdAt));
            if (appts.isEmpty) {
              return Center(
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.history, color: AppColors.textMuted(isDark).withValues(alpha: 0.4), size: 48),
                const SizedBox(height: 12),
                Text('No history found', style: TextStyle(color: AppColors.textMuted(isDark))),
              ]));
            }
            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: appts.length,
              itemBuilder: (_, i) {
                final a = appts[i];
                bool isCompleted = a.status == 'completed' || _isDatePast(a.date);
                final statusLabel = isCompleted ? 'completed' : 'upcoming';
                return Padding(
                  padding: const EdgeInsets.only(bottom: 2),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Column(children: [
                      Container(
                          width: 12,
                          height: 12,
                          decoration:
                              BoxDecoration(shape: BoxShape.circle, color: isCompleted ? AppColors.success : AppColors.primary)),
                      if (i < appts.length - 1) Container(width: 2, height: 80, color: AppColors.cardBorder(isDark)),
                    ]),
                    const SizedBox(width: 14),
                    Expanded(
                        child: GlassCard(
                      padding: const EdgeInsets.all(14),
                      margin: const EdgeInsets.only(bottom: 8),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [
                          Text(a.date, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 14, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 8),
                          const Text('•', style: TextStyle(color: AppColors.primary, fontSize: 13)),
                          const SizedBox(width: 8),
                          Text(a.time, style: const TextStyle(color: AppColors.primary, fontSize: 13)),
                          const Spacer(),
                          Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                  color: (isCompleted ? AppColors.success : AppColors.warning).withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8)),
                              child: Text(statusLabel,
                                  style: TextStyle(
                                      color: isCompleted ? AppColors.success : AppColors.warning,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600))),
                        ]),
                        const SizedBox(height: 8),
                        Row(children: [
                          Icon(Icons.location_on_outlined, color: AppColors.textMuted(isDark), size: 14),
                          const SizedBox(width: 4),
                          Text(a.clinic, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 13)),
                        ]),
                        const SizedBox(height: 4),
                        Text(a.treatment, style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 13)),
                      ]),
                    )),
                  ]),
                );
              },
            );
          },
        )),
      ]))),
    );
  }

  Widget _bigActionBtn(IconData icon, Color color, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 4, offset: const Offset(0, 2))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 18),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
