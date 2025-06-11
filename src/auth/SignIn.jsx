import React, { useState } from 'react';
import API_BASE_URL from '../config';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Store the auth token and its expiry time
      localStorage.setItem('authToken', data.token);
      // Set expiry to 24 hours from now if not provided by backend
      const expiryTime = data.expiresAt || (new Date().getTime() + 24 * 60 * 60 * 1000);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      // Reload the page to enter authenticated state
      window.location.reload();
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
      
      // Store the auth token and its expiry time
      localStorage.setItem('authToken', data.token);
      // Set expiry to 24 hours from now if not provided by backend
      const expiryTime = data.expiresAt || (new Date().getTime() + 24 * 60 * 60 * 1000);
      localStorage.setItem('tokenExpiry', expiryTime.toString());
      
      // Reload the page to enter authenticated state
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create base URL for OAuth redirects
  const baseUrl = API_BASE_URL.replace('/api', '');

  return (
    <div className="h-full flex flex-col justify-center items-center text-white bg-black">
      <h1 className="text-3xl font-bold mb-6">Legal AI Africa</h1>
      
      <div className="w-full max-w-md p-6 bg-[#111] rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Sign In / Sign Up</h2>
        
        {/* Social authentication buttons */}
        <div className="space-y-3 mb-4">
          <button 
            onClick={() => window.location.href = `${baseUrl}/auth/google/login`}
            className="w-full py-2 px-4 bg-white text-black rounded flex items-center justify-center"
          >
            <span>Continue with Google</span>
          </button>
          
          <button 
            onClick={() => window.location.href = `${baseUrl}/auth/facebook/login`}
            className="w-full py-2 px-4 bg-[#1877f2] rounded flex items-center justify-center"
          >
            <span>Continue with Facebook</span>
          </button>
        </div>
        
        <div className="my-4 flex items-center">
          <hr className="flex-1 border-[#333]" />
          <span className="px-3 text-sm text-[#777]">OR</span>
          <hr className="flex-1 border-[#333]" />
        </div>
        
        {error && <div className="bg-red-900/20 text-red-500 p-2 rounded mb-3">{error}</div>}
        
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
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleEmailSignIn}
              disabled={isLoading}
              className="flex-1 py-2 px-4 custom-button disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : 'Sign In'}
            </button>
            
            <button
              type="button"
              onClick={handleEmailSignUp}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-[#333] rounded disabled:opacity-50"
            >
              {isLoading ? 'Please wait...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}