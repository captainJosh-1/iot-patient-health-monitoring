#ifndef SENSORS_TEMP_H
#define SENSORS_TEMP_H

#include <Arduino.h>

/**
 * Initialize the Dallas DS18B20 digital temperature probe on pin D2 (GPIO4).
 * Configures non-blocking conversion mode (setWaitForConversion = false).
 */
void initTemperatureSensor();

/**
 * Non-blocking temperature measurement engine.
 * Called continuously in loop(); requests conversion every 3000 ms,
 * and reads results asynchronously after 750 ms without blocking loop execution.
 */
void updateTemperatureSensor();

/**
 * Returns the most recent valid Body Temperature in Degrees Celsius (°C).
 * Returns -127.0f if sensor is disconnected or invalid.
 */
float getLatestTemperature();

/**
 * Returns true if the most recent reading falls within physiological bounds (25.0 to 45.0 °C).
 */
bool isTemperatureValid();

/**
 * Returns true if the DS18B20 probe is physically connected on the 1-Wire bus.
 */
bool isTemperatureConnected();

#endif // SENSORS_TEMP_H
