import {
  createDirs,
  findDirs,
  greenLog,
  redLog,
  thisSdkDir,
  usageLog,
  runSyncCommandAtDirectory,
} from '../utils.mjs';
import inquirer from 'inquirer';
import fs from 'fs-extra';

const fixPath = (path) => {
  return path == './' ? '' : path.endsWith('/') ? path : `${path}/`;
};

const getTemplatePath = (templateName) => {
  return `${thisSdkDir()}${LIT_CONFIG.templatesRoot}/${templateName}`;
};

export const createNextFunc = async ({ args }) => {
  const userWorkingDir = process.cwd();

  const litProjectPaths = await findDirs(userWorkingDir);

  if (litProjectPaths.length >= 1) {
    // if (!supportedOpts.includes(args[0])) {
    redLog(
      `\n❌ Project has already been initialised in this directory => ${litProjectPaths[0]}\n`
    );
    // redLog(`Use the --force flag to overwrite the existing project\n`);
    process.exit();
  }

  const PROMPT_DIR = args[0];

  // const templatePath = askWhichTemplate();
  const templatePath = getTemplatePath(LIT_CONFIG.createNextPagesTemplate);

  let _srcDir;

  if (PROMPT_DIR !== undefined) {
    _srcDir = fixPath(PROMPT_DIR);
  } else {
    usageLog({
      usage: `getlit create-next-app`,
      options: [{
        name: `path`,
        description: `the directory to install the project in, default ./`
      }],
    });

    // ask user which direcotry they want to install the project in, default ./
    // TODO: check if there's a 'src' directory and use that as the default
    const { srcDir } = await inquirer.prompt([
      {
        type: 'input',
        name: 'srcDir',
        message: 'Where do you want to install the project?',
        default: './',
      },
    ]);
    _srcDir = fixPath(srcDir);
  }

  // append / to the end of the srcDir if it doesn't have one

  const installLocation = `${process.cwd()}/${_srcDir}`;

  const { packageManager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      choices: ['npm', 'yarn', 'bun', 'pnpm'],
    },
  ]);

  greenLog(`\nCreating a new Next app in ${installLocation}\n`);

  // copy the template to the current directory
  try {
    // check if installLocation exists
    createDirs(installLocation);
    await fs.copy(templatePath, installLocation);        
    runSyncCommandAtDirectory(`${packageManager} install`, installLocation, 'inherit');
    runSyncCommandAtDirectory(`git init && git add . && git commit -m "Initial commit"`, installLocation);
    greenLog(`\n🎉 The project has been installed at ${installLocation}\n`);
    process.exit();
  } catch (e) {
    console.log(e);
  }
};
