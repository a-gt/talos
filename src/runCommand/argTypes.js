module.exports = {
  user (val, msg) {
    const client = msg.client
    if (val === undefined) return false;
    const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
    if (matches === null) return false;
    let id = matches[1];
    if (!matches) id = val;
    const user = client.users.cache.get(id);
    if (user === undefined) return false;
    else return user;
  },
  string (val) {
    return val;
  },
  channel (val, msg) {
    if (val === undefined) return false;
    const matches = val.match(/^(?:<#)?([0-9]+)>?$/);
    if (matches === null) return false;
    let id = matches[1];
    if (!matches) id = val;
    const channel = msg.guild.channels.cache.get(id);
    if (channel === undefined) return false;
    else return channel;
  },
  role (val, msg) {
    if (val === undefined) return false;
    const matches = val.match(/^(?:<@&)?([0-9]+)>?$/);
    if (matches === null) return false;
    let id = matches[1];
    if (!matches) id = val;
    const role = msg.guild.roles.cache.get(id);
    if (role === undefined) return false;
    else return role;
  },
  number (str) {
    if (str === undefined) return false;
    const num = parseInt(str);
    if (isNaN(num)) return false;
    return num;
  },
};
