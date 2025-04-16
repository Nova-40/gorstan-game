/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: UI input field component.
 */

// src/components/ui/input.jsx
import React from "react"

export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background 
      placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed 
      disabled:opacity-50 ${className}`}
      {...props}
    />
  )
})

Input.displayName = "Input"
