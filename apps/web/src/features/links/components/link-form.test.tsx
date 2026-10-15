import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LinkForm } from './link-form';

describe('LinkForm', () => {
  it('shows validation errors and does not submit invalid data', async () => {
    const onSubmit = vi.fn();
    render(<LinkForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('URL'), 'not-a-url');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid URL')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data', async () => {
    const onSubmit = vi.fn();
    render(<LinkForm onSubmit={onSubmit} submitLabel="Create" />);

    await userEvent.type(screen.getByLabelText('Title'), 'Vite');
    await userEvent.type(screen.getByLabelText('URL'), 'https://vite.dev');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { title: 'Vite', url: 'https://vite.dev', description: '' },
      expect.anything(),
    );
  });
});
