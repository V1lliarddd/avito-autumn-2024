import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RootLayout } from '../Layouts/RootLayout';

const CatalogPage = lazy(() => import('@pages/Catalog/Catalog'));
const AdPage = lazy(() => import('@pages/Ad/Ad'));
const OrderPage = lazy(() => import('@pages/Order/Order'));

export function AppRouter() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div>Загрузка...</div>}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<CatalogPage />} />
              <Route path="/ad/:id" element={<AdPage />} />
              <Route path="/orders" element={<OrderPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}
