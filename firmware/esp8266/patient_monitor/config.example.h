#ifndef CONFIG_H
#define CONFIG_H

// ==============================================================================
// Hardware Pinout Definitions (NodeMCU ESP8266 ESP-12E)
// Strictly adhering to docs/HARDWARE.md
// ==============================================================================
#define PIN_PULSE_SENSOR A0     // Analog Pulse Sensor input (0-3.3V via board divider)
#define PIN_TEMP_SENSOR  4      // Dallas DS18B20 1-Wire Data Line (D2 / GPIO4)

// ==============================================================================
// Non-Blocking Sampling & Telemetry Intervals
// ==============================================================================
#define PULSE_SAMPLE_INTERVAL_MS     20    // 50 Hz optical pulse sampling
#define TEMP_SAMPLE_INTERVAL_MS      3000  // 3-second thermal reading cycle
#define TELEMETRY_INTERVAL_MS        3000  // 3-second heartbeat & latest vitals cloud sync
#define HISTORY_INTERVAL_MS          15000 // 15-second historical telemetry append
#define SERIAL_TELEMETRY_INTERVAL_MS 1000  // 1-second Serial Monitor report
#define SERIAL_BAUD_RATE             115200

// ==============================================================================
// Clinical Validation Boundaries
// Strictly matching docs/PROJECT_SPEC.md & docs/DATABASE_SCHEMA.md
// ==============================================================================
#define HEART_RATE_MIN_VALID 30
#define HEART_RATE_MAX_VALID 220
#define TEMP_MIN_VALID       25.0f
#define TEMP_MAX_VALID       45.0f
#define DEVICE_DISCONNECTED_C -127.0f

// Pulse Sensor Peak Detection Parameters
#define PULSE_MIN_AMPLITUDE        30   // Minimum peak-to-trough amplitude to count as beat
#define PULSE_MIN_REFRACTORY_MS    270  // Minimum refractory period (270 ms corresponds to ~222 BPM)
#define PULSE_NO_FINGER_TIMEOUT_MS 2500 // Reset BPM after 2.5s with no beat

// ==============================================================================
// Edge Device & Monitored Patient Identity
// ==============================================================================
#define DEVICE_ID        "esp8266_01"
#define PATIENT_ID       "patient_01"
#define FIRMWARE_VERSION "1.0.0-academic"

// ==============================================================================
// Wi-Fi & Firebase Realtime Database Credentials (Phase 9)
// Copy this file to config.h and insert your actual network & Firebase credentials.
// NEVER commit config.h to version control.
// ==============================================================================
#define WIFI_SSID              "YOUR_WIFI_SSID"
#define WIFI_PASSWORD          "YOUR_WIFI_PASSWORD"

// Firebase Web API Key (from Firebase Console -> Project Settings -> General)
#define FIREBASE_API_KEY       "YOUR_FIREBASE_WEB_API_KEY"

// Firebase Realtime Database Base URL (Singapore region, NO trailing slash)
#define FIREBASE_DATABASE_URL  "https://YOUR_PROJECT_ID-default-rtdb.asia-southeast1.firebasedatabase.app"

// Device Firebase Authentication Credentials (created under Authentication -> Users)
#define FIREBASE_DEVICE_EMAIL  "esp8266_01@iot-hospital.internal"
#define FIREBASE_DEVICE_PASS   "YOUR_DEVICE_AUTH_PASSWORD"

#endif // CONFIG_H
