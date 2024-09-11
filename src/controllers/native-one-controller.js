const puppeteer = require('puppeteer');
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const nativeOneInit = async (req, res, next) => {
    try {
        const { url } = req.body;
        const browser = await puppeteer.launch({
            args: [
                "--ignore-certificate-errors",
                "--window-size=1200,1000",
                "--enable-features=NetworkService",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--incognito",
            ],
            ignoreHTTPSErrors: true,
            headless: false,
            slowMo: 150,
        });

        const incognito = await browser.createBrowserContext();

        const scrapePage = async (url) => {
            const page = await incognito.newPage();
            let attempts = 0;
            let captchaDetected = false;

            while (attempts < 3) {
                await page.goto(url, { waitUntil: 'domcontentloaded' });
                await delay(3000);

                captchaDetected = await page.$('body > div > div.a-row.a-spacing-double-large > div.a-box.a-alert.a-alert-info.a-spacing-base > div > h4');

                if (!captchaDetected) {
                    const htmlDom = await page.evaluate(() => document.documentElement.outerHTML);
                    await page.close();
                    return { url, success: true, htmlDom };
                }

                console.log(`CAPTCHA detected, attempt ${attempts + 1}`);

                if (attempts < 2) {
                    await delay(2000);
                }

                attempts++;
            }

            await page.close();
            return { url, success: false, captcha: true };
        };


        const scrapeInit = await scrapePage(url);
        await delay(2000);


        await incognito.close();
        await browser.close();

        res.status(200).json({ scrapeInit });
    } catch (error) {
        next(error);
    }
};

module.exports = nativeOneInit;