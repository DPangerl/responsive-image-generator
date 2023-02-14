#! /usr/bin/env node

const args = require("args");
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const sharp = require("sharp");

const ALLOWED_IMAGE_TYPES = ["webp", "png", "jpeg", "jpg"];
const DEFAULT_SIZES = [1200, 800, 400, 300];

args
  .option("input", "The image file to process")
  .option("output", "The output directory", "./output")
  .option("pattern", "The file name pattern. {size} is the placeholder", "output_{size}")
  .option("types", `The image types to create. Can be ${ALLOWED_IMAGE_TYPES.join(", ")}`, "webp,png")
  .option("clear", "Clears the output folder before processing", false)
  .option("verbose", "Get some additional logs", false)
  .option("sizes", "The sizes To create: ", DEFAULT_SIZES.join(","));

const flags = args.parse(process.argv);

if (!flags.input) {
  console.log("Please provide an input file");
  process.exit(1);
}

if (!fs.existsSync(flags.output)) {
  fs.mkdirSync(flags.output, { recursive: true });
}

if (flags.clear) {
  rimraf.sync(path.resolve(__dirname, `${flags.output}/**/*`));
}

const inputBuffer = fs.readFileSync(path.resolve(__dirname, flags.input));
const types = flags.types.split(",");
const sizes = flags.sizes.split(",");

const processing = types.reduce((acc, type) => {
  if (!ALLOWED_IMAGE_TYPES.includes(type)) {
    console.log(`❌ ${type} is not allowed`);
    return acc;
  }
  const variants = sizes.map((size) => {
    return new Promise((resolve, reject) => {
      sharp(inputBuffer)
        .resize(parseInt(size))
        .toFile(`${flags.output}/${flags.pattern.replace("{size}", size)}.${type}`, (err, info) => {
          flags.verbose && console.log(info);
          if (err) return resolve(`❌ ${type}\t${size}px`);
          return resolve(`✅ ${type}\t${size}px`);
        });
    });
  });

  return [...acc, ...variants];
}, []);

console.log("processing…");

Promise.all(processing)
  .then((x) => {
    console.log(x.join("\n"));
    console.log("All done! 🎉");
  })
  .catch((errors) => console.log(errors));
