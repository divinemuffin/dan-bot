import {IDanPost} from "../models/danbooru";
import {DanConsole} from "./utils";
import {MPost} from "../models/schemas";
const mongoose = require('mongoose');

const {bot, db} = require('../bot');
const {getPostsInfo} = require('./booru');
const dansole = new DanConsole;
const CHANNEL_ID = process.env.CHANNEL_ID;

const fs = require('fs');

console.log(`[DAN] >> DataBase available `);

function setCommand(name: string, callback: Function, isArgument: boolean = false) {
  /*
    * name - how command can be called
    * callback - function of command
    * isArgument - if true command can be followed by argument
    */
  const regExp = (!isArgument) ? new RegExp(`\/${name}`) : new RegExp(`\/${name} (.+)`);
  bot.onText(regExp, callback);
}

setCommand('start', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Thank you for visiting our hub!', {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        [{text: 'Get info', callback_data: '\/info'}, {text: 'Get picture', callback_data: '\/pic'}],
        [{text: 'POST', callback_data: '\/post'}],
      ],
    },
  });
});


setCommand('hello', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello there!').catch(e => dansole.error(e));
});

setCommand('info', (msg) => {
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

  const chatId = msg.chat.id;
  bot.getUpdates().then(res => {

    const newArr = flattenDeep([
      { botChatId: chatId},
      res
    ]);

    console.log(newArr);

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
  let posts: Array<IDanPost> = [];
  let sortedPosts: Array<IDanPost> = [];

  function sortByScore(posts: Array<IDanPost>): Array<IDanPost> {
    return posts.sort(((post, prevPost) => {
      return prevPost.up_score - post.up_score
    }))
  }

  const selectPost = (_posts: Array<IDanPost>): IDanPost => {
    function refreshPosts() {
      posts = getPostsInfo();
      sortedPosts = sortByScore(posts);
      _posts = sortedPosts;
      selectedPostIndex = 0;
      postsRefreshedCounter++;
    }

    if (selectedPostIndex === _posts.length - 1) {
      refreshPosts();
    }

    const _selectedPost = _posts[selectedPostIndex];
    selectedPostIndex++;
    return _selectedPost;
  };

  function getCollectionName(post: IDanPost): string {
    if (post.tag_string_artist.length > 0) {
      return selectedPost.tag_string_artist.split(' ')[0];
    } else {
      return 'other';
    }
  }

  async function doSearch(): Promise<boolean> {
    let isExists: boolean;

    console.log(modelDocument, selectedPost.md5);


    await modelDocument.find({}, (error, docs) => {
      if (error) {
        bot.sendMessage(chatId, 'WARNING! Error performing search!').catch(e => dansole.error(e));
        dansole.error('Error performing search ', error);
      }

      dansole.info(`Searched docs: `, docs, docs.length);
      isExists = (docs) ? docs.length > 0 : false;
    });

    return await isExists;
  }








  // [1] getting pack of posts
  posts = await getPostsInfo();
  const rando = posts[Math.floor(Math.random()*posts.length)];

  // [2] sorting by best (higher up score)
  sortedPosts = sortByScore(posts);
  selectedPost = selectPost(sortedPosts);

  // [3] checking if was posted before
  // checking collection of artist's name
  // if no artist => 'other' collection
  const collectionName = getCollectionName(selectedPost);
  const modelDocument = mongoose.model(collectionName, MPost);


  await doSearch().then(isFound => {
    dansole.info('isFound', isFound);
    if (isFound) {
      selectedPost = selectPost(sortedPosts);
    }
  });

  // [4] saving to DB
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

    dansole.warn(CHANNEL_ID, selectedPost.file_url);
    bot.sendPhoto(CHANNEL_ID, selectedPost.file_url, { caption: `${selectedPost.md5}.${selectedPost.file_ext}` }).catch(e => {
      dansole.error(e)

      bot.sendMessage(
          chatId,
          `
        ❌ Picture ${selectedPost.md5} was NOT posted. \n 
        📋 To collection: ${collectionName}. \n
        🔁 Cycles performed: ${postsRefreshedCounter + 1}. \n 
        Selected picture from last cycle is #${selectedPostIndex} \n
        🕓 Error happened at: ${new Date().toUTCString()} \n\n
        REASON: ${e}
        `
      ).catch(e => dansole.error(e));
    });

    // [6] sending report to owner
    bot.sendMessage(
        chatId,
        `
        ✅ Picture ${selectedPost.md5} was posted. \n 
        📋 To collection: ${collectionName}. \n
        🔁 Cycles performed: ${postsRefreshedCounter + 1}. \n 
        Selected picture from last cycle is #${selectedPostIndex} \n
        🕓 Posted at: ${new Date().toUTCString()}
        `
    ).catch(e => dansole.error(e));
  });
});
