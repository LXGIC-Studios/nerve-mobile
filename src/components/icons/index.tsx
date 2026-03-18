/**
 * NERVE Custom Icon System
 * Sharp geometric SVG icons — square caps, miter joins, 1.5px strokes
 * "Quant terminal" aesthetic matching the web app
 */
import React from 'react';
import Svg, { Path, Rect, Circle, Line, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const defaults = { size: 24, color: '#E8E8EC', strokeWidth: 1.5 };

// === PORTED FROM WEB ===

/** Neural network: 3 nodes + connecting lines */
export function NeuralIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="5" cy="6" r="2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="5" cy="18" r="2" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="19" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="7" y1="6" x2="17" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Line x1="7" y1="18" x2="17" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Circle cx="12" cy="12" r="1.5" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="7" y1="6" x2="10.5" y2="12" stroke={color} strokeWidth={strokeWidth * 0.7} strokeLinecap="square" opacity={0.5} />
      <Line x1="7" y1="18" x2="10.5" y2="12" stroke={color} strokeWidth={strokeWidth * 0.7} strokeLinecap="square" opacity={0.5} />
    </Svg>
  );
}

/** Geometric shield with angular checkmark */
export function ShieldIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 6V12C4 16.42 7.4 20.52 12 22C16.6 20.52 20 16.42 20 12V6L12 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <Path
        d="M9 12L11 14L15 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

/** Ascending bar chart with sharp rectangles */
export function ChartIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="14" width="4" height="7" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="10" y="9" width="4" height="12" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="17" y="3" width="4" height="18" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </Svg>
  );
}

/** Semi-circle gauge with needle */
export function GaugeIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 18C4 11.37 9.37 6 16 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        opacity={0.4}
      />
      <Path
        d="M4 18A8 8 0 0 1 20 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
      />
      <Line x1="12" y1="18" x2="16" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Circle cx="12" cy="18" r="1.5" fill={color} />
    </Svg>
  );
}

/** Angular lightning bolt */
export function LightningIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

/** Geometric padlock */
export function LockIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="1" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Rect x="11" y="15" width="2" height="3" fill={color} />
    </Svg>
  );
}

// === NEW MOBILE ICONS ===

/** Geometric wallet — angular flap + card slots */
export function WalletIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="14" rx="1" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Path d="M2 6L18 6V4H6L2 6Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
      <Rect x="16" y="12" width="4" height="3" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </Svg>
  );
}

/** Trade icon — up+down angular arrows (bid/ask) */
export function TradeIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4L7 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Path d="M3 8L7 4L11 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
      <Path d="M17 20V7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Path d="M13 16L17 20L21 16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}

/** Portfolio — stacked horizontal bars */
export function PortfolioIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="4" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="3" y="10" width="13" height="4" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="3" y="16" width="8" height="4" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </Svg>
  );
}

/** Dashboard — angular grid/gauge combo */
export function DashboardIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="8" height="8" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="13" y="3" width="8" height="4" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="13" y="9" width="8" height="12" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="3" y="13" width="8" height="8" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </Svg>
  );
}

/** Settings — angular gear with sharp teeth */
export function SettingsIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.5 2H13.5L14 5L16.5 6L19 4.5L21 6.5L19.5 9L20.5 11.5L23 12V14L20.5 14.5L19.5 17L21 19.5L19 21.5L16.5 20L14 21L13.5 24H10.5L10 21L7.5 20L5 21.5L3 19.5L4.5 17L3.5 14.5L1 14V12L3.5 11.5L4.5 9L3 6.5L5 4.5L7.5 6L10 5L10.5 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <Circle cx="12" cy="13" r="3" stroke={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

/** Angular magnifying glass */
export function SearchIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10" cy="10" r="7" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="15.5" y1="15.5" x2="21" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
    </Svg>
  );
}

/** Angular flame — portfolio heat */
export function FlameIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L8 10L10 11L7 18C7 18 10 22 12 22C14 22 17 18 17 18L14 11L16 10L12 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

/** Crosshair — entry timing target */
export function TargetIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} />
      <Line x1="12" y1="1" x2="12" y2="5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Line x1="12" y1="19" x2="12" y2="23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Line x1="1" y1="12" x2="5" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Line x1="19" y1="12" x2="23" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
    </Svg>
  );
}

/** Angular star — XP/achievements */
export function StarIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </Svg>
  );
}

/** Up arrow — profit indicator */
export function ArrowUpIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 20V4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Path d="M5 11L12 4L19 11" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}

/** Down arrow — loss indicator */
export function ArrowDownIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4V20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Path d="M5 13L12 20L19 13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}

/** Markets icon — candlestick chart */
export function MarketsIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="6" y1="3" x2="6" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Rect x="4" y="9" width="4" height="6" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Line x1="6" y1="15" x2="6" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Line x1="14" y1="5" x2="14" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Rect x="12" y="8" width="4" height="8" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Line x1="14" y1="16" x2="14" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Line x1="20" y1="2" x2="20" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Rect x="18" y="7" width="4" height="5" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Line x1="20" y1="12" x2="20" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
    </Svg>
  );
}

/** Ellipsis / More menu — three angular dots */
export function MoreIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="10.5" width="3" height="3" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="10.5" y="10.5" width="3" height="3" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Rect x="17" y="10.5" width="3" height="3" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
    </Svg>
  );
}

/** Chevron right — navigation */
export function ChevronRightIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 4L17 12L9 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}

/** Chevron left — back navigation */
export function ChevronLeftIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 4L7 12L15 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}

/** Chevron down — dropdowns */
export function ChevronDownIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9L12 17L20 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}

/** Close / X icon */
export function CloseIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="5" x2="19" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
    </Svg>
  );
}

/** Refresh icon — angular circular arrow */
export function RefreshIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12C4 7.58 7.58 4 12 4C15.15 4 17.84 5.87 19.15 8.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Path d="M20 12C20 16.42 16.42 20 12 20C8.85 20 6.16 18.13 4.85 15.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Path d="M16 8.5H20V4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
      <Path d="M8 15.5H4V19.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" strokeLinejoin="miter" />
    </Svg>
  );
}

/** Info icon */
export function InfoIcon({ size = defaults.size, color = defaults.color, strokeWidth = defaults.strokeWidth }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="1" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="miter" />
      <Line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
      <Rect x="11" y="7" width="2" height="2" fill={color} />
    </Svg>
  );
}
