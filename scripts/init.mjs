import {
  createDirs,
  greenLog,
  listDirsRecursive,
  projectDir,
} from '../utils.mjs';
import inquirer from 'inquirer';
import fs from 'fs-extra';

/**
 * Asks the user which template they want to use
 * @returns {string} the path to the template
 */
// const askWhichTemplate = async () => {
//   const dirs = await listDirsRecursive(`${projectDir()}/templates`, false);

//   const dirNames = dirs.map((dir) => {
//     return dir.split('/').pop();
//   });

//   // make the dirs selectable in the prompt using inquirer
//   const choices = dirNames.map((dir, i) => {
//     return {
//       name: dir,
//       value: dirs[i],
//     };
//   });

//   const { templatePath } = await inquirer.prompt([
//     {
//       type: 'list',
//       name: 'templatePath',
//       message: 'Select a template',
//       choices,
//     },
//   ]);

//   return templatePath;
// };

const fixPath = (path) => {
  return path == './' ? '' : path.endsWith('/') ? path : `${path}/`;
};

export const initFunc = async ({ args }) => {
  const PROMPT_DIR = args[0];

  //   greenLog(`
  // Usage: getlit init [options]

  // Options:
  //   -h, --help      output usage information
  //   `);

  // const templatePath = askWhichTemplate();
  const templatePath = `${projectDir()}templates/${
    LIT_CONFIG.default.templateVersion
  }`;

  let _srcDir;

  if (PROMPT_DIR !== undefined) {
    _srcDir = fixPath(PROMPT_DIR);
  } else {
    // ask user which direcotry they want to install the project in, default ./
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

  const projectName = LIT_CONFIG.default.projectName;

  // append / to the end of the srcDir if it doesn't have one

  const installLocation = `${process.cwd()}/${_srcDir}${projectName}`;

  greenLog(`Creating your project at ${installLocation}`);

  // copy the template to the current directory
  try {
    // check if installLocation exists
    createDirs(installLocation);

    await fs.copy(templatePath, installLocation);
  } catch (e) {
    console.log(e);
  }
};
