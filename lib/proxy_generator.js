const fs = require('fs');
const { default: axios } = require("axios");
const path = require('path');

const proxyscrape = async (country, proxytype) => {
    try {
        const response = await axios.get(`https://api.proxyscrape.com/?request=displayproxies&proxytype=${proxytype}&country=${country}`);
        return response.data.split('\r\n').filter(x => x.length > 5);
    } catch (e) {
        console.log(`Site: api.proxyscrape.com\n${e}`)
        return [];
    }
}

const proxyscan = async (country, proxytype) => {
    try {
        const response = await axios.get(`https://www.proxyscan.io/api/proxy?country=${country}&limit=10&type=${proxytype}`);
        return response.data.map(x => `${x['Ip']}:${x['Port']}`);
    } catch (e) {
        console.log(`Site: www.proxyscan.io\n${e}`)
        return [];
    }
}

const pubproxy = async (country, proxytype) => {
    try {
        const response = await axios.get(`http://pubproxy.com/api/proxy?limit=5&type=${proxytype}&country=${country}`);
        return response.data.data.map(x => x['ipPort']);
    } catch (e) {
        console.log(`Site: pubproxy.com\n${e}`)
        return [];
    }
}

const freshproxies = async (country, proxytype) => {
    try {
        const response = await axios.get(`https://www.freshproxies.net/ProxyList?countries_1=${country}&protocol=${proxytype}&format=json&count=20`);
        return response.data.proxies
            .map(x => `${x['ip']}:${x['port']}`)
            .filter(x => !x.includes('0.0.0.0'));
    } catch (e) {
        console.log(`Site: www.freshproxies.net\n${e}`)
        return [];
    }
}

const proxylist = async (country, proxytype) => {
    try {
        const response = await axios.get(`https://www.proxy-list.download/api/v1/get?type=${proxytype}&country=${country}`);
        return response.data.split('\r\n').filter(x => x.length > 5);
    } catch (e) {
        console.log(`Site: www.proxy-list.download\n${e}`)
        return [];
    }
}

const generate = async (country, proxytype, limit = 1) => {
    const proxyList = await Promise.all([
        proxyscrape(country, proxytype),
        proxyscan(country, proxytype),
        pubproxy(country, proxytype),
        freshproxies(country, proxytype),
        proxylist(country, proxytype),
    ]);

    const resultList = proxyList.reduce((a,b) => a.concat(b), []).filter(x => x != '').slice(0, limit);
    const pathWrite = path.join(__dirname, '../', 'generate', 'proxy.json');
    fs.writeFileSync(pathWrite, JSON.stringify(resultList, null, 4));

    return pathWrite;
}

module.exports = {
    generate
}