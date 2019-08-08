/* 定数定義 */
// 環境によって異なる定数を読み込み
exports.env = require('./env.js');

// 改行・文字コード関連
exports.LINEFEED = "\n";
exports.LINEFEED_WIN = "\r\n";
exports.LINEFEED_MAC = "\r";
exports.LINEFEED_DISPLAY = "<br />";
exports.CHARSET = 'utf8';

// パス関連
exports.FILE_DIR = './files';
exports.WORD_LIST_DIR = './lib/word_list';
exports.PARTICIPATE_DIR = 'participate';
exports.AUTOPOST_DIR = 'autopost';

// ボットに反応させる言葉
exports.WORD_LIST_FILE_PARTICIPATE = 'participate';
exports.WORD_LIST_FILE_NON_PARTICIPATE = 'non_participate';
exports.WORD_LIST_FILE_LETS_GO = 'lets_go';
exports.WORD_LIST_FILE_STATUS = 'status';
exports.WORD_LIST_FILE_RESET = 'reset';
exports.WORD_LIST_FILE_UNKNOWN = 'unknown';
exports.WORD_LIST_FILE_HELP = 'help';
exports.WORD_LIST_FILE_GET_CONVERSATION_ID= 'get_conversation_id';

exports.WORD_LIST_FILE_AUTO_POST_EVERYDAY = 'Everyday';
exports.WORD_LIST_FILE_AUTO_POST_WEEKDAY = 'Weekday';
exports.WORD_LIST_FILE_AUTO_POST_SUNDAY = 'Sunday';
exports.WORD_LIST_FILE_AUTO_POST_MONDAY = 'Monday';
exports.WORD_LIST_FILE_AUTO_POST_TUESDAY = 'Tuesday';
exports.WORD_LIST_FILE_AUTO_POST_WEDNESDAY = 'Wednesday';
exports.WORD_LIST_FILE_AUTO_POST_THURSDAY = 'Thursday';
exports.WORD_LIST_FILE_AUTO_POST_FRIDAY = 'Friday';
exports.WORD_LIST_FILE_AUTO_POST_SATURDAY = 'Saturday';
exports.WORD_LIST_FILE_AUTO_POST_RESET = 'reset';

// コード
exports.ERROR_CODE_NO_SUCH_FILE_OR_DIRECTORY = 'ENOENT';
exports.RESULT_CODE_ERROR = 0;
exports.RESULT_CODE_SUCCESS = 1;
exports.RESULT_CODE_UNNECESSARY = 2;

// グループ分けの人数
exports.MAX_MEMBER_NUM = 4;
exports.MIN_MEMBER_NUM = 3;

// 自動実行関連
exports.AUTOPOST_CRON_TIMER = '* * * * *';
exports.AUTOPOST_OAUTH_URI = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
exports.AUTOPOST_OAUTH_GRANT_TYPE = 'client_credentials';
exports.AUTOPOST_OAUTH_SCOPE = 'https://api.botframework.com/.default';
exports.AUTOPOST_REST_API_URI = 'https://skype.botframework.com/v3/conversations';
exports.AUTOPOST_REST_API_URI_SUFFIX = 'activities';
exports.AUTOPOST_REST_API_JSON_TYPE = 'message';
exports.AUTOPOST_SETTING_FILE_BASE_DIR = 'autopost';
exports.AUTOPOST_SCHEDULE_ALL_DAYS = ['Everyday', 'Weekday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
exports.AUTOPOST_SCHEDULE_WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// タイムゾーン設定
exports.TIMEZONE = 'Asia/Tokyo';