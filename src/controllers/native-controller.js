const puppeteer = require('puppeteer');
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const nativeInit = async (req, res, next) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: 'URLs are required and should be an array' });
        }

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
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            await delay(3000)
            
            if (await page.$('body > div > div.a-row.a-spacing-double-large > div.a-box.a-alert.a-alert-info.a-spacing-base > div > h4')) {
                console.log('CAPTCHA detected');
                await page.close();
                return { url, success: false, captcha: true };
            } else {
                const htmlDom = await page.evaluate(() => document.documentElement.outerHTML);
                await page.close();
                return { url, success: true, htmlDom };
            }
        };

        let results = [];

        const firstResult = await scrapePage(urls[0]);

        if (firstResult.captcha) {
            results = await Promise.all(urls.map(async (url) => {
                const result = await scrapePage(url);
                return result;
            }));
        } else {
            results.push(firstResult);
            for (let i = 1; i < urls.length; i++) {
                const result = await scrapePage(urls[i]);
                results.push(result);
            }
        }

        await incognito.close();
        await browser.close();

        res.status(200).json({ results });
    } catch (error) {
        next(error);
    }
};


module.exports = nativeInit;




// const nativeInit = async (req, res, next) => {
//     try {
//         const targetUrl = req.query.url;

//         if (!targetUrl) {
//             return res.status(400).json({ error: 'URL query parameter is required' });
//         }

//         const browser = await puppeteer.launch({
//             args: [
//                 "--ignore-certificate-errors",
//                 "--window-size=1200,1000",
//                 "--enable-features=NetworkService",
//                 "--disable-setuid-sandbox",
//                 "--no-sandbox",
//                 "--incognito",
//             ],
//             ignoreHTTPSErrors: true,
//             headless: false,
//             slowMo: 150,
//         });
    
//         const incognito = await browser.createBrowserContext();
//         const page = await incognito.newPage();
//         await delay(2000);
//         await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
//         if (await page.$('body > div > div.a-row.a-spacing-double-large > div.a-box.a-alert.a-alert-info.a-spacing-base > div > h4')){
//             await delay(1000);
//             await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
//         }
//         else{
//             const html = await page.content();
//             await incognito.close();
//             res.status(200).json({ html,sucess:true });
//         }

//     } catch (error) {
//         next(error);
//     }
// };
