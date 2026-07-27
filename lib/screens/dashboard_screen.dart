import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_theme.dart';
import '../models/appointment.dart';
import '../models/consultation.dart';
import '../models/ortho_patient.dart';
import '../services/firestore_service.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class UniquePatient {
  final String name;
  final String clinic;
  final String type;

  UniquePatient({required this.name, required this.clinic, required this.type});
}

class ClinicPiePainter extends CustomPainter {
  final double westMarredpallyPercent;
  final double mettugudaPercent;

  ClinicPiePainter({required this.westMarredpallyPercent, required this.mettugudaPercent});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);

    final paint1 = Paint()
      ..color = const Color(0xFF38BDF8) // W. Marredpally (Sky-blue)
      ..style = PaintingStyle.fill;

    final paint2 = Paint()
      ..color = const Color(0xFF818CF8) // Mettuguda (Indigo-blue)
      ..style = PaintingStyle.fill;

    final total = westMarredpallyPercent + mettugudaPercent;
    if (total == 0) {
      canvas.drawCircle(center, radius, Paint()..color = Colors.grey.withAlpha(50));
      return;
    }

    final sweep1 = (westMarredpallyPercent / total) * 2 * 3.14159265;
    final sweep2 = (mettugudaPercent / total) * 2 * 3.14159265;

    canvas.drawArc(rect, -3.14159265 / 2, sweep1, true, paint1);
    canvas.drawArc(rect, -3.14159265 / 2 + sweep1, sweep2, true, paint2);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class ClinicDoughnutChart extends StatelessWidget {
  final int westCount;
  final int mettugudaCount;
  final bool isDark;

  const ClinicDoughnutChart({
    super.key,
    required this.westCount,
    required this.mettugudaCount,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final total = westCount + mettugudaCount;
    final westPercent = total > 0 ? westCount / total : 0.0;
    final mettuPercent = total > 0 ? mettugudaCount / total : 0.0;

    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 140,
              height: 140,
              child: CustomPaint(
                painter: ClinicPiePainter(
                  westMarredpallyPercent: westPercent,
                  mettugudaPercent: mettuPercent,
                ),
              ),
            ),
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF0F172A) : Colors.white,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '$total',
                      style: TextStyle(
                        color: AppColors.textPrimary(isDark),
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Patients',
                      style: TextStyle(
                        color: AppColors.textMuted(isDark),
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _legendItem('W. Marredpally', const Color(0xFF38BDF8), isDark),
            const SizedBox(width: 16),
            _legendItem('Mettuguda', const Color(0xFF818CF8), isDark),
          ],
        ),
      ],
    );
  }

  Widget _legendItem(String label, Color color, bool isDark) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            color: AppColors.textSecondary(isDark),
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

class ActivityBarChart extends StatelessWidget {
  final List<Map<String, dynamic>> data;
  final bool isDark;

  const ActivityBarChart({super.key, required this.data, required this.isDark});

