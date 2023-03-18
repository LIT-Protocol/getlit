import { getArgs, greenLog, redLog } from './utils.mjs';
import fs from 'fs';

const args = getArgs();

const commandMaps = [
  {
    command: 'v',
    description: 'node tools.mjs v',
    fn: async () => {
      const npmVersion = await getLatestVersion();
      greenLog(`📦 Current NPM version: ${npmVersion}`);
      process.exit();
    },
  },
  {
    command: 'bump',
    description: 'node tools.mjs bump [--major|--minor|--patch]',
    fn: bumpFunc,
  },
];

const setup = () => {
  // trigger the function based on the args[0]
  const command = args[0];

  const commandMap = commandMaps.find((commandMap) => {
    return commandMap.command === command;
  });

  if (commandMap) {
    commandMap.fn();
  } else {
    redLog(`\n❌ Command not found: ${command}\n`);

    // show the list of commands
    console.log('Available commands:\n');
    commandMaps.forEach((commandMap) => {
      greenLog(`  - ${commandMap.command} | ${commandMap.description}`);
    });

    greenLog('');

    process.exit();
  }
};

setup();

/**
 * Get the latest version from NPM
 */
async function getLatestVersion() {
  let res = await fetch('https://registry.npmjs.org/getlit');

  res = await res.json();

  // get the last one
  return Object.keys(res.time).pop();
}

async function bumpFunc() {
  const npmVersion = await getLatestVersion();
  const packageJson = JSON.parse(
    await fs.promises.readFile('./package.json', 'utf-8')
  );

  const currentVersion = packageJson.version;

  greenLog(`📦 Current NPM version: ${npmVersion}`);
  greenLog(`📄 Current package.json version: ${currentVersion}`);

  const version = args[1];

  if (!['--major', '--minor', '--patch'].includes(version) || args.length < 2) {
    redLog(
      `\n❌ Please specify the version to bump to.\n   --major | --minor | --patch`
    );
    process.exit();
  }

  if (version === '--patch') {
    // increase x from 0.0.x to 0.0.x+1
    const version = currentVersion.split('.');
    version[2] = parseInt(version[2]) + 1;
    packageJson.version = version.join('.');
  }

  if (version === '--minor') {
    // increase x from 0.x.0 to 0.x+1.0
    const version = currentVersion.split('.');
    version[1] = parseInt(version[1]) + 1;
    version[2] = 0;
    packageJson.version = version.join('.');
  }

  if (version === '--major') {
    // increase x from x.0.0 to x+1.0.0
    const version = currentVersion.split('.');
    version[0] = parseInt(version[0]) + 1;
    version[1] = 0;
    version[2] = 0;
    packageJson.version = version.join('.');
  }

  // write the new version to package.json
  await fs.promises.writeFile(
    './package.json',
    JSON.stringify(packageJson, null, 2)
  );

  greenLog(`\n✅ Successfully bumped to version ${packageJson.version}\n`);
  process.exit();
}
