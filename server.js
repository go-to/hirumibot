var restify = require('restify');
var builder = require('botbuilder');
var hirumiConst = require('./util/const.js');
var hirumiUtil = require('./util/function.js');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('ヾ(⌒(ﾉ\'ω\')ﾉ');
});

var connector = new builder.ChatConnector({
    appId: 'APPID',
    appPassword: 'PASSWORD'
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.dialog('/', function (session) {
    try {

        var today = hirumiUtil.getToday();
        var text = session.message.text;
        var userName = session.message.user.name;
        var linefeed = hirumiConst.LINEFEED_DISPLAY;
        var memberList = [];

        // 今日日付のファイルがなければ作成する
        var listFilePath = hirumiConst.FILE_DIR + today + '.txt';
        if (!hirumiUtil.isExistFile(listFilePath)) {
            hirumiUtil.createFile(listFilePath, '');
        }

        /* 入力メッセージの判別 */
        // どちらでもない系
        var wordFilePath = hirumiConst.WORD_LIST_DIR + hirumiConst.WORD_LIST_FILE_UNKNOWN;
        var wasFound = hirumiUtil.findWord(text, wordFilePath);
        if (wasFound) {
            session.send('参加ですか？不参加ですか？');
            return;
        }

        // 不参加系
        wordFilePath = hirumiConst.WORD_LIST_DIR + hirumiConst.WORD_LIST_FILE_NON_PARTICIPATE;
        wasFound = hirumiUtil.findWord(text, wordFilePath);
        if (wasFound) {
            wasFound = hirumiUtil.findWord(userName, listFilePath);
            if (wasFound) {
                memberList = hirumiUtil.readFile(listFilePath);
                for (var i in memberList) {
                    var memberName = memberList[i];
                    if (memberName === userName) {
                        memberList.splice(i, 1);
                        var memberListStr = memberList.join(hirumiConst.LINEFEED);
                        hirumiUtil.overwriteNameToFile(memberListStr, listFilePath);
                        break;
                    }
                }
                session.send(userName + 'さんの参加を取り消したよ！また今度参加してね！');
            } else {
                session.send(userName + 'さんはまだ参加表明してないよ！');
            }
            return;
        }

        // 参加系
        wordFilePath = hirumiConst.WORD_LIST_DIR + hirumiConst.WORD_LIST_FILE_PARTICIPATE;
        wasFound = hirumiUtil.findWord(text, wordFilePath);
        if (wasFound) {
            var result = hirumiUtil.writeNameToFile(userName, listFilePath);
            if (result === hirumiConst.RESULT_CODE_SUCCESS) {
                session.send(userName + 'さんの参加を受け付けました！わーい！');
            } else if (result === hirumiConst.RESULT_CODE_UNNECESSARY) {
                session.send(userName + 'さんはすでに参加表明済みだよ！');
            }
            return;
        }

        // いま何人系
        wordFilePath = hirumiConst.WORD_LIST_DIR + hirumiConst.WORD_LIST_FILE_STATUS;
        wasFound = hirumiUtil.findWord(text, wordFilePath);
        if (wasFound) {
            memberList = hirumiUtil.readFile(listFilePath);
            session.send('現在' + memberList.length + '人です！');
            if (memberList.length > 0) {
                session.send('【参加予定メンバー】' + linefeed + memberList.join(linefeed));
            }
            return;
        }

        // 行くぞ系
        wordFilePath = hirumiConst.WORD_LIST_DIR + hirumiConst.WORD_LIST_FILE_LETS_GO;
        wasFound = hirumiUtil.findWord(text, wordFilePath);
        if (wasFound) {
            memberList = hirumiUtil.readFile(listFilePath);
            memberList = hirumiUtil.makeMembers(memberList);
            if (memberList.length > 0) {
                session.send('はーい！');
                session.send('メンバーはこちら！');
                for (var i in memberList) {
                    session.send('【' + (parseInt(i) + 1) + '班】' + linefeed + memberList[i].join(linefeed));
                }
            } else {
                session.send('参加者が1人もいません。。。');
            }
            return;
        }

        // リセット系
        wordFilePath = hirumiConst.WORD_LIST_DIR + hirumiConst.WORD_LIST_FILE_RESET;
        wasFound = hirumiUtil.findWord(text, wordFilePath);
        if (wasFound) {
            hirumiUtil.reset(listFilePath);
            session.send('リセットしたよ！');
            return;
        }
        
        // ヘルプ系
        wordFilePath = hirumiConst.WORD_LIST_DIR + hirumiConst.WORD_LIST_FILE_HELP;
        wasFound = hirumiUtil.findWord(text, wordFilePath);
        if (wasFound) {
            var hirumiMention = hirumiConst.HIRUMI_MENTION;
            session.send('【使い方】' + linefeed
                + '・参加する　　　　："' + hirumiMention + ' 参加" と投稿します' + linefeed
                + '・参加を取り消す　："' + hirumiMention + ' 不参加" と投稿します' + linefeed
                + '・現在の人数を確認："' + hirumiMention + ' 人数は？" と投稿します' + linefeed
                + '・班分け＆出発する："' + hirumiMention + ' 行くぞ" と投稿します' + linefeed
                + '上記以外の表現でも反応できる場合があるので、いろいろと試してみてね！'
            );
            return;
        }

        session.send('＿/＼○_ﾋｬｯ　　ε=＼＿__○ノﾎｰｳ!!　←' + userName);

    } catch (e) {
        session.send('エラーです.しくしく:' + e);
    }
});