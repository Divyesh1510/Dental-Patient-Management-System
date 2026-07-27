import 'package:flutter/material.dart';
import '../config/app_theme.dart';
import 'glass_card.dart';

class ClinicalFindingsSelector extends StatelessWidget {
  final String label;
  final List<String> types;
  final Map<String, dynamic> selectedValues;
  final Function(String, Map<String, dynamic>) onSave;
  final bool isDark;

  const ClinicalFindingsSelector({
    super.key,
    required this.label,
    required this.types,
    required this.selectedValues,
    required this.onSave,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8, left: 4),
          child: Text(label.toUpperCase(),
              style: TextStyle(
                  color: AppColors.textMuted(isDark),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2)),
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: types.map((type) {
              final isSelected = selectedValues.containsKey(type);
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: () => _openModal(context, type),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.cardBg(isDark),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.cardBorder(isDark),
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 4))
                            ]
                          : null,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          type,
                          style: TextStyle(
                            color: isSelected ? Colors.white : AppColors.textPrimary(isDark),
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (isSelected) ...[
                          const SizedBox(width: 8),
                          const Icon(Icons.check_circle, color: Colors.white, size: 14),
                        ]
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  void _openModal(BuildContext context, String type) {
    if (type == 'Scaling') {
      final updated = Map<String, dynamic>.from(selectedValues);
      if (updated.containsKey(type)) {
        updated.remove(type);
      } else {
        updated[type] = {'selected': true};
      }
      onSave(type, updated[type] ?? {});
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _FindingsModal(
        type: type,
        initialData: selectedValues[type] ?? {},
        onSave: (data) => onSave(type, data),
        isDark: isDark,
      ),
    );
  }
}

class _FindingsModal extends StatefulWidget {
  final String type;
  final Map<String, dynamic> initialData;
  final Function(Map<String, dynamic>) onSave;
  final bool isDark;

  const _FindingsModal({
    required this.type,
    required this.initialData,
    required this.onSave,
    required this.isDark,
  });

  @override
  State<_FindingsModal> createState() => _FindingsModalState();
}

class _FindingsModalState extends State<_FindingsModal> {
  late Map<String, dynamic> _data;
  String? _subModal; // 'Adult' or 'Child'

  @override
  void initState() {
    super.initState();
    _data = Map<String, dynamic>.from(widget.initialData);
  }

  void _handleSave() {
    widget.onSave(_data);
    Navigator.pop(context);
  }

