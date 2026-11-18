# Project Specification: IoT-Based Patient Health Monitoring System

**Document Version:** 1.0.0  
**Status:** Approved Specification  
**Classification:** Academic Engineering Capstone Project  
**Target Environment:** Academic Demonstration Prototype  

---

## 1. Executive Summary & Overview

The **IoT-Based Patient Health Monitoring System** is a low-power, connected biomedical telemetry prototype engineered to collect, process, and present real-time physiological vitals from a single monitored patient to an authorized physician via a dedicated web dashboard. 

The system continuously acquires two primary human physiological indicators:
1. **Heart Rate (Photoplethysmography / BPM)**
2. **Body Temperature (Contact Thermal Sensing / °C)**

Using a low-cost, high-performance NodeMCU ESP8266 (ESP-12E) Wi-Fi microcontroller, raw sensory readings are sampled, filtered, packaged into structured telemetry payloads, and securely transmitted over standard 802.11 b/g/n Wi-Fi directly to Google Firebase Realtime Database. An authenticated doctor interface—built with React, TypeScript, Tailwind CSS, shadcn/ui, and Recharts—subscribes to these cloud data streams in real time. The dashboard visualizes instantaneous readings, plots historical trends, flags abnormal physiological departures against configurable clinical demo thresholds, records an alert history audit trail, and tracks device connectivity status using a deterministic heartbeat mechanism.

---

## 2. Problem Statement

In contemporary inpatient, post-operative, and home-care environments, vital sign acquisition often relies on intermittent manual measurement by healthcare staff or bulky, proprietary bedside patient monitors. Intermittent spot-checks run the distinct risk of missing acute physiological decompensation between observation rounds. Conversely, high-end commercial telemetry monitors are cost-prohibitive for home-care environments and resource-constrained clinics, require proprietary local infrastructure, and often lack modern, responsive, remote browser-based interfaces for attending physicians.

There is a documented academic and practical need for a functional, secure, lightweight, and cost-effective Internet-of-Things (IoT) monitoring solution that bridges real physical sensor telemetry with cloud synchronization and a modern, high-fidelity clinical user interface.

---

## 3. Motivation

1. **Continuous Telemetry vs. Intermittent Spot-Checks:** Continuous sensing detects physiological anomalies (tachycardia, bradycardia, hypothermia, fever spikes) early.
2. **Accessible Remote Clinical Oversight:** Attending physicians can monitor patient status without physical proximity, conserving personal protective equipment (PPE) and clinical time while supporting remote convalescence.
3. **Hardware-to-Cloud Integration Learning Model:** Provides a transparent, end-to-end engineering blueprint demonstrating analog signal conditioning, microcontroller firmware development, cloud data synchronization, and modern reactive web development.
4. **Resilient Fail-Safe Monitoring:** Establishes explicit connectivity tracking (heartbeat and stale-data detection) so medical personnel are never misled by obsolete cached readings during hardware or network outages.

---

## 4. Project Objectives

- **Objective 1 (Sensor Telemetry Acquisition):** Interface an optical pulse sensor (analog photoplethysmography) and a digital DS18B20 waterproof temperature probe with the NodeMCU ESP8266 microcontroller with validated signal safety and ADC voltage compliance.
- **Objective 2 (Cloud Synchronization):** Establish low-latency Wi-Fi communication between the ESP8266 and Firebase Realtime Database (hosted in the Singapore `asia-southeast1` region) to publish real-time telemetry and connectivity heartbeats.
- **Objective 3 (Secure Physician Access):** Implement single-tenant doctor authentication utilizing Firebase Authentication to ensure that only authorized clinical personnel access patient health data.
- **Objective 4 (Interactive Web Dashboard):** Build a professional, accessible, and responsive clinical dashboard in React and TypeScript that displays instantaneous vitals, dynamic historical trend charts, and real-time alerts.
- **Objective 5 (Dynamic Anomaly Classification):** Evaluate vital sign departures against configurable clinical demonstration thresholds to categorize health status into `NORMAL`, `WARNING`, and `ABNORMAL` states.
- **Objective 6 (Deterministic Device Connectivity):** Implement a robust heartbeat and timestamp monitoring engine to differentiate between active sensor feeds, network latency, and physical device disconnection.

---

## 5. System Scope

