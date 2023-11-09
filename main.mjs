#!/usr/bin/env node

import { exit } from 'process';
import { getArgs, readProjectJsonFile, redLog } from './utils.mjs';
import { docsFunc } from './scripts/docs.mjs';
import { helpFunc } from './scripts/help.mjs';
import { initFunc } from './scripts/init.mjs';
import { buildFunc } from './scripts/build.mjs';
import { setupFunc } from './scripts/setup.mjs';
import { newFunc } from './scripts/newFunc.mjs';
import { testFunc } from './scripts/testFunc.mjs';
import { watchFunc } from './scripts/watchFunc.mjs';
import { deployFunc } from './scripts/deploy.mjs';
import { deriveFunc } from './scripts/derive.mjs';
import { pkpSearchFunc } from './scripts/pkp-search.mjs';

const args = getArgs();
globalThis.LIT_CONFIG = readProjectJsonFile('lit.config.json');

let COMMAND = args[0];

const commandMaps = [
  {
    name: 'action',
    aliases: ['init', 'here'],
    usage: 'getlit action',
    description: '🏁 Initialise a new Lit project',
    fn: initFunc,
  },
  {
    name: 'build',
    aliases: [],
    usage: 'getlit build',
    description: '🏗  Build your Lit Actions',
    fn: buildFunc,
  },
  {
    name: 'new',
    aliases: ['action'],
    usage: 'getlit new [<lit-action-name>]',
    description: '📝 Create a new Lit Action',
    fn: newFunc,
  },
  {
    name: 'test',
    aliases: [],
    usage: 'getlit test [<lit-action-name>]',
    description: '🧪 Test a Lit Action',
    fn: testFunc,
  },
  {
    name: 'watch',
    aliases: ['dev'],
    usage: 'getlit watch [<lit-action-name>]',
    description: '🔧 Simultaneously build and test a Lit Action',
    fn: watchFunc,
  },
  {
    name: 'setup',
    aliases: [],
    usage: 'getlit setup',
    description: '🔑 Setup config for authSig and PKP',
    fn: setupFunc,
  },
  {
    name: 'docs',
    aliases: ['doc'],
    usage: 'getlit docs',
    description: '📖 Open the Lit Protocol documentation',
    fn: docsFunc,
    type: 'help',
  },
  {
    name: 'deploy',
    aliases: [],
    usage: 'getlit deploy',
    description: '🚀 Deploy your Lit Actions',
    fn: deployFunc,
  },
  {
    name: 'help',
    aliases: ['default', 'show'],
    usage: 'getlit help',
    description: '🆘 Show the help menu',
    fn: helpFunc,
    type: 'help',
  },
  {
    name: 'derive-pkp',
    aliases: ['pubkey'],
    usage: 'getlit derive-pkp <--user_id> <--project_id> <--format>',
    description:
      '🗝️ Derive a public key from a user id and application id',
    fn: deriveFunc,
  },
  {
    name: 'search-pkp',
    aliases: ['search'],
    fn: pkpSearchFunc,
    description: '🔍 Search for information related to PKPS',
    usage: "getlit search <--get> <--format>"
  }
];

const setup = () => {
  const findItem = (command) => {
    return commandMaps.find(
      (item) => item.name === command || item.aliases.includes(command)
    );
  };

  let item = findItem(COMMAND ?? 'help');

  if (item === undefined) {
    // find the similar command
    const similarCommand = commandMaps.find(
      (item) => item.name === COMMAND || item.aliases.includes(COMMAND)
    );

    console.log('similarCommand:', similarCommand);

    if (!similarCommand) {
      item = findItem('default');
    } else {
      const foundCommand = similarCommand.name;
      redLog(`Command not found. Did you mean "${foundCommand}"?`);
      exit();
    }
  }

  const _args = args.slice(1);

  item.fn({ commandMaps, args: _args });
};

setup();
