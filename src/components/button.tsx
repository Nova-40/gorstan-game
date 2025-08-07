// src/components/button.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React from 'react';

import { ButtonHTMLAttributes, ReactNode } from 'react';










type ButtonProps = {
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, ...props }: ButtonProps) => (
  <button {...props} className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800">
    {children}
  </button>
);
