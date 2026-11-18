# Guidelines for AI Coding Agents: IoT Patient Health Monitoring System

**Document Version:** 1.0.0  
**Target:** AI Assistants, Coding Agents, and Human Collaborators  
**Enforcement Level:** Mandatory  

---

## 1. Core Principles & Philosophy

As an AI coding agent working in this repository, you operate as a disciplined software engineer within an academic IoT and healthcare software context. You must prioritize code quality, architectural consistency, modularity, security, and adherence to strict project boundaries above velocity.

Every modification must align with the approved system specification and architecture documented in the `docs/` directory.

---

## 2. Mandatory Rules of Engagement

### Rule 1: Read the Documentation Before Implementing Anything
Before generating code, editing files, or proposing architectural modifications, you **must thoroughly read** the relevant project documentation:
- `docs/PROJECT_SPEC.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT_PLAN.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/HARDWARE.md`
- `PROGRESS.md`

Always verify where the project currently sits in the phased roadmap before acting.

### Rule 2: Strictly Follow Approved Project Scope
Do not broaden the scope of this project. The system is engineered as an academic demonstration prototype with:
- Exactly **one (1)** physician account.
- Exactly **one (1)** monitored patient profile.
- Exactly **one (1)** NodeMCU ESP8266 hardware device.
- Exactly **two (2)** physiological parameters: Heart Rate (BPM) and Body Temperature (°C).

### Rule 3: Do Not Introduce Unrequested Features
You are strictly prohibited from implementing or adding scaffolding for:
- ❌ Fall detection or motion tracking (e.g., MPU6050, accelerometers, gyroscopes).
- ❌ Electrocardiogram (ECG) waveforms or front-ends (e.g., AD8232).
- ❌ Blood oxygen saturation (SpO2) sensors (e.g., MAX30100/MAX30102).
- ❌ Blood pressure or blood glucose monitoring.
- ❌ Artificial Intelligence or Machine Learning disease diagnosis or risk prediction.
- ❌ Multi-patient management, patient lists, or hospital ward hierarchies.
- ❌ Patient login portals, family member dashboards, or external guest accounts.
- ❌ Appointment booking, e-prescriptions, clinical notes, or medical billing systems.
- ❌ Auxiliary backend servers (Express, Flask, Fastify, MongoDB, PostgreSQL, Supabase) unless explicitly approved by the project lead.

### Rule 4: Keep Code Modular and Maintainable
- Write small, single-responsibility functions and components.
- Avoid large monolithic files. Break complex UI views into cohesive subcomponents.
- Adhere to the established directory structure in `frontend/src/`:
  - `components/`: Pure presentation and interactive components.
  - `hooks/`: Reusable React hooks encapsulating state and side-effects.
  - `services/`: Encapsulated Firebase, API, and calculation utilities.
  - `types/`: Strong TypeScript interfaces and type definitions.
  - `config/`: Application constants and environment configuration.
- In firmware (`firmware/esp8266/`), separate sensor sampling, Wi-Fi connectivity, and cloud publishing into distinct header and implementation files rather than one giant `.ino` file.

### Rule 5: Follow Consistent Naming Conventions
- **TypeScript/React:**
  - Files for components: PascalCase (e.g., `VitalCard.tsx`, `PatientBanner.tsx`).
  - Hooks: camelCase with `use` prefix (e.g., `useVitals.ts`, `useDevice.ts`).
  - Utility/service files: camelCase (e.g., `firebaseService.ts`, `alertService.ts`).
  - Interfaces/Types: PascalCase (e.g., `VitalReading`, `AlertRecord`).
  - Constants: UPPER_SNAKE_CASE (e.g., `HEART_RATE_MIN_NORMAL`).
- **ESP8266 C++:**
  - File names: snake_case (e.g., `sensors_pulse.h`, `cloud_publisher.cpp`).
  - Function names: camelCase (e.g., `readTemperature()`, `publishTelemetry()`).
  - Constants & macros: UPPER_SNAKE_CASE (e.g., `SAMPLE_INTERVAL_MS`).

### Rule 6: Appropriate Layer Separation
- **UI Components** must never directly call raw Firebase REST endpoints or manipulate raw sockets. They must consume clean React hooks or service functions.
- **Business Logic & Threshold Checks** must reside in dedicated service layers (`services/alertService.ts` or `config/thresholds.ts`), allowing thresholds to be configured or modified in one central location.
- **Firebase Operations** must be encapsulated within `services/firebaseService.ts`.

### Rule 7: Never Expose Secrets or Credentials
- **Never hardcode** Firebase API keys, auth tokens, database secrets, Wi-Fi SSIDs, or Wi-Fi passwords in version-controlled source files.
- Always use environment variables in the frontend (`.env.local` loaded via Vite's `import.meta.env`).
- Provide sanitized templates: `.env.example` for frontend, `config.example.h` for ESP8266 firmware.
- Never commit or expose Firebase service account private keys or database administrator credentials.

### Rule 8: Never Overwrite Completed Modules Without Permission
- Treat finished, verified phases as immutable unless specifically instructed to refactor.
- If an existing function or component needs modification, review its dependents first.
- Do not blindly replace whole files when making targeted bug fixes or additions.

### Rule 9: Explain Important Architectural Decisions
Whenever you make a structural, architectural, or design choice (e.g., introducing a new helper, altering payload formats, selecting a library), explain:
- Why the choice was made.
- What alternatives were evaluated.
- How it adheres to the project specifications.

### Rule 10: Test Changes Before Declaring Completion
- For frontend code: ensure TypeScript compiles cleanly (`pnpm run build`), ESLint passes, and components render without runtime errors.
- For firmware code: ensure syntax validity, memory footprint safety, and adherence to non-blocking `millis()` execution.
- Validate error boundaries, fallback states, and offline/stale indicators.

### Rule 11: Explicitly Report Modified Files
At the conclusion of each turn or feature implementation, provide an unambiguous summary listing:
- Files created.
- Files modified.
- Files deleted (if any).

### Rule 12: Provide Clear Testing Instructions
Every feature or module delivery must conclude with step-by-step instructions for the human developer to test and verify the changes locally.

### Rule 13: Do Not Commit or Push Randomly
- Do not generate fragmented, automated Git commits for every minor edit.
- Group related work into cohesive, milestone-based units.

### Rule 14: Structured Milestone Git Commits
- Git commits must occur only after a meaningful, coherent module is completed and verified against all criteria.
- Use conventional commit messages:
  - `docs:` for documentation updates.
  - `feat:` for complete new features/modules.
  - `fix:` for bug fixes.
  - `refactor:` for code restructurings without behavior changes.
  - `chore:` for tooling or configuration changes.

### Rule 15: Never Push to GitHub Without Explicit User Approval
- **Absolute Rule:** You may run local Git operations (such as `git add`, `git commit`, `git status`) when authorized for milestone completion.
- **NEVER execute `git push` to a remote GitHub repository without the user's explicit, unambiguous written approval.**
- Always prompt the user to inspect the local commit history and grant permission before any network push.
