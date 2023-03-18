import inquirer from 'inquirer';
import {
  childRunCommand,
  getLitProjectMetaData,
  greenLog,
  redLog,
} from '../utils.mjs';
import fs from 'fs';

export const getConfigFile = async () => {
  const proj = await getLitProjectMetaData();

  const configFile = proj.dir + '/' + LIT_CONFIG.configFile;

  const configFileJson = JSON.parse(
    await fs.promises.readFile(configFile, 'utf8')
  );

  if (!configFileJson.authSig || !configFileJson.pkpPublicKey) {
    redLog(
      `\n⛔️ Configuration file appears to be incorrect. Please check your config located at:
  ${proj.dir}/${LIT_CONFIG.configFile}\n
  Alternatively, you can run "getlit setup" to fix the issue.
      `
    );
    process.exit();
  }

  return configFileJson;
};

export async function testFunc({ args }) {
  // -- validate
  const userConfig = await getConfigFile();

  let actionName = args[0];

  if (!actionName) {
    greenLog('');
    // ask user what they want to name the action
    let { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your lit action?',
        default: 'main',
      },
    ]);
    greenLog('');
    actionName = name;
  }

  const proj = await getLitProjectMetaData();

  const testFile = proj.test + actionName + '.t.action.mjs';

  // check if test file exists
  if (!fs.existsSync(testFile)) {
    redLog(`\n❌ Test file does not exist at ${testFile}\n`);
    process.exit();
  }

  greenLog(`\n🧪 Testing => ${testFile}\n`);

  await childRunCommand(`node ${testFile}`);

  process.exit();
}
