const argv = require('yargs').argv
const Promise = require('bluebird')
const cmd = require('node-cmd')
const user = argv.user
const utils = require('./utils')

const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

if (user === '') {
  utils.handleError('Error: You need to specify an user. ex: --user=toto')
}
// check if an user is not already present in the system
getAsync(`grep -c '^${user}:' /etc/passwd`)
  .then((data) => {
  if (data[0].trim() === '0') {
    console.log('good, no user are present with this username')
  }
})
  .then(() => {
  console.log("ok")
  })
  .catch((err) => {
    console.log(err)
  })



