import chromium from 'chrome-aws-lambda'
import cheerio from 'cheerio'

// const SITE_URL =
//   'https://www.trafikverket.se/trafikinformation/tag/?Station=Stockholm%20C&ArrDep=departure'
const SITE_URL =
  'https://www.trafikverket.se/trafikinformation/tag?Station=Nykvarn&ArrDep=departure'

export async function handler(event) {
  await run()

  const response = {
    statusCode: 200,
    body: '',
  }

  return response
}

export async function run() {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  })
  const page = await browser.newPage()

  // TODO: This works but isn't supposed to be here
  await page.goto('https://lumtest.com/myip.json')
  const body = await page.$eval('body', (element) => element.textContent)
  console.log('body', body)
  browser.close()
  return

  await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 })

  const html = await page.content()
  const $ = cheerio.load(html)
  const $trs = $('tr td .time-strikethrough').parent().parent()

  const results: any = []
  for (const tr of $trs) {
    results.push({
      time: $(tr).find('.time-strikethrough').text(),
      estimatedTime: $(tr).find('.format-estimated-time').text(),
      cancelled: $(tr).find('.cancelled').length > 0,
      stationName: $(tr).find('.station-name').text(),
      trainNr: $(tr).find('.train').text(),
    })
  }

  console.log(results)

  browser.close()
}
