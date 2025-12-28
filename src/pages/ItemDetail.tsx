/**
 * ItemDetail page component
 * Displays comprehensive information about a specific wishlist item
 * Requirements: 4.2, 4.3, 4.4, 4.5
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WishlistItem } from '../types';
import { Button, Card } from '../components/ui';
import { PageTransition, FadeTransition } from '../components/PageTransition';
import { InlineLoading } from '../components/ui/Loading';
import { PriceChart } from '../components/charts/PriceChart';
import { 
  formatPrice, 
  formatPriceChange, 
  getTrendColor, 
  getTrendIcon,
  calculateDaysTracked 
} from '../utils/priceCalculations';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ItemDetail: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const [wishlistItems] = useLocalStorage<WishlistItem[]>('wishlist-items', []);
  const [isLoading, setIsLoading] = useState(true);

  // Find the item by ID
  const item = wishlistItems.find(item => item.id === itemId);

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [itemId]);

  if (!item) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-theme-text-primary mb-4 theme-transition">Item Not Found</h1>
            <p className="text-theme-text-secondary mb-6 theme-transition">
              The wishlist item you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Calculate current days tracked (in case it needs updating)
  const currentDaysTracked = calculateDaysTracked(item.dateAdded);

  // Format dates for display
  const dateAddedFormatted = item.dateAdded.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const priceChange = formatPriceChange(item.originalPrice, item.currentPrice);
  const trendColor = getTrendColor(item.trend);
  const trendIcon = getTrendIcon(item.trend);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading ? (
          <InlineLoading text="Loading item details..." />
        ) : (
          <>
            {/* Header with back button */}
            <FadeTransition show={!isLoading} delay={100}>
              <div className="flex items-center justify-between">
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2"
                >
                  ← Back to Dashboard
                </Button>
              </div>
            </FadeTransition>

            {/* Item Information Card */}
            <FadeTransition show={!isLoading} delay={200}>
              <Card className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-theme-text-primary mb-2 theme-transition">
                        {item.name}
                      </h1>
                      <div className="flex items-center gap-2 text-lg">
                        <span className="text-theme-text-secondary theme-transition">Current Price:</span>
                        <span className="font-semibold text-theme-text-primary theme-transition">
                          {formatPrice(item.currentPrice)}
                        </span>
                        <span className={`flex items-center gap-1 ${trendColor} font-medium`}>
                          {trendIcon} {priceChange}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-theme-text-secondary theme-transition">Original Price:</span>
                        <span className="font-medium text-theme-text-primary theme-transition">
                          {formatPrice(item.originalPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-text-secondary theme-transition">Date Added:</span>
                        <span className="font-medium text-theme-text-primary theme-transition">
                          {dateAddedFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-text-secondary theme-transition">Days Tracked:</span>
                        <span className="font-medium text-theme-text-primary theme-transition">
                          {currentDaysTracked} {currentDaysTracked === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </div>

                    {/* Product Link Button */}
                    {item.productUrl && (
                      <div className="pt-4">
                        <Button 
                          variant="primary"
                          onClick={() => window.open(item.productUrl, '_blank')}
                          className="w-full"
                        >
                          View Product Page
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Product Image */}
                  <div className="flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="max-w-full h-auto rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-theme-surface border theme-border rounded-lg flex items-center justify-center theme-transition">
                        <span className="text-theme-text-muted theme-transition">No image available</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </FadeTransition>

            {/* Price History Chart */}
            <FadeTransition show={!isLoading} delay={300}>
              <Card className="p-6">
                <h2 className="text-xl font-bold text-theme-text-primary mb-4 theme-transition">Price History</h2>
                {item.priceHistory.length > 1 ? (
                  <PriceChart 
                    data={item.priceHistory.map(point => ({
                      x: point.date,
                      y: point.price,
                      label: formatPrice(point.price)
                    }))}
                    width={800}
                    height={300}
                  />
                ) : (
                  <div className="text-center py-8 text-theme-text-muted theme-transition">
                    <p>Not enough price data to display chart.</p>
                    <p className="text-sm mt-2">
                      Price history will appear as more data is collected over time.
                    </p>
                  </div>
                )}
              </Card>
            </FadeTransition>

            {/* Additional Details */}
            <FadeTransition show={!isLoading} delay={400}>
              <Card className="p-6">
                <h2 className="text-xl font-bold text-theme-text-primary mb-4 theme-transition">Tracking Details</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-theme-surface border theme-border rounded-lg transition-all duration-200 hover:bg-theme-background hover:shadow-theme-small theme-transition">
                    <div className="text-2xl font-bold text-theme-text-primary theme-transition">
                      {item.priceHistory.length}
                    </div>
                    <div className="text-sm text-theme-text-secondary theme-transition">Price Points</div>
                  </div>
                  <div className="text-center p-4 bg-theme-surface border theme-border rounded-lg transition-all duration-200 hover:bg-theme-background hover:shadow-theme-small theme-transition">
                    <div className={`text-2xl font-bold ${trendColor}`}>
                      {item.trend.toUpperCase()}
                    </div>
                    <div className="text-sm text-theme-text-secondary theme-transition">Current Trend</div>
                  </div>
                  <div className="text-center p-4 bg-theme-surface border theme-border rounded-lg transition-all duration-200 hover:bg-theme-background hover:shadow-theme-small theme-transition">
                    <div className="text-2xl font-bold text-theme-text-primary theme-transition">
                      {currentDaysTracked}
                    </div>
                    <div className="text-sm text-theme-text-secondary theme-transition">Days Tracked</div>
                  </div>
                </div>
              </Card>
            </FadeTransition>
          </>
        )}
      </div>
    </PageTransition>
  );
};