# Database Schema & Data Models: Firebase Realtime Database

**Document Version:** 1.0.0  
**Status:** Architectural Specification  
**Database Technology:** Google Firebase Realtime Database  
**Target Region:** Singapore (`asia-southeast1`)  
**Security Status:** Locked Mode (Security Rules Enforcement)  

---

## 1. Architectural Strategy & Hierarchy

The database schema is designed for low-latency document streaming to web clients, efficient point updates from the edge microcontroller, and deterministic security enforcement. 

In Firebase Realtime Database (a NoSQL JSON tree), deep nesting is avoided in favor of a normalized, shallow structure. This ensures that subscribing to a patient's latest vitals does not inadvertently download large volumes of historical readings or alert logs.

### 1.1 Complete JSON Tree Structure (Proposed Overview)

```
iot-patient-health-monitoring/
├── doctors/
│   └── {doctorId}/                 # Physician profile metadata
├── patients/
│   └── {patientId}/                # Patient demographic & device assignment
├── devices/
│   └── {deviceId}/                 # Edge device status & heartbeat tracking
├── vitals/
│   ├── latest/
│   │   └── {patientId}/            # Current instantaneous physiological readings
│   └── history/
│       └── {patientId}/
│           └── {timestampId}/      # Time-series historical telemetry log
├── alerts/
│   └── {patientId}/
│       └── {alertId}/              # Physiological anomaly alerts & audit log
└── thresholds/
    └── {patientId}/                # Clinical demonstration threshold configuration
```

---

## 2. Detailed Node Specifications

### 2.1 Doctors Node: `/doctors/{doctorId}`
Stores profile details for the attending physician. The `{doctorId}` corresponds to the unique Firebase Authentication User UID (`auth.uid`).

| Field | Type | Required | Description |
|---|---|---|---|
| `doctorId` | String | Yes | Firebase Auth UID of the doctor |
| `name` | String | Yes | Full name of the physician (e.g., "Dr. Sarah Jenkins, MD") |
| `email` | String | Yes | Professional contact email matching Firebase Auth |
| `role` | String | Yes | Access role (e.g., "ATTENDING_PHYSICIAN") |
| `department` | String | Yes | Clinical department (e.g., "Cardiopulmonary Telemetry") |
| `createdAt` | Number | Yes | Epoch timestamp (milliseconds) of account registration |

#### Sample JSON:
```json
{
  "doctors": {
    "doc_firebase_uid_12345": {
      "doctorId": "doc_firebase_uid_12345",
      "name": "Dr. Sarah Jenkins, MD",
      "email": "doctor@hospital.org",
      "role": "ATTENDING_PHYSICIAN",
      "department": "Cardiopulmonary Telemetry",
      "createdAt": 1716980000000
    }
  }
}
```

---

### 2.2 Patient Profiles Node: `/patients/{patientId}`
Maintains patient demographic information and associated monitoring hardware mappings. In this prototype, there is exactly one patient record (`patient_01`).

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | String | Yes | Unique patient identifier (e.g., "patient_01") |
| `fullName` | String | Yes | Full legal name of the patient (e.g., "Eleanor Vance") |
| `age` | Number | Yes | Patient age in years |
| `gender` | String | Yes | Biological sex / gender ("Female" \| "Male" \| "Other") |
| `assignedDeviceId` | String | Yes | Hardware device ID currently bound to the patient (e.g., "esp8266_01") |
| `assignedDoctorId` | String | Yes | Firebase Auth UID of the supervising physician |
| `admissionDate` | String | Yes | ISO 8601 admission date (e.g., "2026-11-15") |
| `roomBed` | String | Yes | Physical clinic or room location (e.g., "Telemetry Suite B-12") |

#### Sample JSON:
```json
{
  "patients": {
    "patient_01": {
      "patientId": "patient_01",
      "fullName": "Eleanor Vance",
      "age": 64,
      "gender": "Female",
      "assignedDeviceId": "esp8266_01",
      "assignedDoctorId": "doc_firebase_uid_12345",
      "admissionDate": "2026-11-15",
      "roomBed": "Telemetry Suite B-12"
    }
  }
}
```

---

