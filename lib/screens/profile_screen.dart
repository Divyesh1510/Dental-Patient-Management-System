import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_theme.dart';
import '../main.dart'; // To access themeProvider
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _notifications = true;

  void _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  void _logout() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
              backgroundColor: isDark ? AppColors.bgDark2 : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: Text('Logout', style: TextStyle(color: AppColors.textPrimary(isDark))),
              content: Text('Are you sure you want to logout?', style: TextStyle(color: AppColors.textSecondary(isDark))),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: Text('Cancel', style: TextStyle(color: AppColors.textMuted(isDark)))),
                TextButton(
                    onPressed: () async {
                      Navigator.pop(ctx);
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.setBool('isLoggedIn', false);
                      await GoogleSignIn().signOut();
                      if (mounted) Navigator.of(context).pushReplacementNamed('/login');
                    },
                    child: const Text('Logout', style: TextStyle(color: AppColors.danger))),
              ],
            ));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: GradientBackground(
          child: SafeArea(
              child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: LinearGradient(
                    colors: isDark ? [const Color(0xFF003566), const Color(0xFF001D3D)] : [Colors.white, const Color(0xFFF1F5F9)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight),
                border: Border.all(color: AppColors.cardBorder(isDark)),
                boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.1), blurRadius: 30)]),
            child: Column(children: [
              Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      image: const DecorationImage(image: AssetImage('assets/logo.png'), fit: BoxFit.cover),
                      boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 20)]),
                  child: Container(
                      decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.primary, width: 2)))),
              const SizedBox(height: 16),
              Text('Radhika Super Speciality\nDental Hospital',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 18, fontWeight: FontWeight.bold, height: 1.3)),
              const SizedBox(height: 8),
              Text('Secunderabad, Telangana', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)),
              const SizedBox(height: 4),
              const Text('Dr. Subramanyam Reddy', style: TextStyle(color: AppColors.primary, fontSize: 14, fontWeight: FontWeight.w600)),
            ]),
          ),
          const SizedBox(height: 20),
          GlassCard(
              padding: const EdgeInsets.all(18),
              margin: EdgeInsets.zero,
              child: Row(children: [
                Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.primary.withValues(alpha: 0.12)),
                    child: const Icon(Icons.call, color: AppColors.primary, size: 22)),
                const SizedBox(width: 14),
                Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Doctor / Clinic', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12)),
                  const SizedBox(height: 2),
                  Text('9885511349',
                      style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 16, fontWeight: FontWeight.w600)),
                ])),
                _miniBtn(Icons.call, AppColors.primary, () => _launch('tel:9885511349'), isDark),
              ])),
          const SizedBox(height: 12),
          GlassCard(
              padding: const EdgeInsets.all(18),
              margin: EdgeInsets.zero,
              child: Row(children: [
                Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.warning.withValues(alpha: 0.12)),
                    child: const Icon(Icons.code, color: AppColors.warning, size: 22)),
                const SizedBox(width: 14),
                Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Developer / Support', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12)),
                  const SizedBox(height: 2),
                  Text('7893625999',
                      style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 16, fontWeight: FontWeight.w600)),
                ])),
                _miniBtn(Icons.call, AppColors.primary, () => _launch('tel:7893625999'), isDark),
              ])),
          const SizedBox(height: 20),
          GlassCard(
              padding: const EdgeInsets.all(4),
              margin: EdgeInsets.zero,
              child: Column(children: [
                _settingTile(
                    'Notifications',
                    Icons.notifications_outlined,
                    Switch(
                        value: _notifications,
                        onChanged: (v) => setState(() => _notifications = v),
                        activeColor: AppColors.primary),
                    isDark),
                Container(height: 1, color: AppColors.cardBorder(isDark)),
                _settingTile(
                    'Dark Mode',
                    Icons.dark_mode_outlined,
                    Switch(
                        value: themeProvider.isDark,
                        onChanged: (v) {
                          themeProvider.toggleTheme();
                          setState(() {});
                        },
                        activeColor: AppColors.primary),
                    isDark),
              ])),
          const SizedBox(height: 20),
          GlassCard(
              padding: const EdgeInsets.all(18),
              margin: EdgeInsets.zero,
              child: Column(children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('Version', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 14)),
                  Text('1.0.0', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)),
                ]),
                const SizedBox(height: 8),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Text('Build', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 14)),
                  Text('Radhika Dental', style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)),
                ]),
              ])),
          const SizedBox(height: 24),
          GradientButton(
              text: 'Logout', icon: Icons.logout, gradient: const [AppColors.danger, Color(0xFFCC3333)], onPressed: _logout),
          const SizedBox(height: 24),
        ]),
      ))),
    );
  }

  Widget _settingTile(String title, IconData icon, Widget trailing, bool isDark) {
    return ListTile(
        leading: Icon(icon, color: AppColors.textSecondary(isDark)),
        title: Text(title, style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 15)),
        trailing: trailing);
  }

  Widget _miniBtn(IconData icon, Color color, VoidCallback onTap, bool isDark) {
    return GestureDetector(
        onTap: onTap,
        child: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 18),
        ));
  }
}
