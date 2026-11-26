# ESP8266 Firmware Source: Patient Telemetry Monitor

This directory contains the embedded C++ firmware for the **NodeMCU ESP8266 (ESP-12E)** edge microcontroller.

---

## 1. Directory Structure

```text
firmware/esp8266/
├── README.md                      # Hardware setup, library dependencies, flashing guide
└── patient_monitor/               # Core Arduino sketch folder
    ├── patient_monitor.ino        # Setup, non-blocking loop(), telemetry synchronization
    ├── config.example.h           # Template configuration (pins, intervals, bounds, Wi-Fi & Firebase)
    ├── sensors_pulse.h            # Header for analog pulse sensor processing (50 Hz / 20 ms)
    ├── sensors_pulse.cpp          # Non-blocking peak detection, IBI smoothing, 30–220 BPM bounds
    ├── sensors_temp.h             # Header for Dallas DS18B20 temperature sensor (3000 ms)
    ├── sensors_temp.cpp           # Non-blocking 1-Wire reader (setWaitForConversion = false)
    ├── wifi_manager.h             # Non-blocking Wi-Fi station and NTP time synchronization header
    ├── wifi_manager.cpp           # Wi-Fi auto-reconnect logic and Unix epoch millisecond clock
    ├── firebase_client.h          # Firebase Auth and REST client header
    └── firebase_client.cpp        # Firebase Auth login/refresh and HTTPS PUT/POST telemetry publisher
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

Install the following three official libraries via **Sketch $\rightarrow$ Include Library $\rightarrow$ Manage Libraries...**:

1. **`OneWire`** by *Paul Stoffregen* (Version **2.3.7** or higher)
   - Handles low-level 1-Wire bit-banging protocol on GPIO4 (D2).
2. **`DallasTemperature`** by *Miles Burton* (Version **3.9.0** or higher)
   - Reads DS18B20 digital temperature values with non-blocking asynchronous conversions.
3. **`ArduinoJson`** by *Benoit Blanchon* (Version **7.x**, e.g., 7.0.4 or higher)
   - **Important:** The firmware uses the modern unified `JsonDocument` syntax from ArduinoJson v7. Ensure version 7.x is selected (not legacy v6 `StaticJsonDocument`).
4. **Built-in Core Libraries:** `ESP8266WiFi`, `WiFiClientSecure`, `ESP8266HTTPClient` (bundled automatically with the ESP8266 board core package).

---

## 5. Configuration Setup

Before flashing:
1. Navigate to `firmware/esp8266/patient_monitor/`.
2. Copy `config.example.h` to `config.h`:
   ```bash
   # In terminal / PowerShell:
   cp config.example.h config.h
   ```
3. Open `config.h` and fill in your actual network and Firebase credentials:
   - `WIFI_SSID` & `WIFI_PASSWORD`: Your 2.4 GHz local Wi-Fi network credentials.
   - `FIREBASE_API_KEY`: Your Firebase Web API Key (found in Firebase Console $\rightarrow$ Project Settings $\rightarrow$ General).
   - `FIREBASE_DATABASE_URL`: Your Realtime Database URL (e.g. `https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app` without trailing slash).
   - `FIREBASE_DEVICE_EMAIL` & `FIREBASE_DEVICE_PASS`: The device email/password created under **Firebase Console $\rightarrow$ Authentication $\rightarrow$ Users**.
4. `config.h` is strictly ignored by `.gitignore` and will never be tracked or committed.
5. If `config.h` is absent, the code automatically falls back to `config.example.h` to allow offline bench testing.

---

## 6. Bench Testing & Serial Verification

1. Connect the NodeMCU to your computer via Micro-USB.
2. Open `patient_monitor.ino` in Arduino IDE.
3. Click **Upload**.
4. Open the **Serial Monitor** at **115200 baud**.
5. Observe telemetry and connection output:
   ```text
   ==================================================================
    IoT-Based Patient Health Monitoring System — Edge Microcontroller
    Firmware Version: 1.0.0-academic
    Device ID:        esp8266_01
    Assigned Patient: patient_01
    Hardware Target:  NodeMCU ESP8266 (ESP-12E) @ 80 MHz
    Cloud Target:     Firebase RTDB (asia-southeast1)
   ==================================================================
   [SYSTEM] Initialization complete. Entering non-blocking acquisition loop...
   [WIFI] Connected successfully! IP: 192.168.1.105 | RSSI: -62 dBm
   [NTP] UTC Time synchronized successfully! Epoch: 1716987450
   [AUTH] Authenticating device via Firebase Auth REST API...
   [AUTH] Device authenticated successfully! ID token acquired.
   [TELEMETRY] Up: 3s | WiFi: CONNECTED | NTP: SYNCED | Cloud: AUTH_OK | HR: 74 BPM | Temp: 36.6 °C
   ```
6. **Cloud Telemetry Verification:**
   - Every 3 seconds: Updates `/devices/esp8266_01` (Heartbeat) and `/vitals/latest/patient_01` (Latest Vitals).
   - Every 15 seconds: Appends a historical snapshot to `/vitals/history/patient_01`.
   - Open your web dashboard or Firebase Console to see instantaneous updates in real time!
