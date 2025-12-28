import { ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Page transition wrapper component
 * Provides smooth fade transitions between pages
 * Requirements: 6.4
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Start invisible
    setIsVisible(false)
    
    // Small delay to allow for smooth transition
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Fade transition component for individual elements
 */
interface FadeTransitionProps {
  children: ReactNode
  show: boolean
  className?: string
  delay?: number
}

export function FadeTransition({ 
  children, 
  show, 
  className = '', 
  delay = 0 
}: FadeTransitionProps) {
  const [shouldRender, setShouldRender] = useState(show)

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShouldRender(true)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setShouldRender(false)
    }
  }, [show, delay])

  if (!shouldRender && !show) {
    return null
  }

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Slide transition component for modals and sidebars
 */
interface SlideTransitionProps {
  children: ReactNode
  show: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function SlideTransition({ 
  children, 
  show, 
  direction = 'up',
  className = '' 
}: SlideTransitionProps) {
  const getTransformClasses = () => {
    const transforms = {
      up: show ? 'translate-y-0' : 'translate-y-full',
      down: show ? 'translate-y-0' : '-translate-y-full',
      left: show ? 'translate-x-0' : 'translate-x-full',
      right: show ? 'translate-x-0' : '-translate-x-full'
    }
    return transforms[direction]
  }

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        show ? 'opacity-100' : 'opacity-0'
      } ${getTransformClasses()} ${className}`}
    >
      {children}
    </div>
  )
}