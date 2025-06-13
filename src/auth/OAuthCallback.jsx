import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import LoadingIndicator from '../components/LoadingIndicator';

export default function OAuthCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Extract token from URL parameters
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (!token) {
        setError('Authentication failed: No token received');
        return;
      }
      
      try {
        // Validate token with backend
        const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.authenticated) {
          throw new Error(data.message || 'Invalid authentication token');
        }
        
        // Store the auth token and its expiry time
        localStorage.setItem('authToken', token);
        // Set expiry to 24 hours from now if not provided
        const expiryTime = (Date.now() + 24 * 60 * 60 * 1000).toString();
        localStorage.setItem('tokenExpiry', expiryTime);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        setError(`Authentication failed: ${err.message}`);
      }
    };
    
    handleOAuthCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        <div className="text-center p-6 bg-[#111] rounded-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <button 
            className="custom-button px-4 py-2 rounded" 
            onClick={() => navigate('/signin')}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-white">
      <div className="text-center">
        <LoadingIndicator text="Completing authentication..." />
        <p className="mt-4 text-gray-400">Please wait while we log you in...</p>
      </div>
    </div>
  );
}