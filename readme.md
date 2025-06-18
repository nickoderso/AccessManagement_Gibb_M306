# Access Management System - Gruppe Gilgen M306

Eine moderne Webanwendung zur Verwaltung und Visualisierung von Active Directory-Berechtigungen und Organisationsstrukturen.

## 📋 Inhaltsverzeichnis

- [Projektübersicht](#projektübersicht)
- [Features](#features)
- [Technologie-Stack](#technologie-stack)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Verwendung](#verwendung)
- [Projektstruktur](#projektstruktur)
- [Komponenten](#komponenten)
- [Authentication](#authentication)
- [State Management](#state-management)
- [UI/UX](#uiux)
- [Deployment](#deployment)
- [Mitwirkende](#mitwirkende)
- [Lizenz](#lizenz)

## 🚀 Projektübersicht

Das Access Management System ist eine Next.js-basierte Webanwendung, die entwickelt wurde, um die Verwaltung von Benutzerberechtigungen und Organisationsstrukturen in Active Directory-Umgebungen zu vereinfachen. Das System bietet eine intuitive Benutzeroberfläche zur Visualisierung und Bearbeitung von Berechtigungen auf verschiedenen Organisationsebenen.

### Hauptziele:

- **Vereinfachte Benutzerverwaltung**: Intuitive Oberfläche für die Verwaltung von Benutzern und deren Berechtigungen
- **Organisationsstruktur-Visualisierung**: Klare Darstellung von Unternehmenshierarchien
- **Sicherheit**: Robuste Authentifizierung und Autorisierung
- **Benutzerfreundlichkeit**: Moderne, responsive Benutzeroberfläche

## ✨ Features

### 🔐 Authentication & Authorization

- **Firebase Authentication**: Sichere Benutzeranmeldung und -registrierung
- **Passwort-Reset**: E-Mail-basierte Passwort-Wiederherstellung
- **Session Management**: Automatische Session-Verwaltung mit lokaler Speicherung
- **Route Protection**: Geschützte Routen mit AuthGuard-Komponente

### 👥 Benutzerverwaltung

- **Benutzerprofile**: Vollständige Verwaltung von Benutzerdaten
- **Rollenverwaltung**: Zuweisung und Verwaltung von Benutzerrollen
- **Berechtigungssystem**: Granulare Kontrolle über Benutzerberechtigungen
- **Entity-Management**: Verwaltung verschiedener Organisationsebenen

### 🏢 Organisationsstruktur

- **Hierarchische Darstellung**:
  - Unternehmen (Company)
  - Tochterunternehmen (Subcompany)
  - Abteilungen (Department)
  - Teams (Team)
  - Mitarbeiter (Employee)
- **Dynamic Entity Editing**: Live-Bearbeitung von Organisationseinheiten
- **Permission Mapping**: Zuordnung von Berechtigungen zu Organisationsebenen

### 📊 Dashboard & Visualisierung

- **Interaktives Dashboard**: Übersichtliche Darstellung aller wichtigen Informationen
- **Responsive Design**: Optimiert für Desktop und mobile Geräte
- **Dark/Light Mode**: Anpassbare Benutzeroberfläche
- **Real-time Updates**: Live-Aktualisierungen der Daten

### 🔔 Notification System

- **Toast Notifications**: Benutzerfreundliche Benachrichtigungen
- **Success/Error Handling**: Klare Rückmeldungen bei Aktionen
- **Customizable Notifications**: Anpassbare Benachrichtigungstypen

## 🛠 Technologie-Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)**: React-Framework mit App Router
- **[React 18](https://reactjs.org/)**: Komponentenbasierte UI-Bibliothek
- **[TypeScript](https://www.typescriptlang.org/)**: Typisierte JavaScript-Entwicklung
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS Framework

### UI Components

- **[Radix UI](https://www.radix-ui.com/)**: Headless UI-Komponenten
- **[Lucide React](https://lucide.dev/)**: Moderne Icon-Bibliothek
- **Custom UI Components**: Maßgeschneiderte Komponenten-Bibliothek

### Backend & Database

- **[Firebase](https://firebase.google.com/)**: Backend-as-a-Service
  - **Authentication**: Benutzerverwaltung
  - **Firestore**: NoSQL-Datenbank
  - **Hosting**: Web-Hosting (optional)

### State Management

- **[Zustand](https://github.com/pmndrs/zustand)**: Lightweight State Management
- **React Context**: Für Authentication und Notifications

### Development Tools

- **ESLint**: Code-Qualität und -Konsistenz
- **Prettier**: Code-Formatierung
- **TypeScript**: Statische Typisierung

## 📦 Installation

### Voraussetzungen

- Node.js (Version 18.0 oder höher)
- npm oder yarn
- Git
- Firebase-Konto

### Schritt-für-Schritt Installation

1. **Repository klonen**

```bash
git clone https://github.com/your-username/AccessManagement_Gibb_M306.git
cd AccessManagement_Gibb_M306
```

2. **Dependencies installieren**

```bash
npm install
# oder
yarn install
```

3. **Umgebungsvariablen konfigurieren**

```bash
cp .env.example .env.local
```

4. **Firebase konfigurieren** (siehe [Konfiguration](#konfiguration))

5. **Development Server starten**

```bash
npm run dev
# oder
yarn dev
```

6. **Anwendung öffnen**

```
http://localhost:3000
```

## ⚙️ Konfiguration

### Firebase Setup

1. **Firebase-Projekt erstellen**

   - Besuchen Sie die [Firebase Console](https://console.firebase.google.com/)
   - Erstellen Sie ein neues Projekt
   - Aktivieren Sie Authentication und Firestore

2. **Environment Variables**
   Erstellen Sie eine `.env.local` Datei:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. **Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /organizations/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Verwendung

### Erste Schritte

1. **Account erstellen**

   - Navigieren Sie zu `/register`
   - Füllen Sie das Registrierungsformular aus
   - Bestätigen Sie Ihre E-Mail-Adresse

2. **Anmelden**

   - Besuchen Sie `/login`
   - Geben Sie Ihre Anmeldedaten ein
   - Sie werden automatisch zum Dashboard weitergeleitet

3. **Dashboard erkunden**
   - Übersicht über alle Organisationsstrukturen
   - Navigation durch verschiedene Hierarchieebenen
   - Bearbeitung von Entitäten und Berechtigungen

### Hauptfunktionen

#### Entity Management

```typescript
// Beispiel: Entity bearbeiten
const handleEditEntity = (entity: Entity) => {
  // Öffnet den Edit-Dialog
  setSelectedEntity(entity);
  setIsEditDialogOpen(true);
};
```

#### Permission Management

```typescript
// Beispiel: Berechtigungen zuweisen
const assignPermission = (entityId: string, permission: Permission) => {
  // Berechtigung zuweisen
  updateEntityPermissions(entityId, permission);
};
```

## 📁 Projektstruktur

```
AccessManagement_Gibb_M306/
├── app/                          # Next.js App Router
│   ├── dashboard/                # Dashboard-Seiten
│   │   └── page.tsx             # Haupt-Dashboard
│   ├── login/                   # Login-Seite
│   ├── register/                # Registrierungs-Seite
│   ├── reset-password/          # Passwort-Reset-Seite
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # Home-Seite (Redirect)
├── components/                   # React-Komponenten
│   ├── auth/                    # Authentifizierungs-Komponenten
│   │   ├── login-form.tsx       # Login-Formular
│   │   ├── register-form.tsx    # Registrierungs-Formular
│   │   └── reset-password-form.tsx # Passwort-Reset-Formular
│   ├── ui/                      # UI-Basis-Komponenten
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── auth-guard.tsx           # Route-Schutz-Komponente
│   ├── dashboard.tsx            # Haupt-Dashboard-Komponente
│   ├── edit-entity-dialog.tsx   # Entity-Bearbeitungs-Dialog
│   ├── footer.tsx               # Footer-Komponente
│   ├── notification-provider.tsx # Notification-Context
│   ├── permission-selector.tsx   # Berechtigungs-Auswahl
│   └── sidebar-new.tsx          # Seitenleiste
├── lib/                         # Utility-Bibliotheken
│   ├── auth-context.tsx         # Authentication-Context
│   ├── firebase.ts              # Firebase-Konfiguration
│   ├── store.ts                 # Zustand Store
│   ├── types.ts                 # TypeScript-Definitionen
│   └── utils.ts                 # Utility-Funktionen
├── styles/                      # CSS-Dateien
│   └── globals.css              # Globale Styles
├── public/                      # Statische Assets
├── .env.local                   # Umgebungsvariablen
├── next.config.js               # Next.js-Konfiguration
├── tailwind.config.js           # Tailwind-Konfiguration
├── tsconfig.json                # TypeScript-Konfiguration
└── package.json                 # Projekt-Dependencies
```

## 🧩 Komponenten

### Core Components

#### AuthGuard

Schützt Routen vor unauthentifizierten Zugriffen:

```typescript
// Verwendung
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

#### NotificationProvider

Stellt Notification-Kontext für die gesamte Anwendung bereit:

```typescript
// Verwendung im Komponenten
const { showNotification } = useNotification();
showNotification({
  title: "Erfolg",
  message: "Aktion erfolgreich ausgeführt",
  type: "success",
});
```

#### EditEntityDialog

Ermöglicht die Bearbeitung von Organisationseinheiten:

```typescript
<EditEntityDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  entity={selectedEntity}
/>
```

### Authentication Components

#### LoginForm

- E-Mail/Passwort-Authentifizierung
- Error-Handling
- Redirect nach erfolgreicher Anmeldung

#### RegisterForm

- Benutzerregistrierung
- Passwort-Bestätigung
- Firestore-Integration

#### ResetPasswordForm

- Passwort-Reset per E-Mail
- Firebase-Integration
- Benutzerfreundliche Rückmeldungen

## 🔐 Authentication

### Firebase Authentication Integration

Das System verwendet Firebase Authentication für:

- **E-Mail/Passwort-Authentifizierung**
- **Passwort-Reset per E-Mail**
- **Session-Management**
- **Benutzerprofile**

### Authentication Flow

1. **Anmeldung**: Benutzer gibt Anmeldedaten ein
2. **Validation**: Firebase validiert Anmeldedaten
3. **Session**: Erfolgreiche Anmeldung erstellt Session
4. **Storage**: User-Daten werden lokal gespeichert
5. **Redirect**: Weiterleitung zum Dashboard

### Protected Routes

```typescript
// AuthGuard implementiert Route-Schutz
const publicPaths = ["/login", "/register", "/reset-password"];

// Automatische Weiterleitung basierend auf Authentication-Status
if (!user && !isPublicPath) {
  router.push("/login");
} else if (user && isPublicPath) {
  router.push("/dashboard");
}
```

## 📊 State Management

### Zustand Store

Das System verwendet Zustand für State Management:

```typescript
// Beispiel Store-Struktur
interface OrgStore {
  entities: Entity[];
  updateEntity: (entity: Entity) => void;
  addEntity: (entity: Entity) => void;
  removeEntity: (entityId: string) => void;
}
```

### Context Providers

#### AuthContext

Verwaltet Authentifizierungsstatus:

```typescript
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});
```

#### NotificationContext

Verwaltet Benachrichtigungen:

```typescript
const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});
```

## 🎨 UI/UX

### Design System

#### Farben

- **Primary**: Hauptfarbe für Aktionen und Hervorhebungen
- **Secondary**: Sekundäre UI-Elemente
- **Muted**: Gedämpfte Texte und Hintergründe
- **Destructive**: Fehler und Warnungen

#### Typography

- **Headings**: Klare Hierarchie mit verschiedenen Größen
- **Body Text**: Optimiert für Lesbarkeit
- **Captions**: Für Metadaten und Beschreibungen

#### Components

- **Buttons**: Verschiedene Varianten (primary, secondary, outline)
- **Forms**: Konsistente Input-Felder und Validierung
- **Dialogs**: Modale Dialoge für Aktionen
- **Cards**: Strukturierte Inhalts-Container

### Responsive Design

- **Mobile First**: Optimiert für mobile Geräte
- **Breakpoints**: Anpassung an verschiedene Bildschirmgrößen
- **Touch-Friendly**: Optimiert für Touch-Interaktionen

### Dark Mode Support

```css
/* Automatische Dark/Light Mode Unterstützung */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... weitere Dark Mode Variablen */
}
```

## 🚀 Deployment

### Vercel Deployment (Empfohlen)

1. **Repository zu Vercel verbinden**

```bash
npm install -g vercel
vercel login
vercel
```

2. **Environment Variables konfigurieren**

   - Fügen Sie alle Firebase-Variablen hinzu
   - Konfigurieren Sie Production-Einstellungen

3. **Build und Deploy**

```bash
vercel --prod
```

### Alternative Deployment-Optionen

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Environment Variables für Production

```env
# Production Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=production_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=production_project_id
# ... weitere Production-Variablen
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Type Checking

```bash
npm run type-check
```

## 📈 Performance

### Optimierungen

- **Code Splitting**: Automatische Code-Aufteilung durch Next.js
- **Image Optimization**: Next.js Image-Komponente
- **Bundle Analysis**: Bundle-Größen-Überwachung
- **Caching**: Optimierte Caching-Strategien

### Monitoring

- **Core Web Vitals**: Performance-Metriken
- **Error Tracking**: Fehler-Überwachung
- **User Analytics**: Benutzerverhalten-Analyse

## 🔧 Wartung

### Updates

```bash
npm update
npm audit fix
```

### Backup

- **Firestore-Backup**: Regelmäßige Datenbank-Backups
- **Code-Backup**: Git-Repository-Sicherung
- **Environment-Backup**: Konfigurationssicherung

## 🤝 Mitwirkende

### Entwicklungsteam

- **Projektleitung**: Gruppe Gilgen
- **Frontend-Entwicklung**: Nick
- **Backend-Entwicklung**: Mike
- **UI/UX Design**: Lorin

### Beitrag leisten

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushen Sie zum Branch (`git push origin feature/AmazingFeature`)
5. Öffnen Sie einen Pull Request

### Code-Standards

- **TypeScript**: Verwenden Sie TypeScript für alle neuen Dateien
- **ESLint**: Befolgen Sie die ESLint-Regeln
- **Prettier**: Verwenden Sie Prettier für Code-Formatierung
- **Conventional Commits**: Verwenden Sie konventionelle Commit-Nachrichten

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Details finden Sie in der [LICENSE](LICENSE) Datei.

## 📞 Support

### Kontakt

- **E-Mail**: support@accessmanagement-gibb.com
- **Issue Tracker**: GitHub Issues](https://github.com/nickoderso/AccessManagement_Gibb_M306/issues)
- **Dokumentation**: [Wiki](https://github.com/nickoderso/AccessManagement_Gibb_M306/wiki)

### FAQ

**F: Wie kann ich neue Benutzer hinzufügen?**
A: Verwenden Sie das Registrierungsformular oder fügen Sie Benutzer direkt über das Admin-Panel hinzu.

**F: Wie kann ich Berechtigungen verwalten?**
A: Navigieren Sie zum Dashboard, wählen Sie einen Benutzer aus und verwenden Sie den Permission Selector.

---

**Entwickelt von Gruppe Gilgen für das Modul M306**

> Diese Anwendung wurde als Teil des Moduls M306 entwickelt und dient der praktischen Anwendung moderner Webentwicklungs-Technologien im Bereich Access Management.
