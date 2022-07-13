const { default: axios } = require("axios")
const { generate } = require("./lib/proxy_generator")
const fs = require('fs')

class GetProxy {
    validation_proxy = async (proxy, header) => {
        const response = await axios.get('http://ipwhois.app/json/', {
            headers: header,
            proxy: proxy,
        })

        return {
            status: response.data.success,
            country: response.data.country,
        }
    }

    get_proxy = async (country, proxytype) => {
        const proxyFile = await generate(country, proxytype)
        const proxyList = JSON.parse(fs.readFileSync(proxyFile));
        return proxyList.map(proxy => {
            return {
                protocol: proxytype,
                host: proxy.split(':')[0],
                port: proxy.split(':')[1],
            }
        });
    }
}

module.exports = GetProxy;