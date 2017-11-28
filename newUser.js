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
    utils.handleError('Error: User already exist !')
  } catch (err) {
    // passed here if there is no user
  }
  try {
    let isMysqlUserExist = await getAsync(`mysql -u root -se "SELECT EXISTS(SELECT 1 FROM mysql.user WHERE user = '${user}');"`)
    if (isMysqlUserExist[0].trim() === '1') {utils.handleError('Error: Mysql user already exist !')}
  } catch (err) {
    utils.handleError(err)
  }
  try {
    await getAsync(`useradd ${user} --groups sftp`)
    console.log(`Ajout de ${user}:sftp au système`)
    let userPassword = utils.generatePassword()
    await getAsync(`echo "${user}:${userPassword}"|chpasswd`)
    await utils.writeFile('/root/userData', `${user}:${userPassword} \n`)
    await getAsync(`mysql -u root -se "CREATE USER '${user}'@'localhost' IDENTIFIED BY '${userPassword}'";`)
    await getAsync(`mysql -u root -se "CREATE DATABASE ${user}";`)
    await getAsync(`mysql -u root -se "GRANT SELECT, UPDATE, DELETE, INSERT ON '${user}'.* TO '${user}'";`)
    console.log(`Ajout de ${user} dans Mysql`)
  } catch (err) {
    utils.handleError(err)
  }
}

main()