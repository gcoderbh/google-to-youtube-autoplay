const path = require('path');
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { scrollPageToBottom } = require('puppeteer-autoscroll-down')

const app = puppeteerExtra.addExtra(puppeteer);

app.use(StealthPlugin());

const Queue = require('bee-queue');
const GetHeader = require("./class_header");
const GetProxy = require("./class_proxy");

const getProxy = new GetProxy();

const random = (items = []) => items[Math.floor(Math.random() * items.length)];

const sleep = (time = 1000) => new Promise((resolve) => setTimeout(resolve, time));

class RateUp {

    taskList = []

    async automate(proxy, header, data, resolution) {
        const browser = await app.launch({
            args: [
                //   `--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`,
                '--no-sandbox',
                '--disable-notifications', 
                '--disable-features=site-per-process',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-2d-canvas-clip-aa',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                // '--incognito',
                // "--window-size=1920,1080", "--window-position=1921,0"
            ],
            headless: false,
            ignoreDefaultArgs: [
                '--enable-automation',
                '--disable-extensions',
                'useAutomationExtension'
            ],
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            defaultViewport: null,
            stealth: true,
        })
        // const context = await browser.createIncognitoBrowserContext();
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders(header);
        await page.setViewport({ width: Number(resolution.split('x')[0]), height: Number(resolution.split('x')[1]) })
        
        
        await page.goto('https://bot.sannysoft.com/', { waitUntil: "domcontentloaded" });
        const screenshotPath = path.join(__dirname, 'tmp', Date.now() + ".jpg")
        await page.screenshot({ path: screenshotPath })
        
        await page.goto("https://www.google.com/", { waitUntil: "domcontentloaded" });
        await page.waitForSelector('input[name="q"]', { visible: true });

        // search keyword in google
        await page.type('input[name="q"]', data.keyword);
        await Promise.all([
            page.waitForNavigation(),
            page.keyboard.press("Enter"),
        ]);

        const seeAll = await page.$x("//a[contains(text(), 'วิดีโอ')]");
        if (seeAll.length > 0) {
            await seeAll[0].click();
        } else {
            throw new Error("Link not found");
        }

        let inFocus = false;
        let youtubeLink = null;

        while (!inFocus) {
            await page.waitForSelector(".LC20lb", { visible: true });

            await scrollPageToBottom(page, {
                size: 500,
                delay: 250
            })

            const listVideo = await page.$$eval(".LC20lb", els =>
                els.map(e => ({ element: e, title: e.innerText, link: e.parentNode.href }))
            );

            const allYoutubeLink = listVideo.filter(x => x.link.includes('youtube'));

            const youtubeCodeList = allYoutubeLink.map(x => x.link.split('v=')[1]);

            inFocus = youtubeCodeList.indexOf(data.youtube) != -1;
            
            if (inFocus) {
                const {link} = allYoutubeLink[youtubeCodeList.indexOf(data.youtube)];
                youtubeLink = link;
            } else {
                const next = await page.$x("//*[contains(local-name(), 'span') and contains(text(), 'ถัดไป')]")
                if (next.length > 0) {
                    await next[0].click();
                } else {
                    throw new Error("Link not found");
                }
            }
        }

        await page.click(`a[href$="${youtubeLink}"]`);
        await page.waitForXPath("//span[@class='ytp-time-duration']", {visible: true});
        const duration = await page.evaluate(() => {
            const duration = document.getElementsByClassName('ytp-time-duration')[0].innerHTML;
            return duration;
        })
        const waitDuration = Number(duration.split(':')[0]) * 60 * 1000;
        await sleep(waitDuration);
        await browser.close()
        return await Promise.resolve(true);
    }

    prepare(proxyListForSite = [], headerList = [], data) {
        const addQueue = new Queue('main-task');
        proxyListForSite.forEach(proxy => {
            const resolution = random(GetHeader.screen_resolution);
            const header = random(headerList);
            const task = addQueue.createJob(this.automate(proxy, header, data, resolution))
            this.taskList.push(task);
        })

        addQueue.saveAll(this.taskList)
            .then((error) => {
                if (error) {
                    return console.log('error', error)
                }

                console.log('success')
            })
        addQueue.process(async (job) => {
            // console.log(`Processing job`, job);
            return true;
        });
    }

    start = (proxyListForSite = [], headerList = [], urlList = []) => this.prepare(proxyListForSite, headerList, urlList);
}

module.exports = RateUp;