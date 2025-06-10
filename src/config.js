const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:4040/api'
  : 'https://lawyers.legalaiafrica.com/api';
 
export default API_BASE_URL; 