### 2.3 Devices Node: `/devices/{deviceId}`
Tracks the operational and connectivity state of the NodeMCU ESP8266 hardware unit.

| Field | Type | Required | Description |
|---|---|---|---|
| `deviceId` | String | Yes | Hardware identifier (e.g., "esp8266_01") |
| `macAddress` | String | Yes | Factory MAC address of the ESP-12E Wi-Fi module |
| `firmwareVersion` | String | Yes | Semantic version string of running C++ firmware (e.g., "1.0.0") |
| `lastSeen` | Number | Yes | Epoch timestamp (milliseconds) of most recent device heartbeat |
| `ipAddress` | String | No | Local LAN IP assigned by DHCP router (e.g., "192.168.1.104") |
| `rssi` | Number | No | Received Signal Strength Indicator in dBm (e.g., -62) |
| `uptimeSeconds` | Number | Yes | Continuous runtime of the microcontroller since last boot |
| `status` | String | Yes | Edge-reported status ("ONLINE" \| "OFFLINE" \| "STANDBY") |

#### Sample JSON:
```json
{
  "devices": {
    "esp8266_01": {
      "deviceId": "esp8266_01",
      "macAddress": "84:F3:EB:4B:92:1A",
      "firmwareVersion": "1.0.0",
      "lastSeen": 1716987450000,
      "ipAddress": "192.168.1.104",
      "rssi": -64,
      "uptimeSeconds": 1420,
      "status": "ONLINE"
    }
  }
}
```

---

### 2.4 Latest Vitals Node: `/vitals/latest/{patientId}`
Represents the current, instantaneous vital readings for real-time presentation. The web dashboard subscribes directly to this node for sub-second updates.

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | String | Yes | Patient identifier (e.g., "patient_01") |
| `deviceId` | String | Yes | Originating hardware device ID |
| `heartRate` | Number | Yes | Instantaneous Heart Rate in Beats Per Minute (BPM) |
| `temperature` | Number | Yes | Instantaneous Body Temperature in Degrees Celsius (°C) |
| `status` | String | Yes | Derived overall status: "NORMAL" \| "WARNING" \| "ABNORMAL" |
| `timestamp` | Number | Yes | Epoch timestamp (milliseconds) when reading was captured |

#### Sample JSON:
```json
{
  "vitals": {
    "latest": {
      "patient_01": {
        "patientId": "patient_01",
        "deviceId": "esp8266_01",
        "heartRate": 74,
        "temperature": 36.6,
        "status": "NORMAL",
        "timestamp": 1716987450000
      }
    }
  }
}
```

---

### 2.5 Historical Vitals Node: `/vitals/history/{patientId}/{timestampId}`
Maintains an append-only time series of vital sign readings utilized by Recharts to plot historical trend lines. To maintain low database overhead, historical snapshots are appended at throttled intervals (e.g., every 10–15 seconds) or on significant delta.

| Field | Type | Required | Description |
|---|---|---|---|
| `timestamp` | Number | Yes | Epoch timestamp (milliseconds) representing chronological key |
| `heartRate` | Number | Yes | Heart Rate reading (BPM) |
| `temperature` | Number | Yes | Body Temperature reading (°C) |
| `status` | String | Yes | Status classification at that specific point in time |

#### Sample JSON:
```json
{
  "vitals": {
    "history": {
      "patient_01": {
        "1716987420000": {
          "timestamp": 1716987420000,
          "heartRate": 72,
          "temperature": 36.5,
          "status": "NORMAL"
        },
        "1716987435000": {
          "timestamp": 1716987435000,
          "heartRate": 76,
          "temperature": 36.6,
          "status": "NORMAL"
        },
        "1716987450000": {
          "timestamp": 1716987450000,
          "heartRate": 74,
          "temperature": 36.6,
          "status": "NORMAL"
        }
      }
    }
  }
}
```

---

### 2.6 Alerts Node: `/alerts/{patientId}/{alertId}`
Records discrete clinical threshold breaches and warnings. Provides an audit trail for attending physicians.

