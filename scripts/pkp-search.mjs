import { greenLog } from '../utils.mjs';
import {LitContracts} from "@lit-protocol/contracts-sdk";
import {providers, ethers} from "ethers";

export async function pkpSearchFunc({ args }) {
    let params = processArgs(args);
    let rpcProvider = new providers.JsonRpcProvider("https://chain-rpc.litprotocol.com/http", 175177);
    let contractsClient = bootstrapClient(rpcProvider);
    
    await contractsClient.connect();

    switch(params.get) {
        case "authMethodScopes":
            const scopes = await getAuthMethodScopes(contractsClient, params.publicKey, params.authMethodId, params.type);
            greenLog(`${params.tokenId}\n${scopes}`);
            break;
        
        case "authMethods":
            const authMethods = await searchAuthMethods(contractsClient, params.publicKey);
            greenLog(`${authMethods}`);
            break;
        
        case "ethAddr":
            const ethAddr = await getEthAddress(client, params.publicKey);
            greenLog(ethAddr);
            break;
        
        case "tokenIds":
            const tokenIds = await getTokenIdsByAuthMethod(contractsClient, params.authMethodId, params.clientId, params.appId, params.type);
            greenLog(`${tokenIds}`);
            break;
    }


    process.exit(0);
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

function bootstrapClient(provider) {
    let contract = new LitContracts({
        signer: provider
    });
    return contract;
}

async function searchAuthMethods(client, pk) {
    let tokenId = ethers.utils.keccak256(`0x${pk}`);
    const tokenIds = await client.pkpPermissionsContract.read.getPermittedAuthMethods(tokenId);
    return tokenIds;
}

async function getAuthMethodScopes(client, pk, authMethodId, authMethodType) {
    let tokenId = ethers.utils.keccak256(`0x${pk}`);
    const scopes = await client.pkpPermissionsContract.read.getPermittedAuthMethodScopes(tokenId, authMethodType, authMethodId, 200);
    return scopes;
}

async function getEthAddress(client, pk) {
    let tokenId = ethers.utils.keccak256(`0x${pk}`);
    const ethAddr = await client.pkpPermissionsContract.read.getEthAddress(tokenId);
    return ethAddr;
}

async function getTokenIdsByAuthMethod(client, authMethodId, clientId, appId, type) {
    if (!authMethodId) {
        authMethodId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${clientId}:${appId}`));
    }

    const tokenIds = await client.pkpPermissionsContract.read.getTokenIdsForAuthMethod(type, authMethodId);

    return tokenIds;
}