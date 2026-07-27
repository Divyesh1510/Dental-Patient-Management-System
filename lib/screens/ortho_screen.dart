import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_theme.dart';
import '../models/ortho_patient.dart';
import '../services/firestore_service.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class OrthoScreen extends StatefulWidget {
  const OrthoScreen({super.key});
  @override
  State<OrthoScreen> createState() => _OrthoScreenState();
}

class _OrthoScreenState extends State<OrthoScreen> {
  String _filterClinic = 'All';
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
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Ortho Patients', style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 24, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.person_add_alt_1, color: AppColors.primary),
                onPressed: () => _showAddPatientDialog(context, isDark),
              ),
            ])),
        Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Track monthly visits and payments', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)))),
        _buildFilters(isDark),
        const SizedBox(height: 12),
        Expanded(
            child: StreamBuilder<List<OrthoPatient>>(
          stream: FirestoreService.getOrthoPatientsStream(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator(color: AppColors.primary));
            var list = snapshot.data ?? [];
            if (_filterClinic != 'All') list = list.where((p) => p.clinic == _filterClinic).toList();
            if (_search.isNotEmpty) list = list.where((p) => p.name.toLowerCase().contains(_search.toLowerCase()) || p.phone.contains(_search)).toList();

            if (list.isEmpty) {
              return Center(child: Text('No ortho patients found', style: TextStyle(color: AppColors.textMuted(isDark))));
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: list.length,
              itemBuilder: (_, i) => _OrthoPatientCard(patient: list[i], isDark: isDark),
            );
          },
        )),
      ]))),
    );
  }

  Widget _buildFilters(bool isDark) {
    return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(children: [
          GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
              margin: EdgeInsets.zero,
              child: TextField(
                style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 14),
                decoration: InputDecoration(
                    hintText: 'Search by name/phone...',
                    border: InputBorder.none,
                    prefixIcon: Icon(Icons.search, color: AppColors.textMuted(isDark), size: 20),
                    hintStyle: TextStyle(color: AppColors.textMuted(isDark))),
                onChanged: (v) => setState(() => _search = v),
              )),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: [
              _filterChip('All', isDark),
              const SizedBox(width: 8),
              _filterChip('West Marredpally', isDark),
              const SizedBox(width: 8),
              _filterChip('Mettuguda', isDark),
            ]),
          )
        ]));
  }

  Widget _filterChip(String label, bool isDark) {
    final active = _filterClinic == label;
    return GestureDetector(
        onTap: () => setState(() => _filterClinic = label),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              gradient: active ? const LinearGradient(colors: AppColors.primaryGradient) : null,
              color: active ? null : AppColors.cardBg(isDark),
              border: Border.all(color: active ? Colors.transparent : AppColors.cardBorder(isDark))),
          child: Text(label, style: TextStyle(color: active ? Colors.white : AppColors.textSecondary(isDark), fontSize: 12, fontWeight: active ? FontWeight.bold : FontWeight.normal)),
        ));
  }

  void _showAddPatientDialog(BuildContext context, bool isDark) {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    String clinic = 'West Marredpally';
    showDialog(
        context: context,
        builder: (ctx) => StatefulBuilder(builder: (context, setDialogState) {
              return AlertDialog(
                backgroundColor: isDark ? AppColors.bgDark2 : Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                title: Text('New Ortho Patient', style: TextStyle(color: AppColors.textPrimary(isDark))),
                content: Column(mainAxisSize: MainAxisSize.min, children: [
                  TextField(controller: nameCtrl, textCapitalization: TextCapitalization.words, decoration: const InputDecoration(hintText: 'Patient Name')),
                  const SizedBox(height: 12),
                  TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(hintText: 'Phone Number')),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: clinic,
                    dropdownColor: isDark ? AppColors.bgDark2 : Colors.white,
                    style: TextStyle(color: AppColors.textPrimary(isDark)),
                    items: ['West Marredpally', 'Mettuguda']
                        .map((c) => DropdownMenuItem(value: c, child: Text(c, style: TextStyle(color: AppColors.textPrimary(isDark)))))
                        .toList(),
                    onChanged: (v) => setDialogState(() => clinic = v!),
                  ),
                ]),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: AppColors.textMuted(isDark)))),
                  TextButton(
                      onPressed: () {
                        if (nameCtrl.text.isNotEmpty && phoneCtrl.text.isNotEmpty) {
                          FirestoreService.addOrthoPatient(OrthoPatient(name: nameCtrl.text.trim(), phone: phoneCtrl.text.trim(), clinic: clinic));
                          Navigator.pop(ctx);
                        }
                      },
                      child: const Text('Add Patient', style: TextStyle(color: AppColors.primary))),
                ],
              );
            }));
  }
}

class _OrthoPatientCard extends StatefulWidget {
  final OrthoPatient patient;
  final bool isDark;
  const _OrthoPatientCard({required this.patient, required this.isDark});
  @override
  State<_OrthoPatientCard> createState() => _OrthoPatientCardState();
}

