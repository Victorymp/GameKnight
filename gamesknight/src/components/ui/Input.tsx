import * as React from "react";
import { cn } from "../../lib/utils";

type Variant =
  | "accent"
  | "sky"
  | "surface"
  | "outline"
  | "ghost"
  | "success"
  | "danger";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  }


const VARIANTS: Record<Variant, string> = {
  accent:
    "bg-accent text-cloud border-ink hover:bg-accent-hover",
  sky:
    "bg-primary text-ink border-ink hover:bg-primary-hover",
  surface:
    "bg-surface text-ink border-ink hover:bg-primary-light",
  outline:
    "bg-surface text-ink border-ink hover:bg-primary-light",
  ghost:
    "bg-transparent text-ink border-ink shadow-none hover:bg-primary-light active:translate-y-0",
  success:
    "bg-success text-cloud border-ink hover:brightness-90",
  danger:
    "bg-error text-cloud border-ink hover:brightness-90",
};

/* Border width scales with size or the outline stops reading
   as a sprite edge on the larger buttons. */
const SIZES: Record<Size, string> = {
  sm: "text-pixel-xs px-4 py-2 border-2",
  md: "text-pixel-sm px-6 py-3 border-4",
  lg: "text-pixel-base px-8 py-4 border-4",
  // Square. Icons need equal padding or the sprite edge looks lopsided.
  "icon-sm": "h-7 w-7 p-0 border-2",
  icon: "h-9 w-9 p-0 border-2",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", variant = "ghost", size = "md", ...props },
    ref
  ) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border-solid shadow-pixel",
          "border-gray-300 bg-white px-3 py-2", 
          "placeholder:text-gray-400",
          // "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", 
          // "focus-visible:ring-offset-2 ring-offset-background", 
          // "disabled:cursor-not-allowed disabled:opacity-50",

          // focus: offset outline, never a soft ring
          "focus-visible:outline-none focus-visible:ring-0",
          "focus-visible:shadow-[0_4px_0_var(--color-ink),0_0_0_3px_var(--color-primary)]",

          // press: two frames, no easing curve
          "transition-[transform,box-shadow,background-color] duration-75 ease-pixel",
          "hover:-translate-y-0.5",
          "active:translate-y-0.75 active:shadow-pixel-pressed",

          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:translate-y-0 disabled:shadow-pixel-sm disabled:hover:translate-y-0",
          VARIANTS[variant],
          SIZES[size],
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