### 5.1 In-Scope Capabilities
- **Monitored Subjects:** Exactly **one (1)** registered patient profile.
- **Authorized Users:** Exactly **one (1)** designated physician/doctor account.
- **Monitored Hardware Units:** Exactly **one (1)** NodeMCU ESP8266 edge device.
- **Sensed Parameters:**
  - Heart Rate in Beats Per Minute (BPM) derived from optical analog pulse wave detection.
  - Body Temperature in Degrees Celsius (°C) via Dallas 1-Wire digital thermal sensing.
- **Cloud Infrastructure:**
  - Firebase Authentication (Email/Password credentials for the physician).
  - Firebase Realtime Database (`asia-southeast1`) operating under security rules.
- **Frontend Dashboard:**
  - Responsive single-page application built with React, Vite, TypeScript, and Tailwind CSS.
  - Modular UI components from shadcn/ui.
  - Historical trend visualization using Recharts.
  - Alert logging and notification feed.
  - Live heartbeat and stale-data detection indicator.

### 5.2 Explicitly Excluded Features (Strict Boundary)
To maintain project focus, avoid scope creep, and ensure academic rigor on core IoT-cloud fundamentals, the following items are **strictly excluded**:
- **NO** Fall detection algorithms or accelerometer/gyroscope integration (e.g., MPU6050 is strictly prohibited).
- **NO** Electrocardiogram (ECG) measurements or analog front-ends (e.g., AD8232).
- **NO** Blood Oxygen Saturation (SpO2) estimation (e.g., MAX30100/MAX30102).
- **NO** Blood pressure or glucose monitoring sensors.
- **NO** Artificial Intelligence or Machine Learning diagnostic predictions.
- **NO** Multi-patient registries or ward management functionality.
- **NO** Patient or family portal accounts/logins.
- **NO** Telemedicine video conferencing, appointment scheduling, or digital prescription generation.
- **NO** Hospital billing, insurance verification, or Electronic Health Record (EHR/HL7/FHIR) integration.
- **NO** Secondary backend application servers (Express, MongoDB, PostgreSQL, etc.) unless an insurmountable security requirement necessitates it.

---

## 6. Functional Requirements (FR)

### FR-1: Doctor Authentication
- **FR-1.1:** The system shall authenticate the attending physician via Firebase Authentication using email and password credentials.
- **FR-1.2:** Unauthenticated requests to protected dashboard routes shall automatically redirect to the login interface.
- **FR-1.3:** The system shall provide a secure session logout mechanism that terminates active tokens and subscriptions.

### FR-2: Patient Telemetry Visualization
- **FR-2.1:** The dashboard shall render the registered patient's demographic banner: Full Name, Patient ID, Age, and Assigned Device ID.
- **FR-2.2:** The dashboard shall display the latest Heart Rate reading prominently in Beats Per Minute (BPM).
- **FR-2.3:** The dashboard shall display the latest Body Temperature reading prominently in Degrees Celsius (°C).
- **FR-2.4:** The dashboard shall display the exact timestamp of the most recent data reception.

### FR-3: Physiological Status Classification
- **FR-3.1:** The system shall continuously compute an overall monitoring status badge based on configurable thresholds:
  - `NORMAL`: Heart rate 60–100 BPM **AND** Temperature 35.0–38.0 °C.
  - `WARNING`: Vitals approaching boundary conditions (e.g., Heart rate 50–59 or 101–115 BPM; Temperature 34.0–34.9 or 38.1–38.9 °C).
  - `ABNORMAL`: Vitals exceeding safety margins (e.g., Heart rate < 50 or > 115 BPM; Temperature < 34.0 or ≥ 39.0 °C).
- **FR-3.2:** The threshold boundaries shall be maintained in a configurable state module rather than hardcoded throughout UI views.

### FR-4: Historical Trend Plotting
- **FR-4.1:** The dashboard shall plot an interactive time-series line chart for Heart Rate (BPM) over time using Recharts.
- **FR-4.2:** The dashboard shall plot an interactive time-series line chart for Body Temperature (°C) over time using Recharts.
- **FR-4.3:** The charts shall provide visual threshold reference lines denoting normal operating ranges.

### FR-5: Anomaly Alerts & History
- **FR-5.1:** When a vital reading transitions into `WARNING` or `ABNORMAL` state, an alert record shall be generated and stored with timestamp, parameter name, breached value, and severity level.
- **FR-5.2:** The dashboard shall present an alert audit log displaying historical threshold breaches sorted in reverse chronological order.
- **FR-5.3:** The doctor shall have the ability to dismiss or acknowledge active UI alert notifications.

