import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('<Button />', () => {
  it('renders button text', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    render(<Button isLoading>Saving</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
