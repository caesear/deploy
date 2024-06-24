import { Link, Navigate, useRoutes } from 'react-router-dom';
import HomePage from './views/home/index'
import LpPage from './views/lp/index'
import NftPage from './views/nft/index'
export function AppRoutes() {
  return useRoutes([
    { index: true, element: <Navigate replace to="/home" /> },
    {
      path: '/home',
      element: <HomePage/>,
    },
    {
      path: '/lp',
      element: <LpPage/>,
    },
    {
      path: '/nft',
      element: <NftPage/>,
    },
  ]);
}
