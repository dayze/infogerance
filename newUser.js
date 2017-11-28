const argv = require('yargs').argv
const Promise = require('bluebird')
const cmd = require('node-cmd')
const user = argv.user
const utils = require('./utils')
const permissionUser = require('./permissionUser')
const VirtualHost = require('./Virtualhost')

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
    // ADD SYSTEM
    await getAsync(`useradd ${user} -g sftp`) // todo test if primary group
    console.log(`add of ${user}:sftp into system`)
    let userPassword = utils.generatePassword()
    await getAsync(`echo "${user}:${userPassword}"|chpasswd`)
    await utils.writeFile('/root/userData', `${user}:${userPassword} \n`)

    // ADD MYSQL
    await getAsync(`mysql -u root -se "CREATE USER '${user}'@'localhost' IDENTIFIED BY '${userPassword}'";`)
    await getAsync(`mysql -u root -se "CREATE DATABASE ${user}";`)
    await getAsync(`mysql -u root -se "GRANT SELECT, UPDATE, DELETE, INSERT ON ${user}.* TO ${user}@localhost";`)
    console.log(`add of ${user}, creation of database ${user} and set permission into Mysql`)

    //CREATION OF FOLDER AND PERMISSIONS
    let pathOfWebUserFolder = `/users/${user}`
    await getAsync(`mkdir ${pathOfWebUserFolder} &&
                    mkdir ${pathOfWebUserFolder}/log &&
                    mkdir ${pathOfWebUserFolder}/private &&
                    mkdir ${pathOfWebUserFolder}/www-dev &&
                    mkdir ${pathOfWebUserFolder}/www-prod`)
    await permissionUser.apply(pathOfWebUserFolder, user)
    console.log(`creation of web folders and set permissions in /users/${user}`)

    //CREATION OF VIRTUALHOST
    let vh = new VirtualHost(user)
    vh.create()
    vh.a2ensite()
  } catch (err) {
    utils.handleError(err)
  }
}

main()