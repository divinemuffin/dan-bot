import {IDanPost, IDanPostError, TDanOrder, TDanRatings} from "../models/danbooru";
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

    if (do_save){
      saveFile([post]);
    }
  });
}

function getPostsInfo(params?: {
  rating?: TDanRatings,
  order?: TDanOrder
}): Array<IDanPost> {
  let postParams;
  if (params) {
    let paramsArray: Array<string> = [];

    for (let paramsKey in params) {
      paramsArray.push(`${paramsKey}:${params[paramsKey]}`);
    }

    postParams = {tags: paramsArray.join(' ')};
  } else {
    console.warn(`[DAN] >> @getFile(): getting random picture ...`)
  }

  return booru.posts(postParams).then((res: Array<IDanPost>) => {

    // sometimes res can be as Error: IDanPostError. If so must throw exception
    if ((res as unknown as IDanPostError).success === false) {
      console.error(`[DAN] >> Error @getFile(): ${(res as unknown as IDanPostError).message}`);
      return;
    }

    return res;
  }).catch(e => console.error(`[DAN] >> Error: ${e.message} \n`, e));
}

function getPostsFileStream(posts: Array<IDanPost>): Array<ClientRequest> {
  return posts.map(post => {
    // Get post's url and create a filename for it
    const url = booru.url(post.file_url);
    // Download post image using node's https and fs libraries
    return https.get(url, (response) => {
      if (response) {
        return response
      }
    });
  })
}

/**
 * Saves file to ./saves.
 * @param {Array<IDanPost>} posts array of posts.
 */
function saveFile(posts: Array<IDanPost>): void {
  const dir = './saves';
  const files = fs.readdirSync(dir);
  const filesCount = ++files.length;

  if (posts && Array.isArray(posts)) {
    posts.forEach(post => {
      const fileName = `${post.md5}.${post.file_ext}`;
      const existing = files.filter(file => file === fileName);

      if (existing.length) {
        console.warn(`[DAN] >> File "${fileName}" already exists! Rewriting.`);
      }

      console.log(`[DAN] >> Saving file #${filesCount} - "${fileName}" ...`);

      // Get post's url and create a filename for it
      const url = booru.url(post.file_url);

      // Download post image using node's https and fs libraries
      https.get(url, (response) => {
        response.pipe(fs.createWriteStream(`${dir}/${fileName}`));
        console.log('The file has been saved!');
      })
    })
  }
}


// EXECUTION

console.log('[DAN] >> main() execution...', '\n\n\n');
(async function main () {

  TEST();

  let postsInfo: Array<IDanPost> = await getPostsInfo({rating: "explicit", order: "rank"});

  // console.log("GET INFO res: \n\n", postsInfo.length, postsInfo.map(postInfoObj => postInfoObj.file_url));

  await getPostsFileStream(postsInfo);

  // console.log("GET STREAM res: \n\n", postsStream.length, postsStream.map((postStream, i) => {
  //   return `Stream #${i} is writable: ${postStream.writable}`;
  // }));

})();

export {getPostsInfo, getPostsFileStream, saveFile};
