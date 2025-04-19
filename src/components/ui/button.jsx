/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: UI button component using shadcn/ui conventions.
 */

import React from "react"

export const Button = ({ className = "", children, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white 
        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 
        disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
