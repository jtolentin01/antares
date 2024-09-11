const puppeteer = require('puppeteer');
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
const randomDelay = (min, max) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
};
const nativeInit = async (req, res, next) => {
    try {
        const { urls } = req.body;

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: 'URLs are required and should be an array' });
        }

        const chunkArray = (array, size) => {
            const chunks = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        };

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
        const chunks = chunkArray(urls, 7);
        let results = [];

        const scrapePage = async (url) => {
            await randomDelay(500,3000);
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

        for (const chunk of chunks) {
            const chunkResults = await Promise.all(chunk.map(url => scrapePage(url)));
            results = results.concat(chunkResults);
            await delay(2000); 
        }

        await incognito.close();
        await browser.close();

        res.status(200).json({ results });
    } catch (error) {
        next(error);
    }
};

module.exports = nativeInit;



// const incognito = await browser.createBrowserContext();
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
