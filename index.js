const args = require("args");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const sharp = require("sharp");

args
  .option("input", "the input file", "input.png")
  .option("output", "the output directory", "./output")
  .option("pattern", "the file name pattern", "1output_{size}")
  .option("types", "the image types", ["webp", "png"])
  .option("clear", "clear output folder")
  .option("verbose", "clear output folder", false)
  .option("sizes", "the sizes", [1200, 1000, 800, 600, 400, 200]);

const flags = args.parse(process.argv);
const inputBuffer = fs.readFileSync(path.resolve(__dirname, flags.input));

if (!fs.existsSync(flags.output)) {
  fs.mkdirSync(flags.output, { recursive: true });
}

if (flags.clear) {
  rimraf.sync(path.resolve(__dirname, `${flags.output}/**/*`));
}

flags.types.forEach((type) => {
  flags.sizes.forEach((size) => {
    sharp(inputBuffer)
      .resize(size)
      .toFile(`${flags.output}/${flags.pattern.replace("{size}", size)}.${type}`, (err, info) => {
        err && console.log(err);
        flags.verbose && console.log(info);
      });
  });
});
