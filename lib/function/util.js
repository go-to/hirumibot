const fs = require('fs');
const hirumiConst = require('../config/const.js');

/**
 * 今日の日付を取得
 * @param {string} delimiter - ファイル区切り文字 (デフォルト値："")
 * @param {boolean} adjustNumberFormat - 桁数調整(ゼロ埋め)を行うか (デフォルト値：true)
 * @return {string} 今日の日付を引数の区切り文字で整形して返す
 */
exports.getToday = (delimiter = '', adjustNumberFormat = true) => {
    const date = new Date();
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    if (!adjustNumberFormat) {
        month = parseInt(month);
        day = parseInt(day);
    }
    return [
        year,
        month,
        day
    ].join(delimiter);
};

/**
 * 現在時間取得処理
 *
 * @returns {string}
 */
exports.getCurrentTime = () => {
    const date = new Date();
    return [
        ('0' + (date.getHours())).slice(-2),
        ('0' + date.getMinutes()).slice(-2)
    ].join('');
};

/**
 * 今日の曜日を取得
 * @params changeValue {int} 変更して取得する日数（翌日の場合は1、前日の場合は-1）
 * @returns {string} 曜日（英文字列）
 */
exports.getDayOfTheWeek = (changeValue = null) => {
    const date = new Date();
    if (changeValue !== null) {
        date.setDate(date.getDate() + changeValue);
    }
    let dayOfTheWeek = '';
    switch (date.getDay()) {
        case 0:
            dayOfTheWeek = hirumiConst.WORD_LIST_FILE_AUTO_POST_SUNDAY;
            break;
        case 1:
            dayOfTheWeek = hirumiConst.WORD_LIST_FILE_AUTO_POST_MONDAY;
            break;
        case 2:
            dayOfTheWeek = hirumiConst.WORD_LIST_FILE_AUTO_POST_TUESDAY;
            break;
        case 3:
            dayOfTheWeek = hirumiConst.WORD_LIST_FILE_AUTO_POST_WEDNESDAY;
            break;
        case 4:
            dayOfTheWeek = hirumiConst.WORD_LIST_FILE_AUTO_POST_THURSDAY;
            break;
        case 5:
            dayOfTheWeek = hirumiConst.WORD_LIST_FILE_AUTO_POST_FRIDAY;
            break;
        case 6:
            dayOfTheWeek = hirumiConst.WORD_LIST_FILE_AUTO_POST_SATURDAY;
            break;
    }
    return dayOfTheWeek;
};

/**
 * 曜日の日本語名取得処理
 *
 * @param dayEn {string} 曜日名（英語）
 * @returns {string}
 */
exports.getDayJaNameByEn = (dayEn) => {
    let dayJa = '';
    switch (dayEn) {
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_EVERYDAY:
            dayJa = '毎日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_WEEKDAY:
            dayJa = '平日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_SUNDAY:
            dayJa = '日曜日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_MONDAY:
            dayJa = '月曜日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_TUESDAY:
            dayJa = '火曜日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_WEDNESDAY:
            dayJa = '水曜日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_THURSDAY:
            dayJa = '木曜日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_FRIDAY:
            dayJa = '金曜日';
            break;
        case hirumiConst.WORD_LIST_FILE_AUTO_POST_SATURDAY:
            dayJa = '土曜日';
            break;
    }
    return dayJa;
};

/**
 * 改行コード変換処理
 *
 * @param str {string} 変換対象文字列
 * @returns {*}
 */
exports.replaceLineFeed = (str) => {
    let result = str;
    result = result.replace(hirumiConst.LINEFEED_WIN, hirumiConst.LINEFEED);  // convert for Windows
    result = result.replace(hirumiConst.LINEFEED_MAC, hirumiConst.LINEFEED);  // convert for MAC
    return result;
};

/**
 * 参加・不参加系ワード判断処理
 *
 * @param conversationId {string} 会話ID
 * @param userName {string} 投稿者名
 * @param text {string} 投稿内容
 * @returns {Promise<Array>}
 */
