import cheerio from 'cheerio'
import rp from 'request-promise'

const mpDataRef = 'https://www.theyworkforyou.com/mps/'
const mpDataBaseUrl = 'https://www.theyworkforyou.com'

export const getMPPageLinks = async () => {
    process.stdout.write('\nfetching html for MPs...\n')

    try {
        const html = await rp(mpDataRef)
        process.stdout.write('finding MP page links...\n')
    
        const $ = cheerio.load(html)
    
        let links = []
        $('a.people-list__person').each((i, link) => {
            links.push(link.attribs.href)
        })
        // if some links are found, return links, otherwise throw error
        return links.length > 0 ? links : console.error({ message: 'sorry, no links found' })
    }
    catch (err) {
        console.error({
            message: `crawling ${mpData} failied`,
            err
        })
    }
}

export const populateMPData = async (mpsLinks) => {
    try {
        let mps = []
        for (const link of mpsLinks) {
            let mp = {}
            let html = await rp(`${mpDataBaseUrl + link}`)
            const $ = cheerio.load(html)

            // get MP name
            const fullName = $('h1.person-header__about__name').text().split(' ')
            mp.firstname = fullName[0]
            mp.surname = fullName[1]

            // get MP political info
            mp.party = $('span.person-header__about__position__role').text().trim().split(' ')[0]
            mp.constituency = $('span.person-header__about__position__constituency').text().trim()
            let position = $('p.person-header__about__known-for').text().trim()
            if (position.length !== 0) mp.position = position
            // get social media links
            let links = []
            $('p.person-header__about__media > a').each((i, link) => {
                links.push({
                    type: link.attribs.href.match(/twitter/g) ? 'twitter' : 'facebook',
                    link: link.attribs.href
                })
            })
            mp.links = links

            mps.push(mp)
        }
        return mps
    }
    catch (err) {
        console.error({
            message: 'failed to fetch MP data',
            err
        })
    }
}