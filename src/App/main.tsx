import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './Styles/index.css';
import { AppRouter } from '@/App/Providers/RouterProvider';
import { AdProvider } from './Providers/AdContext';
import { OrderProvider } from './Providers/OrderContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdProvider>
      <OrderProvider>
        <AppRouter />
      </OrderProvider>
    </AdProvider>
  </StrictMode>
);
