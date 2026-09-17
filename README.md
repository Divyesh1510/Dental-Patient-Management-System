# 🦷 Radhika Dental App — Patient & Clinic Management System

[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Version](https://img.shields.io/badge/version-1.0.1%2B2-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](#)

A modern, cross-platform mobile application designed specifically for **Radhika Super Speciality Dental Hospital**. Built with **Flutter** and **Firebase**, this app provides a streamlined clinic workflow for managing patient records, appointments, specialized orthodontic cases, consultations, and treatment histories.

---

## 🌟 Key Features

### 📊 1. Interactive Dashboard
* **Real-time Metrics**: Quick stats on daily appointments, active patients, and upcoming consultations.
* **Smart Quick-Actions**: Fast navigation to add new patients, schedule appointments, or access clinical records.

### 👥 2. Comprehensive Patient Management
* **Digital Medical Records**: Maintain detailed patient histories, contact information, and treatment timelines.
* **Instant Search & Filter**: Rapidly lookup patients by name, phone number, or ID.

### 📅 3. Smart Calendar & Appointment Booking
* **Interactive Calendar View**: Powered by `table_calendar` for seamless daily, weekly, and monthly scheduling.
* **Conflict-Free Scheduling**: Book, reschedule, or cancel patient appointments effortlessly.

### 🦷 4. Specialized Orthodontic Case Tracking
* **Ortho Module**: Dedicated screen (`ortho_screen.dart`) for tracking brace adjustments, alignment progress, and orthodontic payment schedules.

### 🩺 5. Clinical Consultations & Treatment Plans
* **Detailed Consultations**: Record chief complaints, diagnosis, proposed treatment plans, and clinical notes.
* **History Tracking**: Keep a clear, chronological log of past treatments for every patient.

### 🔐 6. Secure Authentication & User Profiles
* **Google Sign-In**: One-tap secure login powered by Firebase Auth.
* **Persistent Sessions**: Seamless session handling utilizing `shared_preferences`.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Framework** | [Flutter](https://flutter.dev/) (Dart SDK `^3.8.1`) |
| **Backend & Cloud** | [Firebase Core](https://firebase.google.com/), [Cloud Firestore](https://firebase.google.com/docs/firestore) |
| **Authentication** | [Google Sign-In](https://pub.dev/packages/google_sign_in) |
| **UI Components & Fonts** | [Google Fonts](https://pub.dev/packages/google_fonts), [Cupertino Icons](https://pub.dev/packages/cupertino_icons) |
| **Scheduling** | [Table Calendar](https://pub.dev/packages/table_calendar), [Intl](https://pub.dev/packages/intl) |
| **Utilities** | [Shared Preferences](https://pub.dev/packages/shared_preferences), [URL Launcher](https://pub.dev/packages/url_launcher) |

---

## 📂 Project Structure

```bash
radhika_dental_app/
├── android/                   # Android native platform code
├── assets/                    # App assets (icons, logo, images)
│   ├── icon.png
│   └── logo.png
├── lib/
│   ├── config/                # App configurations & theme setup
│   ├── models/                # Data models (Patient, Appointment, Consultation, etc.)
│   ├── screens/               # App UI Screens
│   │   ├── dashboard_screen.dart
│   │   ├── patients_screen.dart
│   │   ├── patient_detail_screen.dart
│   │   ├── add_appointment_screen.dart
│   │   ├── calendar_screen.dart
│   │   ├── consultations_screen.dart
│   │   ├── ortho_screen.dart
│   │   ├── login_screen.dart
│   │   └── profile_screen.dart
│   ├── services/              # Firebase & Firestore database services
│   ├── widgets/               # Reusable UI components
│   └── main.dart              # Application entry point
├── pubspec.yaml               # Package dependencies & asset configuration
└── firebase.json              # Firebase CLI project configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (`>= 3.8.1`)
- [Dart SDK](https://dart.dev/get-dart)
- [Android Studio](https://developer.android.com/studio) or [VS Code](https://code.visualstudio.com/) with Flutter extensions
- A configured Android Emulator or physical device

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Divyesh1510/Dental-Patient-Management-System.git
   cd Dental-Patient-Management-System
   ```

2. **Install Dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   - Ensure `google-services.json` is present under `android/app/` for Android support.
   - Configure Firebase Cloud Firestore rules as per your security requirements.

4. **Run the App**
   ```bash
   flutter run
   ```

---

## 📱 App Configuration & Build

### Generating App Icons
To update launcher icons across Android & iOS:
```bash
flutter pub run flutter_launcher_icons
```

### Release Build (Android APK / App Bundle)
```bash
# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

---

## 📄 License

This project is proprietary software created for **Radhika Super Speciality Dental Hospital**. All rights reserved.

---

<p center="align">
  <i>Developed with ❤️ for Radhika Super Speciality Dental Hospital</i>
</p>
