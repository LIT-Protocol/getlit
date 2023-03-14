import esbuild from "esbuild";
import fs from "fs";

(async () => {
  await esbuild.build({
    entryPoints: ["index.js"],
    sourceRoot: "./",
    globalName: "LitThirdPartyLibs",
    bundle: true,
    outfile: "dist/LitThirdPartyLibs.js",
    define:{
      "zlib": "false",
      "events": "false",
    }
  });

  //   append `export default LitThirdPartyLibs;` to the end of the file
  fs.appendFileSync(
    "dist/LitThirdPartyLibs.js",
    "export default LitThirdPartyLibs;"
  );
})();
