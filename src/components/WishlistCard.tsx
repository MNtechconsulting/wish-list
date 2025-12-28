import React from 'react';
import { WishlistItem } from '../types';
import { Card } from './ui/Card';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from './ui/Icons';
import { formatPrice } from '../utils/priceCalculations';

interface WishlistCardProps {
  item: WishlistItem;
  onClick?: (id: string) => void;
}

/**
 * WishlistCard component displays a single wishlist item
 * Shows product name, current price, price trend indicator, and days tracked
 * Implements color-coded trend indicators (green/red/gray) with icons
 * Enhanced with hover effects and micro-interactions
 * Requirements: 2.2, 2.3, 4.1, 6.2, 6.3, 6.4
 */
export const WishlistCard: React.FC<WishlistCardProps> = ({ item, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(item.id);
    }
  };

  // Determine trend color and icon based on price movement
  const getTrendDisplay = () => {
    switch (item.trend) {
      case 'down':
        return {
          color: 'text-theme-success',
          bgColor: 'bg-theme-success/10',
          Icon: TrendingDownIcon,
          label: 'Price Down'
        };
      case 'up':
        return {
          color: 'text-theme-error',
          bgColor: 'bg-theme-error/10',
          Icon: TrendingUpIcon,
          label: 'Price Up'
        };
      case 'flat':
        return {
          color: 'text-theme-text-muted',
          bgColor: 'bg-theme-surface',
          Icon: MinusIcon,
          label: 'Price Stable'
        };
    }
  };

  const trendDisplay = getTrendDisplay();
  const TrendIcon = trendDisplay.Icon;

  return (
    <Card 
      onClick={handleClick} 
      className="p-6 h-full flex flex-col cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg group"
    >
      {/* Product Name */}
      <h3 className="text-lg font-semibold text-theme-text-primary mb-3 overflow-hidden group-hover:text-theme-primary transition-colors duration-200 theme-transition" style={{ 
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {item.name}
      </h3>

      {/* Current Price */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-theme-primary group-hover:text-theme-primary/80 transition-colors duration-200 theme-transition">
          {formatPrice(item.currentPrice)}
        </p>
        {item.currentPrice !== item.originalPrice && (
          <p className="text-sm text-theme-text-muted mt-1 group-hover:text-theme-text-secondary transition-colors duration-200 theme-transition">
            Original: {formatPrice(item.originalPrice)}
          </p>
        )}
      </div>

      {/* Price Trend Indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${trendDisplay.bgColor} transition-all duration-200 group-hover:shadow-theme-small theme-transition`}>
          <TrendIcon className={`w-4 h-4 ${trendDisplay.color} transition-transform duration-200 group-hover:scale-110`} />
          <span className={`text-sm font-medium ${trendDisplay.color}`}>
            {trendDisplay.label}
          </span>
        </div>
      </div>

      {/* Days Tracked */}
      <div className="mt-auto pt-4 border-t theme-border group-hover:border-theme-border/80 transition-colors duration-200 theme-transition">
        <p className="text-sm text-theme-text-muted group-hover:text-theme-text-secondary transition-colors duration-200 theme-transition">
          Tracked for <span className="font-semibold text-theme-text-primary group-hover:text-theme-primary transition-colors duration-200 theme-transition">{item.daysTracked}</span> {item.daysTracked === 1 ? 'day' : 'days'}
        </p>
      </div>
    </Card>
  );
};
