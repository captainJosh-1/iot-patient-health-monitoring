#include "sensors_temp.h"
#include <OneWire.h>
#include <DallasTemperature.h>

#if __has_include("config.h")
#include "config.h"
#else
#include "config.example.h"
#endif

// Set up 1-Wire bus instance on PIN_TEMP_SENSOR (GPIO4 / D2)
static OneWire oneWire(PIN_TEMP_SENSOR);
static DallasTemperature sensors(&oneWire);

static unsigned long lastRequestTime = 0;
static bool conversionPending = false;
static float currentTemp = DEVICE_DISCONNECTED_C;
static bool connected = false;
static bool valid = false;

void initTemperatureSensor() {
  sensors.begin();
  // CRITICAL: setWaitForConversion(false) ensures requestTemperatures() NEVER blocks the 20ms pulse sampling
  sensors.setWaitForConversion(false);

  // Check initial presence on bus
  int deviceCount = sensors.getDeviceCount();
  if (deviceCount > 0) {
    connected = true;
    sensors.setResolution(12); // 12-bit resolution (~0.0625°C precision, 750ms max conversion)
    sensors.requestTemperatures();
    lastRequestTime = millis();
    conversionPending = true;
  } else {
    connected = false;
    currentTemp = DEVICE_DISCONNECTED_C;
    valid = false;
  }
}

void updateTemperatureSensor() {
  unsigned long now = millis();

  // Phase 1: Retrieve completed conversion after 750ms conversion window
  if (conversionPending && (now - lastRequestTime >= 750)) {
    float tempReading = sensors.getTempCByIndex(0);
    conversionPending = false;

    // Disconnected probe detection (-127.0 °C or 85.0 °C power-on reset error)
    if (tempReading == DEVICE_DISCONNECTED_C || tempReading <= -100.0f) {
      connected = false;
      valid = false;
      currentTemp = DEVICE_DISCONNECTED_C;
    } else {
      connected = true;
      currentTemp = tempReading;
      // Physiological validity boundaries (25.0 °C to 45.0 °C)
      valid = (currentTemp >= TEMP_MIN_VALID && currentTemp <= TEMP_MAX_VALID);
    }
  }

  // Phase 2: Request new conversion every TEMP_SAMPLE_INTERVAL_MS (3000ms)
  if (!conversionPending && (now - lastRequestTime >= TEMP_SAMPLE_INTERVAL_MS)) {
    sensors.requestTemperatures();
    lastRequestTime = now;
    conversionPending = true;
  }
}

float getLatestTemperature() {
  return currentTemp;
}

bool isTemperatureValid() {
  return valid;
}

bool isTemperatureConnected() {
  return connected;
}
