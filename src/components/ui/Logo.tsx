import React from 'react';
import { SvgXml } from 'react-native-svg';

const logoSvg = `
<svg
  width="300"
  height="64"
  viewBox="0 0 300 64"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Classroom 27 logo"
>
  <!-- ICON -->
  <g transform="translate(12,6)">
    <rect
      x="0"
      y="0"
      width="48"
      height="48"
      rx="18"
      fill="#1FC7B5"
    />
    <text
      x="24"
      y="24"
      fill="#0F162A"
      font-size="16"
      font-weight="800"
      text-anchor="middle"
      dominant-baseline="middle"
      letter-spacing="0.05em"
      font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
    >
      CR
    </text>
  </g>

  <!-- WORDMARK -->
  <g transform="translate(64,0)">
    <text
      x="0"
      y="32"
      fill="#0C1A2B"
      font-size="22"
      font-weight="600"
      dominant-baseline="middle"
      letter-spacing="-0.02em"
      font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
    >
      Classroom
    </text>

    <text
      x="124"
      y="32"
      fill="#1FC7B5"
      font-size="22"
      font-weight="800"
      dominant-baseline="middle"
      letter-spacing="-0.01em"
      font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
    >
      27
    </text>
  </g>
</svg>
`;

interface LogoProps {
  width?: number;
  height?: number;
}

export const Logo = ({ width = 200, height = 44 }: LogoProps) => <SvgXml xml={logoSvg} width={width} height={height} />;
