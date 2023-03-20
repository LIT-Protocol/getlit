# GetLit CLI

![](https://raw.githubusercontent.com/LIT-Protocol/getlit/main/banner.png)

The GetLit CLI is a command-line tool designed to help developers manage their Lit Actions projects. The CLI provides a set of commands to create, build, test, and configure Lit Actions.

## Getting Started

```
npm install -g getlit

// or
yarn add global getlit
```

## Usage

To use the GetLit CLI, simply run the desired command followed by any required or optional arguments. The CLI will execute the associated function and display the output accordingly.

| Command                  | Usage                               | Description                               |
| ------------------------ | ----------------------------------- | ----------------------------------------- |
| `getlit init` \| `here` | `getlit init`                       | 🏁 Initialise a new Lit project           |
| `getlit build`           | `getlit build`                      | 🏗  Build your Lit Actions                |
| `getlit new` \| `action` | `getlit new [<lit-action-name>]` | 📝 Create a new Lit Action                |
| `getlit test`            | `getlit test [<lit-action-name>]`   | 🧪 Test a Lit Action                      |
| `getlit watch`           | `getlit watch [<lit-action-name>]`  | 🔧 Simultaneously build and test a Lit Action |
| `getlit setup`           | `getlit setup`                      | 🔑 Setup config for authSig and PKP      |
| `getlit docs` \| `doc` | `getlit docs`                       | 📖 Open the Lit Protocol documentation   |
| `getlit help` \|  `show` | `help`    | 🆘 Show the help menu                     |

## Demos

1. [Initialising a project](#initialising-a-project)
2. [Building your Lit Actions](#building-your-lit-actions)
3. [Setting up `authSig` & `pkpPublicKey` and testing a Lit Action](#setting-up-authsig--pkppublickey-and-testing-a-lit-action)
4. [Watch for file changes, build and test a Lit Action](#watch-for-file-changes-build-and-test-a-lit-action)
5. [Syntax highlighting for Lit Actions SDK](#syntax-highlighting-for-lit-actions-sdk)


## Intialising a project
[![getlit init](https://img.youtube.com/vi/pObLTTb-mLE/0.jpg)](https://www.youtube.com/watch?v=pObLTTb-mLE)

## Building your Lit Actions

Creating your Lit Actions is straightforward; however, there are some required fields (currently, only "NAME") in the Lit action file (refer to lit-action-schema.json).

[![getlit build](https://img.youtube.com/vi/pwB3JcBqvHg/0.jpg)](https://www.youtube.com/watch?v=pwB3JcBqvHg)

## Setting up `authSig` & `pkpPublicKey` and test a Lit Action

Before running a Lit Action, you must obtain your authSig and PKP Public Key to execute it correctly. The config file will be stored locally as `getlit.json`. Ensure that you add this file to your `.gitignore`.

[![getlit test](https://img.youtube.com/vi/tZtXv0bzb10/0.jpg)](https://www.youtube.com/watch?v=tZtXv0bzb10)

## Watch for file changes, build and test a Lit Action

[![getlit watch](https://img.youtube.com/vi/ca1MiJACkTs/0.jpg)](https://www.youtube.com/watch?v=ca1MiJACkTs)

## Syntax highligting for Lit Actions SDK 

Syntax highlighting for the Lit Actions SDK (which refers to the exported functions that reside and can only be accessed on Lit Protocol nodes) is available for improved readability and ease of use.

[![syntax highlighting](https://img.youtube.com/vi/597Vkak_bf4/0.jpg)](https://www.youtube.com/watch?v=597Vkak_bf4)