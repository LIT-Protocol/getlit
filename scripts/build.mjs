import fs from 'fs';
import esbuild from 'esbuild';
import {
  redLog,
  greenLog,
  readProjectJsonFile,
  humanizeBytes,
  yellowLog,
  findDirs,
} from '../utils.mjs';
import Ajv from 'ajv';

function checkConfigProperty(property, propertyName) {
  if (!property) {
    redLog(`Missing configuration property: ${propertyName}`);
    throw new Error(`Missing configuration property: ${propertyName}`);
  }
}

/**
Extracts key-value pairs from a given content string using a provided schema.
This function searches for keys specified in the schema.properties object
within the content string and extracts their corresponding values using
regular expressions. The extracted key-value pairs are stored in an object
and returned.
@param {string} content - The content string to extract key-value pairs from.
@param {object} schema - The schema containing a properties object with keys to search for.
@returns {object} keyValuePairs - An object containing the extracted key-value pairs.
*/

// example of a content
/**
 * VAR: HelloWorld
 */
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

/**

Validates data against a given schema using Ajv.
@param {object} data - The data object to validate.
@param {object} schema - The schema to validate the data against.
@returns {object} data - The data object, if it is valid according to the schema.
@throws {Error} If the data object does not pass the schema validation.
*/
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

/**

Bundles Lit Action projects using esbuild, generating output files with metadata comments.
@param {string} path - The base directory of the project to bundle.
@param {object[]} fileMetadataList - An array of file metadata objects.
*/
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
  let hasFilesThatExceededDefaultLimit = false;

  fileMetadataList.asyncForEach(async (fileMetadata, i) => {
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
        // node
        // platform: 'node',
      });
      counter++;

      // report file size
      const outfile = `${FULL_OUT_DIR}${file.replace(
        IN_FILE_EXT,
        OUT_FILE_EXT
      )}`;
      greenLog(`  - ${_file}`);
      greenLog(`    => Output: ${outfile}`);

      // extract everything between /** and */ and add it to the top of the file
      const metadataComment = `/**\n *\n${Object.keys(metadata)
        .map((key) => ` * ${key}: ${metadata[key]}\n *`)
        .join('\n')}\n */\n`;
      // read the content of the outfile and get the size of it
      const outfileContent = await fs.promises.readFile(outfile, 'utf8');

      // get the filesize of the outfile content
      const outfileSize = Buffer.byteLength(outfileContent, 'utf8');

      const readableBytes = humanizeBytes(outfileSize);

      // show the percentage of the size limit that the outfile is
      const percentage = (outfileSize / LIT_CONFIG.sizeLimitBytes) * 100;

      const readableLimit = humanizeBytes(LIT_CONFIG.sizeLimitBytes);

      // make percentage as a string and cut to 2 decimal places
      const percentageString = percentage.toString().slice(0, 5) + '%';

      const reportMsg = `    => File Size: ${readableBytes} | Space Used: ${percentageString} (out of ${readableLimit} default limit)\n`;

      if (outfileSize <= LIT_CONFIG.sizeLimitBytes) {
        greenLog(reportMsg);
      } else {
        redLog(reportMsg);
        hasFilesThatExceededDefaultLimit = true;
      }

      const newContent = `${metadataComment}\n${outfileContent}`;
      await fs.promises.writeFile(outfile, newContent, 'utf8');
      if (counter === fileMetadataList.length) {
        if (hasFilesThatExceededDefaultLimit) {
          yellowLog(
            `(Warning) Some files exceeded the default size limit of ${readableLimit}. Consider using the Rate Limit NFT to increase the limit.\n`
          );
        }
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

  if (litProjectPaths.length <= 0) {
    redLog(
      `\n❌ Looks like you haven't created a project yet. Please run \`getlit here\` to create a project first.\n`
    );
    process.exit();
  }

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

  let litActionSchema;

  try {
    litActionSchema = await readProjectJsonFile(
      LIT_CONFIG.schemaPaths.litActionSchema
    );
  } catch (e) {
    redLog(e);
    process.exit();
  }

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
