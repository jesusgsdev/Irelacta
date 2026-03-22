# 🌸 Irelacta

> **Postnatal care, beautifully simple** – a browser-based platform connecting healthcare consultants with new mums.

---

## What is Irelacta?

Irelacta is a lightweight postnatal care demo application. It provides two role-based dashboards:

- **Consultant** – manage mum (patient) profiles, record and review consultations, and track care history.
- **Mum** – view your own profile and read your consultation history in a calm, easy-to-use interface.

All data is stored in the browser's `localStorage`. No server, no database, no installation required.

---

## Getting Started

1. **Clone or download** this repository.
2. **Open `index.html`** in any modern web browser (Chrome, Firefox, Safari, Edge).
3. The app will auto-load with demo data on the first run.
4. Log in using the credentials below.

---

## Demo Credentials

### 👩‍⚕️ Consultant

| Username     | Password   | Name               |
|--------------|------------|--------------------|
| `consultant` | `demo1234` | Dr. Sarah O'Brien  |

### 🍼 Mum profiles

| Username | Password   | Name          | Baby   |
|----------|------------|---------------|--------|
| `emma`   | `demo1234` | Emma Thompson | Oliver |
| `lily`   | `demo1234` | Lily García   | Sofia  |

> **Note:** When the consultant adds a new mum, a unique login is auto-generated and shown in a one-time pop-up. The username is also visible on the mum's profile card in the consultant dashboard.

---

## How to Use the App

### As a Consultant

1. Log in with the **Consultant** tab selected (username: `consultant`, password: `demo1234`).
2. The **My Clients** dashboard shows all registered mums and a summary of statistics.
3. **Click any mum card** to open her full profile, view her consultation history, or add a new consultation record.
4. Use the **➕ Add new mum** button to register a new patient – a login is automatically created and shown to you.
5. Use the **✏️ Edit profile** button on a mum's profile to update her details.
6. Delete individual consultations with the 🗑 button on each consultation card.
7. Use the search bar to filter mums by name, email, or baby name.

### As a Mum

1. Log in with the **Mum** tab selected (e.g. username: `emma`, password: `demo1234`).
2. Your **My Consultations** dashboard shows your profile and your full consultation history.
3. The view is read-only; your consultant manages your records.

---

## Features

| Feature                              | Consultant | Mum |
|--------------------------------------|:----------:|:---:|
| View all mum profiles                | ✅          | —   |
| Search mums by name / email / baby   | ✅          | —   |
| Add new mum profile                  | ✅          | —   |
| Edit mum profile                     | ✅          | —   |
| View mum's login username            | ✅          | —   |
| Add consultation record              | ✅          | —   |
| Delete consultation record           | ✅          | —   |
| View consultation history            | ✅          | ✅  |
| View own profile                     | —           | ✅  |
| Dashboard statistics                 | ✅          | —   |

---

## Tech Notes

- **Stack:** Vanilla HTML5, CSS3, and JavaScript (no frameworks or build tools).
- **Persistence:** Browser `localStorage` – data is per-device and per-browser.
- **Security note:** This is a demo app. Passwords are stored in plain text in `localStorage`. Do **not** use real credentials or deploy this as-is in production.
- **Reset data:** Clear `localStorage` in your browser's developer tools to reset to the demo data on next page load.
