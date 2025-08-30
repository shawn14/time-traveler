import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  gradient?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, blur = 'md', opacity = 0.1, gradient = true }, ref) => {
    const blurClasses = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          blurClasses[blur],
          className
        )}
      >
        {/* Glass background */}
        <div
          className="absolute inset-0 bg-white/10"
          style={{ opacity }}
        />
        
        {/* Gradient overlay */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5" />
        )}
        
        {/* Border glow */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 ring-inset" />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      primary: 'bg-white/20 hover:bg-white/30 text-white shadow-lg',
      secondary: 'bg-black/20 hover:bg-black/30 text-white',
      ghost: 'bg-transparent hover:bg-white/10 text-white/80 hover:text-white',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative overflow-hidden rounded-xl backdrop-blur-md',
          'transition-all duration-200',
          'ring-1 ring-white/20 ring-inset',
          'font-medium',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
        
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

interface FloatingOrbProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  delay?: number;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  size = 'md',
  color = 'purple',
  delay = 0,
}) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  const colorClasses = {
    purple: 'from-purple-400/30 to-purple-600/30',
    blue: 'from-blue-400/30 to-blue-600/30',
    pink: 'from-pink-400/30 to-pink-600/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
        x: [0, 30, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn(
        'absolute rounded-full blur-3xl',
        'bg-gradient-to-br',
        sizeClasses[size],
        colorClasses[color as keyof typeof colorClasses] || colorClasses.purple
      )}
    />
  );
};