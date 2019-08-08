const restify = require('restify');
const builder = require('botbuilder');
const schedule = require('node-schedule');
const hirumiConst = require('./lib/config/const.js');
const hirumiUtil = require('./lib/function/util.js');
const autoPost = require('./lib/function/autopost.js');

const server = restify.createServer();
process.env.TZ = hirumiConst.TIMEZONE;
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('ヾ(⌒(ﾉ\'ω\')ﾉ');
});

const connector = new builder.ChatConnector({
    appId: hirumiConst.env.APP_ID,
    appPassword: hirumiConst.env.APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// 定期実行
const job = schedule.scheduleJob(hirumiConst.AUTOPOST_CRON_TIMER, () => {
    // 送信有無を判定して自動投稿
    autoPost.checkSchedule()
        .then((result) => {

        })
        .catch((err) => {
            console.log(err);
        });
});

// bot宛にメッセージが来た際の返信処理
bot.dialog('/', (session) => {
    try {
        const conversationId = session.message.address.conversation.id;
        const text = session.message.text;
        const userName = session.message.user.name;
        const linefeed = hirumiConst.LINEFEED_DISPLAY;

        // // TODO 発言内容を言語解析API等を用いて解釈できるようにする
        // 自動投稿系
        autoPost.searchAutoPostWord(session.message.address.conversation.id, text)
            .then((messages) => {
                if (messages && messages.length > 0) {
                    console.log('自動投稿登録OK');
                    for (idx in messages) {
                        let message = messages[idx];
                        session.send(message);
                    }
                    return;
                } else {
                    // ヘルプ系
                    wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_HELP}`;
                    hirumiUtil.findWord(text, wordFilePath)
                        .then((result) => {
                            if (result) {
                                const hirumiMention = hirumiConst.env.MENTION;
                                session.send(
                                    `【使い方】${linefeed}` +
                                    `・参加する　　　　："${hirumiMention} 参加" と投稿します${linefeed}` +
                                    `・参加を取り消す　："${hirumiMention} 不参加" と投稿します${linefeed}` +
                                    `・現在の人数を確認："${hirumiMention} 人数は？" と投稿します${linefeed}` +
                                    `・班分け＆出発する："${hirumiMention} 行くぞ" と投稿します${linefeed}` +
                                    `上記以外の表現でも反応できる場合があるので、いろいろと試してみてね！`);
                            } else {
                                // ミーティング参加・不参加系
                                hirumiUtil.searchMeetingWord(conversationId, userName, text)
                                    .then((messages) => {
                                        if (messages && messages.length > 0) {
                                            for (idx in messages) {
                                                let message = messages[idx];
                                                session.send(message);
                                            }
                                        } else {
                                            // conversation_id取得系
                                            wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_GET_CONVERSATION_ID}`;
                                            hirumiUtil.findWord(text, wordFilePath)
                                                .then((result) => {
                                                    if (result) {
                                                        session.send(`このグループのconversation_idは↓です！
                                                        ${conversationId}`);
                                                    } else {
                                                        session.send(`＿/＼○_ﾋｬｯ　　ε=＼＿__○ノﾎｰｳ!!　←${userName}`);
                                                    }
                                                })
                                                .catch((err) => {
                                                    console.log(err);
                                                });
                                        }
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    });
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    } catch (e) {
        session.send(`エラーです.しくしく:${e}`);
    }
});
