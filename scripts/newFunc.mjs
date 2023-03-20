import inquirer from 'inquirer';
import {
  findDirs,
  getLitProjectMetaData,
  greenLog,
  projectCreated,
  readSdkFile,
  redLog,
  usageLog,
  writeFile,
} from '../utils.mjs';
import fs from 'fs';

import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

const exts = (str) => {
  const parts = str.split('.');
  const ext2 = parts.pop();
  const ext1 = parts.pop();
  return `.${ext1}.${ext2}`;
};

export async function newFunc({ args }) {
  // -- validate
  await projectCreated();

  const proj = await getLitProjectMetaData();

  const srcFolder = proj.src;
  const testFolder = proj.test;

  console.log('');

  let actionName = args[0];

  if (!actionName) {
    // ask user what they want to name the action
    let { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What do you want to name the action?',
        default: 'bar',
      },
    ]);

    actionName = name;
  }

  /**
   * Loads the default action template, extracts its extension, and constructs
   * the action source file name. Logs an error message and exits the process
   * if the default action template is not found.
   */
  let tempContent;
  let srcFileName;

  try {
    tempContent = readSdkFile(LIT_CONFIG.defaultSrcTemplate);

    // replace the string 'placeholder' with the action name
    tempContent = tempContent.replace('placeholder', actionName);

    const ext = exts(LIT_CONFIG.defaultSrcTemplate);
    srcFileName = `${srcFolder}${actionName}${ext}`;
  } catch (e) {
    redLog(
      `\n❌ Could not find the default action template at ${LIT_CONFIG.defaultSrcTemplate}\n`
    );
    process.exit();
  }

  /**
   * Loads the default test template, extracts its extension, and constructs
   * the test source file name. Logs an error message and exits the process
   * if the default test template is not found.
   */
  let tempTest;
  let testFileName;

  try {
    tempTest = readSdkFile(LIT_CONFIG.defaultTestTemplate);
    const ext = exts(LIT_CONFIG.defaultTestTemplate);
    testFileName = `${testFolder}${actionName}.t${ext}`;
  } catch (e) {
    redLog(
      `\n❌ Could not find the default test template at ${LIT_CONFIG.defaultTestTemplate}\n`
    );
    process.exit();
  }

  /**
   * createFiles - Creates action and test files if they don't exist.
   * If the action file exists, logs an error message.
   * If the test file exists, logs an error message.
   * On successful creation of action file, logs a success message.
   * On successful creation of test file, logs a success message.
   */
  async function createFiles() {
    if (fs.existsSync(srcFileName)) {
      redLog(`  ❌ Action already exists at ${srcFileName}\n`);
    } else {
      try {
        await writeFileAsync(srcFileName, tempContent);
        greenLog(`  ✅ Action created at ${srcFileName}\n`);
      } catch (err) {
        throw err;
      }
    }

    if (fs.existsSync(testFileName)) {
      redLog(`  ❌ Test already exists at ${testFileName}\n`);
    } else {
      try {
        await writeFileAsync(testFileName, tempTest);
        greenLog(`  ✅ Test created at ${testFileName}\n`);
      } catch (err) {
        throw err;
      }
    }
  }

  await createFiles();

  process.exit();
}
