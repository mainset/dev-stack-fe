import { Command } from 'commander';

type ParseCliOptionDescriptor = {
  commanderFlags: string;
  description?: string;
};

function parseCliOptions(options: ParseCliOptionDescriptor[]) {
  const program = new Command();

  options.forEach(({ commanderFlags, description }) => {
    program.option(commanderFlags, description);
  });

  return program
    .allowUnknownOption() // Bypass {error: unknown option '--config'}
    .allowExcessArguments() // Bypass {error: too many arguments. Expected 0 arguments but got 2.}
    .parse(process.argv)
    .opts();
}

export { parseCliOptions };