exports.searchMeetingWord = async (conversationId, userName, text) => {

    const today = this.getToday();
    const linefeed = hirumiConst.LINEFEED_DISPLAY;
    let messages = [];

    // 今日日付のファイルがなければ作成する
    const listFilePath = `${hirumiConst.FILE_DIR}/${hirumiConst.PARTICIPATE_DIR}/${today}-${conversationId}.txt`;
    if (!await this.isExistFile(listFilePath)) {
        await this.createFile(listFilePath, '');
    }

    /* 入力メッセージの判別 */
    // どちらでもない系
    wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_UNKNOWN}`;
    wasFound = await this.findWord(text, wordFilePath);
    if (wasFound) {
        messages.push('参加ですか？不参加ですか？');
        return messages;
    }

    // 不参加系
    wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_NON_PARTICIPATE}`;
    wasFound = await this.findWord(text, wordFilePath);
    if (wasFound) {
        wasFound = await this.findWord(userName, listFilePath);
        if (wasFound) {
            memberList = await this.readFile(listFilePath);
            for (let i in memberList) {
                let memberName = memberList[i];
                if (memberName === userName) {
                    memberList.splice(i, 1);
                    let memberListStr = memberList.join(hirumiConst.LINEFEED);
                    await this.overwriteNameToFile(memberListStr, listFilePath);
                    break;
                }
            }
            messages.push(`${userName}さんの参加を取り消したよ！また今度参加してね！`);
        } else {
            messages.push(`${userName}さんはまだ参加表明してないよ！`);
        }
        return messages;
    }

    // 参加系
    wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_PARTICIPATE}`;
    wasFound = await this.findWord(text, wordFilePath);
    if (wasFound) {
        let result = await this.writeNameToFile(userName, listFilePath);
        if (result === hirumiConst.RESULT_CODE_SUCCESS) {
            messages.push(`${userName}さんの参加を受け付けました！わーい！`);
        } else if (result === hirumiConst.RESULT_CODE_UNNECESSARY) {
            messages.push(`${userName}さんはすでに参加表明済みだよ！`);
        }
        return messages;
    }

    // いま何人系
    wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_STATUS}`;
    wasFound = await this.findWord(text, wordFilePath);
    if (wasFound) {
        memberList = await this.readFile(listFilePath);
        messages.push(`現在${memberList.length}人です！`);
        if (memberList.length > 0) {
            messages.push(`【参加予定メンバー】${linefeed}${memberList.join(linefeed)}`);
        }
        return messages;
    }

    // 行くぞ系
    wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_LETS_GO}`;
    wasFound = await this.findWord(text, wordFilePath);
    if (wasFound) {
        memberList = await this.readFile(listFilePath);
        memberList = this.makeMembers(memberList);
        if (memberList.length > 0) {
            messages.push('はーい！');
            messages.push('メンバーはこちら！');
            for (let i in memberList) {
                messages.push(`【${(parseInt(i) + 1)}班】${linefeed}${memberList[i].join(linefeed)}`);
            }
        } else {
            messages.push('参加者が1人もいません。。。');
        }
        return messages;
    }

    // リセット系
    wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.WORD_LIST_FILE_RESET}`;
    wasFound = await this.findWord(text, wordFilePath);
    if (wasFound) {
        await hirumiUtil.reset(listFilePath);
        messages.push('リセットしたよ！');
        return messages;
    }
    return messages;
};

/**
 * ファイルの存在チェック
 * @param {string} filePath - ファイルパス
 */
exports.isExistFile = async (filePath) => {
    try {
        return await fs.existsSync(filePath) && await fs.statSync(filePath).isFile();
    } catch (err) {
        if (err.code === hirumiConst.ERROR_CODE_NO_SUCH_FILE_OR_DIRECTORY) {
            return false;
        }
    }
};

/**
 * ディレクトリの存在チェック
 * @param {string} dirPath ディレクトリパス
 * @returns {*}
 */
