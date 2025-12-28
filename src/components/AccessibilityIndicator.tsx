/**
 * Accessibility Indicator Component
 * Displays accessibility compliance status and warnings for the current theme
 */

import React, { useState } from 'react';
import { useAccessibilityWarnings } from '../hooks/useAccessibility';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface AccessibilityIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const AccessibilityIndicator: React.FC<AccessibilityIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const { hasIssues, issues, suggestions, violationCount, warningCount } = useAccessibilityWarnings();
  const [showModal, setShowModal] = useState(false);

  if (!hasIssues && !showDetails) {
    return null;
  }

  const getStatusIcon = () => {
    if (violationCount > 0) {
      return '❌';
    }
    if (warningCount > 0) {
      return '⚠️';
    }
    return '✅';
  };

  const getStatusText = () => {
    if (violationCount > 0) {
      return `${violationCount} accessibility violation${violationCount > 1 ? 's' : ''}`;
    }
    if (warningCount > 0) {
      return `${warningCount} accessibility warning${warningCount > 1 ? 's' : ''}`;
    }
    return 'Accessibility compliant';
  };

  const getStatusColor = () => {
    if (violationCount > 0) {
      return 'text-red-600 dark:text-red-400';
    }
    if (warningCount > 0) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 text-sm ${getStatusColor()} hover:opacity-80 transition-opacity`}
          title="View accessibility details"
        >
          <span>{getStatusIcon()}</span>
          <span>{getStatusText()}</span>
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Theme Accessibility Report"
      >
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <h3 className="font-semibold">{getStatusText()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                WCAG 2.1 AA Compliance Status
              </p>
            </div>
          </div>

          {/* Violations */}
          {violationCount > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600 dark:text-red-400">
                ❌ Violations ({violationCount})
              </h4>
              <div className="space-y-2">
                {issues
                  .filter(issue => issue.type === 'violation')
                  .map((issue, index) => (
                    <div key={index} className="p-3 rounded border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                      <p className="font-medium text-red-800 dark:text-red-200">
                        {issue.message}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                        {issue.suggestion}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warningCount > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-600 dark:text-yellow-400">
                ⚠️ Warnings ({warningCount})
              </h4>
              <div className="space-y-2">
                {issues
                  .filter(issue => issue.type === 'warning')
                  .map((issue, index) => (
                    <div key={index} className="p-3 rounded border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">
                        {issue.message}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                        {issue.suggestion}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                💡 Improvement Suggestions
              </h4>
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No Issues */}
          {!hasIssues && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                Fully Accessible Theme
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                This theme meets WCAG 2.1 AA accessibility standards for contrast ratios,
                focus indicators, and interactive element differentiation.
              </p>
            </div>
          )}

          {/* Learn More */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Learn more about{' '}
              <a
                href="https://www.w3.org/WAI/WCAG21/Understanding/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                WCAG 2.1 Guidelines
              </a>
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AccessibilityIndicator;