const argv = require('yargs').argv
const cmd = require('node-cmd')
const user = argv.user
const utils = require('./utils')

if (user === '') {
  utils.handleError('Error: You need to specify an user. ex: --user=toto')
}
// check if an user is not already present in the system
cmd.get(`grep -c '^${user}:' /etc/passwd`, (err, data, stderr) => {
  if(data.trim() === '0') {
    console.log('good, no user are present with this username')
  }
})


