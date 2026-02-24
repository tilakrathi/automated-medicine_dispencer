# Automated Medicine Dispenser

A web application paired with an ESP32 device that automates daily medication schedules. The idea came from a common problem — people forget to take their medicine, or caregivers struggle to manage multiple patients. This project tries to solve that with a simple interface backed by a physical dispenser.

## Live

https://automated-medicine-dispencer.vercel.app/login

## What it does

The dispenser holds up to 8 medication slots. Through the web app, you schedule when each slot should dispense, and the ESP32 handles the rest. Every dose is logged, so you can see whether medicine was taken on time, missed, or dispensed manually. Caregivers get a shared view across the patients they manage.

The stack is Next.js 15 with Supabase for auth and storage. The ESP32 communicates with the backend over REST. A Python simulator is included if you want to test the device integration without physical hardware.

## Getting started

**Prerequisites:** Node.js 18+, pnpm, a Supabase project

```bash
# 1. Clone the repo
git clone https://github.com/tilakrathi/AutometedMedecineDispencer.git
cd AutometedMedecineDispencer

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key in .env.local

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up with your Supabase credentials.

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Project structure

```
app/               Next.js pages and API routes
  api/             REST endpoints (schedules, device, logs, auth)
  dashboard/       Daily overview and device status
  schedule/        Manage medication schedules
  logs/            History and adherence tracking
  login/           Authentication page
components/        Shared UI components (shadcn/ui)
lib/               Supabase client and API utilities
scripts/           ESP32 Python simulator
```

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Demo login (dev only) |
| GET/POST/PUT/DELETE | `/api/schedules` | Manage medication schedules |
| GET/POST | `/api/device/status` | Device health and connectivity |
| POST | `/api/device/sync` | Push schedules to ESP32 |
| POST | `/api/device/dispense` | Trigger manual dispense |
| GET/POST | `/api/logs` | Medication event history |

## ESP32 integration

The ESP32 polls `/api/schedules` to get the active schedule and posts to `/api/device/status` to report battery, WiFi, temperature, and current slot. When a dose is dispensed, it posts to `/api/logs`.

**Testing without hardware:**

```bash
cd scripts
pip install -r requirements.txt
python esp32_simulator.py
```

The simulator mimics the full device lifecycle — syncing schedules, sending status updates, and logging dispense events.

## ESP32 payload examples

```json
// POST /api/device/status
{
  "deviceId": "ESP32_001",
  "batteryLevel": 85,
  "wifiSignal": -45,
  "temperature": 23.5,
  "currentSlot": 2
}

// POST /api/logs
{
  "medicineName": "Paracetamol",
  "dosage": "2 tablets",
  "scheduledTime": "08:00",
  "actualTime": "08:05",
  "slotNumber": 1,
  "status": "taken",
  "acknowledged": true,
  "deviceId": "ESP32_001"
}
```

## Deployment

```bash
pnpm build
pnpm start
```

For production, make sure your Supabase Row Level Security policies are configured and your ESP32 authenticates requests with an API key header.

## Tech stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **UI components:** shadcn/ui (Radix primitives)
- **Backend:** Next.js API routes
- **Database/Auth:** Supabase
- **Device:** ESP32 over REST

## License

MIT
