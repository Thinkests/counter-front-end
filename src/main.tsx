import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const manifestUrl = "https://thinkests.github.jo/counter-front-end/tonconnect-manifest.json";

createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>,
)
