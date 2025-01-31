import React from 'react';
import { ReactComponent as LogoSVG } from './logo.svg';

export const LogoIcon = ({ size = 32, color = '#4299E1' }) => (
  <LogoSVG width={size} height={size} style={{ fill: color }} />
);

export default LogoIcon;
