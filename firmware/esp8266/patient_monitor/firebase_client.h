#ifndef FIREBASE_CLIENT_H
#define FIREBASE_CLIENT_H

#include <Arduino.h>

/**
 * Initialize Firebase REST client.
 */
void initFirebaseClient();

/**
 * Maintenance loop for Firebase client.
 * Handles token renewal and state tracking. Call in loop().
 */
void updateFirebaseClient();

/**
 * Returns true if client has a valid, non-expired Firebase Auth ID token.
 */
bool isFirebaseAuthValid();

/**
 * Publishes device heartbeat strictly matching database.rules.json:
 * PUT /devices/{deviceId}.json?auth={idToken}
 * Payload: { "deviceId": "esp8266_01", "status": "ONLINE"|"STANDBY", "lastSeen": <epoch_ms> }
 */
bool publishHeartbeat(bool isSensorsActive);

/**
 * Publishes instantaneous telemetry strictly matching database.rules.json:
 * PUT /vitals/latest/{patientId}.json?auth={idToken}
 * Payload: { "patientId": "patient_01", "deviceId": "esp8266_01", "heartRate": <30..220>, "temperature": <25.0..45.0>, "timestamp": <epoch_ms> }
 */
bool publishLatestVitals(int heartRate, float temperature);

/**
 * Appends historical reading strictly matching database.rules.json:
 * POST /vitals/history/{patientId}.json?auth={idToken}
 * Payload: { "heartRate": <30..220>, "temperature": <25.0..45.0>, "timestamp": <epoch_ms> }
 */
bool publishHistoricalVitals(int heartRate, float temperature);

#endif // FIREBASE_CLIENT_H
