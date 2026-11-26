#include "firebase_client.h"
#include "wifi_manager.h"
#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#if __has_include("config.h")
#include "config.h"
#else
#include "config.example.h"
#endif

// Firebase Authentication State
static String idToken = "";
static String refreshToken = "";
static unsigned long tokenExpiresAtMs = 0;
static unsigned long lastAuthAttempt = 0;

static bool sendHttpRequest(const String& method, const String& url, const String& payload);

void initFirebaseClient() {
  idToken = "";
  refreshToken = "";
  tokenExpiresAtMs = 0;
  lastAuthAttempt = 0;
}

static bool authenticateDevice() {
  if (strcmp(FIREBASE_API_KEY, "YOUR_FIREBASE_WEB_API_KEY") == 0) {
    return false;
  }
  if (!isWiFiConnected()) {
    return false;
  }

  Serial.println(F("[AUTH] Authenticating device via Firebase Auth REST API..."));

  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(5000);

  HTTPClient http;
  http.setTimeout(5000);

  String authUrl = String("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=") + FIREBASE_API_KEY;
  if (!http.begin(client, authUrl)) {
    Serial.println(F("[AUTH] Failed to initialize connection to Identity Toolkit."));
    return false;
  }

  http.addHeader("Content-Type", "application/json");

  // Build JSON request using ArduinoJson v7 syntax
  JsonDocument reqDoc;
  reqDoc["email"] = FIREBASE_DEVICE_EMAIL;
  reqDoc["password"] = FIREBASE_DEVICE_PASS;
  reqDoc["returnSecureToken"] = true;

  String reqBody;
  serializeJson(reqDoc, reqBody);

  int httpCode = http.POST(reqBody);
  if (httpCode == 200) {
    String respBody = http.getString();
    JsonDocument respDoc;
    DeserializationError err = deserializeJson(respDoc, respBody);
    if (!err) {
      idToken = respDoc["idToken"].as<String>();
      refreshToken = respDoc["refreshToken"].as<String>();
      unsigned long expiresInSec = respDoc["expiresIn"].as<unsigned long>();
      // Refresh 5 minutes before expiration
      tokenExpiresAtMs = millis() + (expiresInSec - 300) * 1000UL;
      Serial.println(F("[AUTH] Device authenticated successfully! ID token acquired."));
      http.end();
      return true;
    } else {
      Serial.print(F("[AUTH] JSON parse error: "));
      Serial.println(err.c_str());
    }
  } else {
    Serial.print(F("[AUTH] Authentication failed. HTTP Code: "));
    Serial.println(httpCode);
  }

  http.end();
  return false;
}

static bool refreshDeviceToken() {
  if (refreshToken.length() == 0) {
    return authenticateDevice();
  }

  Serial.println(F("[AUTH] Refreshing Firebase Auth ID token..."));

  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(5000);

  HTTPClient http;
  http.setTimeout(5000);

  String refreshUrl = String("https://securetoken.googleapis.com/v1/token?key=") + FIREBASE_API_KEY;
  if (!http.begin(client, refreshUrl)) {
    return authenticateDevice();
  }

  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  String formBody = String("grant_type=refresh_token&refresh_token=") + refreshToken;

  int httpCode = http.POST(formBody);
  if (httpCode == 200) {
    String respBody = http.getString();
    JsonDocument respDoc;
    DeserializationError err = deserializeJson(respDoc, respBody);
    if (!err) {
      idToken = respDoc["id_token"].as<String>();
      refreshToken = respDoc["refresh_token"].as<String>();
      unsigned long expiresInSec = respDoc["expires_in"].as<unsigned long>();
      tokenExpiresAtMs = millis() + (expiresInSec - 300) * 1000UL;
      Serial.println(F("[AUTH] ID token refreshed successfully."));
      http.end();
      return true;
    }
  }

  http.end();
  // If refresh fails, fall back to full email/password sign-in
  return authenticateDevice();
}

void updateFirebaseClient() {
  if (!isWiFiConnected()) {
    return;
  }
  if (strcmp(FIREBASE_API_KEY, "YOUR_FIREBASE_WEB_API_KEY") == 0) {
    return;
  }

  unsigned long now = millis();

  // If token is empty and at least 10s passed since last attempt
  if (idToken.length() == 0) {
    if (now - lastAuthAttempt >= 10000) {
      lastAuthAttempt = now;
      authenticateDevice();
    }
    return;
  }

  // Refresh token before expiration
  if (now >= tokenExpiresAtMs) {
    refreshDeviceToken();
  }
}

