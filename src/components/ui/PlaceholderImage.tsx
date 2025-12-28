import React from 'react';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  text?: string;
  className?: string;
  alt?: string;
}

/**
 * PlaceholderImage component that creates a local placeholder image
 * without relying on external services
 */
export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width = 150,
  height = 150,
  text = 'Product',
  className = '',
  alt = 'Product placeholder'
}) => {
  // Create a simple SVG placeholder with safe characters
  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;

  // Use encodeURIComponent instead of btoa to handle special characters
  const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'cover' }}
    />
  );
};