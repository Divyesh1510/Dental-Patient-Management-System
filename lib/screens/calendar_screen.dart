import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:table_calendar/table_calendar.dart';
import '../config/app_theme.dart';
import '../models/appointment.dart';
import '../models/consultation.dart';
import '../services/firestore_service.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});
  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  CalendarFormat _calendarFormat = CalendarFormat.month;

  String _formatDate(DateTime d) => DateFormat('d MMM yyyy').format(d);

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
    return Scaffold(
      body: GradientBackground(
          child: SafeArea(
              child: Column(children: [
        Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Radhika Super Speciality', style: TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  Text('Dental Hospital', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 2)),
                  const SizedBox(height: 8),
                  Text('Clinic Calendar', style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 24, fontWeight: FontWeight.bold)),
                ])),
        StreamBuilder<List<Appointment>>(
          stream: FirestoreService.getAppointmentsStream(),
          builder: (context, apptSnapshot) {
            return StreamBuilder<List<Consultation>>(
              stream: FirestoreService.getConsultationsStream(),
              builder: (context, consultSnapshot) {
                final appts = apptSnapshot.data ?? [];
                final consults = consultSnapshot.data ?? [];
                
                final Map<String, List<dynamic>> eventMap = {};
                for (final a in appts) {
                  eventMap.putIfAbsent(a.date, () => []).add({...a.toMap(), 'id': a.id, 'type': 'Appointment'});
                }
                for (final c in consults) {
                  eventMap.putIfAbsent(c.date, () => []).add({...c.toMap(), 'id': c.id, 'type': 'Walk-in', 'patient': c.patientName});
                }

                final selectedStr = _formatDate(_selectedDay);
                final selectedEvents = eventMap[selectedStr] ?? [];

                return Expanded(
                    child: Column(children: [
                  GlassCard(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    padding: const EdgeInsets.only(bottom: 8),
                    child: TableCalendar(
                      firstDay: DateTime(2020),
                      lastDay: DateTime(2030),
                      focusedDay: _focusedDay,
                      calendarFormat: _calendarFormat,
                      onFormatChanged: (f) => setState(() => _calendarFormat = f),
                      selectedDayPredicate: (d) => isSameDay(d, _selectedDay),
                      onDaySelected: (sel, foc) => setState(() {
                        _selectedDay = sel;
                        _focusedDay = foc;
                      }),
                      onPageChanged: (foc) => _focusedDay = foc,
                      eventLoader: (day) => eventMap[_formatDate(day)] ?? [],
                      calendarStyle: CalendarStyle(
                        outsideDaysVisible: false,
                        todayDecoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.3), shape: BoxShape.circle),
                        selectedDecoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                        todayTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        defaultTextStyle: TextStyle(color: AppColors.textSecondary(isDark)),
                        weekendTextStyle: TextStyle(color: AppColors.textMuted(isDark)),
                        markerDecoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                        markerSize: 5,
                        markersMaxCount: 3,
                      ),
                      headerStyle: HeaderStyle(
                        formatButtonVisible: false,
                        titleCentered: true,
                        titleTextStyle: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 16, fontWeight: FontWeight.w600),
                        leftChevronIcon: const Icon(Icons.chevron_left, color: AppColors.primary),
                        rightChevronIcon: const Icon(Icons.chevron_right, color: AppColors.primary),
                      ),
                      daysOfWeekStyle: DaysOfWeekStyle(
                        weekdayStyle: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12),
                        weekendStyle: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Align(
                          alignment: Alignment.centerLeft,
                          child: Text('${selectedEvents.length} visit${selectedEvents.length == 1 ? '' : 's'} on ${_formatDate(_selectedDay)}',
                              style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 13)))),
                  const SizedBox(height: 8),
                  Expanded(
                    child: selectedEvents.isEmpty
                        ? Center(
                            child: Column(mainAxisSize: MainAxisSize.min, children: [
                            Icon(Icons.event_available, color: AppColors.textMuted(isDark).withValues(alpha: 0.4), size: 48),
                            const SizedBox(height: 12),
                            Text('No visits on this day', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 14)),
                          ]))
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: selectedEvents.length,
                            itemBuilder: (_, i) {
                              final e = selectedEvents[i];
                              final isConsult = e['type'] == 'Walk-in';
                              final pName = e['patient'] ?? 'Unknown';
                              final phone = e['phone'] ?? '';
                              final time = e['time'] ?? 'Walk-in';
                              final clinic = e['clinic'] ?? '';
                              
                              return GlassCard(
                                margin: const EdgeInsets.only(bottom: 12),
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  children: [
                                    Row(children: [
                                      Container(
                                          width: 70,
                                          padding: const EdgeInsets.symmetric(vertical: 8),
                                          decoration: BoxDecoration(color: (isConsult ? Colors.orange : AppColors.primary).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                                          child: Text(
                                            time,
                                            textAlign: TextAlign.center,
                                            style: TextStyle(color: isConsult ? Colors.orange : AppColors.primary, fontSize: 11, fontWeight: FontWeight.w600),
                                          )),
                                      const SizedBox(width: 12),
                                      Expanded(
                                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                        Row(
                                          children: [
                                            Text(pName, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 15, fontWeight: FontWeight.w600)),
                                            const SizedBox(width: 8),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(color: (isConsult ? Colors.orange : AppColors.primary).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                                              child: Text(isConsult ? 'Walk-in' : 'Appointment', style: TextStyle(color: isConsult ? Colors.orange : AppColors.primary, fontSize: 8, fontWeight: FontWeight.bold)),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 4),
                                        Text('${e['treatment'] ?? ''} • $clinic', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12)),
                                      ])),
                                    ]),
                                    const SizedBox(height: 12),
                                    Row(children: [
                                      Expanded(child: _bigActionBtn(Icons.call, Colors.blue, 'Call', () => _launch('tel:$phone'))),
                                      const SizedBox(width: 8),
                                      Expanded(child: _bigActionBtn(Icons.message_outlined, AppColors.whatsapp, 'WA', () => _launch('https://wa.me/${phone.replaceAll(RegExp(r'\D'), '')}'))),
                                      if (!isConsult) ...[
                                        const SizedBox(width: 8),
                                        GestureDetector(
                                          onTap: () {
                                            final newStatus = e['status'] == 'completed' ? 'upcoming' : 'completed';
                                            FirestoreService.updateStatus(e['id'], newStatus);
                                          },
                                          child: Container(
                                            padding: const EdgeInsets.all(10),
                                            decoration: BoxDecoration(color: e['status'] == 'completed' ? AppColors.success : Colors.grey.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                                            child: Icon(Icons.check_circle_outline, color: e['status'] == 'completed' ? Colors.white : AppColors.textMuted(isDark), size: 18),
                                          ),
                                        ),
                                      ]
                                    ]),
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ]));
              },
            );
          },
        ),
      ]))),
    );
  }

  Widget _bigActionBtn(IconData icon, Color color, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.2), blurRadius: 4, offset: const Offset(0, 2))],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 16),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  void _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }
}