bool isFirebaseAuthValid() {
  return (isWiFiConnected() && idToken.length() > 0);
}

static bool sendHttpRequest(const String& method, const String& url, const String& payload) {
  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(4000);

  HTTPClient http;
  http.setTimeout(4000);
  if (!http.begin(client, url)) {
    Serial.println(F("[HTTP] Failed to begin connection."));
    return false;
  }

  http.addHeader("Content-Type", "application/json");

  int httpCode = 0;
  if (method == "PUT") {
    httpCode = http.PUT(payload);
  } else if (method == "POST") {
    httpCode = http.POST(payload);
  }

  bool success = (httpCode >= 200 && httpCode < 300);
  if (!success) {
    Serial.print(F("[HTTP] Error on "));
    Serial.print(method);
    Serial.print(F(" | Code: "));
    Serial.println(httpCode);
    if (httpCode == 401) {
      Serial.println(F("[AUTH] 401 Unauthorized. Invalidating ID token."));
      idToken = "";
    }
  }

  http.end();
  return success;
}

/**
 * Publishes heartbeat strictly matching database.rules.json:
 * PUT /devices/{deviceId}.json?auth={idToken}
 * Required fields: deviceId, status ("ONLINE" | "STANDBY"), lastSeen (number)
 */
bool publishHeartbeat(bool isSensorsActive) {
  if (!isFirebaseAuthValid()) {
    return false;
  }

  uint64_t nowMs = getEpochTimeMs();
  if (nowMs == 0) {
    return false;
  }

  String url = String(FIREBASE_DATABASE_URL) + "/devices/" + DEVICE_ID + ".json?auth=" + idToken;

  JsonDocument doc;
  doc["deviceId"] = DEVICE_ID;
  doc["status"] = isSensorsActive ? "ONLINE" : "STANDBY";
  doc["lastSeen"] = nowMs;

  String payload;
  serializeJson(doc, payload);

  return sendHttpRequest("PUT", url, payload);
}

/**
 * Publishes latest vitals strictly matching database.rules.json:
 * PUT /vitals/latest/{patientId}.json?auth={idToken}
 * Required fields: patientId, deviceId, heartRate (30..220), temperature (25.0..45.0), timestamp (number)
 */
bool publishLatestVitals(int heartRate, float temperature) {
  if (!isFirebaseAuthValid()) {
    return false;
  }

  // Strict physiological validation
  if (heartRate < HEART_RATE_MIN_VALID || heartRate > HEART_RATE_MAX_VALID) {
    return false;
  }
  if (temperature < TEMP_MIN_VALID || temperature > TEMP_MAX_VALID) {
    return false;
  }

  uint64_t nowMs = getEpochTimeMs();
  if (nowMs == 0) {
    return false;
  }

  String url = String(FIREBASE_DATABASE_URL) + "/vitals/latest/" + PATIENT_ID + ".json?auth=" + idToken;

  JsonDocument doc;
  doc["patientId"] = PATIENT_ID;
  doc["deviceId"] = DEVICE_ID;
  doc["heartRate"] = heartRate;
  doc["temperature"] = serialized(String(temperature, 1));
  doc["timestamp"] = nowMs;

  String payload;
  serializeJson(doc, payload);

  return sendHttpRequest("PUT", url, payload);
}

/**
 * Appends historical reading strictly matching database.rules.json:
 * POST /vitals/history/{patientId}.json?auth={idToken}
 * Required fields: heartRate (30..220), temperature (25.0..45.0), timestamp (number)
 */
bool publishHistoricalVitals(int heartRate, float temperature) {
  if (!isFirebaseAuthValid()) {
    return false;
  }

  if (heartRate < HEART_RATE_MIN_VALID || heartRate > HEART_RATE_MAX_VALID) {
    return false;
  }
  if (temperature < TEMP_MIN_VALID || temperature > TEMP_MAX_VALID) {
    return false;
  }

  uint64_t nowMs = getEpochTimeMs();
  if (nowMs == 0) {
    return false;
  }

  String url = String(FIREBASE_DATABASE_URL) + "/vitals/history/" + PATIENT_ID + ".json?auth=" + idToken;

  JsonDocument doc;
  doc["heartRate"] = heartRate;
  doc["temperature"] = serialized(String(temperature, 1));
  doc["timestamp"] = nowMs;

  String payload;
  serializeJson(doc, payload);

  return sendHttpRequest("POST", url, payload);
}
