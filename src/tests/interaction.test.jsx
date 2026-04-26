import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InteractionModal from '../components/InteractionModal';
import React from 'react';

describe('InteractionModal Logic', () => {
  const mockLocation = { id: 'school', name: 'Trường Học' };
  
  it('should call onClose when "Không" button is clicked and interactionStep is "ask"', () => {
    const handleClose = vi.fn();
    const setStep = vi.fn();
    
    render(
      <InteractionModal 
        location={mockLocation} 
        interactionStep="ask" 
        onClose={handleClose} 
        setInteractionStep={setStep}
      />
    );
    
    const noButton = screen.getByText('Không');
    fireEvent.click(noButton);
    
    expect(handleClose).toHaveBeenCalled();
  });

  it('should switch to sub_menu when "Có" button is clicked', () => {
    const handleClose = vi.fn();
    const setStep = vi.fn();
    
    render(
      <InteractionModal 
        location={mockLocation} 
        interactionStep="ask" 
        onClose={handleClose} 
        setInteractionStep={setStep}
      />
    );
    
    const yesButton = screen.getByText('Có');
    fireEvent.click(yesButton);
    
    expect(setStep).toHaveBeenCalledWith('sub_menu');
  });
});
