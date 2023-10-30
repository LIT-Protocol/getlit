import { greenLog } from '../utils.mjs';
import { pkpPermissions } from './abi/pkpPermissions.data';
import { Contract, providers } from 'ethers';
export async function pkpSearchFunc({ args }) {
    let params = processArgs(args);
    let rpcProvider = providers.JsonRpcProvider("https://chain-rpc.litprotocol.com/http", 175177);
    let pkpHelperContract = bootstrapClient(rpcProvider);

    switch(params.by) {
        case "authMethod":
            const pkps = await searchByAuthMethodId(pkpHelperContract, params.tokenId, params.authMethodType);
            greenLog(`pkps for auth method id: ${params.tokenId}\n${pkps}`);
            break;
    }

    switch(params.get) {
        case "authMethodScopes":
            const scopes = await getAuthMethodScopes(pkpHelperContract, params.tokenId, params.authMethodId);
            greenLog(`permission scopes for auth method id: ${params.tokenId}\n${scopes}`);
            break;
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

function bootstrapClient(provider) {
    let contract = new Contract(pkpPermissions.address, pkpPermissions.abi, provider);
    return contract;
}

async function searchByAuthMethodId(client, authMethodId, authMethodType) {
    const tokenIds = await client.getTokenIdsForAuthMethod(authMethodId, authMethodType);
    return tokenIds;
}

async function getAuthMethodScopes(client, tokenId, authMethodId, authMethodType) {
    const scopes = await client.getPermittedAuthMethodScopes(tokenId, authMethodType, authMethodId, 200);
    return scopes;
}