  @override
  Widget build(BuildContext context) {
    int maxVal = 1;
    for (final item in data) {
      final appts = item['appointments'] as int;
      final walkins = item['walkins'] as int;
      if (appts > maxVal) maxVal = appts;
      if (walkins > maxVal) maxVal = walkins;
    }

    return Column(
      children: [
        SizedBox(
          height: 180,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.map((item) {
              final appts = item['appointments'] as int;
              final walkins = item['walkins'] as int;
              
              final apptHeight = (appts / maxVal) * 120.0;
              final walkinHeight = (walkins / maxVal) * 120.0;

              return Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          width: 8,
                          height: apptHeight.clamp(2.0, 120.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFF38BDF8),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          width: 8,
                          height: walkinHeight.clamp(2.0, 120.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFF818CF8),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item['label'] as String,
                      style: TextStyle(
                        color: AppColors.textMuted(isDark),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _legendItem('Appointments', const Color(0xFF38BDF8), isDark),
            const SizedBox(width: 16),
            _legendItem('Walk-ins', const Color(0xFF818CF8), isDark),
          ],
        ),
      ],
    );
  }

  Widget _legendItem(String label, Color color, bool isDark) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            color: AppColors.textSecondary(isDark),
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  DateTime _selectedDate = DateTime.now();
  String _searchQuery = '';

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  String _formatDate(DateTime d) => DateFormat('d MMM yyyy').format(d);

  String _displayDate() {
    final now = DateTime.now();
    if (_selectedDate.year == now.year && _selectedDate.month == now.month && _selectedDate.day == now.day) {
      return "Today's Schedule";
    }
    return _formatDate(_selectedDate);
  }

  void _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  bool _isDatePast(String dateStr) {
    try {
      final d = DateFormat('d MMM yyyy').parse(dateStr);
      final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
      return d.isBefore(today);
    } catch (_) { return false; }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dateStr = _formatDate(_selectedDate);
    return Scaffold(
      body: GradientBackground(
        child: SafeArea(
          child: StreamBuilder<List<Appointment>>(
            stream: FirestoreService.getAppointmentsStream(),
            builder: (context, allSnap) {
              return StreamBuilder<List<Consultation>>(
                stream: FirestoreService.getConsultationsStream(),
                builder: (context, consultSnap) {
                  return StreamBuilder<List<OrthoPatient>>(
                    stream: FirestoreService.getOrthoPatientsStream(),
                    builder: (context, orthoSnap) {
                      final rawAppts = allSnap.data ?? [];
                      final rawConsults = consultSnap.data ?? [];
                      final rawOrtho = orthoSnap.data ?? [];

                      // Calculate unique patients logic matching the website
                      final patientMap = <String, UniquePatient>{};
                      void addPatientToMap(String? phone, String name, String clinic, String type) {
                        final validPhone = (phone != null && phone.isNotEmpty) ? phone : 'Unknown';
                        if (!patientMap.containsKey(validPhone)) {
                          patientMap[validPhone] = UniquePatient(name: name, clinic: clinic, type: type);
                        }
                      }

                      for (final a in rawAppts) {
                        addPatientToMap(a.phone, a.patient, a.clinic, 'General');
                      }
                      for (final c in rawConsults) {
                        addPatientToMap(c.phone, c.patientName, c.clinic, 'Walk-in');
                      }
                      for (final o in rawOrtho) {
                        addPatientToMap(o.phone, o.name, o.clinic, 'Ortho');
                      }

                      final allUniquePatients = patientMap.values.toList();
                      final totalPatients = allUniquePatients.length;
                      final westMarredpallyCount = allUniquePatients.where((p) => p.clinic == 'West Marredpally').length;
                      final mettugudaCount = allUniquePatients.where((p) => p.clinic == 'Mettuguda').length;
                      final orthoCount = allUniquePatients.where((p) => p.type == 'Ortho').length;

                      // Consolidate list for schedule view
                      final allAppts = [
                        ...rawAppts,
                        ...rawConsults.map((c) => Appointment(
                          id: c.id,
                          patient: c.patientName,
                          phone: c.phone,
                          date: c.date,
                          time: c.time ?? 'Walk-in',
                          clinic: c.clinic,
                          treatment: c.treatment,
                          clinicalFindings: c.clinicalFindings,
                          advisedTreatment: c.advisedTreatment,
                          status: 'completed',
                          createdAt: c.createdAt,
                        ))
                      ];

                      final todayStr = _formatDate(DateTime.now());
                      final todayAppts = allAppts.where((a) => a.date == todayStr).toList();
                      
                      var displayAppts = <Appointment>[];
                      if (_searchQuery.isNotEmpty) {
                        displayAppts = allAppts.where((a) =>
                          a.patient.toLowerCase().contains(_searchQuery) ||
                          a.phone.contains(_searchQuery) ||
                          a.treatment.toLowerCase().contains(_searchQuery)
                        ).toList();
                      } else {
                        displayAppts = allAppts.where((a) => a.date == dateStr).toList();
                      }

                      // Generate Last 7 Days Activity (Appointments vs Walk-ins)
                      final last7Days = List.generate(7, (i) {
                        final d = DateTime.now().subtract(Duration(days: 6 - i));
                        return DateFormat('d MMM yyyy').format(d);
                      });

                      final activityData = last7Days.map((dStr) {
                        final dayAppts = rawAppts.where((a) => a.date == dStr).length;
                        final dayWalkins = rawConsults.where((c) => c.date == dStr).length;
                        return {
                          'label': dStr.split(' ')[0] + ' ' + dStr.split(' ')[1], // "28 May"
                          'appointments': dayAppts,
                          'walkins': dayWalkins,
                        };
                      }).toList();

                      return ListView(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        children: [
                          // Hospital Logo and Header
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Radhika Super Speciality', style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                                Text('Dental Hospital', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2)),
                                const SizedBox(height: 8),
                                Text('Hospital Analytics', style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 24, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),

                          // 4 Top Stats Cards Grid
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: GridView.count(
                              crossAxisCount: 2,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 1.5,
                              children: [
                                _statsCard('Total Patients', '$totalPatients', AppColors.primary, Icons.people, isDark),
                                _statsCard('W. Marredpally', '$westMarredpallyCount', Colors.blue, Icons.business, isDark),
                                _statsCard('Mettuguda', '$mettugudaCount', Colors.indigo, Icons.business, isDark),
                                _statsCard('Total Ortho', '$orthoCount', Colors.green, Icons.healing, isDark),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Clinic Distribution Pie/Doughnut Chart
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              margin: EdgeInsets.zero,
                              borderRadius: 20,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.pie_chart, color: AppColors.primary, size: 20),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Clinic Distribution',
                                        style: TextStyle(
                                          color: AppColors.textPrimary(isDark),
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 24),
                                  ClinicDoughnutChart(
                                    westCount: westMarredpallyCount,
                                    mettugudaCount: mettugudaCount,
                                    isDark: isDark,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // 7-Day Activity Bar Chart
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              margin: EdgeInsets.zero,
                              borderRadius: 20,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.bar_chart, color: AppColors.primary, size: 20),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Last 7 Days Activity',
                                        style: TextStyle(
                                          color: AppColors.textPrimary(isDark),
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 20),
                                  ActivityBarChart(
                                    data: activityData,
                                    isDark: isDark,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Divider / Schedule Header
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Text(
                              'Patient Schedule'.toUpperCase(),
                              style: TextStyle(
                                color: AppColors.textMuted(isDark),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Search bar
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: GlassCard(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                              margin: EdgeInsets.zero,
                              borderRadius: 12,
                              child: TextField(
                                style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 14),
                                decoration: InputDecoration(
                                  hintText: 'Search patients, treatments...',
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  prefixIcon: Icon(Icons.search, color: AppColors.textMuted(isDark), size: 18),
                                  fillColor: Colors.transparent,
                                  hintStyle: TextStyle(color: AppColors.textMuted(isDark), fontSize: 13),
                                ),
                                onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Date Selector
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                IconButton(
                                  icon: Icon(Icons.chevron_left, color: AppColors.textPrimary(isDark)),
                                  onPressed: () => setState(() => _selectedDate = _selectedDate.subtract(const Duration(days: 1))),
                                ),
                                GestureDetector(
                                  onTap: () async {
                                    final d = await showDatePicker(
                                      context: context,
                                      initialDate: _selectedDate,
                                      firstDate: DateTime(2020),
                                      lastDate: DateTime(2030),
                                      builder: (ctx, child) => Theme(
                                        data: isDark
                                            ? ThemeData.dark().copyWith(colorScheme: const ColorScheme.dark(primary: AppColors.primary, surface: AppColors.bgDark2))
                                            : ThemeData.light().copyWith(colorScheme: const ColorScheme.light(primary: AppColors.primary)),
                                        child: child!,
                                      ),
                                    );
                                    if (d != null) setState(() => _selectedDate = d);
                                  },
                                  child: Column(
                                    children: [
                                      Text(_displayDate(), style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 16, fontWeight: FontWeight.w600)),
                                      Text(_formatDate(_selectedDate), style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: Icon(Icons.chevron_right, color: AppColors.textPrimary(isDark)),
                                  onPressed: () => setState(() => _selectedDate = _selectedDate.add(const Duration(days: 1))),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Filtered Appointments List
                          if (displayAppts.isEmpty)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 40),
                              child: Column(
                                children: [
                                  Icon(Icons.calendar_today_outlined, color: AppColors.textMuted(isDark).withAlpha(120), size: 48),
                                  const SizedBox(height: 12),
                                  Text('No appointments scheduled', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 14)),
                                ],
                              ),
                            )
                          else
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Column(
                                children: displayAppts.map((appt) => Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _buildAppointmentCard(appt, isDark),
                                )).toList(),
                              ),
                            ),
                        ],
                      );
                    },
                  );
                },
              );
            },
          ),
        ),
      ),
      floatingActionButton: Container(
        width: 64, height: 64,
        decoration: BoxDecoration(shape: BoxShape.circle,
          gradient: const LinearGradient(colors: AppColors.primaryGradient),
          boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.5), blurRadius: 20, spreadRadius: 2)]),
        child: FloatingActionButton(
          backgroundColor: Colors.transparent, elevation: 0,
          onPressed: () => Navigator.pushNamed(context, '/addAppointment'),
          child: const Icon(Icons.add, color: Colors.white, size: 32),
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(Appointment appt, bool isDark) {
    bool isCompleted = appt.status == 'completed' || _isDatePast(appt.date);
    final statusLabel = isCompleted ? 'completed' : 'upcoming';

    return Dismissible(
      key: Key(appt.id ?? appt.createdAt),
      // Swipe right to complete
      background: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
        alignment: Alignment.centerLeft, padding: const EdgeInsets.only(left: 24),
        child: const Row(children: [Icon(Icons.check_circle, color: AppColors.success, size: 28), SizedBox(width: 8), Text('Complete', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w600))]),
      ),
      // Swipe left to delete
      secondaryBackground: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
        alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 24),
        child: const Row(mainAxisAlignment: MainAxisAlignment.end, children: [Text('Delete', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600)), SizedBox(width: 8), Icon(Icons.delete, color: AppColors.danger, size: 28)]),
      ),
      confirmDismiss: (direction) async {
        if (direction == DismissDirection.startToEnd) {
          // Mark as completed
          if (appt.id != null) {
            if (appt.time == 'Walk-in') {
              // Walk-ins are usually already complete, no action needed or update if needed
            } else {
              await FirestoreService.markCompleted(appt.id!);
            }
          }
          if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Marked as completed ✓'), backgroundColor: AppColors.success, duration: Duration(seconds: 1)));
          return false; // Don't remove from list
        } else {
          // Delete — ask confirmation
          return await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
            backgroundColor: isDark ? AppColors.bgDark2 : Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Text('Delete Appointment?', style: TextStyle(color: AppColors.textPrimary(isDark))),
            content: Text('This will permanently delete ${appt.patient}\'s appointment.', style: TextStyle(color: AppColors.textSecondary(isDark))),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('Cancel', style: TextStyle(color: AppColors.textMuted(isDark)))),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: AppColors.danger))),
            ],
          )) ?? false;
        }
      },
      onDismissed: (direction) {
        if (direction == DismissDirection.endToStart && appt.id != null) {
          if (appt.time == 'Walk-in') {
            FirestoreService.deleteConsultation(appt.id!);
          } else {
            FirestoreService.deleteAppointment(appt.id!);
          }
        }
      },
      child: GlassCard(
        padding: const EdgeInsets.all(12), borderRadius: 16,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Top row: time, date, status
          Row(children: [
            _badge(Icons.access_time, appt.time, AppColors.primary),
            const SizedBox(width: 6),
            _badge(Icons.calendar_today, appt.date, AppColors.textMuted(isDark)),
            const Spacer(),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: (isCompleted ? AppColors.success : AppColors.warning).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 5, height: 5, decoration: BoxDecoration(shape: BoxShape.circle, color: isCompleted ? AppColors.success : AppColors.warning)),
                const SizedBox(width: 5),
                Text(statusLabel, style: TextStyle(color: isCompleted ? AppColors.success : AppColors.warning, fontSize: 10, fontWeight: FontWeight.w600)),
              ]),
            ),
          ]),
          const SizedBox(height: 10),
          Text(appt.patient, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Row(children: [
            const Icon(Icons.location_on_outlined, color: AppColors.primary, size: 14), const SizedBox(width: 4),
            Text(appt.clinic, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 12)),
          ]),
          const SizedBox(height: 2),
          Row(children: [
            Icon(Icons.phone_outlined, color: AppColors.textMuted(isDark), size: 14), const SizedBox(width: 4),
            Text(appt.phone, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 12)),
          ]),
          const SizedBox(height: 4),
          const SizedBox(height: 4),
          _buildSummary('Findings', appt.clinicalFindings, isDark),
          _buildSummary('Advised', appt.advisedTreatment, isDark),
          if (appt.treatment.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(appt.treatment, style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12, fontStyle: FontStyle.italic)),
            ),
          const SizedBox(height: 10),
          // Action buttons: Call + SMS + WhatsApp + Edit
          Row(children: [
            Expanded(child: _bigActionBtn(Icons.call, Colors.blue, 'Call', () => _launch('tel:${appt.phone}'), isDark)),
            const SizedBox(width: 8),
            Expanded(child: _bigActionBtn(Icons.sms_outlined, Colors.orange, 'SMS', () => _launch('sms:${appt.phone}'), isDark)),
            const SizedBox(width: 8),
            Expanded(child: _bigActionBtn(Icons.message_outlined, AppColors.whatsapp, 'WA', () => _launch('https://wa.me/${appt.phone.replaceAll(RegExp(r'\D'), '')}'), isDark)),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: () => Navigator.pushNamed(context, '/addAppointment', arguments: appt),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(12)),
                child: Row(children: [
                  Icon(Icons.edit_outlined, color: AppColors.textPrimary(isDark), size: 16),
                  const SizedBox(width: 4),
                  Text('Edit', style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 13, fontWeight: FontWeight.bold)),
                ]),
              ),
            ),
          ]),
        ]),
      ),
    );
  }

  Widget _bigActionBtn(IconData icon, Color color, String label, VoidCallback onTap, bool isDark) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 4, offset: const Offset(0, 2))],
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

  Widget _badge(IconData icon, String text, Color color) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: color, size: 12), const SizedBox(width: 4),
        Text(text, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w500)),
      ]),
    );
  }

  Widget _buildSummary(String label, Map<String, dynamic> data, bool isDark) {
    if (data.isEmpty) return const SizedBox();
    final text = data.entries.map((e) {
      String s = e.key;
      final details = e.value as Map<String, dynamic>;
      if (details['category'] != null) s += ' (${details['category']})';
      if (details['teeth'] != null && (details['teeth'] as List).isNotEmpty) {
        s += ' [${(details['teeth'] as List).join(', ')}]';
      }
      if (details['grade'] != null) s += ' - ${details['grade']}';
      return s;
    }).join('; ');

    return Padding(
      padding: const EdgeInsets.only(top: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$label: ', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold)),
          Expanded(child: Text(text, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 11))),
        ],
      ),
    );
  }

  Widget _actionBtn(IconData icon, Color color, VoidCallback onTap) {
    return GestureDetector(onTap: onTap, child: Container(
      width: 32, height: 32,
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, color: color, size: 16),
    ));
  }

  Widget _statsCard(String label, String value, Color color, IconData icon, bool isDark) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      margin: EdgeInsets.zero,
      borderRadius: 16,
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    color: AppColors.textPrimary(isDark),
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: AppColors.textMuted(isDark),
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
