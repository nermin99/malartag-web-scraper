const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

// const SITE_URL =
;('https://www.trafikverket.se/trafikinformation/tag/?Station=Stockholm%20C&ArrDep=departure')

const SITE_URL =
  'https://www.trafikverket.se/trafikinformation/tag?Station=Nykvarn&ArrDep=departure'

const start = async () => {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  await page.goto(SITE_URL, { waitUntil: 'networkidle2' })

  await page.setViewport({ width: 1080, height: 1024 })

  const html = await page.content()
  const $ = cheerio.load(html)
  // .time-strikethrough
  // .time-advertised-time .time-strikethrough
  const $trs = $('tr td .time-strikethrough').parent().parent()

  for (const tr of $trs) {
    console.log($(tr).find('.time-strikethrough').text())
    console.log($(tr).find('.format-estimated-time').text())
    console.log($(tr).find('.station-name').text())
    console.log($(tr).find('.cancelled').length > 0)
  }

  browser.close()
}

start()
