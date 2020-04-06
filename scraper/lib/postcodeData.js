import rp from 'request-promise'
import cheerio from 'cheerio'

import { getCensusData } from './censusData'

const constituencyBaseUrl = 'https://www.doogal.co.uk/'

export const generatePostcodeArrays = async (constituenciesLinks) => {
    let postcodesDataLinks = []

    try {
        /**
         * Access HTML for each constituency
         */
        for (const link of constituenciesLinks) {
            /**
             * ----------
             * LOAD HTML
             * ----------
             */
            const html = await rp(`${constituencyBaseUrl + link}`)
            const $ = cheerio.load(html)
    
            // Get a link for every postcode in the constituencies data
            // return object that comprises constituency name and array of links
            let postcodeLinks = []
            $('table.postcodeTable a').each((i, postcodeLink) => {
                postcodeLinks.push(postcodeLink.attribs.href)
            })
    
            const postcodeDataObject = {
                constituency: $('div.realContent > h1').text().split('postcodes')[0].trim(),
                postcodeLinks
            }
            postcodesDataLinks.push(postcodeDataObject)
        }
    
        return postcodesDataLinks.length > 0 ? postcodesDataLinks : console.error('sorry, no postcode links found...')
    }
    catch (err) {
        console.error({
            message: `could not process constituency links`,
            err
        })
    }
}

export const populatePostcodeData = async (postcodeObject) => {
    try {
        const { constituency, postcodeLinks } = postcodeObject
    
        process.stdout.write(`\nprocessing: ${postcodeLinks.length} links\n`)
        const postcodes = []
        // setup count variable for logging
        await getCensusData()
        let i = 0
        for (const link of postcodeLinks.slice(0, 3)) {
            process.stdout.write(i.toString())
            /**
             * ----------
             * LOAD HTML
             * ----------
             * set initial variables that are inherited from passed object
             */
            const html = await rp(`${constituencyBaseUrl + link}`)
            const $ = cheerio.load(html)
            // setup postcode object with constituency name
            let postcode = {
                constituency,
                postcode: link.split('?postcode=').pop().split("%20").join(" ").trim()
            }
            /**
             * ----------
             * SCRAPE POSTCODE PAGE
             * ----------
             */
            // get postcode co-ordinates
            const latitude = $('th:contains("Latitude")').next().text().trim()
            const longitude = $('th:contains("Longitude")').next().text().trim()
            postcode.coords = { lat: latitude, lon: longitude }
            // get postcode altitude
            postcode.altitude = $('td#elevation').text().trim()
            // get county
            const countyContext = $('th:contains("County")').next()
            const county = $('a', countyContext).text().trim()
            if (county.length > 0) postcode.county = county
            // get region
            const region = $('th:contains("Region")').next().text().trim()
            if (region.length > 0) postcode.region = region
            // get country
            postcode.country = $('th:contains("Country")').next().text().trim()
    
            postcodes.push(postcode)

            /**
             * ----------
             * LOG PROGRESS
             * ----------
             */
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            i++
        }
        return postcodes.length > 0 ? postcodes : console.error('sorry, no postcodes data found...')
    }
    catch (err) {
        console.error({
            message: `crawling postcodes pages failed...`,
            err
        })
    }
}