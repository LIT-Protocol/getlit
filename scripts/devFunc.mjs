import {
  childRunCommand,
  getConfigFile,
  getLitProjectMetaData,
  redLog,
  selectTest,
} from '../utils.mjs';
import fs from 'fs';
import { promises } from 'fs';
const getActionName = async (args) => {
  // -- validate
  let selectedAction;

  try {
    selectedAction = await selectTest(args);
  } catch (e) {
    redLog(`\n⛔️ ${e.message}\n`);
    process.exit();
  }

  return selectedAction;
};

export const devFunc = async ({ args }) => {
  // -- get var and validate
  const proj = await getLitProjectMetaData();

  const files = await fs.promises.readdir(proj.out);
  if (!files || files.length <= 0) {
    redLog(`\n⛔️ No files found in ${proj.out}.\n   Please run "getlit build" first\n`);
    process.exit();
  }

  const selectedAction = await getActionName(args);
  await getConfigFile();

  // nodemon --watch /Users/user/Projects/test/test-cli/lit_actions/src/ --ext ts --exec "getlit build pear && getlit test pear"
  const cmd = `nodemon --watch ${proj.src} --ext ts --exec "getlit build ${selectedAction} && getlit test ${selectedAction}"`;

  await childRunCommand(cmd);
};
