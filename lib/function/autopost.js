const request = require('superagent');
const hirumiConst = require('../config/const.js');
const hirumiUtil = require('./util.js');

/**
 * 投稿有無チェック処理
 * 
 * @returns {Promise<void>}
 */
exports.checkSchedule = async () => {
    const currentDay = hirumiUtil.getDayOfTheWeek();
    const currentTime = hirumiUtil.getCurrentTime();
    let days = [hirumiConst.WORD_LIST_FILE_AUTO_POST_EVERYDAY];
    if (hirumiConst.AUTOPOST_SCHEDULE_WEEK_DAYS.indexOf(currentDay) >= 0) {
        days.push(hirumiConst.WORD_LIST_FILE_AUTO_POST_WEEKDAY);
    }
    days.push(currentDay);

    for (idx in days) {
        let targetDay = days[idx];
        let targetDir = `${hirumiConst.FILE_DIR}/${hirumiConst.AUTOPOST_DIR}/${targetDay}/${currentTime}`;
        if (!await hirumiUtil.isExistDir(targetDir)) {
            await hirumiUtil.createDir(targetDir);
        }
        const files = await hirumiUtil.getFileList(targetDir);
        if (files.length > 0) {
            for (idx in files) {
                let conversationId = files[idx];
                let filePath = `${targetDir}/${conversationId}`;
                let message = await hirumiUtil.readFile(filePath);
                message = message.join(hirumiConst.LINEFEED_DISPLAY);
                this.execute(conversationId, message);
            }
        }
    }
};

/**
 * 自動投稿テスト用関数
 *
 * @param conversationId {string} 会話ID
 * @param message {string} 投稿本文
 * @returns {Promise<*>}
 */
exports.execute = async (conversationId, message) => {
    // アクセストークンを取得
    const accessToken = await this.getAccessToken();

    // REST APIを叩いてメッセージを投稿
    let uri = `${hirumiConst.AUTOPOST_REST_API_URI}/${conversationId}/${hirumiConst.AUTOPOST_REST_API_URI_SUFFIX}`;
    options = {
        'type': hirumiConst.AUTOPOST_REST_API_JSON_TYPE,
        'text': message,
    };
    const result = await request
        .post(uri)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(options);
    if (!result.hasOwnProperty('body')) {
        return false;
    }
    return result.body.id;
};

/**
 * Skype APIアクセストークン取得処理
 *
 * @returns {Promise<boolean>}
 */
exports.getAccessToken = async () => {
    // OAuth認証
    let uri = hirumiConst.AUTOPOST_OAUTH_URI;
    let options = {
        'client_id': hirumiConst.env.APP_ID,
        'client_secret': hirumiConst.env.APP_PASSWORD,
        'grant_type': hirumiConst.AUTOPOST_OAUTH_GRANT_TYPE,
        'scope': hirumiConst.AUTOPOST_OAUTH_SCOPE,
    };

    const authResult = await request
        .post(uri)
        .set('Content-type', 'application/x-www-form-urlencoded')
        .send(options);
    if (!authResult.hasOwnProperty('body')
        || !authResult.body.hasOwnProperty('access_token')) {
        return false;
    }
    return authResult.body.access_token;
};

/**
 * 自動投稿キーワード検索処理
 * 
 * @param conversationId {string} 会話ID
 * @param text {string} 投稿本文
 * @returns {Promise<Array>}
 */
