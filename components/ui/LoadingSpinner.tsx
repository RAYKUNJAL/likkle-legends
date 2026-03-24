"use client";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export default function LoadingSpinner({ size = 48, className = "" }: LoadingSpinnerProps) {
  return (
    <div
      className={`border-4 border-primary/30 border-t-primary rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}
