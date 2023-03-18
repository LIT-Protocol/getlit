import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { exit } from 'process';
import readline from 'readline';
import { join } from 'path';

const rl = readline.createInterface(process.stdin, process.stdout);

try {
  Array.prototype.asyncForEach = async function (callback) {
    for (let index = 0; index < this.length; index++) {
      await callback(this[index], index, this);
    }
  };
} catch (e) {
  // swallow
}

/**
 * replaceAutogen - Replaces the content between the specified start and end delimiters
 * with new content.
 *
 * @param {string} startDelimiter - The string that marks the start of the content to be replaced.
 * @param {string} endDelimiter - The string that marks the end of the content to be replaced.
 * @param {string} newContent - The new content that will replace the old content.
 *
 * @returns {string} The input string with the content between the start and end
 * delimiters replaced with the new content.
 */

export const replaceAutogen = ({
  oldContent,
  startsWith = '// ----- autogen:imports:start  -----',
  endsWith = '// ----- autogen:imports:end  -----',
  newContent,
}) => {
  // Find the start and end indices of the content to be replaced.
  const startIndex = oldContent.indexOf(startsWith) + startsWith.length;
  const endIndex = oldContent.indexOf(endsWith);

  // Extract the content to be replaced.
  const _oldContent = oldContent.substring(startIndex, endIndex);

  // Replace the old content with the new content.
  const newStr = oldContent.replace(_oldContent, `\n${newContent}\n`);

  return newStr;
};

/**

Recursively finds directories matching a given search term, starting from a specified directory.
@param {string} dir - The directory to start searching from.
@param {string} [searchTerm=LIT_CONFIG.projectName] - The directory name to search for.
@param {number} [depth=4] - The maximum depth to search.
@returns {Promise<string[]>} paths - An array of found directories matching the search term.
*/
export async function findDirs(
  dir,
  searchTerm = LIT_CONFIG.projectName,
  depth = 4
) {
  const files = fs.readdirSync(dir);
  let paths = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      if (file === searchTerm) {
        paths.push(filePath);
      } else if (depth > 0) {
        const subPaths = await findDirs(filePath, searchTerm, depth - 1);
        paths = paths.concat(subPaths);
      }
    }
  }

  return paths;
}

export const getLitProjectMetaData = async () => {
  const litProjectWorkingDir = process.cwd();

  // let litProjectPath;

  const litProjectPaths = await findDirs(litProjectWorkingDir);

  const workingDir = litProjectPaths[0];

  return {
    all: litProjectPaths,
    dir: workingDir,
    src: workingDir + '/' + LIT_CONFIG.buildConfig.srcDir + '/',
    out: workingDir + '/' + LIT_CONFIG.buildConfig.outDir + '/',
    test: workingDir + '/' + LIT_CONFIG.buildConfig.testDir + '/',
  };
};

export const humanizeBytes = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  if (bytes === 0) return 'n/a';

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);

  if (i === 0) return `${bytes} ${sizes[i]}`;

  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