exports.searchAutoPostWord = async (conversationId, text) => {

    let messages = [];

    // 自動投稿削除系
    let wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.AUTOPOST_DIR}/${hirumiConst.WORD_LIST_FILE_AUTO_POST_RESET}`;
    let wasFound = await hirumiUtil.findWord(text, wordFilePath);
    if (wasFound) {
        let deleteFileCount = 0;
        for (idx in hirumiConst.AUTOPOST_SCHEDULE_ALL_DAYS) {
            let day = hirumiConst.AUTOPOST_SCHEDULE_ALL_DAYS[idx];
            let dir = `${hirumiConst.FILE_DIR}/${hirumiConst.AUTOPOST_DIR}/${day}`;
            let targetDirs = await hirumiUtil.getFileList(dir);
            if (targetDirs.length === 0) {
                continue;
            }
            for (idx in targetDirs) {
                let targetDir = `${targetDirs[idx]}`;
                let targetPath = `${dir}/${targetDir}/${conversationId}`;
                if (!await hirumiUtil.isExistFile(targetPath)) {
                    continue;
                }
                await hirumiUtil.deleteFile(targetPath);
                deleteFileCount++;
            }
        }
        if (deleteFileCount > 0) {
            messages.push('自動投稿設定を解除したよ！');
        } else {
            messages.push('自動投稿設定が1件も登録されていないよ！');
        }
        return messages;
    }

    // 自動投稿かどうか
    // TODO 現状は投稿内容に改行文字が入っていて、以下のような形式になっていれば自動投稿に登録することとする
    // TODO 1行目：投稿日時（e.x. 毎日hh時mm分に投稿して）
    // TODO 2行目：投稿内容（e.x. お昼の時間ですよ！）

    const splitText = hirumiUtil.replaceLineFeed(text).split(hirumiConst.LINEFEED);
    if (splitText.length !== 2) {
        console.log('自動登録登録対象外');
        return messages;
    }
    const autoPostScheduleText = splitText[0];
    const autoPostContentText = splitText[1];

    // 投稿間隔
    let wordFileList = [
        hirumiConst.WORD_LIST_FILE_AUTO_POST_EVERYDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_WEEKDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_SUNDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_MONDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_TUESDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_WEDNESDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_THURSDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_FRIDAY,
        hirumiConst.WORD_LIST_FILE_AUTO_POST_SATURDAY,
    ];

    let autoPostDay = '';

    // キーワード検索
    for (idx in wordFileList) {
        let fileName = wordFileList[idx];
        let wordFilePath = `${hirumiConst.WORD_LIST_DIR}/${hirumiConst.AUTOPOST_DIR}/${fileName}`;
        if (await hirumiUtil.findWord(autoPostScheduleText, wordFilePath)) {
            autoPostDay = fileName;
            break;
        }
    }

    // 投稿日時
    let hourMinute = autoPostScheduleText.match(/[0-9]+時|[0-9]+時[0-9]+分|[0-9]+:[0-9]+/g);
    if (hourMinute === null) {
        console.log('時分が指定されていない');
        messages.push('正しい時間を指定してください！');
        return messages;
    }
    // 日時の形式チェック
    let hourMinuteArr = hourMinute[0].split(/:|時|分/g);
    if (hourMinuteArr.length !== 2
        || (Number(hourMinuteArr[0]) < 0 || Number(hourMinuteArr[0]) > 23)
        || (Number(hourMinuteArr[1]) < 0 || Number(hourMinuteArr[1]) > 59)) {
        return messages;
    }
    // 「時」だけ指定の場合は「00分」を設定
    if (hourMinuteArr[1] === '') {
        hourMinuteArr[1] = 0;
    }
    let hour = ('0' + (hourMinuteArr[0])).slice(-2);
    let minute = ('0' + (hourMinuteArr[1])).slice(-2);
    let hourMinuteNum = '' + hour + minute;

    // 曜日が指定されていなかった場合は、投稿時間によって今日or明日を設定
    if (autoPostDay === '') {
        let changeValue = null;
        let currentTime = hirumiUtil.getCurrentTime();
        if (Number(currentTime) > Number(hourMinuteNum)) {
            changeValue = 1;
        }
        autoPostDay = hirumiUtil.getDayOfTheWeek(changeValue);
    }

    // 投稿内容をファイルに書き込む
    fileDir = `${hirumiConst.FILE_DIR}/${hirumiConst.AUTOPOST_DIR}/${autoPostDay}/${hourMinuteNum}`;
    if (!await hirumiUtil.isExistDir(fileDir)) {
        await hirumiUtil.createDir(fileDir);
    }
    filePath = `${fileDir}/${conversationId}`;
    if (!await hirumiUtil.isExistFile(filePath)) {
        await hirumiUtil.createFile(filePath, '');
    }
    result = await hirumiUtil.writeNameToFile(autoPostContentText, filePath);
    if (result === hirumiConst.RESULT_CODE_SUCCESS) {
        messages.push(`【${hirumiUtil.getDayJaNameByEn(autoPostDay)} ${Number(hour)}:${minute}】に自動的に投稿するように設定したよ！`);
    } else if (hirumiConst.RESULT_CODE_UNNECESSARY) {
        messages.push('すでに登録済みだよ！');
    }
    return messages;
};  