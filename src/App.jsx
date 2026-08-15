import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './routes/Login';
import DashboardLayout from './routes/DashboardLayout';
import NewAddOns from './routes/NewAddOns';
import ManageAddOns from './routes/ManageAddOns';
import AddOnDetail from './routes/AddOnDetail';
import ProductDetail from './routes/ProductDetail';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <NewAddOns /> },
      { path: 'manage', element: <ManageAddOns /> },
      { path: 'addon/:id', element: <AddOnDetail /> },
      { path: 'addon/:id/product/:prodIdx', element: <ProductDetail /> }
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}