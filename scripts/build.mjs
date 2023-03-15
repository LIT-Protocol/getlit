import fs from 'fs';
import esbuild from 'esbuild';
import {
  redLog,
  greenLog,
  readJsonFile,
  thisSdkDir,
  readProjectJsonFile,
} from '../utils.mjs';
import path from 'path';
import Ajv from 'ajv';

function checkConfigProperty(property, propertyName) {
  if (!property) {
    redLog(`Missing configuration property: ${propertyName}`);
    throw new Error(`Missing configuration property: ${propertyName}`);
  }
}

function extractKeyValuePairs(content, schema) {
  const keyValuePairs = {};

  for (const key in schema.properties) {
    const regex = new RegExp(`${key}:\\s*([\\w\\d\\s]+)(?=\\s|$)`, 'i');
    const match = content.match(regex);
    if (match) {
      keyValuePairs[key] = match[1].trim();
    }
  }

  return keyValuePairs;
}

function validateSchema(data, schema) {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    throw new Error(
      `❌ Validation errors: \n${validate.errors.map(
        (e) => `  - ${e.message}`
      )}`
    );
  }

  return data;
}

async function findDirs(dir, searchTerm = LIT_CONFIG.projectName, depth = 4) {
  const files = fs.readdirSync(dir);
  let paths = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      if (file === searchTerm) {
        paths.push(filePath);
      } else if (depth > 0) {
        const subPaths = await findDirs(filePath, searchTerm, depth - 1);
        paths = paths.concat(subPaths);
      }
    }
  }

  return paths;
}

const esBuildLitActionProject = async (path, fileMetadataList) => {
  // Access the properties from the LIT_CONFIG object and check if they are missing
  const DEFAULT_NAME = LIT_CONFIG.buildConfig.defaultSrcFileName;
  checkConfigProperty(DEFAULT_NAME, 'defaultSrcFileName');

  const IN_FILE_EXT = LIT_CONFIG.buildConfig.inFileExt;
  checkConfigProperty(IN_FILE_EXT, 'inFileExt');

  const OUT_FILE_EXT = LIT_CONFIG.buildConfig.outFileExt;
  checkConfigProperty(OUT_FILE_EXT, 'outFileExt');

  // const BUNDLE_NAME = LIT_CONFIG.buildConfig.bundleName;
  // checkConfigProperty(BUNDLE_NAME, 'bundleName');

  const SRC_DIR = LIT_CONFIG.buildConfig.srcDir;
  checkConfigProperty(SRC_DIR, 'srcDir');

  const OUT_DIR = LIT_CONFIG.buildConfig.outDir;
  checkConfigProperty(OUT_DIR, 'outDir');

  const FULL_SRC_DIR = `${path}/${SRC_DIR}/`;
  const FULL_OUT_DIR = `${path}/${OUT_DIR}/`;

  greenLog(`\n 📦 Bundling the lit actions... \n`);

  let counter = 0;

  fileMetadataList.forEach(async (fileMetadata, i) => {
    const { file, metadata } = fileMetadata;
    const { VAR } = metadata;

    let _file = `${FULL_SRC_DIR}${file}`;

    try {
      await esbuild.build({
        globalName: VAR,
        entryPoints: [_file],
        bundle: true,
        // outfile: OUT_FILE,
        outdir: FULL_OUT_DIR,
      });
      counter++;

      // report file size
      const outfile = `${FULL_OUT_DIR}${file.replace(
        IN_FILE_EXT,
        OUT_FILE_EXT
      )}`;
      greenLog(`  - ${_file}`);
      greenLog(`    => Output: ${outfile}\n`);

      // extract everything between /** and */ and add it to the top of the file
      const metadataComment = `/**\n *\n${Object.keys(metadata)
        .map((key) => ` * ${key}: ${metadata[key]}\n *`)
        .join('\n')}\n */\n`;

      console.log(metadataComment);

      const outfileContent = await fs.promises.readFile(outfile, 'utf8');
      const newContent = `${metadataComment}\n${outfileContent}`;
      await fs.promises.writeFile(outfile, newContent, 'utf8');
      if (counter === fileMetadataList.length) {
        greenLog(`\n🎉 Build successful!\n`);
        process.exit();
      }
    } catch (e) {
      redLog(e);
      process.exit();
    }
  });
};

/**
 * Asynchronously builds the project based on the user's working directory.
 * If there are multiple project directories found, it logs the paths and
 * asks the user to remove extra directories before proceeding.
 * If only one project directory is found, it proceeds with the build.
 */
export async function buildFunc() {
  const userWorkingDir = process.cwd();

  let litProjectPath;

  const litProjectPaths = await findDirs(userWorkingDir);

  if (litProjectPaths.length > 1) {
    redLog(
      `There are multiple directories with the name ${LIT_CONFIG.projectName} in the current directory. Please remove the extra directories and try again.`
    );

    // show the user the directories prefix with numbers
    redLog('\nThe following directories were found:\n');
    litProjectPaths.forEach((path, i) => {
      redLog(`${i + 1}: ${path}`);
    });
    redLog('\n');

    // TODO: ask user which directory they want to build
    process.exit();
  }

  // if there's only one directory, use that
  litProjectPath = litProjectPaths[0];

  let litProjectFiles = await fs.promises.readdir(litProjectPath + '/src');

  // filter files that includes .action. in the name
  litProjectFiles = litProjectFiles.filter((file) =>
    file.includes('.action.ts')
  );

  const litActionSchema = await readProjectJsonFile(
    LIT_CONFIG.schemaPaths.litActionSchema
  );

  // console.log('litActionSchema:', litActionSchema);

  // make sure each file meets the schema requirements
  const extractMetadataFromFiles = async () => {
    return new Promise(async (resolve, reject) => {
      let data = [];

      for (let i = 0; i < litProjectFiles.length; i++) {
        const file = litProjectFiles[i];

        const filePath =
          litProjectPath + '/' + LIT_CONFIG.buildConfig.srcDir + '/' + file;

        const fileContent = await fs.promises.readFile(filePath, 'utf8');

        let metadata;

        try {
          const kvs = extractKeyValuePairs(fileContent, litActionSchema);
          metadata = validateSchema(kvs, litActionSchema);

          data.push({
            file,
            metadata,
          });

          if (i === litProjectFiles.length - 1) {
            resolve(data);
          }
        } catch (e) {
          reject(
            `\n${e.message} \n\nPlease fix the errors in the file: ${filePath}\n`
          );
          if (i === litProjectFiles.length - 1) {
            process.exit();
          }
        }
      }
    });
  };

  let fileMetadataList;

  try {
    fileMetadataList = await extractMetadataFromFiles();
  } catch (e) {
    redLog(e);
    process.exit();
  }

  esBuildLitActionProject(litProjectPath, fileMetadataList);
}

/**
 * GLOBAL NAME: GetLitSdk
 */
