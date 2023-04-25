import {
  getLitProjectMetaData,
  greenLog,
  redLog,
  selectSrc,
} from '../utils.mjs';
import fs from 'fs';

const IPFS_GATEWAY = `https://ipfs.litgateway.com/ipfs/`;

export async function deployFunc({ args }) {
  const actionName = args[0] || (await selectSrc('deploy'));

  const proj = await getLitProjectMetaData();

  // try to get the action file content
  const actionFile = proj.out + actionName + '.action.js';
  let actionFileContent = await fs.promises.readFile(actionFile, 'utf8');

  const actionFileTs = proj.src + actionName + '.action.ts';
  const actionFileTsContent = await fs.promises.readFile(actionFileTs, 'utf8');

  // if the file doesn't exist, exit
  if (!fs.existsSync(actionFile)) {
    redLog(`\n❌ Action file does not exist at ${actionFile}\n`);
    process.exit();
  }

  const tsHash = await upload(actionFileTsContent);

  actionFileContent = insertSrc(actionFileContent, `TYPESCRIPT SOURCE: ${IPFS_GATEWAY}${tsHash}`);

  const ipfsHash = await upload(actionFileContent);

  greenLog(`\n🚀 Action deployed at ${IPFS_GATEWAY}${ipfsHash}\n`);

  // write to log file in the project root proj.dir
  const logFile = proj.dir + '/deploy.log';

  // include the timestamp in format: 2021-01-01T00:00:00.000Z
  const timestamp = new Date().toISOString();

  // write to log file
  await fs.promises.appendFile(logFile, `${timestamp} ${actionName} ${ipfsHash}\n`);

  process.exit();
}

function insertSrc(text, srcText) {
  const nameKeyword = ' * NAME:';
  const index = text.indexOf(nameKeyword);

  if (index === -1) {
    throw new Error('NAME keyword not found');
  }

  const beforeName = text.slice(0, index);
  const afterName = text.slice(index);

  return `${beforeName} * ${srcText}\n${afterName}`;
}

async function upload(code) {
  const url = 'https://lit-actions-deployer.herokuapp.com/';
  let data;
  try {
    data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
      }),
    });
    data = await data.json();
    data = data.res;
  } catch (e) {
    redLog(`\n❌ Error deploying action file at ${actionFile}\n`);
  }
  if (data.status !== 200) {
    console.log(data);
    process.exit();
  }
  const ipfsHash = data.data.IpfsHash;

  return ipfsHash;
}
