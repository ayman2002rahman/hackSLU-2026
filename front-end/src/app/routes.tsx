import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { InventoryOverview } from './pages/InventoryOverview';
import { DemandForecast } from './pages/DemandForecast';
import { SmartRestock } from './pages/SmartRestock';
import { ManageProducts } from './pages/ManageProducts';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: InventoryOverview },
      { path: 'forecast', Component: DemandForecast },
      { path: 'restock', Component: SmartRestock },
      { path: 'products', Component: ManageProducts },
    ],
  },
]);
