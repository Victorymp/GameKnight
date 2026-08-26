import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";


export interface ImageInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Text on the button before a file is picked. */
  chooseText?: string;
  /** Text beside the button once a file is picked. Pass a fn for the filename. */
  chosenText?: string | ((files: File[]) => string);
  /** Text beside the button when nothing is picked yet. */
  emptyText?: string;
}

export const ImageInput = React.forwardRef<HTMLInputElement, ImageInputProps>(
  (
    {
      className,
      chooseText = "Choose image",
      chosenText,
      emptyText = "No image chosen",
      accept = "image/*",
      multiple,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [files, setFiles] = React.useState<File[]>([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setFiles(Array.from(e.target.files ?? []));
      onChange?.(e);
    }

    const label =
      files.length === 0
        ? emptyText
        : typeof chosenText === "function"
        ? chosenText(files)
        : chosenText ??
          (files.length === 1 ? files[0].name : `${files.length} images`);

    return (
      <div className={cn("flex items-center gap-3", className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="h-10 shrink-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {chooseText}
        </button>
        <span className="truncate text-sm text-gray-500">{label}</span>
      </div>
    );
  }
);

ImageInput.displayName = "ImageInput";