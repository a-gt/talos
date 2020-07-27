const { Cooldown } = require('../common');
const runCommand = require('../runCommand/runCommand');

module.exports = async (client, msg) => {
  if (msg.author.bot) return;
  let args;
  let prefix;
  if (msg.guild) {
    prefix = client.config.prefix;
    const isPrefix = msg.content.startsWith(prefix);

    if (!isPrefix) {
      if (new RegExp(`^<@${client.user.id}>|^<@!${client.user.id}>`).test(msg.content)) {
        if (new RegExp(`^<@${client.user.id}>`).test(msg.content)) {
          prefix = `<@${client.user.id}>`;
        }
        else {
          prefix = `<@!${client.user.id}>`;
        }
      }
      else return;
    }
    args = msg.content.slice(prefix.length).split(/\s+/);
  }
  else {
    args = msg.content.split(/\s+/);
  }
  let commandName = args.shift().toLowerCase();
  let cmd =
    client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!cmd) {
    const arg1 = args.shift();
    if (!arg1) return;
    commandName = arg1.toLowerCase();
    const cmdTest =
      client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (cmdTest) {
      cmd = cmdTest;
    }
    else return;
  }

  if (cmd.guildOnly && msg.channel.type !== 'text') {
    return;
  }

  new Cooldown(
    cmd.name,
    msg.author,
    cmd.cooldown || 3,
    () => {
      runCommand(client, msg, cmd, args, prefix);
    },
    timeLeft => {
      return msg.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.name}\` cmd.`);
    },
  );
};
