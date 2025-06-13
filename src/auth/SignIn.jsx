import React, { useState } from 'react';
import API_BASE_URL from '../config';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSuccess = (data) => {
    // Store the auth token and its expiry time
    localStorage.setItem('authToken', data.token);
    // Set expiry to 24 hours from now if not provided by backend
    const expiryTime = data.expiresAt || (new Date().getTime() + 24 * 60 * 60 * 1000);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
    // Set authentication flag to true for other components
    localStorage.setItem('isAuthenticated', 'true');
    
    // Reload the page to enter authenticated state
    window.location.reload();
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }
      
      handleSignInSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }
      
      handleSignInSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create base URL for OAuth redirects
  const baseUrl = API_BASE_URL.replace('/api', '');

  return (
    <div className="h-full flex flex-col justify-center items-center text-white bg-black p-4 sm:p-6">
      <div className="flex justify-center mb-6">
        <svg 
          className="w-20 h-20 sm:w-24 sm:h-24" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="10" fill="rgb(251 146 60 / var(--tw-text-opacity, 1))" />
          <text 
            x="50" 
            y="55" 
            fontSize="32" 
            fontWeight="bold" 
            textAnchor="middle" 
            fill="#fff"
            fontFamily="Arial, sans-serif"
            style={{ textTransform: 'uppercase' }}
          >
            LAI
          </text>
          <path 
            d="M30 70 L50 30 L70 70 Z" 
            fill="none" 
            stroke="#222"
            strokeLinecap="round"
            strokeLinejoin="round" 
            strokeWidth="4"
          />
        </svg>
      </div>
      
      <div className="w-full max-w-md p-4 sm:p-6 bg-[#111] rounded-lg mx-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Sign In / Sign Up</h2>
        
        {/* Social authentication buttons */}
        <div className="space-y-3 mb-4">
          <button 
            onClick={() => {
              setIsLoading(true);
              setError('');
              window.location.href = `${API_BASE_URL}/auth/google/login`;
            }}
            className="w-full py-2 px-3 sm:px-4 bg-white text-black rounded flex items-center justify-center"
            disabled={isLoading}
          >
            {/* Google Icon */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
              />
              <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
              />
              <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
              />
              <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <button 
            onClick={() => {
              setIsLoading(true);
              setError('');
              window.location.href = `${API_BASE_URL}/auth/facebook/login`;
            }}
            className="w-full py-2 px-3 sm:px-4 bg-[#1877f2] rounded flex items-center justify-center"
            disabled={isLoading}
          >
            {/* Facebook Icon */}
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
              <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>
        
        <div className="my-4 flex items-center">
          <hr className="flex-1 border-[#333]" />
          <span className="px-3 text-sm text-[#777]">OR</span>
          <hr className="flex-1 border-[#333]" />
        </div>
        
        {error && (
          <div className="mb-4 p-2 sm:p-3 border border-[#444] rounded bg-[#222] flex items-center">
            <svg 
              className="w-5 h-5 mr-2 text-amber-400 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-amber-300 text-sm">
              {error === 'Invalid email or password' ? 
                'The email or password you entered doesn\'t match our records. Please try again.' : 
                error}
            </span>
          </div>
        )}
        
        <form className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 bg-[#222] rounded border border-[#333]"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 bg-[#222] rounded-lg border border-[#333]"
              required
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={handleEmailSignIn}
              disabled={isLoading}
              className="w-full sm:flex-1 py-2 px-4 custom-button disabled:opacity-50 rounded"
            >
              {isLoading ? 'Please wait...' : 'Sign In'}
            </button>
            
            <button
              type="button"
              onClick={handleEmailSignUp}
              disabled={isLoading}
              className="w-full sm:flex-1 py-2 px-4 bg-[#333] rounded disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}