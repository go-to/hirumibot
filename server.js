var restify = require('restify');
var builder = require('botbuilder');
var fs = require('fs');
var readline = require('readline');

var FILE_DIR = './files/';

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

        var today = getToday();
        var text = session.message.text;

        if (text.indexOf('不参加') !== -1 || text.indexOf('cancel') !== -1) {
            var data = readFile(today);
            var list = data.split(",");
            var idx = 0;
            for (var i in list) {
                var name = list[i];
                if (name == session.message.user.name) {
                    list = list.splice(idx, 1);
                    break;
                }
                idx++;
            }
            writeNameToFile(today, list.join(","));
            session.send('参加を取り消したよ！また今度参加してね！');
            return;
        }

        if (text.indexOf('参加') !== -1) {
            writeNameToFile(today, session.message.user.name);
            var data = readFile(today);
            var list = data.split(",");
            session.send('参加を受け付けました！わーい！');
            return;
        }

        if (text.indexOf('行くぞ') !== -1 || text.indexOf('いくぞ') !== -1) {
            var data = readFile(today);
            var list = data.split(",");
            var memberList = makeMembers(list);

            session.send('はーい！');
            session.send('メンバーはこちら！');
            for (var i in memberList) {
                session.send(memberList[i].join(", "));
            }
            return;
        }

        if (text.indexOf('リセット') !== -1 || text.indexOf('reset') !== -1) {
            deleteFile(today);
            session.send('リセットしたよ！');
            return;
        }

        session.send('＿/＼○_ﾋｬｯ　　ε=＼＿__○ノﾎｰｳ!!　←' + session.message.user.name);

    } catch (e) {
        session.send('エラーです.しくしく:' + e);
    }
});

function getToday() {
    var date = new Date();
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ].join('');
}

// = others =====================================

/**
 * File 名を指定して指定された文字列を追記する
 * @param {String} fileName 
 * @param {String} name 
 */
function writeNameToFile(fileName, text) {
    var tmptext = '';

    if (fs.existsSync(FILE_DIR + fileName + '.txt')) {

        var namelist = readFile(fileName).split(',');
        // すでに追加されている場合は終了
        if (namelist.indexOf(text) !== -1) {
            return;
        }
        namelist.push(text);
        tmptext = namelist.join(',');

    } else {
        tmptext = text;
    }
    fs.writeFileSync(FILE_DIR + fileName + '.txt', tmptext, 'utf8');
}

/**
 * ファイルの読み込み
 * @param {String} fileName 
 * @param {String} text 
 * @param {Function} completionHandler 
 */
function readFile(fileName) {
    return fs.readFileSync(FILE_DIR + fileName + ".txt", 'utf8');
}

/**
 * ファイルの削除
 * @param {String} fileName 
 */
function deleteFile(fileName) {
    fs.rmdirSync(FILE_DIR + fileName + '.txt');
}

/**
 * シャッフルする
 * @param {Array} array 
 */
function shuffle(array) {
    var n = array.length, t, i;
    while (n) {
        i = Math.floor(Math.random() * n--);
        t = array[n];
        array[n] = array[i];
        array[i] = t;
    }
    return array;
}

/**
 * メンバーのリストを作る
 * @param {Array} list 
 */
function makeMembers(orgList) {

    // シャッフル
    var list = shuffle(orgList);

    // 分割
    var b = list.length;
    var cnt = 4;
    var tmpArr = [];

    for (var i = 0; i < Math.ceil(b / cnt); i++) {
        var j = i * cnt;
        var p = list.slice(j, j + cnt);
        tmpArr.push(p);
    }

    // ここにいれてく
    var newArr = [];

    // ラストの配列が2人以下の場合は分ける
    var lastArr = tmpArr.pop();
    if (lastArr.length <= 2) {
        // TODO: - 全部で6人の場合に落ちます.力尽きた（AM1:50）
        for (var i in lastArr) {
            tmpArr[i].push(lastArr[i]);
        }
        newArr = tmpArr;
    } else {
        newArr = tmpArr;
    }
    return newArr;
}
