import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Web Vitals reporting
reportWebVitals((metric) => {
  console.log('Web Vital:', metric);
  
  // Send to analytics if configured
  if (process.env.REACT_APP_ANALYTICS_ID) {
    // Google Analytics 4 example
    window.gtag && window.gtag('event', metric.name, {
      custom_parameter_1: Math.round(metric.value),
      custom_parameter_2: metric.id,
      custom_parameter_3: metric.name,
    });
  }
});

// Measure and report performance
function sendToAnalytics(metric) {
  // Replace with your analytics endpoint
  const analyticsId = process.env.REACT_APP_ANALYTICS_ID;
  if (analyticsId) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      timestamp: Date.now()
    });
    
    // Use sendBeacon if available, fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/analytics', body);
    } else {
      fetch('/analytics', {
        method: 'POST',
        body,
        headers: {'Content-Type': 'application/json'},
        keepalive: true
      }).catch(console.error);
    }
  }
}

// Register all web vitals
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