exports.isExistDir = async (dirPath) => {
    try {
        return await fs.existsSync(dirPath) && await fs.statSync(dirPath).isDirectory();
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
exports.createFile = async (filePath, text) => {
    await fs.writeFileSync(filePath, text);
};

/**
 * ディレクトリを新規作成
 * @param {string} dirPath ディレクトリパス
 */
exports.createDir = async (dirPath) => {
    await fs.mkdirSync(dirPath);
};

/**
 * ファイル一覧を取得
 * @param {string} dirPath ディレクトリパス
 * @returns {*}
 */
exports.getFileList = async (dirPath) => {
    return await fs.readdirSync(dirPath);
};

/**
 * ファイルの読み込み
 * @param {string} filePath - ファイルパス
 * @return {array} ファイル内の各行を配列化した配列を返す
 */
exports.readFile = async (filePath) => {
    let content = await fs.readFileSync(filePath, hirumiConst.CHARSET);
    if (content === '') {
        return [];
    }
    content = this.replaceLineFeed(content);
    let contentArr = content.split(hirumiConst.LINEFEED);

    // 重複排除
    let contentObj = {};
    for (let i in contentArr) {
        let data = contentArr[i];
        if (data === '') {
            continue;
        }
        contentObj[data] = data;
    }
    return Object.keys(contentObj).map((key) => {
        return contentObj[key]
    });
};

/**
 * ファイル内に指定の言葉が含まれるか探索
 * @param {string }text - 探索対象文字列
 * @param {string} filePath - ファイルパス
 * @return {boolean} 探索結果の真偽値を返す
 */
exports.findWord = async (text, filePath) => {
    // TODO 処理をスマート化したい
    const data = await this.readFile(filePath);
    for (let i = 0; i < data.length; i++) {
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
 * CSVファイル内に指定の言葉が含まれるか探索
 * @param {string }text - 探索対象文字列
 * @param {string} filePath - ファイルパス
 * @param {string} delimiter - ファイル区切り文字 (デフォルト値：",")
 * @return {boolean} 探索結果の真偽値を返す
 */
exports.findWordCsv = async (text, filePath, delimiter = ',') => {
    // TODO 処理をスマート化したい
    const data = await this.readFile(filePath);
    let splitData = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i] === "") {
            continue;
        }
        splitData = data[i].split(delimiter);
        if (splitData.length < 1) {
            continue;
        }
        if (text.indexOf(splitData[0]) !== -1) {
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
exports.writeNameToFile = async (name, filePath) => {
    const wasFound = await this.findWord(name, filePath);
    // すでに追加されている場合は終了
    if (wasFound) {
        return hirumiConst.RESULT_CODE_UNNECESSARY;
    }
    let nameList = await this.readFile(filePath);
    nameList.push(name);
    await fs.writeFileSync(filePath, nameList.join(hirumiConst.LINEFEED), hirumiConst.CHARSET);
    return hirumiConst.RESULT_CODE_SUCCESS;
};

/**
 * ユーザー一覧をファイルに上書き（全書き換え）
 * @param {string} data - ファイルに書き込む文字列
 * @param {string} filePath - ファイルパス
 * @return {number} 処理結果に応じてコードを返す
 */
exports.overwriteNameToFile = async (data, filePath) => {
    await fs.writeFileSync(filePath, data, hirumiConst.CHARSET);
    return hirumiConst.RESULT_CODE_SUCCESS;
};

/**
 * ファイルの中身をリセット（中身を空に更新）
 * @param {string} filePath - ファイルパス
 * @return {number} 処理結果に応じてコードを返す
 */
exports.reset = async (filePath) => {
    await fs.writeFileSync(filePath, '', hirumiConst.CHARSET);
    return hirumiConst.RESULT_CODE_SUCCESS;
};

/**
 * ファイル削除
 *
 * @param {string} filePath - ファイルパス
 * @returns {Promise<number>}
 */
exports.deleteFile = async (filePath) => {
    await fs.unlinkSync(filePath);
    return hirumiConst.RESULT_CODE_SUCCESS;
};

/**
 * 班を作成
 * @param {array} orgList - ユーザー配列
 * @return {array} 班分け後のユーザー配列を返す
 */
exports.makeMembers = (orgList) => {
    // シャッフル
    let list = this.shuffle(orgList);

    // 班分け
    return this.grouping(list);
};

/**
 * 配列をシャッフル
 * @param {array} array - ユーザー配列
 * @return {array} シャッフル後の配列を返す
 */
exports.shuffle = (array) => {
    // Fisher–Yatesアルゴリズムを用いてシャッフル
    for (let i = array.length - 1; i > 0; i--) {
        let r = Math.floor(Math.random() * (i + 1));
        let tmp = array[i];
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
exports.grouping = (members) => {
    let idx = 0;
    let memberList = [];
    while (members.length > 0) {
        // 最大班人数でメンバーの余りを計算
        let remainder = members.length % hirumiConst.MAX_MEMBER_NUM;

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
