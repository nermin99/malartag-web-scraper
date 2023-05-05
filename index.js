const cheerio = require('cheerio')
const puppeteer = require('puppeteer-core')
const chromium = require('chrome-aws-lambda')

// const SITE_URL =
//   'https://www.trafikverket.se/trafikinformation/tag/?Station=Stockholm%20C&ArrDep=departure'
const SITE_URL =
  'https://www.trafikverket.se/trafikinformation/tag?Station=Nykvarn&ArrDep=departure'

exports.handler = async (event) => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  })
  const page = await browser.newPage()

  await page.goto(SITE_URL, { waitUntil: 'networkidle2' })

  await page.setViewport({ width: 1080, height: 1024 })

  const html = await page.content()
  const $ = cheerio.load(html)
  const $trs = $('tr td .time-strikethrough').parent().parent()

  const results = []
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

// handler() // TODO: REMOVE ME IN AWS
