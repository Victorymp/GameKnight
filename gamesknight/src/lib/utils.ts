// cn is a helper that merges Tailwind classes conditionally
export function cn(...inputs: any[]) {
  const classes: string[] = [];

  function add(input: any) {
    if (!input) return;
    if (typeof input === "string") {
      classes.push(input);
      return;
    }
    if (Array.isArray(input)) {
      input.forEach(add);
      return;
    }
    if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }

  add(inputs);
  return classes.join(" ");
}

