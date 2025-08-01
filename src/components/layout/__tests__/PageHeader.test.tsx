import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  it('renders title and description', () => {
    render(
      <PageHeader 
        title="Test Title" 
        description="Test description" 
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<PageHeader title="Test Title" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <PageHeader title="Test Title">
        <button>Test Button</button>
      </PageHeader>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});