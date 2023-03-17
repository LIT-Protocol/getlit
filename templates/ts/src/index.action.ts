/**
 * VAR: HelloWorld
 */

// This will exceed the default file size limit
// import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";

export type HelloWorld = "Hello World!";

export const helloWorld: HelloWorld = "Hello World!";

export const getHelloWorld = (): Promise<HelloWorld> => {
  return new Promise((resolve, reject) => {
    resolve(helloWorld);
  });
};

// export { LitJsSdk };

console.log(helloWorld);
