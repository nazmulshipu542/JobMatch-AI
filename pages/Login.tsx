import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { User, Role } from '../types';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Fake password for demo
  const [role, setRole] = useState<Role>('candidate');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Login
    const mockUser: User = {
      id: role === 'employer' ? 'emp_1' : 'cand_1',
      name: role === 'employer' ? 'Acme Corp HR' : 'John Doe',
      email: email,
      role: role,
      resumeText: role === 'candidate' ? undefined : undefined
    };
    login(mockUser);
    
    // Redirect back or to dashboard
    const from = (location.state as any)?.from || '/dashboard';
    navigate(from);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex gap-4 p-2 bg-gray-50 rounded-lg">
             <label className="flex items-center space-x-2 cursor-pointer">
                 <input type="radio" checked={role === 'candidate'} onChange={() => setRole('candidate')} className="text-indigo-600" />
                 <span className="text-sm font-medium text-gray-700">Candidate</span>
             </label>
             <label className="flex items-center space-x-2 cursor-pointer">
                 <input type="radio" checked={role === 'employer'} onChange={() => setRole('employer')} className="text-indigo-600" />
                 <span className="text-sm font-medium text-gray-700">Employer</span>
             </label>
          </div>

          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md">
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}