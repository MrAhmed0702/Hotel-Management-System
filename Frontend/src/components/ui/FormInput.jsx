import clsx from 'clsx';
import { forwardRef } from 'react';

const FormInput = forwardRef(({ label, error, type = 'text', className, ...props }, ref) => {
  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-[#1A2B44] mb-1.5">
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          ref={ref}
          className={clsx(
            "w-full px-4 py-2.5 rounded-lg border bg-white text-[#1A2B44] transition-all",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
              : "border-[#E5E5E5] focus:border-[#C5A059] focus:ring-[#C5A059]"
          )}
          {...props}
        />
      ) : (
        <input
          ref={ref}
          type={type}
          className={clsx(
            "w-full px-4 py-2.5 rounded-lg border bg-white text-[#1A2B44] transition-all",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50",
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
              : "border-[#E5E5E5] focus:border-[#C5A059] focus:ring-[#C5A059]"
          )}
          {...props}
        />
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">{error.message}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
