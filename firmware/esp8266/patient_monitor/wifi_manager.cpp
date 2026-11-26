#include "wifi_manager.h"
#include <ESP8266WiFi.h>
#include <time.h>
#include <sys/time.h>

#if __has_include("config.h")
#include "config.h"
#else
#include "config.example.h"
#endif

static bool wifiConnected = false;
static bool timeSynchronized = false;
static unsigned long lastReconnectAttempt = 0;
static unsigned long lastNtpCheck = 0;

void initWiFi() {
  // Check if credentials are still placeholder defaults
  if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") == 0) {
    Serial.println(F("[WIFI] Placeholder SSID detected in config. Running in offline bench mode."));
    return;
  }

  Serial.print(F("[WIFI] Initializing station mode. Connecting to SSID: "));
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Configure NTP for UTC time (0 offset, 0 daylight saving)
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  lastReconnectAttempt = millis();
}

void updateWiFi() {
  unsigned long now = millis();

  // Monitor connection state
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConnected) {
      wifiConnected = true;
      Serial.println();
      Serial.print(F("[WIFI] Connected successfully! IP: "));
      Serial.print(WiFi.localIP());
      Serial.print(F(" | RSSI: "));
      Serial.print(WiFi.RSSI());
      Serial.println(F(" dBm"));
    }

    // Check NTP time sync status periodically
    if (!timeSynchronized && (now - lastNtpCheck >= 2000)) {
      lastNtpCheck = now;
      time_t currentSec = time(nullptr);
      // Valid epoch time check (greater than Jan 1, 2024: 1704067200)
      if (currentSec > 1704067200) {
        timeSynchronized = true;
        Serial.print(F("[NTP] UTC Time synchronized successfully! Epoch: "));
        Serial.println((unsigned long)currentSec);
      }
    }
  } else {
    if (wifiConnected) {
      wifiConnected = false;
      Serial.println(F("[WIFI] Connection lost. Attempting automatic reconnect..."));
    }

    // Auto-reconnect throttle every 10 seconds
    if (strcmp(WIFI_SSID, "YOUR_WIFI_SSID") != 0 && (now - lastReconnectAttempt >= 10000)) {
      lastReconnectAttempt = now;
      WiFi.reconnect();
    }
  }
}

bool isWiFiConnected() {
  return wifiConnected;
}

bool isTimeSynced() {
  return timeSynchronized;
}

uint64_t getEpochTimeMs() {
  if (!timeSynchronized) {
    return 0;
  }
  struct timeval tv;
  gettimeofday(&tv, nullptr);
  return ((uint64_t)tv.tv_sec * 1000ULL) + ((uint64_t)tv.tv_usec / 1000ULL);
}

String getLocalIp() {
  if (wifiConnected) {
    return WiFi.localIP().toString();
  }
  return String("0.0.0.0");
}

int8_t getWifiRssi() {
  if (wifiConnected) {
    return WiFi.RSSI();
  }
  return 0;
}
