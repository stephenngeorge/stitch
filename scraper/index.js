import { getConstituencyPageLinks, populateConstituencyData } from './lib/constituencyData'
import  { getMPPageLinks, populateMPData } from './lib/mpData'
import { generatePostcodeArrays, populatePostcodeData } from './lib/postcodeData'

const main = async () => {
    const state = {
        constituenciesLength: null,
        constituenciesLinks: null,
        mpsLength: null,
        mpsLinks: null
    }

    const data = {
        constituencies: null,
        mps: null,
        postcodes: null
    }
    
    const constituenciesLinks = await getConstituencyPageLinks()
    process.stdout.write(`found data for: ${constituenciesLinks.length} constituencies\n`)
    state.constituenciesLength = constituenciesLinks.length
    state.constituenciesLinks = constituenciesLinks

    const mpsLinks = await getMPPageLinks()
    process.stdout.write(`found data for: ${mpsLinks.length} MPs\n`)
    state.mpsLength = mpsLinks.length
    state.mpsLinks = mpsLinks

    if (state.constituenciesLength !== state.mpsLength) console.warn('\ndata sets are of different lengths, there might be some data missing...\n')

    data.constituencies = await populateConstituencyData(state.constituenciesLinks.slice(0, 3))
    data.mps = await populateMPData(state.mpsLinks.slice(0, 3))

    const postcodeArrays = await generatePostcodeArrays(state.constituenciesLinks.slice(0, 3))
    const postcodes = []
    // for (const item of postcodeArrays) {
    //     const data = await populatePostcodeData(item)
    //     postcodes.push(data)
    // }
    postcodes.push(await populatePostcodeData(postcodeArrays[0]))
    data.postcodes = postcodes

    console.log("END", "CONSTITUENCY:", data.constituencies[0], "MPS:", data.mps[0], "POSTCODES:", data.postcodes[0])
}

main()