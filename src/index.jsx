import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
import 'katex/dist/katex.min.css';

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)