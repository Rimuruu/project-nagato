

const { spawn } = require('node:child_process')
const { Buffer } = require('node:buffer')

function execAsync(command){
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: ['pipe', 'pipe', 'inherit'] })

    child.stdin.end()
   
    const chunks = []

    child.stdout.on('error', err => reject(err))
    child.stdout.on('data', (chunk) => chunks.push(chunk))
    child.stdout.on('end', () => resolve(Buffer.concat(chunks).toString()))
    child.on('error', err => reject(err))
    child.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`"${command}" process exited with code ${code}`))
    })
  })
}

module.exports = {execAsync}