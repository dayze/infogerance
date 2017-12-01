const child_process = require('child_process');

module.exports.apply =  (folderOfUser, userName) => {
  child_process.exec(`chmod 700 ${folderOfUser}`)
  child_process.exec(`chown root:root ${folderOfUser}`)
  child_process.exec(`setfacl -m u:${userName}:rx ${folderOfUser}`)
  child_process.exec(`chmod 700 ${folderOfUser}/private`)
  child_process.exec(`chmod 700 ${folderOfUser}/www-dev`)
  child_process.exec(`chmod 700 ${folderOfUser}/www-prod`)
  child_process.exec(`chown ${userName}:sftp ${folderOfUser}/private`)
  child_process.exec(`chown ${userName}:sftp ${folderOfUser}/www-dev`)
  child_process.exec(`chown ${userName}:sftp ${folderOfUser}/www-prod`)
  child_process.exec(`chown root:sftp ${folderOfUser}/log`)
  child_process.exec(`chmod 755 ${folderOfUser}/log`)
}



