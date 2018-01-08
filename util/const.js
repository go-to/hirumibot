/* 定数定義 */
// 環境まわり
exports.LINEFEED = "\n";
exports.LINEFEED_WIN = "\r\n";
exports.LINEFEED_MAC = "\r";
exports.LINEFEED_DISPLAY = "<br />";
exports.CHARSET = 'utf8';

// パス関連
exports.FILE_DIR = './files/';
exports.WORD_LIST_DIR = './util/word_list/';

// ボットに反応させる言葉
exports.WORD_LIST_FILE_PARTICIPATE = 'participate';
exports.WORD_LIST_FILE_NON_PARTICIPATE = 'non_participate';
exports.WORD_LIST_FILE_LETS_GO = 'lets_go';
exports.WORD_LIST_FILE_STATUS = 'status';
exports.WORD_LIST_FILE_RESET = 'reset';
exports.WORD_LIST_FILE_UNKNOWN = 'unknown';
exports.WORD_LIST_FILE_HELP = 'help';

// コード
exports.ERROR_CODE_NO_SUCH_FILE_OR_DIRECTORY = 'ENOENT';
exports.RESULT_CODE_ERROR = 0;
exports.RESULT_CODE_SUCCESS = 1;
exports.RESULT_CODE_UNNECESSARY = 2;

// グループ分けの人数
exports.MAX_MEMBER_NUM = 4;
exports.MIN_MEMBER_NUM = 3;

// メンション
exports.HIRUMI_MENTION = '@hirumibot';