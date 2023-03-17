import inquirer from 'inquirer';
import {
  getLitProjectMetaData,
  LitJsSdk,
  spawnProcess,
  thisSdkDir,
} from '../utils.mjs';
import fs from 'fs';

export async function testFunc({ args }) {
  let actionName = args[0];

  if (!actionName) {
    // ask user what they want to name the action
    let { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your lit action?',
        default: 'main',
      },
    ]);
    actionName = name;
  }

  const proj = await getLitProjectMetaData();

  const testFile = proj.test + actionName + '.t.action.mjs';

  // console.log(testFile);



  // console.log(`${thisSdkDir()}node_modules/@lit-protocol/lit-node-client-nodejs`);

  // spawnProcess(`node ${testFile}`);

  // get the content of the
  const content = fs.readFileSync(
    proj.out + '/' + actionName + '.action.js',
    'utf8'
  );

  const client = new LitJsSdk.LitNodeClientNodeJs({
    litNetwork: 'serrano',
  });

  await client.connect();

  const res = await client.executeJs({
    authSig,
    code: content,
    jsParams: {},
  });

  console.log('res:', res);
}
