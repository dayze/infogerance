const fs = require('fs')
module.exports.handleError = (err) => {
  console.log(err)
  process.exit(1)
}

module.exports.generatePassword = () => {
  return Math.random().toString(36).slice(-8)
}

module.exports.writeFile = (path, data) => {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, data, {flag: 'a'}, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}