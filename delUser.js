const argv = require('yargs').argv
const Promise = require('bluebird')
const cmd = require('node-cmd')
const user = argv.user
const utils = require('./utils')
const VirtualHost = require('./Virtualhost')

const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

if (user === '' || user === undefined) {
  utils.handleError('Error: You need to specify an user. ex: --user=toto')
}
if (user.match(/[^A-Za-z0-9 ]/)) {
  utils.handleError('Error: invalid character into the username, only Alphanumeric allowed')
}

const main = async () => {
  // DEL SYSTEM
  try {
    await getAsync(`id -u ${user}`)
    await getAsync(`userdel ${user}`)
    console.log(`${user} unix user is delete`)
    await getAsync(`sed -i "/${user}/d" /root/userData`)
    console.log(`${user} into password file is delete`)
  } catch (err) {
    if (err) {console.log(`No system user ${user} \nContinue`)}
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
    console.log(isMysqlUserExist)
    if (isMysqlUserExist[0].trim().replace(/\n/g, '') !== '0') {
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
    vh.deleteVh()
    setTimeout(() => {
      vh.apacheReload()
    }, 100)

    //DELETE OF WEB DIRECTORY
    await getAsync(`rm -rf /users/${user}`)
    console.log(`drop of /users/${user} directory`)

  } catch (err) {
    console.log(err)
  }

}

main()