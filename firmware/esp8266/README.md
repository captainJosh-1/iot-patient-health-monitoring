# ESP8266 Firmware Source: Patient Telemetry Monitor

This directory contains the embedded C++ firmware for the **NodeMCU ESP8266 (ESP-12E)** edge microcontroller.

---

## 1. Directory Structure

```text
firmware/esp8266/
├── README.md                      # Hardware setup, library dependencies, flashing guide
└── patient_monitor/               # Core Arduino sketch folder
    ├── patient_monitor.ino        # Setup, non-blocking loop(), serial telemetry reporter
    ├── config.example.h           # Template configuration (pins, intervals, bounds, Wi-Fi placeholders)
    ├── sensors_pulse.h            # Header for analog pulse sensor processing (50 Hz / 20 ms)
    ├── sensors_pulse.cpp          # Non-blocking peak detection, IBI smoothing, 30–220 BPM bounds
    ├── sensors_temp.h             # Header for Dallas DS18B20 temperature sensor (3000 ms)
    └── sensors_temp.cpp           # Non-blocking 1-Wire reader (setWaitForConversion = false)
```

---

## 2. Hardware Wiring & Electrical Connections

Strictly adhering to [`docs/HARDWARE.md`](../../docs/HARDWARE.md):

| Sensor / Module | Sensor Pin / Lead | NodeMCU ESP-12E Pin | Power Rail | Critical Electrical Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Analog Pulse Sensor** | Signal (S) | **A0** (ADC0) | — | Only analog input on ESP8266. |
| | VCC (+) | — | **3.3V Rail** | **CRITICAL: Connect to 3.3V (NOT 5V/Vin).** Keeps peak output $\le 3.3\text{V}$, matching the board divider. |
| | GND (-) | — | **GND Rail** | Common ground with NodeMCU. |
| **DS18B20 Digital Probe** | DATA (Yellow/White)| **D2** (GPIO4) | — | Boot-safe GPIO; no boot-strapping conflicts. |
| | VDD (Red) | — | **3.3V Rail** | 3.3V power rail. |
| | GND (Black/Blue) | — | **GND Rail** | Common ground with NodeMCU. |
| **Pull-Up Resistor (4.7kΩ)**| Lead 1 to D2, Lead 2 to 3.3V | **D2** $\leftrightarrow$ **3.3V** | **3.3V Rail** | **MANDATORY:** Dallas 1-Wire open-drain bus requires a 4.7kΩ external pull-up resistor. |

---

## 3. Arduino IDE Setup & Configuration

### 3.1 Board Package Installation
1. In Arduino IDE, open **File $\rightarrow$ Preferences**.
2. Add the ESP8266 board manager URL into **Additional Board Manager URLs**:
   ```text
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
   ```
3. Open **Tools $\rightarrow$ Board $\rightarrow$ Boards Manager...**, search for `esp8266`, and install version **3.1.2** (or latest stable).

### 3.2 Target Board Settings
Configure under the **Tools** menu:
- **Board:** `"NodeMCU 1.0 (ESP-12E Module)"`
- **CPU Frequency:** `80 MHz`
- **Flash Size:** `4MB (FS:2MB OTA:~1019KB)`
- **Upload Speed:** `115200` (or `921600` for faster flashing)
- **Port:** Select the COM port corresponding to the CP2102 or CH340 USB-UART bridge.

---

## 4. Required Arduino Libraries

Install the following two official libraries via **Sketch $\rightarrow$ Include Library $\rightarrow$ Manage Libraries...**:

1. **`OneWire`** by *Paul Stoffregen* (Version **2.3.7** or higher)
   - Handles low-level 1-Wire bit-banging protocol on GPIO4 (D2).
2. **`DallasTemperature`** by *Miles Burton* (Version **3.9.0** or higher)
   - Reads DS18B20 digital temperature values with non-blocking asynchronous conversions.

---

## 5. Configuration Setup

Before flashing:
1. Navigate to `firmware/esp8266/patient_monitor/`.
2. Copy `config.example.h` to `config.h`:
   ```bash
   # In terminal / PowerShell:
   cp config.example.h config.h
   ```
3. `config.h` is protected by `.gitignore` and will never be tracked or committed to Git.
4. If `config.h` is absent, the code automatically defaults to `config.example.h` for seamless compilation.

---

## 6. Bench Testing & Serial Verification

1. Connect the NodeMCU to your computer via Micro-USB.
2. Open `patient_monitor.ino` in Arduino IDE.
3. Click **Upload**.
4. Open the **Serial Monitor** at **115200 baud**.
5. Observe telemetry output:
   ```text
   ==================================================================
    IoT-Based Patient Health Monitoring System — Edge Microcontroller
    Firmware Version: 1.0.0-academic
    Device ID:        esp8266_01
    Assigned Patient: patient_01
    Hardware Target:  NodeMCU ESP8266 (ESP-12E)
    Sensors:          Pulse Sensor (A0) | DS18B20 1-Wire (D2/GPIO4)
   ==================================================================
   [SYSTEM] Sensors initialized. Entering non-blocking acquisition loop...
   [TELEMETRY] Up: 1s | Signal(A0): 514 | Heart Rate: -- BPM [NO FINGER] | Temp: 27.2 °C [VALID]
   [TELEMETRY] Up: 2s | Signal(A0): 512 | Heart Rate: -- BPM [NO FINGER] | Temp: 27.2 °C [VALID]
   ```
6. **Pulse Verification:** Place finger lightly on the pulse sensor optical window. Within 3–5 seconds, the status will shift to `[TRACKED]` with a live BPM reading (e.g., `72 BPM [TRACKED]`).
7. **Temperature Verification:** Grip the waterproof DS18B20 stainless steel probe between your thumb and index finger. Observe the temperature rise smoothly from ambient (~$25\text{–}27^\circ\text{C}$) toward human body temperature (~$35\text{–}36^\circ\text{C}$).
