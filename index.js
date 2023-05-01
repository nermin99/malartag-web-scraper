const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const AWS = require('aws-sdk')
require('dotenv').config()

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = 'malartag-scraper'

// const SITE_URL =
//   'https://www.trafikverket.se/trafikinformation/tag/?Station=Stockholm%20C&ArrDep=departure'

const SITE_URL =
  'https://www.trafikverket.se/trafikinformation/tag?Station=Nykvarn&ArrDep=departure'

const start = async () => {
  const defaultParams = {
    headless: 'new',
  }
  const prodParams = {
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox'],
  }
  const browser = await puppeteer.launch({
    ...defaultParams,
    ...(process.env.NODE_ENV === 'production' ? prodParams : {}),
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

start()
