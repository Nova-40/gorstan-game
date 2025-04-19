/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: UI card component for grouped displays.
 */

// src/components/ui/card.jsx
import React from "react"

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border bg-white/5 p-4 shadow-md backdrop-blur ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ className = "", children }) {
  return <div className={`p-2 ${className}`}>{children}</div>
}
