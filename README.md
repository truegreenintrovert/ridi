# Ridi Hospital Management System

Ridi Hospital Management System (HMS) is a modern, full-stack application for managing hospital operations, including patient records, appointments, prescriptions, lab tests, staff, inventory, and billing. Built with React, Supabase, Electron, and Tailwind CSS, it provides a responsive and user-friendly interface for healthcare providers.

## Features

- **Authentication**: Secure sign-in/sign-up with email/password and Google.
- **Dashboard**: Overview of key hospital statistics.
- **Patients**: Add, edit, search, and view detailed patient profiles and health records.
- **Doctors & Staff**: Manage doctor and staff information, shifts, and contact details.
- **Appointments**: Schedule and track patient appointments.
- **Prescriptions**: Create, update, and export medical prescriptions as PDFs.
- **Lab Tests**: Manage lab test orders, upload/view reports, and track statuses.
- **Inventory**: Track medicines and medical supplies.
- **Payments & Invoices**: Record payments, generate and download invoices.
- **Profile & Settings**: Update user profile, change password, and manage system settings.
- **Export/Print**: Export patient records, health records, and prescriptions as PDF documents.
- **Notifications**: Toast notifications for actions and errors.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Supabase (Database, Auth, Storage)
- **Desktop**: Electron (optional, for desktop builds)
- **PDF Generation**: jsPDF
- **Other**: date-fns, Radix UI, class-variance-authority

## Project Structure

```
.
├── electron/
│   └── main.js
├── public/
│   └── .htaccess
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── HealthRecordHistory.jsx
│   │   ├── Invoice.jsx
│   │   ├── Layout.jsx
│   │   ├── PatientDataView.jsx
│   │   ├── PatientDetailsModal.jsx
│   │   ├── PatientForm.jsx
│   │   ├── PatientSearch.jsx
│   │   ├── PaymentForm.jsx
│   │   ├── PaymentStats.jsx
│   │   ├── ThemeProvider.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── ViewPatientDialog.jsx
│   │   └── ui/
│   ├── contexts/
│   ├── lib/
│   └── pages/
├── .env
├── .eslintrc.json
├── .gitignore
├── capacitor.config.json
├── index.html
├── LICENSE
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase](https://supabase.com/) project (for backend)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/ridi.git
   cd ridi
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase credentials.

4. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

5. **(Optional) Run as Electron desktop app:**
   ```sh
   npm run electron:dev
   ```

### Build

- **Web build:**
  ```sh
  npm run build
  ```
- **Electron build:**
  ```sh
  npm run electron:build
  ```

## Usage

- Access the app at `http://localhost:5173` (default Vite port).
- Sign up or sign in to start using the system.
- Navigate using the sidebar to manage patients, staff, appointments, lab tests, inventory, and more.

## Customization

- **Styling:** Tailwind CSS is used for styling. Modify `tailwind.config.js` and `src/index.css` as needed.
- **Supabase:** Update [`src/lib/supabase.js`](src/lib/supabase.js) and your `.env` file for your Supabase project.
- **PDF Templates:** PDF generation logic can be customized in [`src/components/Invoice.jsx`](src/components/Invoice.jsx) and related files.

## License

This project is licensed under the MIT License.

---

*For any questions or support, please contact the project maintainer.*


