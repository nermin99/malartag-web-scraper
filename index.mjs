const STATION = 'Cst' // Nkv | Cst

const locations = {
  Arb: 'Arboga',
  U: 'Uppsala C',
  Et: 'Eskilstuna C',
  Cst: 'Stockholm C',
}

const getTimezoneOffset = (date) => date.getTimezoneOffset() / -60

// yyyy-MM-ddTHH:mm:ss+0X:00
const formatDate = (date) =>
  date.toISOString().split('Z')[0] + `+0${getTimezoneOffset(date)}:00`

const offsetDate = (date, minutes) => new Date(date.getTime() + 60000 * minutes)

let now = new Date()
now = new Date(offsetDate(now, getTimezoneOffset(now) * 60))

const dateEstimated = formatDate(offsetDate(now, -5))
const dateAdvertisedGT = formatDate(offsetDate(now, -30))
const dateAdvertisedLT = formatDate(offsetDate(now, 120))

// const URL = 'https://lumtest.com/myip.json'
const URL = 'https://api.trafikinfo.trafikverket.se/v2/data.json'
const options = {
  method: 'POST',
  'content-type': 'text/plain',
}
options.body = `
<REQUEST>
    <LOGIN authenticationkey="707695ca4c704c93a80ebf62cf9af7b5" />
    <QUERY lastmodified="true" orderby="AdvertisedTimeAtLocation,EstimatedTimeAtLocation" objecttype="TrainAnnouncement" schemaversion="1.6" includedeletedobjects="false" sseurl="true">
        <FILTER>
            <AND>
                <EQ name="LocationSignature" value="${STATION}" />
                <EQ name="Advertised" value="true" />
                <EQ name="ActivityType" value="Avgang" />
                <OR>
                    <AND>
                        <GT name="AdvertisedTimeAtLocation" value="${dateAdvertisedGT}" />
                        <LT name="AdvertisedTimeAtLocation" value="${dateAdvertisedLT}" />
                    </AND>
                    <GT name="EstimatedTimeAtLocation" value="${dateEstimated}" />
                </OR>
            </AND>
        </FILTER>
    </QUERY>
</REQUEST>
`
// console.log(options.body)

const reDate = /\d{4}-\d{2}-\d{2}/
const reTime = /\d{2}:\d{2}/

export const handler = async (event) => {
  const response = await fetch(URL, options)
  const responseBody = await response.text().then((text) => JSON.parse(text))

  const trains = responseBody?.RESPONSE?.RESULT[0]?.TrainAnnouncement
  // console.dir(trains[0], { depth: null })

  const results = []
  for (const train of trains) {
    const { AdvertisedTrainIdent, AdvertisedTimeAtLocation, TimeAtLocation } = train

    const obj = {
      date: AdvertisedTimeAtLocation.match(reDate)[0],
      time: AdvertisedTimeAtLocation.match(reTime)[0],
      location: locations[train.ToLocation[0].LocationName],
      AdvertisedTrainIdent,
      // FromLocation: train.FromLocation[0].LocationName,
      ToLocation: train.ToLocation[0].LocationName,
      cancelled: false,
      AdvertisedTimeAtLocation,
    }

    // Check if train is cancelled
    if (train?.Deviation?.[0]?.Description === 'Inställt') {
      obj.cancelled = true
      results.push(obj)
      continue
    }

    // Check if train is delayed
    if (TimeAtLocation) {
      obj.TimeAtLocation = TimeAtLocation
      const delta = Math.floor(
        (new Date(TimeAtLocation).getTime() - new Date(AdvertisedTimeAtLocation).getTime()) /
          60000
      )
      if (delta > 0) {
        obj.delay = delta
        results.push(obj)
      }
    }
  }

  return {
    statusCode: 200,
    body: results,
  }
}

console.log(await handler()) // TODO: REMOVE ME IN AWS
