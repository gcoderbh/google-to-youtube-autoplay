const GetProxy = require('./class_proxy');
const RateUp = require('./rate_up');
const GetHeader = require('./class_header');


(async () => {
  const proxy = new GetProxy();
  const header = new GetHeader();
  const proxyList = await proxy.get_proxy('th', 'https');
  const headerList = header.generate_header_list(20);
  const rateUp = new RateUp();
  rateUp.start(proxyList, headerList, {
    keyword: 'ปลูกผักชี',
    youtube: 'SZZx9NVF998'
  })
})()