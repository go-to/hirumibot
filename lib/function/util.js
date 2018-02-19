var fs = require('fs');
var hirumiConst = require('../config/const.js');

/**
 * 今日の日付を取得
 * @return {string} 今日の日付をYYYYMMDD形式で返す
 */
exports.getToday = function () {
    var date = new Date();
    return [
        date.getFullYear(),
        ('0' + (date.getMonth() + 1)).slice(-2),
        ('0' + date.getDate()).slice(-2)
    ].join('');
};

/**
 * ファイルの存在チェック
 * @param {string} filePath - ファイルパス
 */
exports.isExistFile = function (filePath) {
    try {
        fs.statSync(filePath);
        return true;
    } catch (err) {
        if (err.code === hirumiConst.ERROR_CODE_NO_SUCH_FILE_OR_DIRECTORY) {
            return false;
        }
    }
};

/**
 * ファイルを新規作成
 * @param {string} filePath - ファイルパス
 * @param {string} text - ファイルに書き込む文字列
 */
exports.createFile = function (filePath, text) {
    fs.writeFile(filePath, text);
};

/**
 * ファイルの読み込み
 * @param {string} filePath - ファイルパス
 * @return {array} ファイル内の各行を配列化した配列を返す
 */
exports.readFile = function (filePath) {
    var content = fs.readFileSync(filePath, hirumiConst.CHARSET);
    if (content === '') {
        return [];
    }
    content = content.replace(hirumiConst.LINEFEED_WIN, hirumiConst.LINEFEED);  // convert for Windows
    content = content.replace(hirumiConst.LINEFEED_MAC, hirumiConst.LINEFEED);  // convert for MAC
    var contentArr = content.split(hirumiConst.LINEFEED);

    // 重複排除
    var contentObj = {};
    for (var i in contentArr) {
        var data = contentArr[i];
        if (data === '') {
            continue;
        }
        contentObj[data] = data;
    }
    return Object.keys(contentObj).map(function(key){return contentObj[key]});
};

/**
 * ファイル内に指定の言葉が含まれるか探索
 * @param {string }text - 探索対象文字列
 * @param {string} filePath - ファイルパス
 * @return {boolean} 探索結果の真偽値を返す
 */
exports.findWord = function (text, filePath) {
    // TODO 処理をスマート化したい
    var data = this.readFile(filePath);
    for (var i = 0; i < data.length; i++) {
        if (data[i] === "") {
            continue;
        }
        if (text.indexOf(data[i]) !== -1) {
            return true;
        }
    }
    return false;
};

/**
 * ユーザーをファイルに追記
 * @param {string} name - ユーザー名
 * @param {string} filePath - ファイルパス
 * @return {number} 処理結果に応じてコードを返す
 */
exports.writeNameToFile = function (name, filePath) {
    var wasFound = this.findWord(name, filePath);
    // すでに追加されている場合は終了
    if (wasFound) {
        return hirumiConst.RESULT_CODE_UNNECESSARY;
    }
    var nameList = this.readFile(filePath);
    nameList.push(name);
    fs.writeFileSync(filePath, nameList.join(hirumiConst.LINEFEED), hirumiConst.CHARSET);
    return hirumiConst.RESULT_CODE_SUCCESS;
};

/**
 * ユーザー一覧をファイルに上書き（全書き換え）
 * @param {string} data - ファイルに書き込む文字列
 * @param {string} filePath - ファイルパス
 * @return {number} 処理結果に応じてコードを返す
 */
exports.overwriteNameToFile = function (data, filePath) {
    fs.writeFileSync(filePath, data, hirumiConst.CHARSET);
    return hirumiConst.RESULT_CODE_SUCCESS;
};

/**
 * ファイルの中身をリセット（中身を空に更新）
 * @param {string} filePath - ファイルパス
 * @return {number} 処理結果に応じてコードを返す
 */
exports.reset = function (filePath) {
    fs.writeFileSync(filePath, '', hirumiConst.CHARSET);
    return hirumiConst.RESULT_CODE_SUCCESS;
};

/**
 * 班を作成
 * @param {array} orgList - ユーザー配列
 * @return {array} 班分け後のユーザー配列を返す
 */
exports.makeMembers = function (orgList) {
    // シャッフル
    var list = this.shuffle(orgList);

    // 班分け
    return this.grouping(list);
};

/**
 * 配列をシャッフル
 * @param {array} array - ユーザー配列
 * @return {array} シャッフル後の配列を返す
 */
exports.shuffle = function (array) {
    // Fisher–Yatesアルゴリズムを用いてシャッフル
    for (var i = array.length - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[r];
        array[r] = tmp;
    }
    return array;
};

/**
 * 班分け
 * @param {array} members - ユーザー配列
 * @return {array} ユーザー配列を班分け（規定の要素で2次元配列化）して返す
 */
exports.grouping = function (members) {
    var idx = 0;
    var memberList = [];
    while (members.length > 0) {
        // 最大班人数でメンバーの余りを計算
        var remainder = members.length % hirumiConst.MAX_MEMBER_NUM;

        if (remainder === 0) {  // 完全に割り切れた場合
            // 参加人数＝最大班人数ならそのまま班を作成
            if (members.length === hirumiConst.MAX_MEMBER_NUM) {
                memberList[idx] = members.concat();
                members.splice(0, hirumiConst.MAX_MEMBER_NUM);
                // 上記以外は最大班人数で班を作成
            } else {
                memberList[idx] = members.concat().slice(0, hirumiConst.MAX_MEMBER_NUM);
                members.splice(0, hirumiConst.MAX_MEMBER_NUM);
            }
        } else if (remainder <= hirumiConst.MIN_MEMBER_NUM) {   // 余りが最小班人数以下の場合
            // 参加人数が最小班人数以下ならそのまま班を作成
            if (members.length <= hirumiConst.MIN_MEMBER_NUM) {
                memberList[idx] = members.concat().slice(0, members.length);
                members.splice(0, members.length);
                // 上記以外は最小班人数で班を作成
            } else {
                memberList[idx] = members.concat().slice(0, hirumiConst.MIN_MEMBER_NUM);
                members.splice(0, hirumiConst.MIN_MEMBER_NUM);
            }
        } else {    // 余りが最小班人数より多い場合は最大班人数で班を作成
            memberList[idx] = members.concat().slice(0, hirumiConst.MAX_MEMBER_NUM);
            members.splice(0, hirumiConst.MAX_MEMBER_NUM);
        }
        idx++;
    }
    return memberList;
};