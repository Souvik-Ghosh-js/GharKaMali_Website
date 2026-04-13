'use client';

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  // Smooth scroll removed per user request (returning to normal native scroll to eliminate lag)
  return <>{children}</>;
}
