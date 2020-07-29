const _ = require('lodash');

class Module {
  constructor (name, description, options) {
    this.name = _.startCase(name);
    this.descriptions = description;
    this.group = (options || {}).group || 'public';
    this.color = (options || {}).color || '#18FFFF';
    this.emoji = (options || {}).emojis || ':robot:';
    this.image = (options || {}).image || 'https://i.imgur.com/8zisgQe.png';
  }
}

module.exports = Module;
