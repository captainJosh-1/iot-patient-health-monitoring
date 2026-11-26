/**
 * ==============================================================================
 * IoT-Based Patient Health Monitoring System
 * NodeMCU ESP8266 (ESP-12E) Edge Firmware — Phase 9 Cloud Connected
 * 
 * Target Microcontroller: NodeMCU 1.0 (ESP-12E Module) @ 80 MHz
 * Sensed Parameters:
 *   - Heart Rate (BPM) via Optical Pulse Sensor on Pin A0 (50 Hz / 20 ms sampling)
 *   - Body Temperature (°C) via Dallas DS18B20 on Pin D2 (3000 ms non-blocking)
 * Cloud Integration:
 *   - Non-blocking Wi-Fi station manager with NTP UTC synchronization
 *   - Firebase Authentication REST client with automatic ID token renewal
 *   - Secure HTTPS REST publisher to Singapore Realtime Database (asia-southeast1)
 * 
 * Strictly adheres to:
 *   - docs/HARDWARE.md
 *   - docs/PROJECT_SPEC.md
 *   - docs/DATABASE_SCHEMA.md
 *   - database.rules.json
 * ==============================================================================
 */

#include <Arduino.h>

#if __has_include("config.h")
#include "config.h"
#else
#include "config.example.h"
#endif

#include "sensors_pulse.h"
#include "sensors_temp.h"
#include "wifi_manager.h"
#include "firebase_client.h"

static unsigned long lastSerialPrint = 0;
static unsigned long lastTelemetryPublish = 0;
static unsigned long lastHistoryPublish = 0;

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  delay(500); // Brief power-on stabilization delay

  Serial.println();
  Serial.println(F("=================================================================="));
  Serial.println(F(" IoT-Based Patient Health Monitoring System — Edge Microcontroller"));
  Serial.println(F(" Firmware Version: " FIRMWARE_VERSION));
  Serial.println(F(" Device ID:        " DEVICE_ID));
  Serial.println(F(" Assigned Patient: " PATIENT_ID));
  Serial.println(F(" Hardware Target:  NodeMCU ESP8266 (ESP-12E) @ 80 MHz"));
  Serial.println(F(" Cloud Target:     Firebase RTDB (asia-southeast1)"));
  Serial.println(F("=================================================================="));

  // 1. Initialize sensor subsystems
  initPulseSensor();
  initTemperatureSensor();

  // 2. Initialize Wi-Fi station and NTP time sync
  initWiFi();

  // 3. Initialize Firebase REST client
  initFirebaseClient();

  Serial.println(F("[SYSTEM] Initialization complete. Entering non-blocking acquisition loop..."));
}

void loop() {
  // 1. Continuous non-blocking optical pulse acquisition (internal 20ms / 50Hz timer)
  updatePulseSensor();

  // 2. Continuous non-blocking temperature acquisition (asynchronous 3000ms / 750ms)
  updateTemperatureSensor();

  // 3. Wi-Fi connection and NTP time synchronization maintenance
  updateWiFi();

  // 4. Firebase Authentication ID token lifecycle maintenance
  updateFirebaseClient();

  unsigned long now = millis();

  // 5. Periodic Heartbeat & Latest Vitals Cloud Synchronization (every 3000 ms)
  if (now - lastTelemetryPublish >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryPublish = now;

    bool pulseOk = isPulseDetected();
    bool tempOk = isTemperatureValid();
    bool isSensorsActive = pulseOk && tempOk;

    // A. Publish Device Heartbeat (PUT /devices/esp8266_01.json)
    if (isFirebaseAuthValid() && isTimeSynced()) {
      publishHeartbeat(isSensorsActive);

      // B. Publish Latest Vitals (PUT /vitals/latest/patient_01.json)
      // Only publish when both physiological sensors are actively tracking valid data
      if (isSensorsActive) {
        publishLatestVitals(getLatestBpm(), getLatestTemperature());
      }
    }
  }

  // 6. Periodic Historical Telemetry Cloud Append (every 15000 ms)
  if (now - lastHistoryPublish >= HISTORY_INTERVAL_MS) {
    lastHistoryPublish = now;

    bool pulseOk = isPulseDetected();
    bool tempOk = isTemperatureValid();

    // Append to /vitals/history/patient_01.json only when sensors are actively valid
    if (pulseOk && tempOk && isFirebaseAuthValid() && isTimeSynced()) {
      publishHistoricalVitals(getLatestBpm(), getLatestTemperature());
    }
  }

  // 7. Periodic Local Telemetry Output to Serial Monitor (every 1000 ms)
  if (now - lastSerialPrint >= SERIAL_TELEMETRY_INTERVAL_MS) {
    lastSerialPrint = now;

    int bpm = getLatestBpm();
    int rawSignal = getRawSignal();
    bool pulseOk = isPulseDetected();
    float tempC = getLatestTemperature();
    bool tempOk = isTemperatureValid();
    bool tempConn = isTemperatureConnected();
    unsigned long uptimeSec = now / 1000;

    Serial.print(F("[TELEMETRY] Up: "));
    Serial.print(uptimeSec);
    Serial.print(F("s | WiFi: "));
    Serial.print(isWiFiConnected() ? F("CONNECTED") : F("OFFLINE"));
    Serial.print(F(" | NTP: "));
    Serial.print(isTimeSynced() ? F("SYNCED") : F("WAITING"));
    Serial.print(F(" | Cloud: "));
    Serial.print(isFirebaseAuthValid() ? F("AUTH_OK") : F("NO_AUTH"));

    Serial.print(F(" | HR: "));
    if (pulseOk) {
      Serial.print(bpm);
      Serial.print(F(" BPM"));
    } else {
      Serial.print(F("-- [NO FINGER]"));
    }

    Serial.print(F(" | Temp: "));
    if (tempConn) {
      Serial.print(tempC, 1);
      Serial.print(F(" °C"));
      if (!tempOk) {
        Serial.print(F(" [OUT_OF_RANGE]"));
      }
    } else {
      Serial.print(F("DISCONNECTED"));
    }

    Serial.println();
  }
}
