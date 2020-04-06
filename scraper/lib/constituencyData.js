import cheerio from 'cheerio'
import rp from 'request-promise'

const constituencyDataRef = 'https://www.doogal.co.uk/ElectoralConstituencies.php'
const constituencyBaseUrl = 'https://www.doogal.co.uk/'

// FUNCTION gets all hrefs to individual constituency pages
export const getConstituencyPageLinks = async () => {
    process.stdout.write('\nfetching html for constituencies data...\n')

    try {
        /**
         * ----------
         * LOAD HTML
         * ----------
         */
        const html = await rp(constituencyDataRef)
        process.stdout.write('finding constituency page links...\n')
        const $ = cheerio.load(html)

        /**
         * ----------
         * GET LINKS
         * ----------
         * traverse DOM to find the link for every constituency page
         */
        let links = []
        $('.electoralConstituenciesTable a').each((i, link) => {
            links.push(link.attribs.href)
        })
        // if some links are found, return array, otherwise throw error
        return links.length > 0 ? links : console.error({ message: 'sorry, no links found' })
    }
    catch (err) {
        console.error({
            message: `crawling ${constituencyDataRef} failed`,
            err
        })
    }
}

export const populateConstituencyData = async (constituenciesLinks) => {
    try {
        let constituencies = []
        for (const link of constituenciesLinks) {
            let constituency = {}
            let html = await rp(`${constituencyBaseUrl + link}`)
            const $ = cheerio.load(html)
    
            // get constituency name
            const name = $('div.realContent > h1').text().split('postcodes')[0].trim()
            constituency.name = name
    
            constituencies.push(constituency)
        }
        
        return constituencies
    }
    catch (err) {
        console.error({
            message: 'failed to fetch constituency data',
            err
        })
    }
}