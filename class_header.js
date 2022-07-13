const {
    ACCEPT,
    ACCEPT_ENCODING,
    CACHE_CONTROL,
    REFERRER,
    USER_AGENT,
    SCREEN_RES,
} = require('./lib/header_const');

const random = (items = []) => items[Math.floor(Math.random()*items.length)];

class GetHeader {
    static referrer = REFERRER

    static screen_resolution = SCREEN_RES

    generate_header_list = (num = 1) => {
        const headers = [];
        
        for (let i = 0; i < num; i++) {
            headers.push({
                // 'accept': random(ACCEPT),
                // 'accept-encoding': random(ACCEPT_ENCODING),
                // 'cache-control': random(CACHE_CONTROL),
                // 'connection': 'keep-alive',
                // 'referer': `https://${random(GetHeader.referrer)}/`,
                // 'upgrade-insecure-requests': '1',
                'user-agent': random(USER_AGENT),
            });
        }

        return headers;
    }

    show_header_data = (key) => console.log({
        'user_agent': USER_AGENT,
        'accept': ACCEPT,
        'accept_encoding': ACCEPT_ENCODING,
        'cache_control': CACHE_CONTROL,
        'referrer': GetHeader.referrer
    }[key])
}

module.exports = GetHeader;