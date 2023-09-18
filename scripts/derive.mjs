import { greenLog } from '../utils.mjs';


export async function deriveFunc({ args }) {
  let params = processArgs(args);
  let client = await bootstrapClient();
  let keyId = client.computeHDKeyId(params.userId, params.appId);
  keyId = keyId.replace('0x', "");


  const pubkey = client.computeHDPubKey(keyId);
  const compressedPubkey = await compressPubKey(pubkey);
  const ethAddr = await ethAddress(pubkey);
  if (params.format == 'compressed') {
    greenLog(`derived public key: ${compressedPubkey}`); 
  } else if (params.format == 'uncompressed') {
    greenLog(`derived public key:  ${pubkey}`);
    greenLog(`derived ethereum address: ${ethAddr}`); 
  } else {
    greenLog(`derived uncompressed public key:  ${pubkey}`);
    greenLog(`derived compressed public key: ${compressedPubkey}`);
    greenLog(`derived ethereum address: ${ethAddr}`);
  }
}

function processArgs(args) {
    if (args.length < 2) {
        throw new Error("Invalid number of arguments aborting");
        return;
    }
    let params = {}
    for (let arg of args) {
        arg = arg.replaceAll("-", "");
        let parts = arg.split("=");
        if (parts.length == 2) {
          params[parts[0]] = parts[1];
        } else {
          params[parts[0]] = true;
        }
    }

    return params;
}

async function bootstrapClient() {
  let client;

  try {
    const LitJsSdk = await import('@lit-protocol/lit-node-client-nodejs').then(
      (LitJsSdk) => LitJsSdk
    );

    client = new LitJsSdk.LitNodeClientNodeJs({
      litNetwork: 'cayenne',
      // debug: false
    });
    await client.connect();
  } catch (e) {
    errorLog(
      `🚨 Cannot find package! Running "yarn add @lit-protocol/lit-node-client-nodejs"...\n`
    );
  }

  return client;
}

async function compressPubKey(pubKey) {
    const testBuffer = Buffer.from(pubKey, 'hex');
    if (testBuffer.length === 64) {
      pubKey = '04' + pubKey;
    }
  
    // const hex = Buffer.from(pubKey, 'hex');
    const uint8array = new Uint8Array(Buffer.from(pubKey, 'hex'));
    const secp = await import('secp256k1');

    const compressedKey = secp.default.publicKeyConvert(uint8array, true);
    const hex = Buffer.from(compressedKey).toString('hex');
  
    return hex;
};


async function ethAddress(pubkey) {
  console.log(pubkey);
  const pubKeyToAddr = await import('ethereum-public-key-to-address');
  const addr = pubKeyToAddr.default(pubkey)
  return addr;
}

