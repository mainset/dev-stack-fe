function set<T extends object, V = unknown>(
  obj: T,
  path: string | (string | number)[],
  value: V,
): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // Parse path like "a.b[0].c" into ["a", "b", "0", "c"]
  const keys = Array.isArray(path) ? path : path.match(/[^.[\]]+/g) || [];

  let current: Record<string | number, unknown> = obj as Record<
    string | number,
    unknown
  >;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (i === keys.length - 1) {
      current[key] = value;
      break; // Reached the end
    }

    const nextValue = current[key];
    if (
      nextValue === undefined ||
      nextValue === null ||
      typeof nextValue !== 'object'
    ) {
      // If the next key is an integer, initialize as an array, else object
      const nextKey = keys[i + 1];
      const isArrayIndex =
        typeof nextKey === 'number' || /^(0|[1-9]\d*)$/.test(String(nextKey));

      current[key] = isArrayIndex ? [] : {};
    }

    current = current[key] as Record<string | number, unknown>;
  }

  return obj;
}

export { set };
