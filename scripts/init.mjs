import {
  createDirs,
  findDirs,
  greenLog,
  listDirsRecursive,
  redLog,
  thisSdkDir,
} from '../utils.mjs';
import inquirer from 'inquirer';
import fs from 'fs-extra';

/**
 * Asks the user which template they want to use
 * @returns {string} the path to the template
 */
// const askWhichTemplate = async () => {
//   const dirs = await listDirsRecursive(`${thisSdkDir()}/templates`, false);

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

//   return `${thisSdkDir()}templates/templatePath`;
// };

const fixPath = (path) => {
  return path == './' ? '' : path.endsWith('/') ? path : `${path}/`;
};

const getTemplatePath = (templateName) => {
  return `${thisSdkDir()}${LIT_CONFIG.templatesRoot}/${templateName}`;
};

export const initFunc = async ({ args }) => {
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
  const templatePath = getTemplatePath(LIT_CONFIG.selectedTemplate);

  let _srcDir;

  if (PROMPT_DIR !== undefined) {
    _srcDir = fixPath(PROMPT_DIR);
  } else {
    greenLog(`
    Usage: getlit here [options]
    
    Options:
    
      <project-name>  The name of the project
      
        `);

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

  const projectName = LIT_CONFIG.projectName;

  // append / to the end of the srcDir if it doesn't have one

  const installLocation = `${process.cwd()}/${_srcDir}${projectName}`;

  greenLog(`🎉 The project has been installed at ${installLocation}`);

  // copy the template to the current directory
  try {
    // check if installLocation exists
    createDirs(installLocation);
    await fs.copy(templatePath, installLocation);
    process.exit();
  } catch (e) {
    console.log(e);
  }
};