// read the file and return as json
export async function readJsonFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export function readProjectJsonFile(filename) {
  const filePath = thisSdkDir() + filename;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export function readSdkFile(filename) {
  const filePath = thisSdkDir() + filename;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return fileContents;
}

export async function readFile(filename) {
  const filePath = path.join(process.cwd(), filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return fileContents;
}

// create a function to write to file
export async function writeJsonFile(filename, content) {
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

export async function writeFile(filename, content) {
  const filePath = path.join(process.cwd(), filename);
  fs.writeFileSync(filePath, content);
}

// run a command
export async function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Asynchronously runs the specified command and returns the output.
 *
 * @param {string} command The command to run.
 *
 * @return {Promise<string>} A promise that resolves with the output of the command.
 *
 * @throws {Error} If the command fails to run.
 */
export async function childRunCommand(command) {
  return new Promise((resolve, reject) => {
    const child = exec(
      command,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout.trim());
      },
      {
        env: {
          ...process.env,
          FORCE_COLOR: true,
        },
      }
    );
    child.stdout.on('data', (data) => {
      console.log(`${data.toString().replace(/\n$/, '')}`);
    });

    child.stderr.on('data', (data) => {
      console.warn(`${data.toString().replace(/\n$/, '')}`);
    });

    child.on('close', (code) => {
      // console.log(`child process exited with code ${code}`);
      // exit();
    });
  });
}

/**
 * Usage Examples:
 * spawnProcess('yarn tools --dev --apps');
 * spawnProcess('yarn nx run nodejs:serve', {
 *  prefix: '[nodejs]',
 *  color: 31,
 *  spawnOptions: {
 *    cwd: './src',
 *  }
 * });
 * 
 * Advanced Usage:
 * spawnProcess('yarn build:packages', {
        onDone: () => {
            spawnProcess('yarn npx lerna publish --force-publish', {
                onDone: () => {
                    console.log('Done!');
                },
            });
        },
        onExit: (exitCode) => {
            console.log('Exit Code: ', exitCode);
        }
    });
 * 
 */
export const spawnProcess = (
  commands,
  opt = {
    prefix: '',
    color: 32,
    spawnOptions: {},
    onDone: () => {},
    onExit: () => {},
  }
) => {
  let _commands = commands.split(' ');

  // let eventName = commands.split(' ')[1].replace('.mjs', '');

  // make commands to pass to spawn
  const command = _commands[0];
  const args = _commands.slice(1);

  // Use the spawn() function to run the command in a child process
  let bob = spawn(command, args, {
    ...opt.spawnOptions,
    env: {
      ...process.env,
      FORCE_COLOR: true,
    },
  });

  bob.on('error', (error) => {
    console.error(`Error occurred in the child process: ${error.message}`);
    // handle the error here
  });

  bob.on('exit', (exitCode) => {
    if (parseInt(exitCode) !== 0) {
      // handle non-exit code
      redLog(
        `child process exited with code ${exitCode} when running ${command}`
      );

      if (opt?.onExit) {
        opt?.onExit(exitCode);
      }
      exit();
    }

    if (opt?.onDone) {
      opt?.onDone(exitCode);
    }
  });

  // Handle child process output
  // bob.stdout.pipe(process.stdout);
  // randomize the color

  // if (!opt.color) {
  //   opt.color = Math.floor(Math.random() * 6) + 31;
  // }

  bob.stdout.on('data', (data) => {
    if (!opt.prefix) {
      console.log(
        `\x1b[${opt.color}m%s\x1b[0m`,
        data.toString().replace(/\n$/, '')
      );
    } else {
      console.log(
        `\x1b[${opt.color}m%s\x1b[0m: %s`,
        opt.prefix,
        data.toString().replace(/\n$/, '')
      );
    }
  });

  // foward the key to the child process
  process.stdin.on('data', (key) => {
    bob.stdin.write(key);
  });

  return bob;
};

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const getArgs = () => {
  const args = process.argv.slice(2);
  return args;
};

export const redLog = (msg, noDash = false) => {
  if (noDash) {
    console.log('\x1b[31m%s\x1b[0m', `- ${msg}`);
  } else {
    console.log('\x1b[31m%s\x1b[0m', msg);
  }
};

export const greenLog = (msg, noDash = false) => {
  if (noDash) {
    console.log('\x1b[32m%s\x1b[0m', `- ${msg}`);
  } else {
    console.log('\x1b[32m%s\x1b[0m', msg);
  }
};

export const usageLog = ({ usage, options }) => {
  const optionsStr = options.map((option) => {
    return `    <${option.name}>  ${option.description}`;
  });

  greenLog(`
  Usage: ${usage} [options]
  
  Options:
  
    ${optionsStr}
    
      `);
};

export const yellowLog = (msg, noDash = false) => {
  if (noDash) {
    console.log('\x1b[33m%s\x1b[0m', `- ${msg}`);
  } else {
    console.log('\x1b[33m%s\x1b[0m', msg);
  }
};

export const question = (str, { yes, no }) => {
  return new Promise((resolve) => {
    return rl.question(`- ${str} [yes]/no:`, async (answer) => {
      if (answer === 'no' || answer === 'n') {
        no.call(answer);
      }

      if (answer === 'yes' || answer === 'y') {
        yes.call(answer);
      }

      // if nethers of the above, assume yes
      if (
        answer !== 'yes' &&
        answer !== 'y' &&
        answer !== 'no' &&
        answer !== 'n'
      ) {
        redLog('Invalid answer, exiting...');
      }

      resolve();
    });
  });
};

export const getFiles = (path) =>
  new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      resolve(files);
    });
  });

// wait for 1 second
export const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// recursively list all directories in a directory and return paths relative to root
export const listDirsRecursive = async (dir, recursive = true) => {
  const root = join(dir, '..', '..');
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  const dirs = [];
  for (const file of files) {
    if (file.isDirectory()) {
      const path = join(dir, file.name);
      dirs.push(path);

      if (recursive) {
        dirs.push(...(await listDirsRecursive(path)));
      }
    }
  }
  return dirs;
};

export const tree = async (dir, recursive = false) => {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });
  const dirs = [];
  for (const file of files) {
    if (file.isDirectory()) {
      const path = join(dir, file.name);
      dirs.push(path);

      if (recursive) {
        dirs.push(...(await listDirsRecursive(path)));
      }
    }
  }
  return dirs;
};

