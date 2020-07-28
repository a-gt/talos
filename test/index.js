const { TalosClient } = require('../src');
const { token } = require('./config.json');
const _ = require('lodash');
/* eslint no-console: "error" */

const client = new TalosClient({
  token,
  config : {
    prefix            : '?',
    dynamicHelp       : true,
    description       : 'A bot made with Talos.',
    onCommandError (msg, command, error) {
      msg.channel.send({
        embed : {
          color       : '#F04E45',
          title       : `<:xmark:734831609919963156> Error while doing the "${_.startCase(command.name)}" command.`,
          description : `If this error persists please contact ${client.user.username} Support.`,
        },
      });
      console.error(error);
    },
    userNoPermissions (msg, command) {
      const owner = client.users.cache.get(msg.guild.ownerID);
      return msg.channel.send({
        embed : {
          color       : '#F04E45',
          title       : `<:xmark:734831609919963156> You have insufficient permissions for the "${_.startCase(
            command.name,
          )}" command.`,
          description : `If you believe this is incorrect contact the server owner, **${owner.tag}**.`,
        },
      });
    },
    invalidArg        : {
      invalidType (msg, command, arg, prefix) {
        msg.channel.send({
          embed : {
            color       : '#F04E45',
            title       : `<:xmark:734831609919963156> Invalid arguments provided for the "${_.startCase(
              command.name,
            )}" command.`,
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
            title       : `<:xmark:734831609919963156> Invalid arguments provided for the "${_.startCase(
              command.name,
            )}" command.`,
            description : `Missing the \`${_.startCase(
              arg.name,
            )}\` argument.\n\n**Usage:**\n\`\`\`${prefix}${command.usage}\`\`\``,
          },
        });
      },
    },
  },
});

client.connect();

client.once('ready', () => {
  console.log('Talos is alive!');
});

client.on('preCommand', msg =>
  msg.delete({ timeout: 0, reason: '' }).catch(() => {
    return;
  }),
);
