import inquirer from 'inquirer';
import {
  getLitProjectMetaData,
  greenLog,
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
  // if (!args[0]) {
  //   usageLog({
  //     usage: 'getlit action <lit-action-name>',
  //     options: [
  //       {
  //         name: 'lit-action-name',
  //         description: 'the name of the lit action',
  //       },
  //     ],
  //   });
  //   process.exit();
  // }

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
        default: 'main',
      },
    ]);

    actionName = name;
  }

  // get the content from the templates/template.action.ts folder
  let tempContent;
  let srcFileName;

  try {
    tempContent = readSdkFile(LIT_CONFIG.defaultSrcTemplate);
    const ext = exts(LIT_CONFIG.defaultSrcTemplate);
    srcFileName = `${srcFolder}${actionName}${ext}`;
  } catch (e) {
    redLog(
      `\n❌ Could not find the default action template at ${LIT_CONFIG.defaultSrcTemplate}\n`
    );
    process.exit();
  }

  // get the content from the templates/template.test.ts folder
  let tempTest;
  let testFileName;

  try {
    tempTest = readSdkFile(LIT_CONFIG.defaultTestTemplate);
    const ext = exts(LIT_CONFIG.defaultTestTemplate);
    testFileName = `${testFolder}${actionName}${ext}`;
  } catch (e) {
    redLog(
      `\n❌ Could not find the default test template at ${LIT_CONFIG.defaultTestTemplate}\n`
    );
    process.exit();
  }

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
