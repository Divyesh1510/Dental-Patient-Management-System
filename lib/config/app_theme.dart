import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppColors {
  // Background gradient - Dark
  static const Color bgDark1 = Color(0xFF000B18);
  static const Color bgDark2 = Color(0xFF001D3D);
  static const Color bgDark3 = Color(0xFF003566);

  // Background gradient - Light
  static const Color bgLight1 = Color(0xFFF0F4F8);
  static const Color bgLight2 = Color(0xFFE2E8F0);
  static const Color bgLight3 = Color(0xFFCBD5E1);

  // Primary accent
  static const Color primary = Color(0xFF00A8E8);
  static const Color primaryDark = Color(0xFF007EA7);

  // Card - Dark
  static const Color cardBgDark = Color(0x08FFFFFF);
  static const Color cardBorderDark = Color(0x14FFFFFF);

  // Card - Light
  static const Color cardBgLight = Color(0xFFFFFFFF);
  static const Color cardBorderLight = Color(0x1A000000);

  // Text - Dark
  static const Color textPrimaryDark = Color(0xFFFFFFFF);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textMutedDark = Color(0xFF64748B);

  // Text - Light
  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);
  static const Color textMutedLight = Color(0xFF94A3B8);

  // Status
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFFF4D4D);
  static const Color whatsapp = Color(0xFF25D366);

  // Tab bar
  static const Color tabBorderDark = Color(0x0DFFFFFF);
  static const Color tabBorderLight = Color(0x1A000000);

  static const List<Color> bgGradientDark = [bgDark1, bgDark2, bgDark3];
  static const List<Color> bgGradientLight = [bgLight1, bgLight2, bgLight3];
  static const List<Color> primaryGradient = [primary, primaryDark];

  // Helper getters based on theme mode
  static Color cardBg(bool isDark) => isDark ? cardBgDark : cardBgLight;
  static Color cardBorder(bool isDark) => isDark ? cardBorderDark : cardBorderLight;
  static Color textPrimary(bool isDark) => isDark ? textPrimaryDark : textPrimaryLight;
  static Color textSecondary(bool isDark) => isDark ? textSecondaryDark : textSecondaryLight;
  static Color textMuted(bool isDark) => isDark ? textMutedDark : textMutedLight;
  static Color tabBorder(bool isDark) => isDark ? tabBorderDark : tabBorderLight;
  static Color bgBase(bool isDark) => isDark ? bgDark1 : bgLight1;
  static List<Color> bgGradient(bool isDark) => isDark ? bgGradientDark : bgGradientLight;
}

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.dark;
  ThemeMode get themeMode => _themeMode;
  bool get isDark => _themeMode == ThemeMode.dark;

  ThemeProvider() {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final isDark = prefs.getBool('isDarkMode') ?? true;
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }

  Future<void> toggleTheme() async {
    _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', _themeMode == ThemeMode.dark);
    notifyListeners();
  }
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bgDark1,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.primaryDark,
        surface: AppColors.bgDark2,
        error: AppColors.danger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(color: AppColors.textPrimaryDark, fontSize: 20, fontWeight: FontWeight.bold),
        iconTheme: IconThemeData(color: AppColors.textPrimaryDark),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.cardBgDark,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorderDark)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorderDark)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        labelStyle: const TextStyle(color: AppColors.textMutedDark),
        hintStyle: const TextStyle(color: AppColors.textMutedDark),
        prefixIconColor: AppColors.textMutedDark,
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.bgLight1,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.primaryDark,
        surface: AppColors.bgLight2,
        error: AppColors.danger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(color: AppColors.textPrimaryLight, fontSize: 20, fontWeight: FontWeight.bold),
        iconTheme: IconThemeData(color: AppColors.textPrimaryLight),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.cardBgLight,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorderLight)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.cardBorderLight)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        labelStyle: const TextStyle(color: AppColors.textMutedLight),
        hintStyle: const TextStyle(color: AppColors.textMutedLight),
        prefixIconColor: AppColors.textMutedLight,
      ),
    );
  }
}