export const findImportsFromDir = async (dir) => {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });

  const packages = [];

  await asyncForEach(files, async (file) => {
    if (!file.isDirectory()) {
      const filePath = join(dir, file.name);
      // greenLog(`    - Scanning => ${filePath}`, true);

      const contents = await fs.promises.readFile(filePath, 'utf-8');

      // use regex to find all from 'package-name'
      const regex = /from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(contents)) !== null) {
        const pkg = match[1];
        packages.push(pkg);
      }
    }
  });

  return packages;
};

export const findStrFromDir = async (dir, str) => {
  const files = await fs.promises.readdir(dir, { withFileTypes: true });

  const paths = [];

  await asyncForEach(files, async (file) => {
    if (!file.isDirectory()) {
      const filePath = join(dir, file.name);
      // greenLog(`    - Scanning => ${filePath}`, true);

      const contents = await fs.promises.readFile(filePath, 'utf-8');

      // use regex to find if content has str
      const regex = new RegExp(str, 'g');

      let match;
      while ((match = regex.exec(contents)) !== null) {
        paths.push(filePath);
      }
    }
  });

  const uniquePaths = [...new Set(paths)];

  return uniquePaths;
};

export const createDirs = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};
export const customSort = (arr, orderJson) => {
  arr.sort((a, b) => {
    if (orderJson[a] !== undefined && orderJson[b] !== undefined) {
      return orderJson[a] - orderJson[b];
    } else if (orderJson[a] !== undefined) {
      return -1;
    } else if (orderJson[b] !== undefined) {
      return 1;
    } else {
      return 0;
    }
  });

  return arr;
};

// create a function that recursively find all files content contains a string 'hello'
export const findFilesWithContent = async (dir, content) => {
  const files = await fs.promises
    .readir(dir, { withFileTypes: true })
    .catch((err) => {
      console.log(err);
    });

  const foundFiles = [];

  await asyncForEach(files, async (file) => {
    if (!file.isDirectory()) {
      const filePath = join(dir, file.name);
      const contents = await fs.promises
        .readFile(filePath, 'utf-8')
        .catch((err) => {
          console.log(err);
        });

      if (contents.includes(content)) {
        foundFiles.push(filePath);
      }
    } else {
      const path = join(dir, file.name);
      foundFiles.push(...(await findFilesWithContent(path, content)));
    }
  });

  return foundFiles;
};

export const replaceFileContent = async (path, oldContent, newContent) => {
  const file = path;
  let content = await readFile(file);
  content = content.replaceAll(oldContent, newContent);
  await writeFile(file, content);
  return content;
};

/**
 * Examples:
 * 1. prefixPathWithDir('./src/index.js', 'components') => './components/src/index.js'
 * 2. prefixPathWithDir('src/index.js', 'components') => './components/src/index.js'
 */
export const prefixPathWithDir = (path, dirName) => {
  if (path.slice(0, 2) === './') {
    return `./${dirName}/${path.slice(2)}`;
  } else {
    return `./${dirName}/${path}`;
  }
};

// lerna.json version x.x.x must be greater than each individual package.json version x.x.x
export const versionChecker = (pkg, lernaVersion) => {
  const version = pkg.version;

  // version cannot be the same as lerna.json version
  if (version === lernaVersion) {
    return {
      status: 500,
      message: `Skipping ${pkg.name} as version is the same as lerna.json version`,
    };
  }

  // lerna.json version x.x.x must be greater than package.json version x.x.x
  const lernaVersionArr = lernaVersion.split('.');
  const versionArr = version.split('.');
  const lernaVersionMajor = parseInt(lernaVersionArr[0]);
  const lernaVersionMinor = parseInt(lernaVersionArr[1]);
  const lernaVersionPatch = parseInt(lernaVersionArr[2]);
  const versionMajor = parseInt(versionArr[0]);
  const versionMinor = parseInt(versionArr[1]);
  const versionPatch = parseInt(versionArr[2]);

  if (lernaVersionMajor < versionMajor) {
    return {
      status: 500,
      message: `Skipping ${pkg.name} as lerna.json version is less than package.json version`,
    };
  }

  if (lernaVersionMajor === versionMajor && lernaVersionMinor < versionMinor) {
    return {
      status: 500,
      message: `Skipping ${pkg.name} as lerna.json version is less than package.json version`,
    };
  }

  if (
    lernaVersionMajor === versionMajor &&
    lernaVersionMinor === versionMinor &&
    lernaVersionPatch <= versionPatch
  ) {
    return {
      status: 500,
      message: `Skipping ${pkg.name} as lerna.json version is less than package.json version`,
    };
  }

  return { status: 200, message: `${pkg.name}@${version} => @${lernaVersion}` };
};

export const getPackageVersion = () => {
  const pkg = JSON.parse(
    fs.readFileSync(`${thisSdkDir()}/package.json`, 'utf8')
  );
  return pkg.version;
};

export const thisSdkDir = () => {
  const __dirname = new URL('.', import.meta.url).pathname;

  return __dirname;
};
