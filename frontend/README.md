# Patient Telemetry Clinical Dashboard (Frontend)

A modern, responsive, clinical web dashboard built with React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Recharts.

---

## 1. Architecture & Component Hierarchy

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             # Collapsible clinical navigation (Overview, Monitoring, Alerts, Settings)
│   │   │   ├── TopNav.tsx              # Page title, patient chip, device status, doctor identity
│   │   │   └── DashboardLayout.tsx     # Shell container coordinating Sidebar & TopNav
│   │   ├── dashboard/
│   │   │   ├── PatientBanner.tsx       # Demographic summary (Name, Age, ID, Room, Device ID)
│   │   │   ├── OverallStatusBanner.tsx # Composite clinical status (NORMAL, WARNING, ABNORMAL)
│   │   │   ├── VitalCard.tsx           # Reusable metric card (BPM and °C) with status badges & limits
│   │   │   ├── HeartRateChart.tsx      # Recharts line chart with threshold bands (60–100 BPM)
│   │   │   ├── TemperatureChart.tsx    # Recharts line chart with threshold bands (35.0–38.0 °C)
│   │   │   ├── AlertsFeed.tsx          # Real-time alert notifications & acknowledgment audit
│   │   │   ├── DeviceStatusCard.tsx    # NodeMCU ESP8266 telemetry, Wi-Fi RSSI, and heartbeat monitor
│   │   │   └── ThresholdsModal.tsx     # Configurable clinical demonstration threshold manager
│   │   └── ui/                         # shadcn/ui primitives
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       └── alert.tsx
│   ├── types/
│   │   ├── vitals.ts                   # VitalReading, PhysiologicalStatus, VitalThresholds, ChartDataPoint
│   │   ├── patient.ts                  # PatientProfile, DoctorProfile
│   │   ├── device.ts                   # DeviceTelemetry, ConnectivityStatus
│   │   └── alerts.ts                   # AlertRecord
│   ├── data/
│   │   └── mockData.ts                 # Synthetic demonstration dataset (separated from application logic)
│   ├── lib/
│   │   ├── utils.ts                    # Classname merger (clsx, twMerge) & time/date formatters
│   │   └── thresholdEvaluator.ts       # Pure threshold evaluation functions
│   ├── pages/
│   │   └── DashboardPage.tsx           # Composed primary clinical monitoring view
│   ├── App.tsx                         # Root app coordinator
│   ├── main.tsx                        # React DOM root entry
│   └── index.css                       # Tailwind directives & base styles
├── tailwind.config.js                  # Clinical color tokens & typography
├── vite.config.ts                      # Bundler config & path aliases (@/*)
├── tsconfig.json                       # TypeScript compiler settings
└── package.json                        # Dependencies & scripts
```

---

## 2. Technology Stack

- **Framework:** React 18+ (TypeScript)
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS (Custom clinical palette: Deep Navy, Medical Blue, Muted Teal, Status Green/Amber/Red)
- **Component Primitives:** shadcn/ui (Card, Badge, Button, Alert)
- **Data Visualization:** Recharts (BPM and Temperature time-series charts with threshold reference lines)
- **Icons:** Lucide React

---

## 3. How to Run Locally

### Development Server:
```bash
cd frontend
npm run dev
```
The application will start at `http://localhost:3000`.

### Production Build:
```bash
cd frontend
npm run build
npm run preview
```

---

## 4. Current Milestone Status

- **Phase 2 Complete:** Frontend foundation and visual dashboard implemented with synthetic baseline telemetry.
- **Next Phase (Phase 3):** Doctor Authentication Module (Firebase Auth sign-in and route protection).
