import { createBrowserRouter, type RouteObject } from 'react-router';

import { RootLayout } from '@/app/layouts/root-layout';
import { LinkDetailsPage } from '@/features/links/pages/link-details-page';
import { LinksPage } from '@/features/links/pages/links-page';
import { HomePage } from '@/pages/home-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { RouteErrorPage } from '@/pages/route-error-page';

// Add new pages here. Nested routes render inside <Outlet /> of RootLayout.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'links', element: <LinksPage /> },
      { path: 'links/:id', element: <LinkDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
