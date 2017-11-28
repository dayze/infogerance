const argv = require('yargs').argv
const Promise = require('bluebird')
const cmd = require('node-cmd')
const user = argv.user
const utils = require('./utils')

const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

/*if (user === '') {
  utils.handleError('Error: You need to specify an user. ex: --user=toto')
}
// check if an user is not already present in the system
getAsync(`id -u ${user}`)
  .then(() => {
    utils.handleError("Error: User already exist !")
  })
  .catch((err) => {
    // passed here if there is no user
  })
  .then(() => {
    getAsync(`useradd ${user}`)
  })*/

const main = async () => {
  let isUserAlreadyInUnix = await getAsync('id -u ${user}')
  console.log(isUserAlreadyInUnix)
}

main()