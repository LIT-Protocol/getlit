import open from 'open';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser';
import { getLitProjectMetaData, greenLog } from '../utils.mjs';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

//
export const setupFunc = async () => {
  app.use(bodyParser.json());

  const port = LIT_CONFIG.tempServerPort;

  greenLog(
    `\n🔐 Listening at http://localhost:${port}/auth to get your authSig and pkpPublicKey\n`
  );
  await open(`http://localhost:${port}/auth`);

  app.post('/api', async (req, res) => {
    console.log('xbody:', req.body);

    const authSig = req.body.authSig;
    const pkpPublicKey = req.body.pkpPublicKey;

    console.log('authSig:', authSig);
    console.log('pkpPublicKey:', pkpPublicKey);

    const proj = await getLitProjectMetaData();

    const configFile = proj.dir + '/' + LIT_CONFIG.configFile;

    const configFileJson = JSON.parse(
      await fs.promises.readFile(configFile, 'utf8')
    );

    configFileJson.authSig = authSig;
    configFileJson.pkpPublicKey = pkpPublicKey;

    // write to config file
    await fs.promises.writeFile(
      configFile,
      JSON.stringify(configFileJson, null, 2)
    );

    res.json({ message: 'Hello from the API!' });

    // close server
    process.exit();
    
  });

  app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
  });

  app.listen(port, async () => {
    // console.log(`Local server listening at http://localhost:${port}`);
  });
  //   // Open the browser to make the request

  // });
};
