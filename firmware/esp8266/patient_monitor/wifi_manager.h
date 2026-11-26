#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>

/**
 * Initialize non-blocking Wi-Fi station mode and configure NTP time synchronization.
 */
void initWiFi();

/**
 * Non-blocking Wi-Fi maintenance cycle.
 * Handles auto-reconnects and NTP time verification. Call in loop().
 */
void updateWiFi();

/**
 * Returns true if Wi-Fi is actively connected with an assigned IP address.
 */
bool isWiFiConnected();

/**
 * Returns true if real UTC time has been synchronized via NTP.
 */
bool isTimeSynced();

/**
 * Returns the current Unix epoch timestamp in milliseconds (UTC).
 * Returns 0 if NTP is not yet synchronized.
 */
uint64_t getEpochTimeMs();

/**
 * Returns the current local IP address as a string.
 */
String getLocalIp();

/**
 * Returns the Wi-Fi RSSI in dBm.
 */
int8_t getWifiRssi();

#endif // WIFI_MANAGER_H
