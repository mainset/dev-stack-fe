interface DebouncedFn<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
  flush: (...args: TArgs) => void;
}

function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number,
): DebouncedFn<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced: DebouncedFn<TArgs> = (...args: TArgs): void => {
    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delay);
  };

  debounced.cancel = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  debounced.flush = (...args: TArgs): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }

    fn(...args);
  };

  return debounced;
}

export { debounce };