  void _clear() {
    widget.onSave({});
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final showCategory = widget.type != 'Stains' && widget.type != 'Calculus';

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: widget.isDark ? AppColors.bgDark2 : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  if (showCategory) _buildCategorySelection(),
                  const SizedBox(height: 24),
                  _buildSpecifics(),
                ],
              ),
            ),
          ),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(widget.type.toUpperCase(),
              style: TextStyle(
                  color: AppColors.textPrimary(widget.isDark),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2)),
          IconButton(
            icon: Icon(Icons.close, color: AppColors.textMuted(widget.isDark)),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySelection() {
    return Row(
      children: [
        _categoryBtn('Adult', _data['category'] == 'Adult'),
        const SizedBox(width: 12),
        _categoryBtn('Child', _data['category'] == 'Child'),
      ],
    );
  }

  Widget _categoryBtn(String label, bool active) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _data['category'] = label;
            _subModal = label;
          });
          _openChart();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          decoration: BoxDecoration(
            color: active ? AppColors.primary.withValues(alpha: 0.1) : AppColors.cardBg(widget.isDark),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: active ? AppColors.primary : AppColors.cardBorder(widget.isDark)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (active) const Icon(Icons.check_circle, color: AppColors.primary, size: 16),
              if (active) const SizedBox(width: 8),
              Text(label,
                  style: TextStyle(
                      color: active ? AppColors.primary : AppColors.textSecondary(widget.isDark),
                      fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSpecifics() {
    if (widget.type == 'Stains' || widget.type == 'Calculus') {
      final options = widget.type == 'Stains'
          ? ['Grade I', 'Grade II', 'Grade III']
          : ['Grade I', 'Grade II', 'Grade III', 'Grade IV'];
      return Column(
        children: options
            .map((opt) => RadioListTile<String>(
                  title: Text(opt, style: TextStyle(color: AppColors.textPrimary(widget.isDark))),
                  value: opt,
                  groupValue: _data['grade'],
                  onChanged: (v) => setState(() => _data['grade'] = v),
                  activeColor: AppColors.primary,
                ))
            .toList(),
      );
    }

    if (_data['category'] != null) {
      final teeth = (_data['teeth'] as List?)?.join(', ') ?? 'None selected';
      return GestureDetector(
        onTap: _openChart,
        child: GlassCard(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(Icons.settings_suggest_outlined, color: AppColors.primary),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Selected Teeth',
                        style: TextStyle(
                            color: AppColors.textMuted(widget.isDark), fontSize: 10, fontWeight: FontWeight.bold)),
                    Text(teeth, style: TextStyle(color: AppColors.textPrimary(widget.isDark), fontSize: 14)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.primary),
            ],
          ),
        ),
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            Icon(Icons.touch_app_outlined, color: AppColors.textMuted(widget.isDark), size: 48),
            const SizedBox(height: 16),
            Text('Select Adult or Child to continue',
                style: TextStyle(color: AppColors.textMuted(widget.isDark))),
          ],
        ),
      ),
    );
  }

  void _openChart() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _DentalChartModal(
        type: _data['category']!,
        initialTeeth: List<String>.from(_data['teeth'] ?? []),
        onSave: (teeth) {
          setState(() => _data['teeth'] = teeth);
        },
        isDark: widget.isDark,
      ),
    );
  }

  Widget _buildFooter() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: OutlinedButton(
              onPressed: _clear,
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: BorderSide(color: AppColors.cardBorder(widget.isDark)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: Text('CLEAR', style: TextStyle(color: AppColors.textMuted(widget.isDark))),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _handleSave,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('SAVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}

class _DentalChartModal extends StatefulWidget {
  final String type;
  final List<String> initialTeeth;
  final Function(List<String>) onSave;
  final bool isDark;

  const _DentalChartModal({
    required this.type,
    required this.initialTeeth,
    required this.onSave,
    required this.isDark,
  });

  @override
  State<_DentalChartModal> createState() => _DentalChartModalState();
}

class _DentalChartModalState extends State<_DentalChartModal> {
  late List<String> _selectedTeeth;

  @override
  void initState() {
    super.initState();
    _selectedTeeth = List<String>.from(widget.initialTeeth);
  }

  void _toggle(String quad, String num) {
    final id = '$quad-$num';
    setState(() {
      if (_selectedTeeth.contains(id)) {
        _selectedTeeth.remove(id);
      } else {
        _selectedTeeth.add(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isChild = widget.type == 'Child';
    final nums = isChild ? ['E', 'D', 'C', 'B', 'A'] : ['8', '7', '6', '5', '4', '3', '2', '1'];
    final numsNormal = isChild ? ['A', 'B', 'C', 'D', 'E'] : ['1', '2', '3', '4', '5', '6', '7', '8'];

    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: widget.isDark ? AppColors.bgDark2 : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          Positioned(
                            left: 0, right: 0,
                            child: Container(height: 4, color: AppColors.textPrimary(widget.isDark)),
                          ),
                          Positioned(
                            top: 0, bottom: 0,
                            child: Container(width: 4, color: AppColors.textPrimary(widget.isDark)),
                          ),
                          Column(
                            children: [
                              Row(
                                children: [
                                  _buildQuadrant('Q1', 'Upper right', nums, true),
                                  const SizedBox(width: 32),
                                  _buildQuadrant('Q2', 'Upper left', numsNormal, false),
                                ],
                              ),
                              const SizedBox(height: 32),
                              Row(
                                children: [
                                  _buildQuadrant('Q4', 'Lower right', nums, true),
                                  const SizedBox(width: 32),
                                  _buildQuadrant('Q3', 'Lower left', numsNormal, false),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  _buildSelectedList(),
                ],
              ),
            ),
          ),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('${widget.type} CHART',
              style: TextStyle(
                  color: AppColors.textPrimary(widget.isDark),
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
          IconButton(
            icon: Icon(Icons.close, color: AppColors.textMuted(widget.isDark)),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildQuadrant(String quad, String title, List<String> teethNums, bool isRightSide) {
    return Column(
      crossAxisAlignment: isRightSide ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text('$title  $quad', style: TextStyle(color: AppColors.textPrimary(widget.isDark), fontSize: 12, fontWeight: FontWeight.normal)),
        const SizedBox(height: 12),
        Row(
          children: teethNums.map((n) => Padding(
            padding: EdgeInsets.only(right: isRightSide ? 0 : 6, left: isRightSide ? 6 : 0),
            child: _toothBtn(quad, n),
          )).toList(),
        ),
      ],
    );
  }

  Widget _toothBtn(String quad, String num) {
    final id = '$quad-$num';
    final active = _selectedTeeth.contains(id);
    return GestureDetector(
      onTap: () => _toggle(quad, num),
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(num,
              style: TextStyle(
                  color: active ? Colors.white : AppColors.textPrimary(widget.isDark),
                  fontSize: 12,
                  fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  Widget _buildSelectedList() {
    if (_selectedTeeth.isEmpty) return const SizedBox();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('SELECTED TEETH',
            style: TextStyle(
                color: AppColors.textMuted(widget.isDark), fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _selectedTeeth
              .map((t) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(t, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  ))
              .toList(),
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: ElevatedButton(
        onPressed: () {
          widget.onSave(_selectedTeeth);
          Navigator.pop(context);
        },
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(double.infinity, 56),
          backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        child: const Text('CONFIRM SELECTION', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
