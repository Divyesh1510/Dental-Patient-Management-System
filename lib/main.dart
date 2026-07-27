import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'config/app_theme.dart';
import 'config/firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/add_appointment_screen.dart';
import 'screens/calendar_screen.dart';
import 'screens/patients_screen.dart';
import 'screens/patient_detail_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/ortho_screen.dart';
import 'screens/consultations_screen.dart';

final ThemeProvider themeProvider = ThemeProvider();

void main() async {
  try {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Robust Firebase initialization
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
      }
    } catch (e) {
      if (!e.toString().contains('duplicate-app')) rethrow;
    }

    // Persistent login check
    final prefs = await SharedPreferences.getInstance();
    final bool isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
    
    runApp(RadhikaDentalApp(initialRoute: isLoggedIn ? '/main' : '/login'));
  } catch (e) {
    debugPrint("CRITICAL ERROR DURING STARTUP: $e");
    runApp(MaterialApp(
      home: Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text("Startup Error\n$e", textAlign: TextAlign.center, style: const TextStyle(color: Colors.black87)),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => main(),
                  child: const Text("Retry"),
                )
              ],
            ),
          ),
        ),
      ),
    ));
  }
}

class RadhikaDentalApp extends StatelessWidget {
  final String initialRoute;
  const RadhikaDentalApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: themeProvider,
      builder: (context, _) {
        return MaterialApp(
          title: 'Radhika Super Speciality Dental Hospital',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeProvider.themeMode,
          initialRoute: initialRoute,
          routes: {
            '/login': (_) => const LoginScreen(),
            '/main': (_) => const MainNavigation(),
            '/addAppointment': (_) => const AddAppointmentScreen(),
            '/patientDetail': (_) => const PatientDetailScreen(),
          },
        );
      },
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});
  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;
  final _screens = const [
    DashboardScreen(),
    ConsultationScreen(),
    CalendarScreen(),
    PatientsScreen(),
    OrthoScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.bgBase(isDark),
          border: Border(top: BorderSide(color: AppColors.tabBorder(isDark), width: 1)),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 64,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(Icons.dashboard_rounded, 'Dash', 0, isDark),
                _navItem(Icons.note_alt_rounded, 'Walk-ins', 1, isDark),
                _navItem(Icons.calendar_month_rounded, 'Calendar', 2, isDark),
                _navItem(Icons.people_rounded, 'Patients', 3, isDark),
                _navItem(Icons.medical_services_rounded, 'Ortho', 4, isDark),
                _navItem(Icons.person_rounded, 'Profile', 5, isDark),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, String label, int index, bool isDark) {
    final isActive = _currentIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentIndex = index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: isActive ? AppColors.primary.withValues(alpha: 0.12) : Colors.transparent,
              ),
              child: Icon(icon, color: isActive ? AppColors.primary : AppColors.textMuted(isDark), size: 22),
            ),
            const SizedBox(height: 2),
            Text(label, 
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: isActive ? AppColors.primary : AppColors.textMuted(isDark),
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              )),
          ],
        ),
      ),
    );
  }
}
