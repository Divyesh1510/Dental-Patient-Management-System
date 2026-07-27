import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/app_theme.dart';
import '../models/appointment.dart';
import '../services/firestore_service.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';

class AddAppointmentScreen extends StatefulWidget {
  const AddAppointmentScreen({super.key});
  @override
  State<AddAppointmentScreen> createState() => _AddAppointmentScreenState();
}

class _AddAppointmentScreenState extends State<AddAppointmentScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _complaintCtrl = TextEditingController();
  final _searchCtrl = TextEditingController();
  bool _isNewPatient = true;
  String _clinic = 'West Marredpally';
  DateTime _date = DateTime.now();
  TimeOfDay _time = TimeOfDay.now();
  bool _isLoading = false;
  Map<String, dynamic> _clinicalFindings = {};
  Map<String, dynamic> _advisedTreatment = {};
  Appointment? _editAppt;
  bool _initialized = false;
  List<Map<String, String>> _existingPatients = [];
  List<Map<String, String>> _filteredPatients = [];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Appointment) {
        _editAppt = args;
        _nameCtrl.text = args.patient;
        _phoneCtrl.text = args.phone;
        _complaintCtrl.text = args.complaint ?? args.treatment ?? args.notes ?? '';
        _clinicalFindings = Map<String, dynamic>.from(args.clinicalFindings);
        _advisedTreatment = Map<String, dynamic>.from(args.advisedTreatment);
        _isNewPatient = args.isNewPatient;
        _clinic = args.clinic;
        try {
          _date = DateFormat('d MMM yyyy').parse(args.date);
        } catch (_) {}
        try {
          final parts = args.time.split(' ');
          final timeParts = parts[0].split(':');
          int hour = int.parse(timeParts[0]);
          final min = int.parse(timeParts[1]);
          if (parts.length > 1 && parts[1].toUpperCase() == 'PM' && hour != 12) hour += 12;
          if (parts.length > 1 && parts[1].toUpperCase() == 'AM' && hour == 12) hour = 0;
          _time = TimeOfDay(hour: hour, minute: min);
        } catch (_) {}
      }
      _fetchPatients();
      _initialized = true;
    }
  }

  void _fetchPatients() async {
    final appts = await FirestoreService.getAllAppointments();
    final Map<String, String> patients = {};
    for (final a in appts) {
      patients[a.phone] = a.patient;
    }
    setState(() {
      _existingPatients = patients.entries.map((e) => {'name': e.value, 'phone': e.key}).toList();
      _filteredPatients = _existingPatients;
    });
  }

  void _filterPatients(String q) {
    setState(() {
      _filteredPatients = _existingPatients
          .where((p) => p['name']!.toLowerCase().contains(q.toLowerCase()) || p['phone']!.contains(q))
          .toList();
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _complaintCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  String _formatDate(DateTime d) => DateFormat('d MMM yyyy').format(d);

  String _formatTime(TimeOfDay t) {
    final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    final m = t.minute.toString().padLeft(2, '0');
    final p = t.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $p';
  }

  void _pickDate() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final d = await showDatePicker(
        context: context,
        initialDate: _date,
        firstDate: DateTime(2020),
        lastDate: DateTime(2030),
        builder: (ctx, child) => Theme(
            data: isDark
                ? ThemeData.dark().copyWith(colorScheme: const ColorScheme.dark(primary: AppColors.primary, surface: AppColors.bgDark2))
                : ThemeData.light().copyWith(colorScheme: const ColorScheme.light(primary: AppColors.primary)),
            child: child!));
    if (d != null) setState(() => _date = d);
  }

  void _pickTime() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final t = await showTimePicker(
        context: context,
        initialTime: _time,
        builder: (ctx, child) => Theme(
            data: isDark
                ? ThemeData.dark().copyWith(colorScheme: const ColorScheme.dark(primary: AppColors.primary, surface: AppColors.bgDark2))
                : ThemeData.light().copyWith(colorScheme: const ColorScheme.light(primary: AppColors.primary)),
            child: child!));
    if (t != null) setState(() => _time = t);
  }

  String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s.split(' ').map((word) {
      if (word.isEmpty) return word;
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  void _save() async {
    if (_nameCtrl.text.isEmpty || _phoneCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill patient name and phone'), backgroundColor: AppColors.danger));
      return;
    }
    setState(() => _isLoading = true);
    try {
      final appt = Appointment(
        patient: _capitalize(_nameCtrl.text.trim()),
        phone: _phoneCtrl.text.trim(),
        date: _formatDate(_date),
        time: _formatTime(_time),
        clinic: _clinic,
        treatment: _complaintCtrl.text.trim(),
        treatmentProvided: '',
        medication: '',
        medicalHistory: '',
        allergies: '',
        notes: _complaintCtrl.text.trim(),
        complaint: _complaintCtrl.text.trim(),
        clinicalFindings: const {},
        advisedTreatment: const {},
        isNewPatient: _isNewPatient,
        status: _editAppt?.status ?? 'upcoming',
        createdAt: _editAppt?.createdAt,
      );
      if (_editAppt != null && _editAppt!.id != null) {
        await FirestoreService.updateAppointment(_editAppt!.id!, appt);
      } else {
        await FirestoreService.addAppointment(appt);
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: AppColors.danger));
      }
    }
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isEdit = _editAppt != null;
    return Scaffold(
      body: GradientBackground(
          child: SafeArea(
              child: Column(children: [
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(children: [
              IconButton(icon: Icon(Icons.arrow_back_ios, color: AppColors.textPrimary(isDark)), onPressed: () => Navigator.pop(context)),
              Text(isEdit ? 'Edit Appointment' : 'New Appointment',
                  style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 20, fontWeight: FontWeight.bold)),
            ])),
        Expanded(
            child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: GlassCard(
                  padding: const EdgeInsets.all(20),
                  margin: const EdgeInsets.only(bottom: 20),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    _label('Patient Status', isDark),
                    const SizedBox(height: 8),
                    Row(children: [
                      _toggleBtn('New Patient', _isNewPatient, () => setState(() => _isNewPatient = true), isDark),
                      const SizedBox(width: 12),
                      _toggleBtn('Existing', !_isNewPatient, () => setState(() => _isNewPatient = false), isDark),
                    ]),
                    const SizedBox(height: 20),
                    if (!_isNewPatient && !isEdit) ...[
                      _label('Select Existing Patient', isDark),
                      TextField(
                          controller: _searchCtrl,
                          onChanged: _filterPatients,
                          style: TextStyle(color: AppColors.textPrimary(isDark)),
                          decoration: const InputDecoration(hintText: 'Search by name or phone', prefixIcon: Icon(Icons.search))),
                      const SizedBox(height: 12),
                      if (_filteredPatients.isNotEmpty)
                        Container(
                          height: 150,
                          decoration: BoxDecoration(
                              color: AppColors.cardBg(isDark),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.cardBorder(isDark))),
                          child: ListView.builder(
                            itemCount: _filteredPatients.length,
                            itemBuilder: (context, i) {
                              final p = _filteredPatients[i];
                              return ListTile(
                                title: Text(p['name']!, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 14)),
                                subtitle: Text(p['phone']!, style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12)),
                                onTap: () {
                                  setState(() {
                                    _nameCtrl.text = p['name']!;
                                    _phoneCtrl.text = p['phone']!;
                                    _isNewPatient = false;
                                  });
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Selected: ${p['name']}'), duration: const Duration(seconds: 1)));
                                },
                              );
                            },
                          ),
                        ),
                      const SizedBox(height: 20),
                    ],
                    _label('Patient Name', isDark),
                    TextField(
                        controller: _nameCtrl,
                        textCapitalization: TextCapitalization.words,
                        style: TextStyle(color: AppColors.textPrimary(isDark)),
                        decoration: const InputDecoration(hintText: 'Full name', prefixIcon: Icon(Icons.person_outline))),
                    const SizedBox(height: 16),
                    _label('Phone Number', isDark),
                    TextField(
                        controller: _phoneCtrl,
                        keyboardType: TextInputType.phone,
                        style: TextStyle(color: AppColors.textPrimary(isDark)),
                        decoration: const InputDecoration(hintText: 'Phone number', prefixIcon: Icon(Icons.call_outlined))),
                    const SizedBox(height: 16),
                    _label('Select Clinic', isDark),
                    Row(children: [
                      _toggleBtn('West Marredpally', _clinic == 'West Marredpally', () => setState(() => _clinic = 'West Marredpally'), isDark),
                      const SizedBox(width: 12),
                      _toggleBtn('Mettuguda', _clinic == 'Mettuguda', () => setState(() => _clinic = 'Mettuguda'), isDark),
                    ]),
                    const SizedBox(height: 16),
                    _label('Appointment Date', isDark),
                    GestureDetector(
                        onTap: _pickDate,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          decoration: BoxDecoration(
                              color: AppColors.cardBg(isDark),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.cardBorder(isDark))),
                          child: Row(children: [
                            const Icon(Icons.calendar_today, color: AppColors.primary, size: 20),
                            const SizedBox(width: 12),
                            Text(_formatDate(_date), style: TextStyle(color: AppColors.textPrimary(isDark))),
                          ]),
                        )),
                    const SizedBox(height: 16),
                    _label('Time Slot', isDark),
                    GestureDetector(
                        onTap: _pickTime,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          decoration: BoxDecoration(
                              color: AppColors.cardBg(isDark),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.cardBorder(isDark))),
                          child: Row(children: [
                            const Icon(Icons.access_time, color: AppColors.primary, size: 20),
                            const SizedBox(width: 12),
                            Text(_formatTime(_time), style: TextStyle(color: AppColors.textPrimary(isDark))),
                          ]),
                        )),
                    const SizedBox(height: 16),
                    _label('Complaint Given', isDark),
                    TextField(
                        controller: _complaintCtrl,
                        maxLines: 3,
                        style: TextStyle(color: AppColors.textPrimary(isDark)),
                        decoration: const InputDecoration(
                            hintText: 'Describe patient complaint...',
                            prefixIcon: Icon(Icons.note_alt_outlined))),
                    const SizedBox(height: 28),
                    GradientButton(
                        text: isEdit ? 'Update Appointment' : 'Save Appointment',
                        icon: Icons.check_circle_outline,
                        isLoading: _isLoading,
                        onPressed: _save),
                  ]),
                ))),
      ]))),
    );
  }

  Widget _label(String text, bool isDark) => Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12)));

  Widget _toggleBtn(String text, bool active, VoidCallback onTap, bool isDark) {
    return Expanded(
        child: GestureDetector(
            onTap: onTap,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: active ? const LinearGradient(colors: AppColors.primaryGradient) : null,
                color: active ? null : AppColors.cardBg(isDark),
                border: active ? null : Border.all(color: AppColors.cardBorder(isDark)),
              ),
              child: Text(text,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: active ? Colors.white : AppColors.textSecondary(isDark),
                      fontWeight: active ? FontWeight.w600 : FontWeight.normal,
                      fontSize: 14)),
            )));
  }
}
