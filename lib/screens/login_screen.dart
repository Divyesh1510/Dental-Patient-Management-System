import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_theme.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';
import '../widgets/gradient_button.dart';

// Authorized admin emails
const List<String> _authorizedEmails = [
  'divyeshatla@gmail.com',
  'dratlareddy@gmail.com',
  'dratlareddy@yahoo.com',
  'atlaswapna@gmail.com',
];

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _passwordController = TextEditingController();
  bool _obscure = true;
  bool _isLoading = false;
  bool _isGoogleLoading = false;
  late AnimationController _pulseCtrl;
  late Animation<double> _pulse;

  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email']);

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.9, end: 1.1).animate(CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() => _isGoogleLoading = true);
    try {
      await _googleSignIn.signOut();
      final account = await _googleSignIn.signIn();
      if (account == null) {
        if (mounted) setState(() => _isGoogleLoading = false);
        return;
      }
      final email = account.email.toLowerCase();
      if (_authorizedEmails.contains(email)) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('isLoggedIn', true);
        if (mounted) Navigator.of(context).pushReplacementNamed('/main');
      } else {
        await _googleSignIn.signOut();
        if (mounted) _showUnauthorizedDialog(email);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Google Sign-In failed: $e'), backgroundColor: AppColors.danger));
      }
    }
    if (mounted) setState(() => _isGoogleLoading = false);
  }

  void _showUnauthorizedDialog(String email) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
        context: context,
        builder: (ctx) => Dialog(
              backgroundColor: Colors.transparent,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                        color: (isDark ? AppColors.bgDark2 : Colors.white).withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.cardBorder(isDark))),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.warning.withValues(alpha: 0.15)),
                          child: const Icon(Icons.block, color: AppColors.warning, size: 32)),
                      const SizedBox(height: 20),
                      Text('Access Denied',
                          style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('$email\nis not an authorized admin account.',
                          textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)),
                      const SizedBox(height: 24),
                      GradientButton(
                          text: 'OK',
                          gradient: const [AppColors.warning, Color(0xFFD97706)],
                          onPressed: () => Navigator.pop(ctx)),
                    ]),
                  ),
                ),
              ),
            ));
  }

  void _login() async {
    if (_passwordController.text == '123456789') {
      setState(() => _isLoading = true);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('isLoggedIn', true);
      await Future.delayed(const Duration(milliseconds: 800));
      if (mounted) Navigator.of(context).pushReplacementNamed('/main');
    } else {
      _showError();
    }
  }

  void _showError() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
        context: context,
        builder: (ctx) => Dialog(
              backgroundColor: Colors.transparent,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                        color: (isDark ? AppColors.bgDark2 : Colors.white).withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.cardBorder(isDark))),
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                      Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.danger.withValues(alpha: 0.15)),
                          child: const Icon(Icons.lock_outline, color: AppColors.danger, size: 32)),
                      const SizedBox(height: 20),
                      Text('Invalid Password',
                          style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('The password you entered is incorrect.\nPlease try again.',
                          textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary(isDark), fontSize: 14)),
                      const SizedBox(height: 24),
                      GradientButton(
                          text: 'Try Again',
                          gradient: const [AppColors.danger, Color(0xFFCC3333)],
                          onPressed: () => Navigator.pop(ctx)),
                    ]),
                  ),
                ),
              ),
            ));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
        body: GradientBackground(
            child: SafeArea(
                child: Center(
                    child: SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        ScaleTransition(
          scale: _pulse,
          child: Container(
              width: 110,
              height: 110,
              decoration: BoxDecoration(shape: BoxShape.circle, boxShadow: [
                BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 40, spreadRadius: 10),
              ]),
              child: Image.asset('assets/logo.png')),
        ),
        const SizedBox(height: 24),
        Text('Radhika Super Speciality',
            style: TextStyle(color: AppColors.textPrimary(isDark), fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
        const SizedBox(height: 4),
        const Text('DENTAL HOSPITAL',
            style: TextStyle(color: AppColors.primary, fontSize: 18, fontWeight: FontWeight.w600, letterSpacing: 3)),
        const SizedBox(height: 40),
        GlassCard(
            padding: const EdgeInsets.all(24),
            margin: EdgeInsets.zero,
            child: Column(children: [
              SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: const LinearGradient(colors: [Color(0xFF4285F4), Color(0xFF3367D6)]),
                    ),
                    child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(12),
                          onTap: _isGoogleLoading ? null : _handleGoogleSignIn,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                              if (_isGoogleLoading)
                                const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              else ...[
                                Container(
                                    width: 28,
                                    height: 28,
                                    decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                                    child: const Center(
                                        child: Text('G',
                                            style:
                                                TextStyle(color: Color(0xFF4285F4), fontSize: 16, fontWeight: FontWeight.bold)))),
                                const SizedBox(width: 12),
                                const Text('Sign in with Google',
                                    style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                              ],
                            ]),
                          ),
                        )),
                  )),
              const SizedBox(height: 24),
              Row(children: [
                Expanded(child: Container(height: 1, color: AppColors.cardBorder(isDark))),
                Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text('OR ADMIN LOGIN',
                        style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 12, letterSpacing: 1))),
                Expanded(child: Container(height: 1, color: AppColors.cardBorder(isDark))),
              ]),
              const SizedBox(height: 24),
              TextField(
                  controller: _passwordController,
                  obscureText: _obscure,
                  style: TextStyle(color: AppColors.textPrimary(isDark)),
                  decoration: InputDecoration(
                      hintText: 'Enter admin password',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                          icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              color: AppColors.textMuted(isDark)),
                          onPressed: () => setState(() => _obscure = !_obscure))),
                  onSubmitted: (_) => _login()),
              const SizedBox(height: 12),
              Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                      onPressed: () {
                        showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                                backgroundColor: isDark ? AppColors.bgDark2 : Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                title: Text('Forgot Password?', style: TextStyle(color: AppColors.textPrimary(isDark))),
                                content: Text('Contact Developer: +91 7893625999',
                                    style: TextStyle(color: AppColors.textSecondary(isDark))),
                                actions: [
                                  TextButton(
                                      onPressed: () => Navigator.pop(ctx),
                                      child: const Text('OK', style: TextStyle(color: AppColors.primary)))
                                ]));
                      },
                      child: const Text('Forgot Password?', style: TextStyle(color: AppColors.primary, fontSize: 13)))),
              const SizedBox(height: 16),
              GradientButton(text: 'Admin Login', icon: Icons.login_rounded, isLoading: _isLoading, onPressed: _login),
            ])),
        const SizedBox(height: 32),
        Text('Secunderabad, Telangana', style: TextStyle(color: AppColors.textMuted(isDark), fontSize: 13)),
      ]),
    )))));
  }
}
