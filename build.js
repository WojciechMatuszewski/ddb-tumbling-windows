import esbuild from "esbuild";

const { buildSync } = esbuild;

const [_, __, inputFile, outputFile] = process.argv;

console.log({
  inputFile,
  outputFile
});

if (!inputFile || !outputFile) {
  throw new Error("Missing parameters");
}

console.log(`Starting building ${inputFile}`);

buildSync({
  bundle: true,
  entryPoints: [inputFile],
  outfile: outputFile,
  external: [],
  minify: true,
  platform: "node",
  target: "node12"
});

console.log(`${inputFile} build finished`);
