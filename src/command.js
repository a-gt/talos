const _ = require('lodash');

class Command {
  constructor (name, aliases, description, options, run) {
    this.name = name.toLowerCase();
    this.aliases = (aliases || []).map(alias => alias.toLowerCase());
    this.descriptions = description;
    this.args = options.args || [];
    this.group = options.group || 'public';
    this.type = options.type || 'string';
    this.run = run;
    const usage = [];
    this.args.forEach(arg => {
      if (arg.required) usage.push(`<${_.startCase(arg.name)}>`);
      else usage.push(`(${_.startCase(arg.name)})`);
    });
    this.usageWithoutCmd = usage.join(' ');
    this.usage =
      `${this.name}${
        this.aliases === [] ? '' :
        `/${this.aliases.join('/')}`} ` + usage.join(' ');
  }
}

module.exports = Command;
