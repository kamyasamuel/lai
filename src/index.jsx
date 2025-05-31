import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import axios from 'axios';
import './styles/index.css'

// Set the base URL for all Axios requests
axios.defaults.baseURL = 'https://lawyers.legalaiafrica.com/api';

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)