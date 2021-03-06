// set of all bot commands


import {IDanPost} from "../models/danbooru";
import {MPost} from "../models/schemas";
import {DanConsole, DanMemory, DanUtils} from "./__utils";
import {LIMIT_FOR_TAGS} from "../models/constants";
import { ITelegramMessage, ITelegramUpdateResponse } from "../models/telegram";
import { IMongoFindResponse } from "../models/mongo";
import { IncomingMessage } from "http";

const dansole = new DanConsole(true);
const danUtils = new DanUtils();
const danMemory = new DanMemory();


const mongoose = require('mongoose');
const {bot} = require('./bot');
const {getPostsInfo} = require('./booru');
const {setCommand} = require('../core');

const CHANNEL_ID = process.env.CHANNEL_ID;

/**
 * shows keyboard
 * also this is INITIAL COMMAND (runs on start)
 */
function c_start(msg: ITelegramMessage) {
    const chatId = msg.chat.id;
    bot.getUpdates().then(() => {
        bot.sendMessage(chatId, 'Thank you for visiting our hub!', {
            reply_markup: {
                resize_keyboard: true,
                one_time_keyboard: false,
                keyboard: [
                    [{text: '\/help'}],
                    [{text: '\/info'}, {text: '\/pic'}],
                    [{text: '\/post'}],
                ],
            },
        });
    })
}

/**
 * prints static message
 */
function c_hello(msg: ITelegramMessage) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello there!').catch((e: IncomingMessage) => dansole.error(e));
}

/**
 * prints general information:
 *  botId
 */
function c_info(msg: ITelegramMessage) {
    const chatId = msg.chat.id;
    bot.getUpdates().then((res: Array<ITelegramUpdateResponse>) => {
        const botInfoObj = danUtils.flattenArrayOfObjects([
            { botChatId: chatId},
            res
        ]);

        let info = botInfoObj.join(`; \n`);

        const settings = danMemory.getAll();

        if (Object.keys(settings).length) {
            info = info.concat(`\n\nSettings: \n${JSON.stringify(settings)}`)
        }

        dansole.info(info, settings);

        bot.sendMessage(chatId, info).catch((e: IncomingMessage) => dansole.error(e))
    });
}

/**
 * sends a random picture link
 */
async function c_link(msg: ITelegramMessage) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Getting you a link ...').catch((e: IncomingMessage) => dansole.error(e));
    const posts: Array<IDanPost> = await getPostsInfo();
    const rando = posts[Math.floor(Math.random()*posts.length)];
    await bot.sendMessage(chatId, rando.file_url).catch((e: IncomingMessage) => dansole.error(e));
}

/**
 * sends a random picture
 */
async function c_pic(msg: ITelegramMessage) {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Getting you a picture ...').catch((e: IncomingMessage) => dansole.error(e));
    const posts: Array<IDanPost> = await getPostsInfo();
    const rando = posts[Math.floor(Math.random()*posts.length)];
    await bot.sendPhoto(msg.chat.id, rando.file_url).catch((e: IncomingMessage) => dansole.error(e))
}

/**
 * posts picture to channel
 */
