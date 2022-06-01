import fs from "fs";
import Jimp = require("jimp");

export async function saveImage(data: Buffer): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const photo = await Jimp.read(data);
      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo.write(__dirname + outpath, (img) => {
        resolve(__dirname + outpath);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function deleteLocalFiles(files: Array<string>) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
