import open from 'open';
import express from 'express';

const app = express();

//
export const authSigFunc = () => {
  const port = LIT_CONFIG.tempServerPort;
  // console.log("port:", port);

  // Start the server and listen for the request
  const server = app.listen(port, async () => {
    console.log(`Local server listening at http://localhost:${port}`);

    // Open the browser to make the request
    await open(`http://localhost:${port}`);
  });
};
