// src/components/common/Button.jsx
import React from 'react';
import './Button.css'; 

export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
