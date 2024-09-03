const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { readFileSync } = require('fs');
const csv = require('csv-parser');

const chunkArray = (arr, size) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
        chunked.push(arr.slice(i, i + size));
    }
    return chunked;
};

const readAlpha2Codes = () => {
    return new Promise((resolve, reject) => {
        const codes = [];
        fs.createReadStream('countries.csv')
            .pipe(csv())
            .on('data', (row) => codes.push(row['ISO Code']))
            .on('end', () => resolve(codes))
            .on('error', (err) => reject(err));
    });
};


const openBrowser = async (isIncognito = true) => {
    const browser = await puppeteer.launch({
        args: [
            "--ignore-certificate-errors",
            "--window-size=1200,1000",
            "--enable-features=NetworkService",
            "--disable-setuid-sandbox",
            "--no-sandbox",
        ],
        ignoreHTTPSErrors: true,
        headless: false,
        slowMo: 20,
    });

    if (isIncognito) {
        const incognito = await browser.createIncognitoBrowserContext();
        return { browser, page: await incognito.newPage() };
    } else {
        const page = await browser.newPage();
        return { browser, page };
    }
};

const getPageDetails = (htmlBody) => {
    const $ = cheerio.load(htmlBody);
    const validate = (text) => (text ? text.trim() : '');

    const brand = validate($('span#cr-arp-byline > a').text()) || '-'
    const title = validate($('div.a-row.product-title > h1 > a').text()) || '-'
    const starRating = validate($('span[data-hook="rating-out-of-text"]').text()) || '-'
    const fiveStarPercent = validate(
        $('table#histogramTable > tbody > tr:nth-child(1) > td:nth-child(3)').text() || '-'
    );
    const customerRating = validate($('div[data-hook="total-review-count"]').text()) || '-'

    const reviews = {};
    $('span[data-hook="review-body"]').each((index, element) => {
        reviews[`review${index + 1}`] = validate($(element).text()) || '-';
    });

    return {
        brand,
        title,
        starRating,
        fiveStarPercent,
        customerRating,
        reviews,
    };
};

const modifyProductIDInURL = (url, newProductID) => {
    return url.replace(/\/product-reviews\/[A-Z0-9]+/, `/product-reviews/${newProductID}`);
};

const asinList = [
    "B07P5W4WFW",
    "B07P5W515B",
    "B07P7YCPXM",
    "B07P939HQJ",
    "B07P939ZZ9",
    "B07P93D6JS"
];


const main = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080'
        ],
        defaultViewport: {
            width: 1920,
            height: 1080
        },
    });

    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    const url = `https://webproxy.lumiproxy.com/request?area=US&u=https://www.hhworkwear.com/`;

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); 

        // await page.waitForSelector('#onetrust-accept-btn-handler', { visible: true, timeout: 30000 }); 
        // await page.click('#onetrust-accept-btn-handler');

        await page.waitForSelector('input[name="search_query"]', { visible: true, timeout: 30000 }); 

        await page.type('input[name="search_query"]', '79322', { delay: 100 }); 

        await page.click('.searchField-searchTrigger-eEcaS');

        await page.waitForSelector('.gridRow-module-wrapper-dIF9S', { visible: true, timeout: 30000 });

        await page.waitForFunction(() => {
            const suggestionsWrapper = document.querySelector('.productCard-module-linkContainer-dsZ8K productCard-module-titleLink-v9ktt');
            return suggestionsWrapper && suggestionsWrapper.querySelector('a') !== null;
        }, { timeout: 30000 });

        const hasAnchor = await page.evaluate(() => {
            const suggestionsWrapper = document.querySelector('.suggestions-suggestionsWrapper-DxCKe');
            return !!suggestionsWrapper.querySelector('a'); 
        });

        if (hasAnchor) {
            console.log('There are anchor tags inside the suggestions div.');
        } else {
            console.log('No anchor tags found inside the suggestions div.');
        }

        await page.mouse.move(100, 100);
        await page.mouse.move(200, 200);

        await new Promise(resolve => setTimeout(resolve, 999999999));
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
};



const apiTest = async (maxRetries = 3) => {
    return new Promise(async (resolve, reject) => {
        const url = "https://www.amazon.com/product-reviews/B07DR59JLP/";
        const area = "TH";
        const baseUrl = `https://webproxy.lumiproxy.com/request?area=${area}&u=${url}`
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // redirect: 'manual'
        };

        const fetchData = async (retryCount) => {
            try {
                const response = await fetch(baseUrl, options);

                if (!response.ok) {
                    throw new Error(`amzExecute ${url} - HTTP error! status: ${response.status}`);
                }
                const htmlData = await response.text();
                console.log(htmlData);
                resolve(htmlData);
            } catch (error) {
                if (retryCount > 0) {
                    console.log(`amzExecute ${url} - Retrying... Attempts left: ${retryCount}`);
                    fetchData(retryCount - 1);
                } else {
                    reject(error);
                }
            }
        };

        fetchData(maxRetries);
    });
}

const getCookie = async (page, url) => {

    let arrCookies = [];
    await page.setRequestInterception(true);
    await page.setDefaultNavigationTimeout(0);

    page.on('request', request => {
        const cookies = request.headers()['cookie'];

        if (cookies) {
            arrCookies.push(cookies);
        };

        request.continue();
    });

    await page.goto(url);
    return arrCookies[0];
};

main().catch(console.error);

