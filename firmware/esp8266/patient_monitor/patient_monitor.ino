/**
 * ==============================================================================
 * IoT-Based Patient Health Monitoring System
 * NodeMCU ESP8266 (ESP-12E) Edge Firmware — Phase 8 Core
 * 
 * Target Microcontroller: NodeMCU 1.0 (ESP-12E Module) @ 80 MHz
 * Sensed Parameters:
 *   - Heart Rate (BPM) via Optical Pulse Sensor on Pin A0 (50 Hz / 20 ms sampling)
 *   - Body Temperature (°C) via Dallas DS18B20 on Pin D2 (3000 ms non-blocking)
 * 
 * Strictly adheres to:
 *   - docs/HARDWARE.md
 *   - docs/PROJECT_SPEC.md
 *   - docs/DATABASE_SCHEMA.md
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

static unsigned long lastTelemetryPrint = 0;

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  delay(500); // Brief power-on stabilization delay

  Serial.println();
  Serial.println(F("=================================================================="));
  Serial.println(F(" IoT-Based Patient Health Monitoring System — Edge Microcontroller"));
  Serial.println(F(" Firmware Version: " FIRMWARE_VERSION));
  Serial.println(F(" Device ID:        " DEVICE_ID));
  Serial.println(F(" Assigned Patient: " PATIENT_ID));
  Serial.println(F(" Hardware Target:  NodeMCU ESP8266 (ESP-12E)"));
  Serial.println(F(" Sensors:          Pulse Sensor (A0) | DS18B20 1-Wire (D2/GPIO4)"));
  Serial.println(F("=================================================================="));

  // Initialize modular sensor sub-systems
  initPulseSensor();
  initTemperatureSensor();

  Serial.println(F("[SYSTEM] Sensors initialized. Entering non-blocking acquisition loop..."));
}

void loop() {
  // 1. Continuous non-blocking pulse acquisition (internal 20ms / 50Hz timer)
  updatePulseSensor();

  // 2. Continuous non-blocking temperature acquisition (asynchronous 3000ms / 750ms)
  updateTemperatureSensor();

  // 3. Periodic telemetry report output to Serial Monitor
  unsigned long now = millis();
  if (now - lastTelemetryPrint >= SERIAL_TELEMETRY_INTERVAL_MS) {
    lastTelemetryPrint = now;

    int bpm = getLatestBpm();
    int rawSignal = getRawSignal();
    bool pulseOk = isPulseDetected();
    float tempC = getLatestTemperature();
    bool tempOk = isTemperatureValid();
    bool tempConn = isTemperatureConnected();
    unsigned long uptimeSec = now / 1000;

    Serial.print(F("[TELEMETRY] Up: "));
    Serial.print(uptimeSec);
    Serial.print(F("s | Signal(A0): "));
    Serial.print(rawSignal);

    Serial.print(F(" | Heart Rate: "));
    if (pulseOk) {
      Serial.print(bpm);
      Serial.print(F(" BPM [TRACKED]"));
    } else {
      Serial.print(F("-- BPM [NO FINGER]"));
    }

    Serial.print(F(" | Temp: "));
    if (tempConn) {
      Serial.print(tempC, 1);
      Serial.print(F(" °C"));
      if (tempOk) {
        Serial.print(F(" [VALID]"));
      } else {
        Serial.print(F(" [OUT_OF_RANGE]"));
      }
    } else {
      Serial.print(F("DISCONNECTED (-127°C)"));
    }

    Serial.println();
  }
}
