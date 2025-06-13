// Add to your existing auth service

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('user');
  
  // Dispatch a custom event to notify all components about the auth change
  window.dispatchEvent(new Event('auth-change'));
};

// Add to your existing login success handler

export const login = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('expiresAt', data.expiresAt);
  localStorage.setItem('user', JSON.stringify({
    email: data.email,
    name: data.name
  }));
  
  // Dispatch a custom event to notify all components about the auth change
  window.dispatchEvent(new Event('auth-change'));
};