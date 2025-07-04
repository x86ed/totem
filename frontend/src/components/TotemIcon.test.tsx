import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TotemIcon } from './TotemIcon';

describe('TotemIcon', () => {
  it('renders canvas element', () => {
    const { container } = render(<TotemIcon seed="test" showControls={false} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders with seed prop', () => {
    const { container } = render(<TotemIcon seed="custom-seed" showControls={false} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
