const utils = require('./utils')
const Promise = require('bluebird')
const cmd = require('node-cmd')

const getAsync = Promise.promisify(cmd.get, {multiArgs: true, context: cmd})

class Virtualhost {
  constructor (user) {
    this.user = user
    this.fill()
  }

  fill () {
    this.vhProd = `
  <VirtualHost *:80>
    ServerName ${this.user}.apache.macmonac.info
    DocumentRoot /users/${this.user}/www-prod
    <Directory /users/${this.user}/www-prod>
        Require all granted
    </Directory>
    ErrorLog /users/${this.user}/log/error.log
    CustomLog /users/${this.user}/log/access.log combined
    <IfModule mpm_itk_module>
       AssignUserId ${this.user} sftp
    </IfModule>
</VirtualHost>
  `

    this.vhDev = `
<VirtualHost *:80>
    ServerName ${this.user}-dev.apache.macmonac.info
    DocumentRoot /users/${this.user}/www-dev
    <Directory /users/${this.user}/www-dev>
        Options +Indexes 
        Require all granted
    </Directory>
    ErrorLog /users/${this.user}/log/error-dev.log
    CustomLog /users/${this.user}/log/access-dev.log combined
    <IfModule mpm_itk_module>
        AssignUserId ${this.user} sftp
    </IfModule>
</VirtualHost>
`

  }

  async create () {
    await utils.writeFile(`/etc/apache2/sites-available/${this.user}-dev.conf`, this.vhDev)
    await utils.writeFile(`/etc/apache2/sites-available/${this.user}-prod.conf`, this.vhProd)
  }

  async a2ensite () {
    await getAsync(`a2ensite /etc/apache2/sites-available/${this.user}-dev 
            && a2ensite /etc/apache2/sites-available/${this.user}-prod`)
  }

  async a2dissite () {
    await getAsync(`a2dissite ${this.user}-dev && a2dissite ${this.user}-prod`)
  }

  async deleteVh () {
    await getAsync(`rm -rf /etc/apache2/sites-available/${this.user}-dev`)
    await getAsync(`rm -rf /etc/apache2/sites-available/${this.user}-prod`)
  }

  async apacheRestart () {
    await getAsync(`service apache2 restart`)
  }

  async apacheReload () {
    await getAsync(`service apache2 reload`)
  }



}

module.exports = Virtualhost