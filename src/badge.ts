import { makeBadge } from 'badge-maker';
import type { BadgeOptions } from './types.js';

export function getColorForRank(rank: number): string {
  if (rank >= 90) return 'brightgreen';
  if (rank >= 75) return 'green';
  if (rank >= 60) return 'yellowgreen';
  if (rank >= 40) return 'yellow';
  if (rank >= 20) return 'orange';
  return 'red';
}

export function generateBadgeSVG(options: BadgeOptions): string {
  return makeBadge({
    label: options.label,
    message: options.message,
    color: options.color,
    style: options.style,
  });
}

export function createTeaRankBadge(
  rank: number,
  label: string,
  style: BadgeOptions['style'],
  precision: number,
  customColor?: string
): string {
  const roundedRank = precision === 0 
    ? Math.round(rank).toString() 
    : rank.toFixed(precision);
  
  const color = customColor || getColorForRank(rank);
  
  return generateBadgeSVG({
    label,
    message: roundedRank,
    color,
    style,
  });
}