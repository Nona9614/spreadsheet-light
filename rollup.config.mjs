// NodeJS
import path from "path";
// Rollup
import { rollup } from "rollup";
import ts from "rollup-plugin-ts";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import { nodeResolve as node } from "@rollup/plugin-node-resolve";
// `package.json` file
import pkg from "./package.json" assert { type: "json" };
// External
import { empty, read, resolve, write, writeSync } from "xufs";
import { replacer } from "dynason";

/** Bases the paths to the `lib` folder */
function lib(...paths) {
  return resolve("lib", ...paths);
}

/**
 * These flag is set to true once the types declaration file
 * at `spreadsheet-light/types.d.ts` is created already
 */
let isGlobalTypesBundled = false;

/**
 * Checks if some filename ends with the declaration file extension
 * -  .d.ts
 * -  .d.mts
 * -  .d.cts
 * @param {string} filename The filename to be checked
 */
const isDeclarationFile = (filename) => /\.d\.[mc]?ts$/giu.test(filename);

/**
 * Checks if some filename ends with the extension of a sourcemap
 * -  .js.map
 * -  .mjs.map
 * -  .cjs.map
 * -  .ts.map
 * -  .mts.map
 * -  .cts.map
 * @param {string} filename The filename to be checked
 * @returns
 */
const isSourceMap = (filename) => /\.[cm]?[tj]s\.map$/giu.test(filename);

/**
 * Bundles the typescript code and outpus it
 * @param {object} object
 * @param {import('rollup').InputOptions} object.inputOptions These are the options like which file to use as reference to bundle and th plugins to use
 * @param {import('rollup').OutputOptions} object.outputOptions These are options like where to output the file and its name
 */
async function bundler({ inputOptions, outputOptions }) {
  const bundle = await rollup(inputOptions);
  const { output } = await bundle.generate(outputOptions);
  for (const _ of output) {
    // Actual code to be bundled
    if (_.type === "chunk") {
      // Writing code to its file
      writeSync(outputOptions.file, _.code);
      if (_.map) {
        // Write maps if enabled
        const name = `${outputOptions.file}.map`;
        writeSync(name, JSON.stringify(_.map));
      }
    } else {
      // Write only once the global declaration file
      if (isDeclarationFile(_.fileName)) {
        if (!isGlobalTypesBundled) {
          const name = lib(_.fileName.replace(/[mc]ts$/, "ts"));
          writeSync(name, _.source);
          isGlobalTypesBundled = true;
        }
        // Write isolated types
        const name = path.join(path.dirname(outputOptions.file), "index.d.ts");
        writeSync(name, _.source);
      } else if (!isSourceMap(_.fileName)) {
        // Write any other asset to the lib that is not a source map
        const name = lib(_.fileName);
        writeSync(name, _.source);
      }
    }
  }
  // Finishes bundle session
  await bundle.close();
}

/**
 * @type {import('rollup').InputOptions}
 * These options are meant to be used for `esm` code
 * such that the code is bundled but not minified
 */
const ESM_INPUT_OPTIONS = {
  input: "src/exports/esm.ts",
  external: ["dynason"],
  plugins: [ts()],
};

/**
 * @type {import('rollup').InputOptions}
 * These options are meant to be used for `cjs` code
 * such that the code is bundled but not minified
 */
const CJS_INPUT_OPTIONS = {
  input: "src/exports/cjs.ts",
  external: ["dynason"],
  plugins: [ts()],
};

/**
 * @type {import('rollup').OutputOptions}
 * These options are meant to be used for `esm` code.
 * Takes the name from the `module` property of the `package.json` file
 * and should not have sourcemaps when generated as they are not needed.
 */
const ESM_OUTPUT_OPTIONS = {
  file: lib(pkg.module),
  format: "esm",
  sourcemap: false,
};

/**
 * @type {import('rollup').OutputOptions}
 * These options are meant to be used for `cjs` code.
 * Takes the name from the `main` property of the `package.json` file
 * and should not have sourcemaps when generated as they are not needed.
 */
const CJS_OUTPUT_OPTIONS = {
  file: lib(pkg.main),
  format: "cjs",
  sourcemap: false,
};

/**
 * @type {import('rollup').InputOptions}
 * These options are meant to be used for `umd` code
 * such that the code is bundled and minified
 */
const UMD_INPUT_OPTIONS = {
  input: "src/exports/umd.ts",
  plugins: [terser(), node(), ts()],
};

/**
 * @type {import('rollup').OutputOptions}
 * These options are meant to be used for `umd` code.
 * The name should be in the same folder as the other formats but with the name `umd`
 * and must have sourcemaps when generated as they are needed when used in
 * the HTML `script` tag.
 */
const UMD_OUTPUT_OPTIONS = {
  name: "spreadsheet-light",
  file: lib("umd", "index.js"),
  format: "umd",
  sourcemap: true,
};

/**
 * Builds the whole application code and copies any no code content
 * to the distribution folder
 */
async function build() {
  /**
   * Creates an array containing all the options to
   * render all the formats
   * @type {Array<{inputOptions: import('rollup').OutputOptions, outputOptions: import('rollup').InputOptions}>}
   */
  const formats = [
    { inputOptions: ESM_INPUT_OPTIONS, outputOptions: ESM_OUTPUT_OPTIONS },
    { inputOptions: CJS_INPUT_OPTIONS, outputOptions: CJS_OUTPUT_OPTIONS },
    { inputOptions: UMD_INPUT_OPTIONS, outputOptions: UMD_OUTPUT_OPTIONS },
  ];

  // Only in the first time tries to create all the `no code` content
  formats[0].inputOptions.plugins.push(
    copy({
      targets: [
        { src: "README.md", dest: lib("") },
        { src: "package.json", dest: lib("") },
      ],
    }),
  );

  // Wmptying folder before start
  await empty(lib(), true);

  // Bundles all the formats
  for (let i = 0; i < formats.length; i++) {
    // Bundles each of the formats
    await bundler(formats[i]);
  }
}

/**
 * Replaces the `'<version>'` tag with the current package version
 * @param {string[]} filenames
 */
async function versionage(filenames) {
  for (const filename of filenames) {
    let template = await read(filename);
    template = replacer(template, { version: pkg.version });
    await write(filename, template);
  }
}

// Builds the formats to the distribution folder and copies the no code content
await build();
// Update version to documentations
await versionage([lib("README.md")]);
