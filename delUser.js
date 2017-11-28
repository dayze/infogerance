const argv = require('yargs').argv
const Promise = require('bluebird')
const cmd = require('node-cmd')
const user = argv.user
const utils = require('./utils')

const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

if (user === '') {
  utils.handleError('Error: You need to specify an user. ex: --user=toto')
}

const main = async () => {
  try {
    await getAsync(`id -u ${user}`)
  } catch (err) {
    utils.handleError('Error: ${user} does not exist!')
  }
  try {
    let isMysqlUserExist = await getAsync(`mysql -u root -se "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '${user}');"`)
    if (isMysqlUserExist[0].trim() === '0') {
      console.log(`No user account ${user} \n Continue...`)
    }
  } catch (err) {
    utils.handleError(err)
  }
  try {
    // DEL SYSTEM
    await getAsync(`userdel ${user}`)
    console.log(`delete of ${user}`)
    // DEL MYSQL
    let isMysqlUserExist = await getAsync(`mysql -u root -se "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '${user}');"`)
    if (isMysqlUserExist[0].trim() === '0') {
      console.log(`No user account ${user} \n Continue...`)
    }
    else {
      await getAsync(`DROP USER '${user}'@'localhost';`)
    }
  } catch (err) {
    console.log(err)
  }

}

main()