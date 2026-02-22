import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { InventoryOverview } from './pages/InventoryOverview';
import { FutureRiskAndAction } from './pages/FutureRiskAndAction';
import { SendOrders } from './pages/SendOrders';
import { Navigate } from 'react-router';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: InventoryOverview },
      { path: 'analysis', Component: FutureRiskAndAction },
      { path: 'orders', Component: SendOrders },
      // Redirect old routes to home
      { path: 'forecast', element: <Navigate to="/" replace /> },
      { path: 'restock', element: <Navigate to="/" replace /> },
      { path: 'products', element: <Navigate to="/" replace /> },
      // Catch all other routes
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);