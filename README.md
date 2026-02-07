# Expensary | Client Application

A modern, feature-rich React SPA for personal expense tracking and financial management. Built with TypeScript, Vite, and Mantine UI, this application provides an intuitive interface for managing expenses, budgets, and financial statistics.

**Backend Repository:** [money-trace](https://github.com/amittras-pal/money-trace)

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Local Development Setup](#-local-development-setup)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Docker Deployment](#-docker-deployment)
- [VS Code Setup](#-vs-code-setup)

---

## 🛠 Tech Stack

### Core Framework
- **React 18.3** - UI library with hooks and modern features
- **TypeScript 5.3** - Type-safe development
- **Vite 7** - Fast build tool with HMR using SWC plugin

### UI & Styling
- **Mantine 8.3** - Component library with hooks and utilities
- **SASS** - CSS preprocessor for styling
- **Tabler Icons** - Icon system
- **Josefin Sans** - Custom web font

### State & Data Management
- **TanStack Query (React Query) 4.28** - Server state management
- **React Router 6.9** - Client-side routing
- **React Hook Form 7.43** - Form state management with Yup validation
- **Axios 1.12** - HTTP client

### Data Visualization & Tables
- **AG Grid 29.2** - Enterprise-grade data grid
- **ECharts 5.6** - Interactive charting library

### Additional Libraries
- **Day.js** - Date manipulation and formatting
- **React Markdown** - Markdown rendering
- **React Highlight Words** - Text highlighting

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18.0 or higher
- **npm** or **pnpm**
- Backend API running ([setup guide](https://github.com/amittras-pal/money-trace#local-setup-for-development))

### Install and Run
```bash
# Clone the repository
git clone https://github.com/amittras-pal/expensary.git
cd expensary

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 🚀 Local Development Setup

### 1. Clone and Install
```bash
git clone https://github.com/amittras-pal/expensary.git
cd expensary
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:6400
VITE_APP_TITLE=Expensary
NODE_ENV=development
```

See [Environment Variables](#-environment-variables) section for details.

### 3. Start Backend Service
Ensure the backend API is running before starting the frontend. Follow the [backend setup guide](https://github.com/amittras-pal/money-trace#local-setup-for-development).

### 4. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173` with hot module replacement enabled.

---

## 🔧 Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL (without `/api` suffix) | `http://localhost:6400` | ✅ |
| `VITE_APP_TITLE` | Application title displayed in header | `Expensary` | ✅ |
| `NODE_ENV` | Node environment | `development` | ❌ |

**Note:** All Vite environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run serve` | Preview production build locally |
| `npm run type-check` | Run TypeScript type checking |
| `npm run type-check:watch` | Run type checking in watch mode |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

---

## 🐳 Docker Deployment

### Build Image Locally
```bash
docker build -t expensary:latest .
```

### Run Container
```bash
docker run -p 8080:80 expensary:latest
```

Access the app at `http://localhost:8080`

### GitHub Container Registry

Images are automatically built and published to GHCR via GitHub Actions:

```bash
# Pull latest image
docker pull ghcr.io/amittras-pal/expensary:latest

# Run container
docker run -p 8080:80 ghcr.io/amittras-pal/expensary:latest
```

**Available tags:** `latest`, `main`, `v*.*.*` (semver), commit SHAs

---

## 💻 VS Code Setup

### Recommended Extensions

#### Code Quality & DX
- [**GitLens**](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Enhanced Git integration and blame information
- [**Prettier**](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatter (configured in project)
- [**ESLint**](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - JavaScript/TypeScript linting
- [**Todo Tree**](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) - Track TODO, FIXME comments
- [**Error Lens**](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) - Inline error highlighting

#### TypeScript & React
- [**TypeScript Vue Plugin (Volar)**](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - Enhanced TS support
- [**ES7+ React Snippets**](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) - React code snippets
- [**Auto Import**](https://marketplace.visualstudio.com/items?itemName=steoates.autoimport) - Automatic import management

#### Visual Enhancements
- [**Material Icon Theme**](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) - File/folder icons
- [**Carbon Product Icons**](https://marketplace.visualstudio.com/items?itemName=antfu.icons-carbon) - Application icons
- [**One Dark Pro**](https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme) - Color theme

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## 📝 Project Structure

```
src/
├── components/        # Reusable UI components
├── modules/          # Feature modules (auth, expenses, plans, etc.)
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── context/          # React context providers
├── utils/            # Helper functions
├── schemas/          # Yup validation schemas
├── constants/        # Constants and configuration
├── theme/            # SASS styles and theme
└── types.d.ts        # Global TypeScript definitions
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a pull request

---

## 📄 License

This project is private and proprietary.

---

## 🔗 Related Projects

- **Backend API:** [money-trace](https://github.com/amittras-pal/money-trace)
