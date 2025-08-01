import { render, screen } from '@testing-library/react';
import { Navigation } from '../Navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navigation', () => {
  it('renders navigation items', () => {
    render(<Navigation />);
    
    expect(screen.getAllByText('CompressVerse')).toHaveLength(2); // Desktop and mobile
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('shows mobile menu button', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Toggle Menu')).toBeInTheDocument();
  });
});