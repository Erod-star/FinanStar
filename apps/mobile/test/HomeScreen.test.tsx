import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomeScreen } from '@/screens/HomeScreen';

describe('HomeScreen', () => {
  it('muestra el titulo FinanStar', () => {
    render(<HomeScreen />);
    expect(screen.getByText('FinanStar')).toBeTruthy();
  });
});
