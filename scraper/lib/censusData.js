import fs from 'fs'
import path from 'path'
import csv from 'csvtojson'

const householdsUrl = "https://www.nomisweb.co.uk"
const fileA_F = householdsUrl + "/output/census/2011/Postcode_Estimates_Table_1_A_F.csv"
const fileG_L = householdsUrl + "/output/census/2011/Postcode_Estimates_Table_1_G_L.csv"
const fileM_R = householdsUrl + "/output/census/2011/Postcode_Estimates_Table_1_M_R.csv"
const fileS_Z = householdsUrl + "/output/census/2011/Postcode_Estimates_Table_1_S_Z.csv"

const files = [fileA_F, fileG_L, fileM_R, fileS_Z]

import { fileDownload } from './utils'

export const getCensusData = async() => {
    const householdsDir = path.join(__dirname, 'householdsData')
    await fs.mkdir(householdsDir, err => {
        if (!!err) console.error(err)
        else return process.stdout.write(`created dir: ${householdsDir}\n`)
    })
    let i = 1
    for (const file of files) {
        await fileDownload(householdsDir, `${i}`, 'csv', file)
        i++
    }
}