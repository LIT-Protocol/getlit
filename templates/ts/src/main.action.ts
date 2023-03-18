/**
 * NAME: hello
 */

// This will exceed the default file size limit
// import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";

type SignData = number[];

const helloWorld: SignData = [
  72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
];

const getHelloWorld = (): Promise<SignData> => {
  return new Promise((resolve, reject) => {
    resolve(helloWorld);
  });
};

// export { LitJsSdk };

// @main
(async () => {
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  const sigShare = await LitActions.signEcdsa({
    toSign: new Uint8Array(await getHelloWorld()),
    publicKey, // <-- You should pass this in jsParam
    sigName,
  });

  console.log("sigShare", sigShare);

})();
