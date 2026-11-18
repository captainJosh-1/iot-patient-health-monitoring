# Hardware Specifications & Circuit Design: NodeMCU ESP8266 & Sensors

**Document Version:** 1.0.0  
**Status:** Approved Hardware Specification  
**Classification:** IoT Biomedical Telemetry Hardware Interface  

---

## 1. Hardware Inventory & Bill of Materials (BOM)

The prototype utilizes the following components:

| Item | Component | Model / Spec | Quantity | Purpose in Prototype |
|:---:|---|---|:---:|---|
| 1 | **Microcontroller** | NodeMCU ESP-12E (ESP8266) | 1 | Edge data acquisition, ADC sampling, 1-Wire bus master, Wi-Fi telemetry client |
| 2 | **Heart Rate Sensor** | Analog Pulse Sensor Module | 1 | Optical photoplethysmography (PPG) pulse wave detection |
| 3 | **Temperature Sensor** | DS18B20 Waterproof Probe | 1 | Digital contact body temperature measurement |
| 4 | **Prototyping Board** | MB-102 830-Point Breadboard | 1 | Solderless component interconnect and power distribution |
| 5 | **Interconnects** | Male-to-Male Jumper Wires | 1 set | Electrical routing between NodeMCU, sensors, and passive components |
| 6 | **Power & Data Link** | Micro-USB Data Cable | 1 | 5V DC power supply and UART firmware flashing via USB |
| 7 | **Passives** | 4.7kΩ Metal Film Resistors | 2 | Pull-up resistor for Dallas 1-Wire bus (1 active, 1 spare) |

---

## 2. Component Principles & Operating Characteristics

### 2.1 NodeMCU ESP8266 (ESP-12E Development Board)
The NodeMCU is an open-source development board based on the Espressif ESP8266 Wi-Fi SoC.

- **Microprocessor:** 32-bit Tensilica Xtensa L106 RISC CPU running at 80 MHz (overclockable to 160 MHz in firmware).
- **Wi-Fi Capabilities:** Integrated 2.4 GHz 802.11 b/g/n transceiver supporting WPA/WPA2-PSK security.
- **System Memory:** 64 KB Instruction RAM, 96 KB Data RAM, 4 MB SPI Flash.
- **Onboard Power Regulation:** An onboard low-dropout (LDO) linear regulator (AMS1117-3.3) steps down 5V from the Micro-USB port to a stable 3.3V DC system rail.
- **USB-to-UART Bridge:** Silicon Labs CP2102 or CH340 chip enabling serial programming and debugging over Micro-USB.

#### Hardware Constraints & Limitations:
1. **Single ADC Channel:** The ESP8266 contains exactly one internal 10-bit Successive Approximation Register (SAR) Analog-to-Digital Converter (`ADC0` / `TOUT`). Multiple analog sensors cannot be interfaced simultaneously without an external analog multiplexer. (In this project, only one analog sensor is used: Pulse Sensor on A0).
2. **2.4 GHz Only:** The transceiver operates exclusively on 2.4 GHz Wi-Fi channels (802.11 b/g/n). 5 GHz networks are not supported.
3. **Power Spikes during RF Transmission:** RF transmission bursts can draw peak currents up to 170–200 mA, necessitating clean, unthrottled 5V USB power to avoid brownout resets.

---

### 2.2 Analog Pulse Sensor Module
- **Sensing Principle:** Reflective Photoplethysmography (PPG). An onboard high-efficiency green LED ($\lambda \approx 565\text{ nm}$) illuminates cutaneous and subcutaneous capillary beds. As oxygenated blood pulses through arterioles with each cardiac cycle, the volume fraction of blood modulates the intensity of reflected light. An integrated ambient-light photodetector and operational amplifier circuit output an analog voltage waveform corresponding to the arterial pulse wave.
- **Supply Voltage:** 3.3V to 5.0V DC.
- **Output Signal:** Analog AC-coupled fluctuating voltage centered near half-supply voltage.

---

### 2.3 DS18B20 Digital Waterproof Temperature Probe
- **Sensing Principle:** Silicon bandgap temperature sensor integrated with digital signal processing, analog-to-digital converter, and a proprietary 1-Wire bus transceiver sealed in a waterproof stainless steel capsule (6mm diameter $\times$ 50mm length).
- **Communication Protocol:** Dallas 1-Wire serial communication (single data wire plus ground).
- **Operating Temperature Range:** -55°C to +125°C.
- **Clinical Accuracy:** $\pm 0.5^\circ\text{C}$ accuracy in the crucial biological range of +10°C to +85°C.
- **Programmable Resolution:** 9 to 12 bits (corresponding to $0.5^\circ\text{C}$ down to $0.0625^\circ\text{C}$ resolution).
- **Conversion Duration:** ~93.75 ms (9-bit), ~187.5 ms (10-bit), ~750 ms (12-bit).

---

## 3. Electrical Verification & Voltage Compatibility Analysis