| Field | Type | Required | Description |
|---|---|---|---|
| `alertId` | String | Yes | Unique alert identifier (e.g., "alt_1716987450000") |
| `patientId` | String | Yes | Target patient identifier |
| `parameter` | String | Yes | Breached physiological parameter ("HEART_RATE" \| "TEMPERATURE") |
| `value` | Number | Yes | Exact sensor reading that triggered the alert |
| `severity` | String | Yes | Alert level ("WARNING" \| "ABNORMAL") |
| `message` | String | Yes | Human-readable clinical description (e.g., "High Heart Rate: 118 BPM") |
| `timestamp` | Number | Yes | Epoch timestamp (milliseconds) when anomaly occurred |
| `acknowledged` | Boolean | Yes | Flag indicating whether the physician has reviewed the alert |
| `acknowledgedAt`| Number | No | Epoch timestamp of physician acknowledgment |

#### Sample JSON:
```json
{
  "alerts": {
    "patient_01": {
      "alt_1716987465000": {
        "alertId": "alt_1716987465000",
        "patientId": "patient_01",
        "parameter": "HEART_RATE",
        "value": 118,
        "severity": "ABNORMAL",
        "message": "High Heart Rate Detected (118 BPM exceeds 115 BPM abnormal threshold)",
        "timestamp": 1716987465000,
        "acknowledged": false,
        "acknowledgedAt": null
      }
    }
  }
}
```

---

### 2.7 Demonstration Thresholds Node: `/thresholds/{patientId}`
Contains configurable baseline limits for physiological classification. Decoupling thresholds into a dedicated node enables dynamic threshold adjustments without hardcoding values in UI or firmware.

| Field | Type | Default Value | Description |
|---|---|---|---|
| `heartRateMinNormal` | Number | 60 | Minimum baseline normal BPM |
| `heartRateMaxNormal` | Number | 100 | Maximum baseline normal BPM |
| `heartRateMinWarning` | Number | 50 | Low warning threshold (50–59 BPM) |
| `heartRateMaxWarning` | Number | 115 | High warning threshold (101–115 BPM) |
| `tempMinNormal` | Number | 35.0 | Minimum baseline normal temperature (°C) |
| `tempMaxNormal` | Number | 38.0 | Maximum baseline normal temperature (°C) |
| `tempMinWarning` | Number | 34.0 | Low warning threshold (34.0–34.9 °C) |
| `tempMaxWarning` | Number | 38.9 | High warning threshold (38.1–38.9 °C) |

#### Sample JSON:
```json
{
  "thresholds": {
    "patient_01": {
      "heartRateMinNormal": 60,
      "heartRateMaxNormal": 100,
      "heartRateMinWarning": 50,
      "heartRateMaxWarning": 115,
      "tempMinNormal": 35.0,
      "tempMaxNormal": 38.0,
      "tempMinWarning": 34.0,
      "tempMaxWarning": 38.9
    }
  }
}
```

---

## 3. Database Security Rules (Proposed Architecture)

The following security rules define authentication, authorization, and data validation boundaries for the Firebase Realtime Database:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    
    "doctors": {
      "$doctorId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $doctorId"
      }
    },
    
    "patients": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    
    "devices": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null || auth.token.device === true"
      }
    },
    
    "vitals": {
      "latest": {
        "$patientId": {
          ".read": "auth != null",
          ".write": "auth != null || auth.token.device === true",
          ".validate": "newData.hasChildren(['heartRate', 'temperature', 'timestamp', 'deviceId', 'status'])"
        }
      },
      "history": {
        "$patientId": {
          ".read": "auth != null",
          ".write": "auth != null || auth.token.device === true",
          ".indexOn": ["timestamp"]
        }
      }
    },
    
    "alerts": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".indexOn": ["timestamp", "severity", "acknowledged"]
      }
    },
    
    "thresholds": {
      "$patientId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 4. Proposed vs. Finalized Decisions

- **Proposed:** Dedicated custom claims (`auth.token.device === true`) for ESP8266 edge device authentication via Firebase Auth REST login.
- **Proposed:** Real-time query limit of 50 samples for `/vitals/history` to ensure lightweight DOM rendering.
- **Finalized:** Database region strictly in Singapore (`asia-southeast1`).
- **Finalized:** Single-doctor, single-patient, single-device model.
- **Finalized:** Shallow JSON structure separating instantaneous latest vitals from time-series history to prevent bandwidth bloat.
