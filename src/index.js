import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 如果您想要註冊 Service Worker (PWA功能)
// import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 如果您想要讓應用離線工作，可以取消下面的註釋
// serviceWorkerRegistration.register();