### FR-6: Edge-to-Cloud Telemetry & Heartbeat
- **FR-6.1:** The NodeMCU ESP8266 shall sample the Pulse Sensor and DS18B20 sensor at defined intervals.
- **FR-6.2:** The firmware shall transmit structured JSON payloads containing sensor readings, device ID, and a heartbeat timestamp to Firebase Realtime Database.
- **FR-6.3:** The dashboard shall monitor the difference between client system time and the device's last-seen timestamp. If no heartbeat is received within 30 seconds, the dashboard shall mark the device status as `DISCONNECTED` or `STALE` and visually inform the physician.

---

## 7. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- **NFR-1.1:** End-to-end telemetry latency (from physical sensor sampling to browser UI render) shall not exceed 3.0 seconds under normal Wi-Fi conditions.
- **NFR-1.2:** The web dashboard initial page load time shall be under 2.0 seconds on standard broadband connections.

### NFR-2: Reliability & Fault Tolerance
- **NFR-2.1:** The ESP8266 firmware shall implement an automated reconnection loop for Wi-Fi and Firebase socket dropouts without requiring a physical hard reset.
- **NFR-2.2:** In the event of a network outage, the web dashboard shall preserve previously cached readings while clearly displaying a `STALE DATA / OFFLINE` indicator.

### NFR-3: Security & Privacy
- **NFR-3.1:** All communication between ESP8266, Firebase cloud services, and the web browser shall be encrypted over TLS/HTTPS (WSS).
- **NFR-3.2:** No Firebase administrator service account keys or private database master secrets shall be embedded in public client-side frontend code.
- **NFR-3.3:** Firebase Realtime Database Security Rules shall enforce authentication requirements for all read and write operations.

### NFR-4: Usability & Clinical Aesthetics
- **NFR-4.1:** The user interface shall adhere strictly to professional healthcare design standards: clean sans-serif typography, high contrast, minimal non-functional decorations, and clear visual hierarchy.
- **NFR-4.2:** The dashboard shall be fully responsive across desktop monitors, tablets, and mobile browser viewports.

---

## 8. Target Hardware & Software Stack

| Category | Component / Tool | Specification / Version |
|---|---|---|
| **Microcontroller** | NodeMCU ESP8266 | ESP-12E module, Tensilica L106 32-bit RISC, 80/160 MHz |
| **Heart Rate Sensor** | Analog Pulse Sensor | Optical PPG sensor, green LED (565nm), photodetector, 3.3V supply |
| **Temperature Sensor** | DS18B20 Probe | Waterproof stainless steel probe, Dallas 1-Wire digital bus |
| **Circuitry** | Breadboard & Passives | MB-102 830-point breadboard, 4.7kΩ pull-up resistor, jumper wires |
| **Firmware Development** | Arduino IDE / C++ | ESP8266 Core for Arduino, OneWire, DallasTemperature |
| **Cloud Services** | Google Firebase | Firebase Auth, Firebase Realtime Database (`asia-southeast1`) |
| **Frontend Framework** | React 18+ with TypeScript | Built with Vite for optimized HMR and bundle compilation |
| **Styling & Components** | Tailwind CSS & shadcn/ui | Radix UI primitives, Lucide React icons, Tailwind utility classes |
| **Data Visualization** | Recharts | Composable SVG time-series charting library |
| **Version Control** | Git & GitHub | Modular branching and structured milestone commits |

---

## 9. Project Limitations

1. **Demonstration Thresholds:** The vital thresholds utilized in this project are demonstration baselines designed for academic validation and must not be used for diagnostic medical decisions.
2. **Ambient Noise Sensitivity:** Analog optical pulse sensors are susceptible to motion artifacts and ambient light variation. Measurements require gentle, stable finger placement.
3. **Single-Patient Architecture:** The cloud schema and UI are architected intentionally for a single-patient clinical scenario. Expanding to a multi-bed ward would require database indexing and schema expansion.
4. **Network Dependency:** The prototype requires an active 2.4 GHz 802.11 b/g/n Wi-Fi network with internet connectivity for real-time cloud publishing.

---

## 10. Expected Academic Outcomes

Upon full completion of all development phases, this project will deliver:
1. A fully functional, bench-tested physical IoT sensor prototype transmitting physiological data to the cloud.
2. A production-grade, responsive clinical web dashboard showcasing instantaneous vitals, dynamic charts, alerts, and connectivity status.
3. Rigorous, publication-quality technical documentation covering specifications, system architecture, database modeling, hardware pinouts, and step-by-step development milestones.
4. A cleanly architected, modular codebase adhering strictly to software engineering best practices.
