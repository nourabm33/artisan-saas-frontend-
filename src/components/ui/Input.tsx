'use client';

import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

const base =
  'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50';

function Wrapper({
  id,
  label,
  error,
  hint,
  children,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, error, hint, className = '', id, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <Wrapper id={inputId} label={label} error={error} hint={hint}>
        <input
          ref={ref}
          id={inputId}
          className={`${base} ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
          {...props}
        />
      </Wrapper>
    );
  }
);

export function Select({
  label,
  error,
  hint,
  className = '',
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <Wrapper id={selectId} label={label} error={error} hint={hint}>
      <select
        id={selectId}
        className={`${base} bg-white ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
  const autoId = useId();
  const areaId = id ?? autoId;
  return (
    <Wrapper id={areaId} label={label} error={error} hint={hint}>
      <textarea
        id={areaId}
        className={`${base} ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
    </Wrapper>
  );
}