### 3.1 ESP8266 ADC Input Range Verification (Crucial Safety Constraint)
A common point of failure in ESP8266 IoT projects stems from confusing the **raw ESP8266 SoC chip ADC rating** with the **NodeMCU development board A0 pin rating**:

1. **Bare ESP8266 SoC (`TOUT` pin):** The silicon ADC input has an absolute voltage limit of **0 to 1.0V DC**. Voltages exceeding 1.0V on the raw SoC will saturate the reading or permanently damage the internal ADC.
2. **NodeMCU ESP-12E Board (`A0` pin):** The NodeMCU development board incorporates an onboard resistor divider network:
   - Series Resistor ($R_1$): $220\text{ k}\Omega$
   - Shunt Resistor ($R_2$): $100\text{ k}\Omega$
   - Attenuation Ratio:
     $$V_{\text{internal}} = V_{\text{external}} \times \left( \frac{100\text{ k}\Omega}{220\text{ k}\Omega + 100\text{ k}\Omega} \right) = V_{\text{external}} \times \frac{100}{320} \approx 0.3125 \times V_{\text{external}}$$
   - At $V_{\text{external}} = 3.3\text{ V}$:
     $$V_{\text{internal}} = 3.3\text{ V} \times 0.3125 = 1.031\text{ V} \approx 1.0\text{ V}$$

> [!IMPORTANT]
> **Voltage Compliance Rule:** The NodeMCU board `A0` pin safely accepts **0 to 3.3V**.  
> The Analog Pulse Sensor **MUST be connected to the NodeMCU 3.3V rail** (NOT the 5V / Vin rail).  
> When powered with 3.3V, the sensor's peak analog output cannot exceed 3.3V, perfectly matching the NodeMCU A0 pin range and preventing ADC saturation or damage.

---

### 3.2 DS18B20 Pull-Up Resistor & Lead Verification
The DS18B20 is an open-drain/open-collector digital device on the 1-Wire bus. The bus master (ESP8266) or slave (DS18B20) pulls the line low to transmit logic 0, while a pull-up resistor passively restores the bus to logic high (3.3V) when released.

- **Probe Packaging:** The procured component is a **waterproof probe with bare wire leads**, NOT a pre-assembled PCB module.
- **Pull-Up Resistor Status:** The bare waterproof probe **DOES NOT have an internal pull-up resistor**.
- **Requirement:** An external **4.7kΩ pull-up resistor** (included in our BOM) must be inserted across the `DATA` line and the `3.3V VCC` rail on the breadboard.
- **Lead Color Identification Standards:**
  - **Red Wire:** $V_{\text{DD}}$ (Power: Connect to NodeMCU 3.3V rail).
  - **Black or Blue Wire:** $GND$ (Ground: Connect to common GND).
  - **Yellow or White Wire:** $DATA$ (1-Wire Bus: Connect to NodeMCU GPIO4 / D2).

> [!WARNING]
> Always verify wire pinouts with a digital multimeter before powering on. Some clone DS18B20 probes use non-standard wire colors. Running reverse polarity on the probe will cause rapid overheating and destroy the sensor.

---

### 3.3 NodeMCU GPIO Pin Assignment & Boot Strapping Analysis

The ESP8266 multiplexes its limited GPIOs with critical boot-configuration strapping functions:

| Pin Label | SoC GPIO | Boot Strapping Behavior | Safe for Sensors? | Project Assignment |
|---|---|---|---|---|
| **A0** | ADC0 | Analog Input (0–3.3V via board divider) | Yes | **Pulse Sensor Analog Output** |
| **D0** | GPIO16 | High at boot, wake-up from Deep Sleep | Caution | Unused |
| **D1** | GPIO5 | General GPIO, default I2C SCL | **Yes (Safe)** | Candidate spare GPIO |
| **D2** | GPIO4 | General GPIO, default I2C SDA | **Yes (Safe)** | **DS18B20 1-Wire Data Line** |
| **D3** | GPIO0 | Bootloader selector (Must be HIGH to boot) | Caution | Unused (Avoid boot issues) |
| **D4** | GPIO2 | Onboard LED, boot mode (Must be HIGH) | Caution | Unused (Avoid boot issues) |
| **D5** | GPIO14| SPI SCK, general GPIO | **Yes (Safe)** | Unused |
| **D6** | GPIO12| SPI MISO, general GPIO | **Yes (Safe)** | Unused |
| **D7** | GPIO13| SPI MOSI, general GPIO | **Yes (Safe)** | Unused |
| **D8** | GPIO15| Boot mode (Must be pulled LOW to boot) | Caution | Unused (Avoid boot issues) |

**Pin Assignment Rationale:**
- **`A0`** is assigned to the Analog Pulse Sensor as it is the only analog pin available on the ESP8266.
- **`D2` (GPIO4)** is assigned to the DS18B20 digital bus. GPIO4 is an unrestricted, general-purpose I/O that does not interfere with the ESP8266 boot process, has no internal pull-down strapping, and guarantees clean boot sequences even when the 4.7kΩ pull-up resistor is attached.

