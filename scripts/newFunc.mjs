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
  const tempContent = readSdkFile(LIT_CONFIG.defaultSrcTemplate);
  const srcFileName = `${srcFolder}${actionName}.action.ts`;

  const tempTest = readSdkFile(LIT_CONFIG.defaultTestTemplate);
  const testFileName = `${testFolder}${actionName}.t.action.mjs`;

  async function createFiles() {
    greenLog('\n');
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

    greenLog('\n');
  }

  await createFiles();

  process.exit();
}
