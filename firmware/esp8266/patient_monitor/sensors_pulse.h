#ifndef SENSORS_PULSE_H
#define SENSORS_PULSE_H

#include <Arduino.h>

/**
 * Initialize the analog optical pulse sensor on pin A0.
 */
void initPulseSensor();

/**
 * Non-blocking pulse acquisition cycle.
 * Called continuously in loop(); executes internal sampling every 20 ms (50 Hz).
 */
void updatePulseSensor();

/**
 * Returns the current smoothed Heart Rate in Beats Per Minute (BPM).
 * Returns 0 if no valid pulse is detected or finger is off the sensor.
 */
int getLatestBpm();

/**
 * Returns the raw 10-bit analog reading from pin A0 (0-1023).
 */
int getRawSignal();

/**
 * Returns the most recent Inter-Beat Interval (IBI) in milliseconds.
 */
int getLatestIbi();

/**
 * Returns true if an active rhythmic pulse is currently being tracked.
 */
bool isPulseDetected();

/**
 * Returns true for one cycle when a new systolic peak is identified.
 */
bool isBeatTriggered();

#endif // SENSORS_PULSE_H
