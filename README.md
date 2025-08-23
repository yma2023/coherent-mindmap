# MindFlow - AI-Integrated Mind Map Application

A modern, collaborative mind mapping application with AI integration, built with React, Supabase, and advanced real-time features.

## 🚀 Features

### Core Functionality
- **Interactive Mind Maps**: Drag-and-drop node placement with automatic tree layout
- **Multiple Node Types**: Text, Image, Link, and Task nodes with checkboxes
- **Real-time Collaboration**: Multi-user editing with WebSocket synchronization
- **AI Integration**: `/ai` command for automatic node generation and idea augmentation
- **Revision History**: Time travel functionality to view and restore previous versions

### Authentication & Security
- **Complete Auth System**: Registration, login, password reset, email verification
- **Protected Routes**: Secure access control with automatic redirects
- **Session Management**: Persistent sessions with automatic token refresh
- **User Profiles**: Customizable user profiles with avatar support

### Modern UI/UX
- **MindMeister-inspired Design**: Professional three-panel layout
- **Responsive Design**: Optimized for desktop and mobile devices
- **Smooth Animations**: Micro-interactions and transitions
- **Dark/Light Themes**: Customizable appearance

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Flow** for interactive node rendering
- **Tailwind CSS** for styling
- **Zustand** for state management with Immer
- **React Router** for navigation
- **Lucide React** for icons

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live collaboration
- **Socket.IO** for WebSocket communication

### AI Integration
- **OpenAI GPT-4** integration ready
- **Structured AI responses** with LangChain support
- **Streaming responses** for real-time AI interaction

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mindflow-app
npm install
```

### 2. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be ready

2. **Get Your Credentials**:
   - Go to Settings > API
   - Copy your `Project URL` and `anon public` key

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run Database Migrations**:
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Run the migrations from `supabase/migrations/` in order:
     1. `create_profiles_table.sql`
     2. `create_mind_maps_table.sql`

### 3. Configure Authentication

In your Supabase Dashboard:

1. **Go to Authentication > Settings**
2. **Configure Site URL**:
   - Site URL: `http://localhost:5173` (for development)
   - Redirect URLs: `http://localhost:5173/**`

3. **Email Settings**:
   - Enable email confirmations if desired
   - Configure SMTP settings for production

### 4. Start Development

```bash
# Start the frontend
npm run dev

# Start the backend server (optional, for WebSocket features)
npm run dev:server

# Start both frontend and backend
npm run dev:full
```

Visit `http://localhost:5173` to see the application.

## 🔐 Authentication Flow

### Registration Process
1. User fills out registration form with email, password, and full name
2. Supabase creates user account and sends confirmation email (if enabled)
3. Database trigger automatically creates user profile
4. User is redirected to dashboard after successful registration

### Login Process
1. User enters email and password
2. Supabase validates credentials and creates session
3. Application fetches user profile and updates global state
4. User is redirected to dashboard or intended page

### Password Reset
1. User requests password reset with email
2. Supabase sends reset link to user's email
3. User clicks link and is redirected to reset form
4. New password is updated in Supabase

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── UserProfile.tsx
│   ├── layout/               # Layout components
│   │   ├── Sidebar.tsx
│   │   └── Toolbar.tsx
│   ├── nodes/                # Mind map node components
│   │   └── TextNode.tsx
│   ├── MindMapCanvas.tsx     # Main canvas component
│   └── Dashboard.tsx         # User dashboard
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── services/
│   ├── authService.ts       # Authentication service
│   └── socketService.ts     # WebSocket service
├── stores/
│   ├── authStore.ts         # Authentication state
│   └── mindMapStore.ts      # Mind map state
├── types/
│   ├── auth.ts              # Authentication types
│   ├── database.ts          # Database types
│   └── index.ts             # General types
└── App.tsx                  # Main application component
```

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own profiles and mind maps
- Collaborators have controlled access to shared maps
- All database operations are secured at the row level

### Authentication Security
- Secure password hashing with Supabase Auth
- JWT tokens with automatic refresh
- Protected routes with authentication guards
- CSRF protection built into Supabase

### Data Validation
- Client-side form validation
- Server-side validation through Supabase
- Type safety with TypeScript
- Input sanitization for XSS prevention

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for custom themes
- Update color schemes in component files
- Add custom CSS in `src/index.css`

### Authentication UI
- Customize forms in `src/components/auth/`
- Modify validation rules in auth service
- Add social login providers through Supabase

### Mind Map Features
- Add new node types in `src/components/nodes/`
- Extend AI integration in `src/services/`
- Customize canvas behavior in `MindMapCanvas.tsx`

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables in your hosting dashboard
4. Update Supabase redirect URLs for production

### Supabase Configuration
1. Update Site URL in Supabase Dashboard
2. Configure production SMTP settings
3. Set up custom domain (optional)
4. Configure rate limiting and security rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **React Flow Docs**: [reactflow.dev](https://reactflow.dev)

## 🎯 Roadmap

- [ ] AI-powered node suggestions
- [ ] Advanced collaboration features
- [ ] Mobile app development
- [ ] Integration with external APIs
- [ ] Advanced export formats
- [ ] Team management features
- [ ] Analytics and insights
- [ ] Offline support with sync

---

Built with ❤️ using React, Supabase, and modern web technologies.