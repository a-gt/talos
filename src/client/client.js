const { Client, Collection } = require('discord.js');
const onMessage = require('../events/message.js');
const _ = require('lodash');
const runCommand = require('../runCommand/runCommand');
const help = require('../defaultCommands/help');
const Module = require('../module');
/* eslint no-console: "error" */

const defaultProps = (prop, defaultVal) => {
  if (prop === undefined) {
    return defaultVal;
  }
  else {
    return prop;
  }
};

class TalosClient extends Client {
  constructor (options) {
    super(options);
    this.token = options.token;
    const user = this.user;
    this.config = defaultProps(options.config, {
      prefix            : 't!',
      groups            : {},
      dynamicHelp       : true,
      description       : 'A bot made with Talos.',
      onCommandError (msg, command, error) {
        msg.channel.send({
          embed : {
            color       : '#F04E45',
            title       : `:x: Error while doing the "${_.startCase(command.name)}" command.`,
            description : `If this error persists please contact ${user.username} Support.`,
          },
        });
        console.error(error);
      },
      userNoPermissions (msg, command) {
        const owner = this.users.cache.get(msg.guild.ownerID);
        return msg.channel.send({
          embed : {
            color       : '#F04E45',
            title       : `:x: You have insufficient permissions for the "${_.startCase(command.name)}" command.`,
            description : `If you believe this is incorrect contact the server owner, **${owner.tag}**.`,
          },
        });
      },
      invalidArg        : {
        invalidType (msg, command, arg, prefix) {
          msg.channel.send({
            embed : {
              color       : '#F04E45',
              title       : `:x: Invalid arguments provided for the "${_.startCase(command.name)}" command.`,
              description : `You need to specify a \`${_.startCase(arg.type)}\` for the \`${_.startCase(
                arg.name,
              )}\` argument.\n\n**Usage:**\n\`\`\`${prefix}${command.usage}\`\`\``,
            },
          });
        },
        missing (msg, command, arg, prefix) {
          msg.channel.send({
            embed : {
              color       : '#F04E45',
              title       : `:x: Invalid arguments provided for the "${_.startCase(command.name)}" command.`,
              description : `Missing the \`${_.startCase(
                arg.name,
              )}\` argument.\n\n**Usage:**\n\`\`\`${prefix}${command.usage}\`\`\``,
            },
          });
        },
      },
    });
    this.getPrefix = this.config.getPrefix || (() => {
      return this.prefix
    });
    this.prefix = this.config.prefix || 'k!'
    this.commands = new Collection();
    this.modules = new Collection();
    this.dynamicHelp = this.config.dynamicHelp;
    if (this.token === undefined) {
      throw new Error('No token specified.');
    }
    if (this.dynamicHelp === true) {
      this.addModule(new Module('Bot', `Main commands of this bot.`), [
        help,
      ]);
    }
    super.on('message', msg => onMessage(msg));
  }

  connect () {
    super.login(this.token);
  }

  runCommand (name, msg, args, prefix) {
    const command = this.commands.get(name) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name));
    return runCommand(this, msg, command, args, prefix);
  }

  addModule (moduleData, cmds) {
    const name = moduleData.name;
    let previous = [];
    if (this.modules.has(name)) previous = this.modules.get(name).cmds;
    const result = previous.concat(cmds);
    const combined = result.filter((cmd, i) => result.indexOf(cmd) === i);
    this.modules.set(name.toLowerCase(), {
      ...moduleData,
      moduleName : name.toLowerCase(),
      cmds       : combined,
    });
    cmds.forEach(cmd =>
      this.commands.set(cmd.name, {
        ...cmd,
        moduleData : name,
      }),
    );
  }

  addCommand (cmd, moduleName) {
    if (this.modules.has(moduleName)) throw new Error(`Module "${moduleName}" doesn't exist.`);
    this.commands.set(cmd.name, {
      ...cmd,
      module : moduleName,
    });
  }
}

module.exports = TalosClient;
