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
import { devFunc } from './scripts/devFunc.mjs';

const args = getArgs();
globalThis.LIT_CONFIG = readProjectJsonFile('lit.config.json');

let COMMAND = args[0];

const commandMaps = [
  {
    name: 'init',
    aliases: ['here'],
    usage: 'getlit here',
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
    name: 'action',
    aliases: ['new'],
    usage: 'getlit action [<lit-action-name>]',
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
    fn: devFunc,
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
    name: 'help',
    aliases: ['default', 'show'],
    usage: 'getlit help',
    description: '🆘 Show the help menu',
    fn: helpFunc,
    type: 'help',
  },
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