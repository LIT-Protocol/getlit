import { greenLog, tableLog } from '../utils.mjs';
import {LitContracts} from "@lit-protocol/contracts-sdk";
import {providers, ethers} from "ethers";

export async function pkpSearchFunc({ args }) {
    let params = processArgs(args);
    
    if (params.help) {
        greenLog(printHelp());
    }
    
    let rpcProvider = new providers.JsonRpcProvider("https://chain-rpc.litprotocol.com/http", 175177);
    let contractsClient = bootstrapClient(rpcProvider);
    
    await contractsClient.connect();

    switch(params.get) {
        case "authMethodScopes":
            const scopes = await getAuthMethodScopes(contractsClient, params.publicKey, params.authMethodId, params.type, params.maxScope);
            !params.format && greenLog(`${JSON.stringify(scopes)}`);
            params.format === "table" && tableLog(scopes);
            break;
        
        case "authMethods":
            const authMethods = await searchAuthMethods(contractsClient, params.publicKey);
            !params.format && greenLog(`${JSON.stringify(authMethods)}`);
            params.format === "table" && tableLog(authMethods);
            break;
        
        case "ethAddr":
            const ethAddr = await getEthAddress(client, params.publicKey);
            !params.format && greenLog(`${JSON.stringify(ethAddr)}`);
            params.format === "table" && tableLog(ethAddr);
            break;
        
        case "tokenIds":
            const tokenIds = await getTokenIdsByAuthMethod(contractsClient, params.authMethodId, params.clientId, params.appId, params.type);
            !params.format && greenLog(`${JSON.stringify(tokenIds)}`);
            params.format === "table" && tableLog(tokenIds);
            break;
    }

    process.exit(0);
}

function processArgs(args) {
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

function printHelp() {
    const message = `
usage: pkp-search <--get=<search-param>> <--pubKey=<public key>> <--authMethodId=<id>> <--authMethodType=<type>> 
    [--clientId=<id>] [-appId=<id>] [--maxScope=<scopeIndex>]
        
    example: getlit pkp-search --get=authMethods --publicKey=<pkp-public-key>
    example getlit pkp-search --get=authMethodScopes -publicKey=<pkp-public-key> --authMethodId=<id> --authMethodType=<type> --maxScope=5
    example getlit pkp-search --get=ethAddr --pubKey=<pkp-public-key>
        
    search for pkp informaton related to a pkp or auth method meta data.
`;
    return message;
}

async function searchAuthMethods(client, pk) {
    let tokenId = ethers.utils.keccak256(`0x${pk}`);
    let authMethods = await client.pkpPermissionsContract.read.getPermittedAuthMethods(tokenId);
    let authMethodObjs = []
    for (const authMethod of authMethods) {
        authMethodObjs.push({
            authMethodType: authMethod[0]._hex,
            authMethodiId: authMethod[1],
            pubKey: authMethod[2],
        });
    }
    return authMethodObjs;
}

async function getAuthMethodScopes(client, pk, authMethodId, authMethodType, maxScope = 3) {
    let tokenId = ethers.utils.keccak256(`0x${pk}`);
    let scopes = await client.pkpPermissionsContract.read.getPermittedAuthMethodScopes(tokenId, authMethodType, authMethodId, maxScope);
    scopes = {
        scopes
    };
    return scopes;
}

async function getEthAddress(client, pk) {
    let tokenId = ethers.utils.keccak256(`0x${pk}`);
    let ethAddr = await client.pkpPermissionsContract.read.getEthAddress(tokenId);
    ethAddr = {
        address: ethAddr
    };

    return ethAddr;
}

async function getTokenIdsByAuthMethod(client, authMethodId, clientId, appId, type) {
    if (!authMethodId) {
        authMethodId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${clientId}:${appId}`));
    }

    let tokenIds = await client.pkpPermissionsContract.read.getTokenIdsForAuthMethod(type, authMethodId);
    tokenIds = {
        tokenIds
    };
    !params.format && greenLog(`${JSON.stringify(tokenIds)}`);
    params.format === "table" && tableLog(tokenIds);

    return tokenIds;
}