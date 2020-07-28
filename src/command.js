const _ = require('lodash');

class Command {
  constructor (name, aliases, description, options, run) {
    this.name = name.toLowerCase();
    this.aliases = (aliases || []).map(alias => alias.toLowerCase());
    this.description = description;
    this.args = (options || {}).args || [];
    this.args.forEach((arg, i) => {
      if (arg.name === undefined) this.args[i].name = arg.key
    })
    this.group = (options || {}).group || 'public';
    this.type = (options || {}).type || 'string';
    this.cooldown = (options || {}).cooldown || 3;
    this.run = run;
    const usage = [];
    this.args.forEach(arg => {
      if (arg.required) usage.push(`<${_.startCase(arg.name)}>`);
      else usage.push(`(${_.startCase(arg.name)})`);
    });
    this.usageWithoutCmd = usage.join(' ');
    this.usage =
      `${this.name}${
        this.aliases[0] === undefined ? '' :
        `/${this.aliases.join('/')}`} ` + usage.join(' ');
  }
}

module.exports = Command;
