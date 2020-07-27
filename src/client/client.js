const { Client, Collection } = require('discord.js');
const onMessage = require('../events/message.js');
const _ = require('lodash');
const runCommand = require('../runCommand/runCommand');

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
    this.config = defaultProps(options.config, {
      prefix            : 't!',
      onCommandError (msg, error) {
        msg.channel.send({
          embed : {
            color       : '#F04E45',
            title       : `:x: Error while doing the "${_.startCase(command.name)}" command.`,
            description : `If this error persists please contact Prometheus Support.`,
          },
        });
        console.error(error);
      },
      userNoPermissions (msg) {
        const owner = this.users.cache.get(msg.guild.ownerID);
        return msg.channel.send({
          embed : {
            color       : '#F04E45',
            title       : `:x: You have insufficient permissions for the "${_.startCase(command.name)}" command.`,
            description : `If you believe this is incorrect contact the server owner, **${owner.tag}**.`,
          },
        });
      },
      invalidArgs       : {
        invalidType (msg, command, arg, prefix) {
          msg.channel.send({
            embed : {
              color       : '#F04E45',
              title       : `:x: Invalid arguments provided for the "${_.startCase(command.name)}" command.`,
              description : `You need to specify a \`${_.startCase(arg.type.name)}\` for the \`${_.startCase(
                arg.name,
              )}\` argument.\n\n**Usage:**\n\`\`\`${prefix}${command.usage}\`\`\``,
            },
          });
        },
        missing (msg, command, arg, prefix) {
          msg.channel.send({
            embed : {
              color       : '#F04E45',
              title       : `:x Invalid arguments provided for the "${_.startCase(command.name)}" command.`,
              description : `Missing the \`${_.startCase(
                arg.name,
              )}\` argument.\n\n**Usage:**\n\`\`\`${prefix}${command.usage}\`\`\``,
            },
          });
        },
      },
    });
    this.commands = new Collection();
    this.modules = new Collection();
    if (this.token === undefined) {
      throw new Error('No token specified.');
    }
    super.on('message', msg => onMessage(this, msg));
  }

  connect () {
    super.login(this.token);
  }

  runCommand (name, msg, args, prefix) {
    const command = this.commands.get(name) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(name));
    return runCommand(this, msg, command, args, prefix);
  }

  addModule (name, moduleData, cmds) {
    this.modules.set(name.toLowerCase(), {
      ...moduleData,
      moduleName : name.toLowerCase(),
      cmds,
    });
    cmds.forEach(cmd =>
      this.commands.set(cmd.name, {
        ...cmd,
        module : name,
      }),
    );
  }
}

module.exports = TalosClient;
