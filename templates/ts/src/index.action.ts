/**
 * VAR: HelloWorld
 */

export type HelloWorld = 'Hello World!';

export const helloWorld: HelloWorld = 'Hello World!';

export const getHelloWorld = (): Promise<HelloWorld> => {
  return new Promise((resolve, reject) => {
    resolve(helloWorld);
  });
};
