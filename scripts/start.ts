import {IDanPost} from "../models/danbooru";
import {DanConsole} from "./utils";
import {MPost} from "../models/schemas";
const mongoose = require('mongoose');

const {bot, db} = require('../bot');
const {getPostsInfo} = require('./booru');
const dansole = new DanConsole(true);
const CHANNEL_ID = process.env.CHANNEL_ID;

const fs = require('fs');

dansole.info(`DataBase available`);

function setCommand(name: string, callback: Function, isArgument: boolean = false) {
  /*
    * name - how command can be called
    * callback - function of command
    * isArgument - if true command can be followed by argument
    */
  const regExp = (!isArgument) ? new RegExp(`\/${name}`) : new RegExp(`\/${name} (.+)`);
  bot.onText(regExp, callback);
}

function flattenDeep(arr1: Array<{[key:string]: any}>) {
  return arr1.reduce((acc, val) => {
    if (Array.isArray(val)) {
      return acc.concat(flattenDeep(val));
    } else if (typeof val === 'object') {
      const temp = [];
      for (let valKey in val) {
        if (typeof val[valKey] === 'object') {
          return acc.concat(flattenDeep([val[valKey]]));
        }
        temp.push(`${valKey}: ${val[valKey]}`)
      }
      return acc.concat(temp)
    } else {
      return acc.concat(val)
    }
  }, []);
}

setCommand('start', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Thank you for visiting our hub!', {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: false,
      keyboard: [
        [{text: '\/info'}, {text: '\/pic'}],
        [{text: '\/post'}],
      ],
    },
  });
});


setCommand('hello', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello there!').catch(e => dansole.error(e));
});

setCommand('info', (msg) => {
  const chatId = msg.chat.id;
  bot.getUpdates().then(res => {

    const newArr = this.flattenDeep([
      { botChatId: chatId},
      res
    ]);

    dansole.info(newArr);

    bot.sendMessage(chatId, newArr.join('; \n')).catch(e => dansole.error(e));
  });
});

setCommand('link', async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Getting you a link ...').catch(e => dansole.error(e));
  const posts: Array<IDanPost> = await getPostsInfo();
  const rando = posts[Math.floor(Math.random()*posts.length)];
  await bot.sendMessage(chatId, rando.file_url).catch(e => dansole.error(e));
});


setCommand('pic', async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Getting you a picture ...').catch(e => dansole.error(e));
  const posts: Array<IDanPost> = await getPostsInfo();
  const rando = posts[Math.floor(Math.random()*posts.length)];
  await bot.sendPhoto(msg.chat.id, rando.file_url).catch(e => dansole.error(e))
});

setCommand('post', async (msg) => {
  const chatId = msg.chat.id;
  let selectedPostIndex: number = 0;
  let postsRefreshedCounter: number = 0;  // debug info (for report)
  let selectedPost: IDanPost;
  // let posts: Array<IDanPost> = [];
  let sortedPosts: Array<IDanPost> = [];

  // let collectionName: string;
  // let modelDocument;

  function sortByScore(posts: Array<IDanPost>): Array<IDanPost> {
    return posts.sort(((post, prevPost) => {
      return prevPost.up_score - post.up_score
    }))
  }

  // pulls a pack of 20 posts and sorts them
  async function refreshPosts() {
    // [1] getting pack of posts
    const _posts = await getPostsInfo();
    // [2] sorting by best (higher up score)
    sortedPosts = await sortByScore(_posts);

    selectedPostIndex = 0;
    postsRefreshedCounter++;
  }

  const selectPost = (_posts: Array<IDanPost>): IDanPost => {
    if (selectedPostIndex === _posts.length - 1) {
      refreshPosts();
    }

    const _selectedPost = _posts[selectedPostIndex];
    selectedPostIndex++;

    return _selectedPost;
  };

  function getCollectionName(post: IDanPost): string {
    if (post.tag_string_artist.length > 0) {
      return post.tag_string_artist.split(' ')[0];
    } else {
      return 'other';
    }
  }

  function isPostInDB(_selectedPost: IDanPost): Promise<boolean> {
    // [3] checking if was posted before
    const collectionName = getCollectionName(selectedPost);
    const modelDocument = mongoose.model(collectionName, MPost);

    return modelDocument.find({md5: _selectedPost.md5}).then(res => {
      dansole.info(`Searching ${selectedPost.md5.substr(-4, 4)} in ${collectionName}`);
      dansole.info(res.length, res.map(r => r.md5.substr(-4, 4)));
      return res.length > 0;
    });
  }

  await refreshPosts();
  let isNewPost: boolean = false;

  do {
    selectedPost = selectPost(sortedPosts);
    isNewPost = await isPostInDB(selectedPost);

    if (postsRefreshedCounter > 3) {
      bot.sendMessage(chatId, '`WARNING!` Maximum cycle count reached. You need to make search scope wider!').catch(e => dansole.error(e));
      return;
    }
  } while (isNewPost);

  // [4] saving to DB
  const collectionName = getCollectionName(selectedPost);
  const modelDocument = mongoose.model(collectionName, MPost);
  const dbPost = new modelDocument({
    md5: selectedPost.md5,
    url: selectedPost.file_url,
    added_at: new Date().toUTCString(),
    tags: selectedPost.tag_string,
    artists: selectedPost.tag_string_artist
  });

  await dbPost.save(function (err) {
    if (err) {
      bot.sendMessage(chatId, '`WARNING!` Unable to save post to DB. Post was not posted!').catch(e => dansole.error(e));
      return dansole.error(err);
    }

    // [5] posting to channel
    bot.sendPhoto(CHANNEL_ID, selectedPost.large_file_url, { caption: `${selectedPost.md5}.${selectedPost.file_ext}` }).then(() => {
      // [6] sending report to owner
      bot.sendMessage(
          chatId,
          `
        ✅ Picture ${selectedPost.md5} was posted. \n 
        📋 To collection: ${collectionName}. \n
        🔁 Cycles performed: ${postsRefreshedCounter}. \n 
        Selected picture from last cycle is #${selectedPostIndex} \n
        🕓 Posted at: ${new Date().toUTCString()}
        `
      ).catch(e => dansole.error(e));
    }).catch(e => {
      dansole.error(e);

      bot.sendMessage(
          chatId,
          `
        ❌ Picture ${selectedPost.md5} was NOT posted. \n 
        📋 To collection: ${collectionName}. \n
        🔁 Cycles performed: ${postsRefreshedCounter}. \n 
        Selected picture from last cycle is #${selectedPostIndex} \n
        🕓 Error happened at: ${new Date().toUTCString()} \n\n
        REASON: ${e} \n\n
        
        LOG: ${JSON.stringify(selectedPost)}
        `
      ).catch(e => dansole.error(e));
    });
  });
});
