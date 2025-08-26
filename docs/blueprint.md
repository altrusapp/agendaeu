# **App Name**: AgeNails

## Core Features:

- Authentication: Individual authentication for each professional (tenant) using Firebase Auth.
- Data Isolation: Data isolation using 'tenantId' in Firestore for services, schedules, clients, and payments.
- Quick Onboarding: One-click onboarding: selecting name and logo automatically generates a public schedule URL like meusalão.agenda.app.
- Public Scheduling: Simple public scheduling interface: customers view available times and book appointments.
- Dashboard: Authenticated dashboard with agenda, client list, and basic reports (appointments, revenue, attendance).
- WhatsApp Reminders: Automatic WhatsApp reminder tool sent via Cloud Functions: 24 hours and 2 hours before the appointment, reasoning about appointment details before responding.
- Payment Integration: Basic payment integration (Pix or Stripe) for collecting deposits or booking fees during reservation.

## Style Guidelines:

- Primary color: Soft purple (#A088B3) to represent beauty and sophistication.
- Background color: Very light gray (#F5F5F5) to provide a clean and modern feel.
- Accent color: Light teal (#74B49B) to highlight important actions and information.
- Body and headline font: 'PT Sans' (sans-serif) for readability and a modern touch.
- Simple, elegant icons representing different services and actions.
- Mobile-first, clean layout ensuring functionality within 5 minutes of account creation.
- Subtle transitions and animations to enhance user experience without being distracting.