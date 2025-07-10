interface MergeOptions {
  isSourceObjMutated: boolean;
}

function merge<T extends object>(
  obj1: T,
  obj2: T,
  options: MergeOptions = { isSourceObjMutated: false },
) {
  const result = options.isSourceObjMutated ? obj1 : { ...obj1 };

  for (const key in obj2) {
    if (Array.isArray(obj2[key]) && Array.isArray(result[key])) {
      // Concatenate arrays
      result[key] = [...result[key], ...obj2[key]] as T[Extract<
        keyof T,
        string
      >];
    } else if (
      typeof obj2[key] === 'object' &&
      obj2[key] !== null &&
      typeof result[key] === 'object' &&
      result[key] !== null
    ) {
      // Recursively merge nested objects
      result[key] = merge(result[key], obj2[key], options);
    } else {
      // Overwrite or add new key
      result[key] = obj2[key];
    }
  }

  return result;
}

export { merge };
