const argv = require('yargs').argv
const Promise = require('bluebird')
const cmd = require('node-cmd')
const user = argv.user
const utils = require('./utils')
const VirtualHost = require('./Virtualhost')

const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

if (user === '' || user.match(/[^A-Za-z0-9 ]/)) {
  utils.handleError('Error: You need to specify an user. ex: --user=toto')
}

const main = async () => {
  // DEL SYSTEM
  try {
    await getAsync(`id -u ${user}`)
  } catch (err) {
    if (err) {console.log(`No system user ${user} \nContinue`)}
    else {
      await getAsync(`userdel ${user}`)
      console.log(`${user} unix user is delete`)
    }
  }
  try {
    let isMysqlUserExist = await getAsync(`mysql -u root -se "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '${user}');"`)
    if (isMysqlUserExist[0].trim() === '0') {
      console.log(`No user account ${user} \nContinue...`)
    }
  } catch (err) {
    utils.handleError(err)
  }
  try {
    // DEL MYSQL
    let isMysqlUserExist = await getAsync(`mysql -u root -se "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '${user}');"`)
    let isDatabasePresent = await getAsync(`mysql -u root -se "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA
                                           WHERE SCHEMA_NAME = '${user}'"`)
    if (isMysqlUserExist[0].trim() !== '0') {
      await getAsync(`mysql -u root -se "DROP USER ${user}@localhost;"`)
      console.log(`${user} user mysql is delete`)
    } else {console.log(`No user account ${user} \nContinue...`)}

    if (isDatabasePresent[0].trim() !== '') {
      await getAsync(`mysql -u root -se "DROP DATABASE ${user};"`)
      console.log(`${user} database mysql is delete`)
    } else {console.log(`No database named ${user} \nContinue...`)}

    //DELETE OF VIRTUALHOST
    let vh = new VirtualHost(user)
    vh.a2dissite()
    vh.delete()
    vh.apacheReload()

    //DELETE OF WEB DIRECTORY
    await getAsync(`rm -rf /users/${user}`)

  } catch (err) {
    console.log(err)
  }

}

main()