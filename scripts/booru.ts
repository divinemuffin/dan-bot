import {IDanPost, IDanPostError} from "../models/danbooru";
import {ClientRequest} from "http";

console.log('[DAN] >> Starting booru.js ...');

const Danbooru = require('danbooru');
const https = require('https');
const fs = require('fs');

// Perform a search for popular image posts
const booru = new Danbooru();

function TEST(do_save: boolean = false): void {
  booru.posts({tags: 'rating:safe order:rank'}).then((posts) => {
    // Select a random post from posts array
    const index = Math.floor(Math.random() * posts.length);
    const post = posts[index];

    console.log('Link: ', post.large_file_url);

    // Get post's url and create a filename for it
    const url = booru.url(post.file_url);

    // Download post image using node's https and fs libraries
    https.get(url, (response) => {
      if (response && do_save) {
        saveFile(response, post.md5, post.file_ext);
      }
    });
  });
}

function getFile(): Array<IDanPost> {
  return booru.posts({tags: 'rating:explicit order:rank'}).then((res: Array<IDanPost>) => {

    if ((res as unknown as IDanPostError).success === false) {
      console.error(`[DAN] >> Error @getFile(): ${(res as unknown as IDanPostError).message}`);
      return;
    }

    return res;
  }).catch(e => console.error(`[DAN] >> Error: ${e.message} \n`, e));
}

/**
 * Saves file to ./saves.
 * @param {ClientRequest} data data for this file.
 * @param {string} name name of this file.
 * @param {string} ext extension of this file (no dot).
 */
function saveFile(data: ClientRequest, name: string, ext: string): void {
  const dir = './saves';
  const files = fs.readdirSync(dir);
  const filesCount = ++files.length;
  const fileName = `${name}.${ext}`;
  const existing = files.filter(file => file === `${name}.${ext}`);

  if (existing.length) {
    console.warn(`[DAN] >> File "${fileName}" already exists! Rewriting.`);
  }

  console.log(`[DAN] >> Saving file #${filesCount} - "${fileName}" ...`);
  data.pipe(fs.createWriteStream(`${dir}/${name}.${ext}`));
  console.log('The file has been saved!');
}


// EXECUTION

console.log('[DAN] >> main() execution...', '\n\n\n');
(async function main () {

  TEST();

  let res: Array<IDanPost> = await getFile();

  console.log("GET FILE res: ", res.length, res.map(post => post.file_url));

})();
