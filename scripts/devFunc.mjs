import {
  childRunCommand,
  getConfigFile,
  getLitProjectMetaData,
  redLog,
  selectTest,
} from '../utils.mjs';

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
  // -- var
  const selectedAction = await getActionName(args);
  await getConfigFile();

  const proj = await getLitProjectMetaData();

  // nodemon --watch /Users/user/Projects/test/test-cli/lit_actions/src/ --ext ts --exec "getlit build pear && getlit test pear"
  const cmd = `nodemon --watch ${proj.src} --ext ts --exec "getlit build ${selectedAction} && getlit test ${selectedAction}"`;

  await childRunCommand(cmd);
};
