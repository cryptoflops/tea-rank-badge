import kleur from 'kleur';

let quiet = false;
let debug = false;

export const setLogLevel = (opts: { quiet?: boolean; debug?: boolean }) => {
  quiet = opts.quiet || false;
  debug = opts.debug || false;
};

export const log = {
  info: (message: string) => {
    if (!quiet) console.log(kleur.blue('ℹ'), message);
  },
  success: (message: string) => {
    if (!quiet) console.log(kleur.green('✓'), message);
  },
  warn: (message: string) => {
    if (!quiet) console.warn(kleur.yellow('⚠'), message);
  },
  error: (message: string) => {
    console.error(kleur.red('✖'), message);
  },
  debug: (message: string, data?: any) => {
    if (debug) {
      console.log(kleur.gray('⚙'), message);
      if (data) console.log(kleur.gray(JSON.stringify(data, null, 2)));
    }
  },
};