class _OrthoPatientCardState extends State<_OrthoPatientCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final p = widget.patient;
    final isDark = widget.isDark;
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(children: [
        Row(children: [
          Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: AppColors.primaryGradient)),
              child: Center(child: Text(p.name[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)))),
          const SizedBox(width: 12),
          Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(p.name, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 16, fontWeight: FontWeight.bold)),
            Text(p.phone, style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12)),
          ])),
          // Edit Button
          GestureDetector(
            onTap: () {
              // Edit logic
            },
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(10)),
              child: Icon(Icons.edit_outlined, size: 18, color: AppColors.textPrimary(isDark)),
            ),
          ),
          const SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('₹${p.totalPaid.toInt()}', style: const TextStyle(color: AppColors.success, fontSize: 16, fontWeight: FontWeight.bold)),
            Text('TOTAL PAID', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 9, letterSpacing: 1)),
          ]),
          IconButton(icon: Icon(_expanded ? Icons.expand_less : Icons.expand_more, color: AppColors.textMuted(isDark)), onPressed: () => setState(() => _expanded = !_expanded)),
        ]),
        const SizedBox(height: 12),
        // Action Buttons Row
        Row(children: [
          Expanded(child: _bigActionBtn(Icons.call, Colors.blue, 'Call', () => _launch('tel:${p.phone}'))),
          const SizedBox(width: 8),
          Expanded(child: _bigActionBtn(Icons.sms_outlined, Colors.orange, 'SMS', () => _launch('sms:${p.phone}'))),
          const SizedBox(width: 8),
          Expanded(child: _bigActionBtn(Icons.message_outlined, AppColors.whatsapp, 'WA', () => _launch('https://wa.me/${p.phone.replaceAll(RegExp(r'\D'), '')}'))),
        ]),
        if (_expanded) ...[
          const Divider(height: 24),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Previous Visits', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 13, fontWeight: FontWeight.bold)),
            GestureDetector(
                onTap: () => _showAddVisitDialog(context, p, isDark),
                child: const Row(children: [Icon(Icons.add_circle_outline, color: AppColors.primary, size: 16), SizedBox(width: 4), Text('Add Visit', style: TextStyle(color: AppColors.primary, fontSize: 13))])),
          ]),
          const SizedBox(height: 12),
          if (p.visits.isEmpty)
            Text('No visit history', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12))
          else
            Column(
                children: p.visits
                    .map((v) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(children: [
                            Text(v.date, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 12)),
                            const Spacer(),
                            Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: _modeColor(v.paymentMode).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                                child: Text(v.paymentMode.toUpperCase(), style: TextStyle(color: _modeColor(v.paymentMode), fontSize: 9, fontWeight: FontWeight.bold))),
                            const SizedBox(width: 12),
                            Text('₹${v.paidAmount.toInt()}', style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 13, fontWeight: FontWeight.bold)),
                          ]),
                        ))
                    .toList()),
        ]
      ]),
    );
  }

  Color _modeColor(String mode) {
    if (mode == 'cash') return AppColors.primary;
    if (mode == 'online') return AppColors.success;
    return AppColors.warning;
  }

  void _showAddVisitDialog(BuildContext context, OrthoPatient p, bool isDark) {
    final amountCtrl = TextEditingController();
    final noteCtrl = TextEditingController();
    String mode = 'cash';
    DateTime date = DateTime.now();
    showDialog(
        context: context,
        builder: (ctx) => StatefulBuilder(builder: (context, setDialogState) {
              return AlertDialog(
                backgroundColor: isDark ? AppColors.bgDark2 : Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                title: Text('Record Monthly Visit', style: TextStyle(color: AppColors.textPrimary(isDark))),
                content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
                  GestureDetector(
                    onTap: () async {
                      final d = await showDatePicker(context: context, initialDate: date, firstDate: DateTime(2020), lastDate: DateTime.now());
                      if (d != null) setDialogState(() => date = d);
                    },
                    child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(border: Border.all(color: AppColors.cardBorder(isDark)), borderRadius: BorderRadius.circular(10)),
                        child: Row(children: [const Icon(Icons.calendar_today, size: 16, color: AppColors.primary), const SizedBox(width: 8), Text(DateFormat('d MMM yyyy').format(date))])),
                  ),
                  const SizedBox(height: 12),
                  TextField(controller: amountCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(hintText: 'Amount Paid')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: mode,
                    dropdownColor: isDark ? AppColors.bgDark2 : Colors.white,
                    decoration: const InputDecoration(labelText: 'Payment Mode'),
                    items: ['cash', 'online', 'pending']
                        .map((m) => DropdownMenuItem(value: m, child: Text(m.toUpperCase(), style: TextStyle(color: AppColors.textPrimary(isDark)))))
                        .toList(),
                    onChanged: (v) => setDialogState(() => mode = v!),
                  ),
                  const SizedBox(height: 12),
                  TextField(controller: noteCtrl, decoration: const InputDecoration(hintText: 'Optional Note')),
                ])),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Cancel', style: TextStyle(color: AppColors.textMuted(isDark)))),
                  TextButton(
                      onPressed: () {
                        final amount = double.tryParse(amountCtrl.text) ?? 0;
                        FirestoreService.addOrthoVisit(p.id!, OrthoVisit(date: DateFormat('d MMM yyyy').format(date), paidAmount: amount, paymentMode: mode, note: noteCtrl.text));
                        Navigator.pop(ctx);
                      },
                      child: const Text('Save', style: TextStyle(color: AppColors.primary))),
                ],
              );
            }));
  }
  Widget _bigActionBtn(IconData icon, Color color, String label, VoidCallback onTap) {
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

  void _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}
