import https from 'https'
import fs from 'fs'
import path from 'path'

export const fileDownload = async(dir, fileName, fileExtension, source) => {
    const file = fs.createWriteStream(path.join(dir, `${fileName}.${fileExtension}`))
    https.get(source, res => {
        let total = res.headers['content-length']
        process.stdout.write(`${fileName}: ${total / 1000000}\n`)
        res.on('data', data => {
            file.write(data)
        })
        res.on('end', () => {
            file.end()
            console.log(`***\n${fileName}: file downloaded`)
        })
    })
    .on('error', (err) => {
        fs.unlink(`${fileName}.${fileExtension}`)
        console.error(err)
    })
}

// NEED TO AWAIT SOMETHING!