---

## 4. Candidate Breadboard Wiring Diagram

```
+---------------------------------------------------------------------------------+
|                               BREADBOARD (MB-102)                               |
|                                                                                 |
|   [ 3.3V Power Rail (+) ] <----------------- NodeMCU 3.3V Pin                   |
|   [ Ground Rail (-)     ] <----------------- NodeMCU GND Pin                    |
|                                                                                 |
|   --- Analog Pulse Sensor Wiring ---                                            |
|   Pulse Sensor VCC (+)   --------> Connect to 3.3V Power Rail                   |
|   Pulse Sensor GND (-)   --------> Connect to Ground Rail (-)                   |
|   Pulse Sensor Signal(S) --------> Connect to NodeMCU Pin A0                    |
|                                                                                 |
|   --- DS18B20 Waterproof Probe Wiring ---                                       |
|   Red Wire (VDD)         --------> Connect to 3.3V Power Rail                   |
|   Black/Blue Wire (GND)  --------> Connect to Ground Rail (-)                   |
|   Yellow/White Wire(DATA)-------> Connect to NodeMCU Pin D2 (GPIO4)             |
|                                                                                 |
|   --- 4.7kΩ Pull-Up Resistor ---                                                |
|   Lead 1                 --------> Connect to NodeMCU Pin D2 (DATA line)        |
|   Lead 2                 --------> Connect to 3.3V Power Rail                   |
+---------------------------------------------------------------------------------+
```

---

## 5. Timing, Sampling & Cloud Upload Frequencies

Balancing edge signal fidelity against network bandwidth and Firebase write limits is essential:

### 5.1 Pulse Sensor Sampling Frequency (50 Hz / 20 ms)
- Heart rate pulse waveforms (PPG) have frequency components typically between 0.5 Hz and 5 Hz (corresponding to 30 to 300 BPM).
- Under the Nyquist-Shannon sampling theorem, the minimum sampling rate must exceed 10 Hz. To accurately resolve systolic peaks, peak inflection, and calculate Inter-Beat Intervals (IBI), a sampling rate of **50 Hz (one sample every 20 ms)** is optimal.
- Firmware execution: A non-blocking software timer (`millis()` check) samples `analogRead(A0)` every 20 ms. Samples pass through a moving average filter to detect baseline crossings and measure elapsed time between peaks.

### 5.2 DS18B20 Temperature Sampling Frequency (0.33 Hz / 3000 ms)
- Human body temperature changes on a scale of minutes, not milliseconds.
- At 12-bit resolution, DS18B20 requires up to 750 ms for an analog-to-digital conversion.
- Sampling the temperature probe once every **3 seconds (3000 ms)** provides responsive clinical tracking without stalling the microcontroller or inducing self-heating in the sensor probe.

### 5.3 Firebase Cloud Synchronization Frequency
- **Latest Vitals & Heartbeat (`/vitals/latest` & `/devices`):** Published every **3 to 5 seconds**. This gives the attending doctor a near-live view of physiological vitals without saturating the ESP8266 Wi-Fi stack or triggering Firebase rate limits.
- **Historical Telemetry Log (`/vitals/history`):** Appended every **15 seconds** (or upon an acute state transition). This rate provides adequate granularity for Recharts historical trends while preserving database storage limits.

---

## 6. Hardware Bench Testing & Verification Protocol

Before running full cloud telemetry firmware, the physical hardware must be validated on the bench in isolated steps:

### Test Step 1: Power & Voltage Rail Verification
1. Insert NodeMCU ESP8266 into the MB-102 breadboard.
2. Connect Micro-USB cable to PC. Verify onboard power LED illuminates.
3. Using a digital multimeter, measure the voltage between NodeMCU `3V3` and `GND` pins.
4. **Pass Criteria:** Voltage must read $3.30\text{V} \pm 0.10\text{V}$.

### Test Step 2: DS18B20 1-Wire Verification
1. Connect DS18B20 Red wire to 3.3V, Black to GND, Yellow to NodeMCU D2.
2. Insert 4.7kΩ resistor between D2 and 3.3V.
3. Flash DallasTemperature standard test sketch (`Single.ino`).
4. Open Arduino Serial Monitor at 115200 baud.
5. **Pass Criteria:** Sensor ROM address is detected; temperature reads ambient (~$23\text{–}27^\circ\text{C}$); holding probe tightly between fingers shows smooth temperature increase toward $35\text{–}36^\circ\text{C}$.

### Test Step 3: Pulse Sensor Analog Verification
1. Connect Pulse Sensor VCC to 3.3V, GND to GND, Signal to A0.
2. Flash analog read test sketch outputting `analogRead(A0)` over Serial.
3. Open Arduino Serial Plotter at 115200 baud.
4. Place finger lightly against optical sensor window without excessive pressure.
5. **Pass Criteria:** A clear, repeating photoplethysmogram pulse waveform appears on the Serial Plotter with identifiable systolic peaks corresponding to pulse beats.
