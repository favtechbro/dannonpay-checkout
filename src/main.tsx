import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { PaymentLinkPage } from '@/pages/PaymentLinkPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/c/:code" element={<CheckoutPage mode="hosted" />} />
        <Route path="/c/:code/return" element={<CheckoutPage mode="hosted" />} />
        <Route path="/embed/:code" element={<CheckoutPage mode="embedded" />} />
        <Route path="/l/:slug" element={<PaymentLinkPage />} />
        <Route path="/" element={<Navigate to="/404" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
