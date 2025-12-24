import React from 'react';
import { SvgXml } from 'react-native-svg';

const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="32" viewBox="0 0 160 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="12" fill="#1FC7B5"/>
  <text x="44" y="21" font-family="Arial" font-size="18" font-weight="700" fill="#0F162A">Classroom 27</text>
</svg>`;

export const Logo = () => <SvgXml xml={logoSvg} width={160} height={32} />;
