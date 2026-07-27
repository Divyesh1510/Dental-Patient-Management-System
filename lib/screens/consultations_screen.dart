import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_theme.dart';
import '../models/consultation.dart';
import '../services/firestore_service.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';
import '../widgets/clinical_findings_selector.dart';

class ConsultationScreen extends StatefulWidget {
  const ConsultationScreen({super.key});
  @override
  State<ConsultationScreen> createState() => _ConsultationScreenState();
}

class _ConsultationScreenState extends State<ConsultationScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _complaintController = TextEditingController();
  final _treatmentController = TextEditingController();
  final _treatmentProvidedCtrl = TextEditingController();
  final _medicationCtrl = TextEditingController();
  final _medicalHistoryCtrl = TextEditingController();
  final _allergiesCtrl = TextEditingController();
  final _timeController = TextEditingController(text: DateFormat('hh:mm a').format(DateTime.now()));
  String _entryDate = DateFormat('d MMM yyyy').format(DateTime.now());
  DateTime _entryDateTime = DateTime.now();
  String _selectedDate = DateFormat('d MMM yyyy').format(DateTime.now());
  DateTime _currentDate = DateTime.now();
  String _clinicFilter = 'All';
  String _selectedClinic = 'West Marredpally';
  Map<String, dynamic> _clinicalFindings = {};
  Map<String, dynamic> _advisedTreatment = {};

  void _showAddDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark ? AppColors.bgDark2 : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: SingleChildScrollView(
            controller: scrollController,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 24),
                const Text('New Consultation', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Record walk-in patient details', style: TextStyle(color: AppColors.textSecondary(Theme.of(context).brightness == Brightness.dark))),
                const SizedBox(height: 24),
                _buildTextField(_nameController, 'Patient Name', Icons.person_outline),
                const SizedBox(height: 16),
                _buildTextField(_phoneController, 'Phone Number', Icons.phone_outlined, keyboardType: TextInputType.phone),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Consultation Date', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          InkWell(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: context,
                                initialDate: _entryDateTime,
                                firstDate: DateTime(2000),
                                lastDate: DateTime(2100),
                              );
                              if (picked != null) {
                                setState(() {
                                  _entryDateTime = picked;
                                  _entryDate = DateFormat('d MMM yyyy').format(picked);
                                });
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey.withValues(alpha: 0.3)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.calendar_today, size: 16, color: AppColors.primary),
                                  const SizedBox(width: 8),
                                  Text(_entryDate),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildTextField(_timeController, 'Time', Icons.access_time),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Clinic Selection
                const Text('Clinic Branch', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _selectedClinic,
                  decoration: InputDecoration(prefixIcon: const Icon(Icons.location_on_outlined, color: AppColors.primary)),
                  items: ['West Marredpally', 'Mettuguda'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                  onChanged: (v) => setState(() => _selectedClinic = v!),
                ),
                const SizedBox(height: 16),
                StatefulBuilder(builder: (context, setModalState) {
                  return Column(
                    children: [
                      ClinicalFindingsSelector(
                        label: 'Clinical Findings',
                        types: const [
                          'Dental Caries',
                          'Gingivitis',
                          'Pulpitis',
                          'Periapical Abscess',
                          'Grossly Decayed',
                          'Periodontitis',
                          'Stains',
                          'Calculus'
                        ],
                        selectedValues: _clinicalFindings,
                        onSave: (type, data) {
                          setModalState(() {
                            if (data.isEmpty) {
                              _clinicalFindings.remove(type);
                            } else {
                              _clinicalFindings[type] = data;
                            }
                          });
                        },
                        isDark: Theme.of(context).brightness == Brightness.dark,
                      ),
                      const SizedBox(height: 24),
                      ClinicalFindingsSelector(
                        label: 'Advised Treatment',
                        types: const [
                          'Scaling',
                          'Restoration',
                          'Root Canal Treatment',
                          'Extraction',
                          'Bridges',
                          'Orthodontic Treatment',
                          'Implants'
                        ],
                        selectedValues: _advisedTreatment,
                        onSave: (type, data) {
                          setModalState(() {
                            if (data.isEmpty) {
                              _advisedTreatment.remove(type);
                            } else {
                              _advisedTreatment[type] = data;
                            }
                          });
                        },
                        isDark: Theme.of(context).brightness == Brightness.dark,
                      ),
                    ],
                  );
                }),
                const SizedBox(height: 24),
                _buildTextField(_medicalHistoryCtrl, 'Patient Medical History', Icons.favorite_border, maxLines: 2),
                const SizedBox(height: 16),
                _buildTextField(_allergiesCtrl, 'Allergies', Icons.warning_amber_rounded, maxLines: 2),
                const SizedBox(height: 16),
                _buildTextField(_treatmentProvidedCtrl, 'Treatment Provided', Icons.medical_services_outlined, maxLines: 3),
                const SizedBox(height: 16),
                _buildTextField(_medicationCtrl, 'Medication', Icons.medication_outlined, maxLines: 2),
                const SizedBox(height: 16),
                _buildTextField(_complaintController, 'Treatment / Notes', Icons.note_alt_outlined, maxLines: 2),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: _saveConsultation,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('Save Consultation', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, IconData icon, {TextInputType? keyboardType, int maxLines = 1}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: TextStyle(color: AppColors.textPrimary(isDark)),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppColors.primary),
        alignLabelWithHint: maxLines > 1,
      ),
    );
  }

  void _saveConsultation() async {
    if (_nameController.text.isEmpty) return;
    
    final consultation = Consultation(
      patientName: _nameController.text,
      phone: _phoneController.text,
      date: _entryDate,
      time: _timeController.text,
      complaint: _complaintController.text,
      treatment: _treatmentController.text,
      treatmentProvided: _treatmentProvidedCtrl.text,
      medication: _medicationCtrl.text,
      medicalHistory: _medicalHistoryCtrl.text,
      allergies: _allergiesCtrl.text,
      notes: _complaintController.text,
      clinicalFindings: _clinicalFindings,
      advisedTreatment: _advisedTreatment,
      fee: '',
      clinic: _selectedClinic,
    );

    await FirestoreService.addConsultation(consultation);
    
    if (mounted) {
      Navigator.pop(context);
      _nameController.clear();
      _phoneController.clear();
      _complaintController.clear();
      _treatmentController.clear();
      _treatmentProvidedCtrl.clear();
      _medicationCtrl.clear();
      _medicalHistoryCtrl.clear();
      _allergiesCtrl.clear();
      _clinicalFindings = {};
      _advisedTreatment = {};
      _timeController.text = DateFormat('hh:mm a').format(DateTime.now());
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Consultation saved!'), backgroundColor: AppColors.success));
    }
  }

  void _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: GradientBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Radhika Super Speciality', style: TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                          Text('Dental Hospital', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 8, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                          const SizedBox(height: 4),
                          Text('Walk-ins', style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 24, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    // Clinic Filter Dropdown
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(color: AppColors.cardBg(isDark), borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder(isDark))),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _clinicFilter,
                          style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 12, fontWeight: FontWeight.bold),
                          dropdownColor: isDark ? AppColors.bgDark2 : Colors.white,
                          items: ['All', 'West Marredpally', 'Mettuguda'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                          onChanged: (v) => setState(() => _clinicFilter = v!),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Date Navigation
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(icon: Icon(Icons.chevron_left, color: AppColors.textPrimary(isDark)), onPressed: () {
                      setState(() {
                        _currentDate = _currentDate.subtract(const Duration(days: 1));
                        _selectedDate = DateFormat('d MMM yyyy').format(_currentDate);
                      });
                    }),
                    Column(
                      children: [
                        Text(_selectedDate, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        if (DateFormat('d MMM yyyy').format(DateTime.now()) == _selectedDate)
                          const Text('Today', style: TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    IconButton(icon: Icon(Icons.chevron_right, color: AppColors.textPrimary(isDark)), onPressed: () {
                      setState(() {
                        _currentDate = _currentDate.add(const Duration(days: 1));
                        _selectedDate = DateFormat('d MMM yyyy').format(_currentDate);
                      });
                    }),
                  ],
                ),
              ),
              Expanded(
                child: StreamBuilder<List<Consultation>>(
                  stream: FirestoreService.getConsultationsByDate(_selectedDate),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    }
                    var consultations = snapshot.data ?? [];
                    if (_clinicFilter != 'All') {
                      consultations = consultations.where((c) => c.clinic == _clinicFilter).toList();
                    }
                    if (consultations.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.notes_outlined, size: 64, color: AppColors.textMuted(isDark).withValues(alpha: 0.5)),
                            const SizedBox(height: 16),
                            Text('No consultations on this day', style: TextStyle(color: AppColors.textMuted(isDark))),
                          ],
                        ),
                      );
                    }
                    return ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: consultations.length,
                      itemBuilder: (context, index) {
                        final c = consultations[index];
                        return _buildConsultationCard(c, isDark);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddDialog,
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildConsultationCard(Consultation c, bool isDark) {
    return Dismissible(
      key: Key(c.id ?? c.createdAt),
      direction: DismissDirection.endToStart,
      background: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        child: const Icon(Icons.delete, color: AppColors.danger),
      ),
      confirmDismiss: (dir) async {
        return await showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Delete record?'),
            content: const Text('This will permanently delete this consultation record.'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: AppColors.danger))),
            ],
          ),
        );
      },
      onDismissed: (dir) => FirestoreService.deleteConsultation(c.id!),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        borderRadius: 20,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(c.patientName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(c.clinic, style: const TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(c.phone, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)),
            const Divider(height: 24),
            if (c.complaint.isNotEmpty) ...[
              _rowItem(Icons.info_outline, 'Complaint', c.complaint, isDark),
              const SizedBox(height: 8),
            ],
            if (c.clinicalFindings.isNotEmpty) ...[
              _buildSummary('Findings', c.clinicalFindings, isDark),
              const SizedBox(height: 8),
            ],
            if (c.advisedTreatment.isNotEmpty) ...[
              _buildSummary('Advised', c.advisedTreatment, isDark),
              const SizedBox(height: 8),
            ],
            if (c.treatment.isNotEmpty) ...[
              _rowItem(Icons.medical_services_outlined, 'Treatment Given', c.treatment, isDark),
              const SizedBox(height: 8),
            ],
            if (c.time != null && c.time!.isNotEmpty) ...[
              _rowItem(Icons.access_time, 'Time', c.time!, isDark, color: AppColors.primary),
              const SizedBox(height: 12),
            ],
            const SizedBox(height: 8),
            // Action buttons: Call + SMS + WhatsApp
            Row(children: [
              Expanded(child: _bigActionBtn(Icons.call, Colors.blue, 'Call', () => _launch('tel:${c.phone}'))),
              const SizedBox(width: 8),
              Expanded(child: _bigActionBtn(Icons.sms_outlined, Colors.orange, 'SMS', () => _launch('sms:${c.phone}'))),
              const SizedBox(width: 8),
              Expanded(child: _bigActionBtn(Icons.message_outlined, AppColors.whatsapp, 'WA', () => _launch('https://wa.me/${c.phone.replaceAll(RegExp(r'\D'), '')}'))),
            ]),
          ],
        ),
      ),
    );
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

  Widget _rowItem(IconData icon, String label, String value, bool isDark, {Color? color}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: color ?? AppColors.primary),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 13),
              children: [
                TextSpan(text: '$label: ', style: const TextStyle(fontWeight: FontWeight.bold)),
                TextSpan(text: value),
              ],
            ),
          ),
        ),
      ],
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

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.label_outline, size: 14, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 13),
              children: [
                TextSpan(text: '$label: ', style: const TextStyle(fontWeight: FontWeight.bold)),
                TextSpan(text: text),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
