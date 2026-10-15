import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { createQueryClient, Providers } from './providers';
import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <Providers client={createQueryClient()}>
      <RouterProvider router={router} />
    </Providers>,
  );
}

describe('router', () => {
  it('renders the home page', async () => {
    renderAt('/');
    expect(await screen.findByText('Welcome')).toBeInTheDocument();
  });

  it('renders the not found page for unknown paths', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
