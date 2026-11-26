#include "sensors_pulse.h"
#if __has_include("config.h")
#include "config.h"
#else
#include "config.example.h"
#endif

// Internal Pulse Sensor Tracking State
static unsigned long lastSampleTime = 0;
static unsigned long lastBeatTime = 0;
static int rawSignal = 0;
static int latestBpm = 0;
static int latestIbi = 600;
static bool pulseDetected = false;
static bool beatTriggered = false;

// Adaptive Peak & Trough Tracking
static int P = 512;          // Peak of pulse wave
static int T = 512;          // Trough of pulse wave
static int thresh = 512;     // Dynamic threshold
static int amp = 100;        // Signal amplitude (P - T)
static bool firstBeat = true;
static bool secondBeat = false;

// Running average buffer for IBI smoothing (last 4 valid intervals)
#define IBI_HISTORY_SIZE 4
static int ibiHistory[IBI_HISTORY_SIZE] = { 600, 600, 600, 600 };
static int ibiIndex = 0;

void initPulseSensor() {
  pinMode(PIN_PULSE_SENSOR, INPUT);
  lastSampleTime = millis();
  lastBeatTime = millis();
  rawSignal = analogRead(PIN_PULSE_SENSOR);
  latestBpm = 0;
  pulseDetected = false;
  beatTriggered = false;
}

void updatePulseSensor() {
  unsigned long now = millis();
  beatTriggered = false;

  // Enforce 50 Hz non-blocking sampling (every 20 ms)
  if (now - lastSampleTime < PULSE_SAMPLE_INTERVAL_MS) {
    return;
  }
  lastSampleTime = now;

  rawSignal = analogRead(PIN_PULSE_SENSOR);
  unsigned long timeSinceLastBeat = now - lastBeatTime;

  // Track trough during declining phase (after refractory window)
  if (timeSinceLastBeat > PULSE_MIN_REFRACTORY_MS) {
    if (rawSignal < thresh && rawSignal < T) {
      T = rawSignal;
    }
  }

  // Track peak during rising phase
  if (rawSignal > thresh && rawSignal > P) {
    P = rawSignal;
  }

  // Beat Detection Condition:
  // 1. Signal crosses dynamic threshold upwards
  // 2. Refractory period has elapsed (prevents double-counting dicrotic notch)
  // 3. Amplitude is sufficiently strong above noise floor
  if (timeSinceLastBeat > PULSE_MIN_REFRACTORY_MS) {
    if ((rawSignal > thresh) && (!beatTriggered) && (amp > PULSE_MIN_AMPLITUDE)) {
      beatTriggered = true;
      latestIbi = timeSinceLastBeat;
      lastBeatTime = now;

      if (secondBeat) {
        secondBeat = false;
        // Prime the IBI running average
        for (int i = 0; i < IBI_HISTORY_SIZE; i++) {
          ibiHistory[i] = latestIbi;
        }
      }

      if (firstBeat) {
        firstBeat = false;
        secondBeat = true;
      } else {
        // Store in circular buffer and smooth
        ibiHistory[ibiIndex] = latestIbi;
        ibiIndex = (ibiIndex + 1) % IBI_HISTORY_SIZE;

        long runningTotal = 0;
        for (int i = 0; i < IBI_HISTORY_SIZE; i++) {
          runningTotal += ibiHistory[i];
        }
        int avgIbi = runningTotal / IBI_HISTORY_SIZE;

        int calculatedBpm = 60000 / avgIbi;

        // Apply physiological bounds check (30 to 220 BPM)
        if (calculatedBpm >= HEART_RATE_MIN_VALID && calculatedBpm <= HEART_RATE_MAX_VALID) {
          latestBpm = calculatedBpm;
          pulseDetected = true;
        }
      }
    }
  }

  // Decay Peak and Trough when signal drops below threshold
  if (rawSignal < thresh && beatTriggered) {
    beatTriggered = false;
    amp = P - T;
    thresh = amp / 2 + T;
    P = thresh;
    T = thresh;
  }

  // Finger Off / Timeout Detection:
  // If no beat detected for > 2.5 seconds, reset state
  if (timeSinceLastBeat > PULSE_NO_FINGER_TIMEOUT_MS) {
    thresh = 512;
    P = 512;
    T = 512;
    lastBeatTime = now;
    firstBeat = true;
    secondBeat = false;
    latestBpm = 0;
    pulseDetected = false;
  }
}

int getLatestBpm() {
  return latestBpm;
}

int getRawSignal() {
  return rawSignal;
}

int getLatestIbi() {
  return latestIbi;
}

bool isPulseDetected() {
  return pulseDetected;
}

bool isBeatTriggered() {
  return beatTriggered;
}
