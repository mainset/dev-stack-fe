const TERMINAL_COLOR__BY_KEY = {
  RESET: '\x1b[0m',
  // Regular colors
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  // Bright colors
  BRIGHT_RED: '\x1b[91m',
  BRIGHT_GREEN: '\x1b[92m',
  BRIGHT_YELLOW: '\x1b[93m',
} as const;

const EMOJI__BY_COLOR_KEY: Partial<
  Record<keyof typeof TERMINAL_COLOR__BY_KEY, string>
> = {
  RED: '❌',
  BRIGHT_RED: '❌',

  YELLOW: '⚠️',
  BRIGHT_YELLOW: '⚠️',

  GREEN: '✅',
  BRIGHT_GREEN: '✅',
};

const consoleColorize = (
  color: keyof typeof TERMINAL_COLOR__BY_KEY,
  text: string,
) => {
  const emoji = color ? `${EMOJI__BY_COLOR_KEY[color]}  ` : '';
  return `${emoji}${TERMINAL_COLOR__BY_KEY[color]}${text}${TERMINAL_COLOR__BY_KEY.RESET}`;
};

export { consoleColorize };
