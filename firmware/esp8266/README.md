# ESP8266 Firmware Source

This directory contains the C++ embedded firmware for the NodeMCU ESP8266 (ESP-12E) edge microcontroller.

## Hardware Configuration
- **Microcontroller:** NodeMCU ESP-12E (Tensilica L106 32-bit RISC CPU)
- **Analog Input (A0):** Analog Pulse Sensor (Photoplethysmography / BPM) powered via 3.3V
- **Digital Bus (D2 / GPIO4):** Dallas DS18B20 Waterproof Temperature Probe with external 4.7kΩ pull-up resistor
- **Cloud Telemetry Target:** Firebase Realtime Database (Singapore `asia-southeast1`)

## Implementation Status
- **Status:** Scaffold placeholder (Phase 1).
- **Scheduled Implementation:** Phase 7 (Hardware Bench Testing) through Phase 9 (ESP-to-Firebase Cloud Communication).
- **Rule:** Do not write or flash firmware until hardware pinouts, voltage ratings, and bench testing procedures in [HARDWARE.md](../../docs/HARDWARE.md) are completed.

Please refer to [Hardware Specification](../../docs/HARDWARE.md) and [System Architecture](../../docs/ARCHITECTURE.md) for full circuit and firmware details.