async function c_post(msg: ITelegramMessage) {
    const chatId = msg.chat.id;
    let selectedPostIndex: number = 0;
    let postsRefreshedCounter: number = 0;  // debug info (for report)
    let selectedPost: IDanPost;
    // let posts: Array<IDanPost> = [];
    let sortedPosts: Array<IDanPost> = [];
    const postPreferences = danMemory.getAll();

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
        const _posts = await getPostsInfo(postPreferences);
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

        return modelDocument.find({md5: _selectedPost.md5}).then((res: Array<IMongoFindResponse<IDanPost>>) => {
            dansole.info(`Searching ${selectedPost.md5.substr(-4, 4)} in ${collectionName}`);
            dansole.info(res.length, res.map(r => {
                return (r._doc) ? r._doc.md5.substr(-4, 4) : 'not found!';
            }));
            return res.length > 0;
        }, (e: IncomingMessage) => dansole.error(e));
    }

    await refreshPosts();
    let isNewPost: boolean = false;

    do {
        selectedPost = selectPost(sortedPosts);
        isNewPost = await isPostInDB(selectedPost);

        if (postsRefreshedCounter > 3) {
            bot.sendMessage(chatId, '`WARNING!` Maximum cycle count reached. You need to make search scope wider!').catch((e: IncomingMessage) => dansole.error(e));
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

    await dbPost.save(function (err: IncomingMessage) {
        if (err) {
            bot.sendMessage(chatId, '`WARNING!` Unable to save post to DB. Post was not posted!').catch((e: IncomingMessage) => dansole.error(e));
            return dansole.error(err);
        }

        // [5] posting to channel
        bot.sendPhoto(CHANNEL_ID, selectedPost.large_file_url, { caption: `${selectedPost.md5}.${selectedPost.file_ext}` }).then(() => {
            // [6] sending report to owner
            let info = ` \n
            ✅ Picture ${selectedPost.md5} was posted. \n 
            📋 To collection: ${collectionName}. \n
            🔁 Cycles performed: ${postsRefreshedCounter}. \n 
            Selected picture from last cycle is #${selectedPostIndex} \n
            🕓 Posted at: ${new Date().toUTCString()}`;

            const preferences = danMemory.getAll();

            if (Object.keys(preferences).length) {
                info = info.concat(` \n\n⚙ With preferences: ${JSON.stringify(preferences)} and increased limit to ${LIMIT_FOR_TAGS}`);
            }

            bot.sendMessage(
                chatId, info
            ).catch((e: IncomingMessage) => dansole.error(e));
        }).catch((e: IncomingMessage) => {
            dansole.error(e);

            bot.sendMessage(
                chatId, `22
                ❌ Picture ${selectedPost.md5} was NOT posted. \n 
                📋 To collection: ${collectionName}. \n
                🔁 Cycles performed: ${postsRefreshedCounter}. \n 
                Selected picture from last cycle is #${selectedPostIndex} \n
                🕓 Error happened at: ${new Date().toUTCString()} \n\n
                REASON: ${e} \n\n
                
                LOG: ${JSON.stringify(selectedPost)}`
            ).catch((e: IncomingMessage) => dansole.error(e));
        });
    });
}

/**
 * sets a setting value
 */
function c_set(msg: ITelegramMessage) {
    const chatId = msg.chat.id;

    const parameters = danUtils.parseCommand(msg.text).parameters;

    if (parameters['_'].length) {
        bot.sendMessage(chatId, `Can't perceive this parameters: ${parameters['_'].join(', ')}`);
        c_help(msg);
        return;
    }

    delete parameters['_'];

    for (const key in parameters) {
        if (parameters.hasOwnProperty(key) && danMemory.allowedParams.find(name => name === key)) {
            danMemory.set({[key]: parameters[key]});
        } else {
            bot.sendMessage(chatId, `${key} parameter not allowed`);
            c_help(msg);
        }
    }

    bot.sendMessage(chatId, `Dan preference now: ${JSON.stringify(danMemory.getAll())}`);
}

/**
 * prints help
 */
function c_help(msg: ITelegramMessage) {
    bot.sendMessage(msg.chat.id, `
        Available commands:
            /start - shows keyboard, starts bot
            /hello - prints message
            /pic - gets random picture
            /post - posts picture to channel based on preferences
            /set - sets preference
                --rating - saves selected rating ['explicit' | 'safe' | 'questionable']; ex: /set --rating=safe
                --order - saves selected order ['rank' | 'custom' | 'comment_bumped']; ex: /set --order=rank
                --frequency - how often post will be posted automatically (in hours);  ex: /set --frequency=1
    `);
}


setCommand('set', (msg: ITelegramMessage) => {
    c_set(msg)
}, true);
setCommand('help', (msg: ITelegramMessage) => {
    c_help(msg)
});
setCommand('post', (msg: ITelegramMessage) => {
    c_post(msg);
});
setCommand('pic', (msg: ITelegramMessage) => {
    c_pic(msg);
});
setCommand('link', (msg: ITelegramMessage) => {
    c_link(msg);
});
setCommand('hello', (msg: ITelegramMessage) => {
    c_hello(msg);
});
setCommand('info', (msg: ITelegramMessage) => {
    c_info(msg);
});
setCommand('start', (msg: ITelegramMessage) => {
    c_start(msg);
});

module.exports = {
    c_help,
    c_start,
    c_link,
    c_info,
    c_hello,
    c_pic,
    c_post,
    c_set,
};
