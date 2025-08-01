import { render, screen } from '@testing-library/react';
import { Navigation } from '../Navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navigation', () => {
  it('renders navigation items', () => {
    render(<Navigation />);
    
    expect(screen.getAllByText('GIF Generator')).toHaveLength(2); // Desktop and mobile
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it('shows mobile menu button', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Toggle Menu')).toBeInTheDocument();
  });
});