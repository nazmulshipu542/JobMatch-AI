import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, Job, Application, AuthContextType } from './types';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { JobBoard } from './pages/JobBoard';
import { JobDetails } from './pages/JobDetails';
import { MockBackend } from './services/mockBackend';
import { UserCircle, Briefcase, LogOut, Menu, X } from 'lucide-react';

// --- Auth Context ---
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    MockBackend.updateUser(newUser); // Persist to mock DB
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobBoard />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    {user?.role === 'employer' ? <EmployerDashboard /> : <CandidateDashboard />}
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthContext.Provider>
  );
}

// --- Components ---

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
            <Briefcase className="w-6 h-6" />
            <span>JobMatch AI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className={`hover:text-indigo-200 ${location.pathname === '/jobs' ? 'text-white font-semibold' : 'text-indigo-100'}`}>Browse Jobs</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className={`hover:text-indigo-200 ${location.pathname === '/dashboard' ? 'text-white font-semibold' : 'text-indigo-100'}`}>Dashboard</Link>
                <div className="flex items-center space-x-2 bg-indigo-700 px-3 py-1.5 rounded-full">
                  <UserCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button onClick={logout} className="hover:text-red-300 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="px-4 py-2 hover:text-indigo-200 font-medium">Log In</Link>
                <Link to="/register" className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition-colors shadow-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-700 px-4 pt-2 pb-4 space-y-2">
          <Link to="/jobs" className="block px-3 py-2 rounded-md hover:bg-indigo-600">Browse Jobs</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md hover:bg-indigo-600">Dashboard</Link>
              <div className="block px-3 py-2 text-indigo-200">Signed in as {user.name}</div>
              <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md hover:bg-indigo-600 text-red-300">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-md hover:bg-indigo-600">Log In</Link>
              <Link to="/register" className="block px-3 py-2 rounded-md hover:bg-indigo-600 bg-indigo-800">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-8">
      <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full animate-bounce">
        <Briefcase className="w-12 h-12" />
      </div>
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
        Find Your Dream Job with <span className="text-indigo-600">AI</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl">
        JobMatch AI connects employers and candidates using advanced Gemini AI to match resumes with job descriptions accurately.
      </p>
      <div className="flex space-x-4">
        <Link to="/jobs" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          Browse Jobs
        </Link>
        <Link to="/register" className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md">
          Post a Job
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
        <FeatureCard 
          icon="📄" 
          title="Resume Analysis" 
          desc="Upload your PDF resume and let our AI extract your key skills and experience automatically." 
        />
        <FeatureCard 
          icon="🎯" 
          title="Smart Matching" 
          desc="Get a compatibility score for every job application based on your unique profile." 
        />
        <FeatureCard 
          icon="🚀" 
          title="Fast Applying" 
          desc="Apply to suitable jobs with a single click once your profile is set up." 
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8 text-center">
      <p>&copy; {new Date().getFullYear()} JobMatch AI. Powered by Nazmul, Ishrak & Jamil.</p>
    </footer>
  );
}

function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}