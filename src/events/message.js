const { Cooldown } = require('../common');
const runCommand = require('../runCommand/runCommand');

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = async msg => {
  const client = msg.client;
  if (msg.author.bot) return;
  let args;
  let prefix;
  if (msg.guild) {
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(await client.getPrefix(msg))})\\s*`);
    if (!prefixRegex.test(msg.content)) return;
    prefix = await client.getPrefix(msg);

    const [
      ,
      matchedPrefix,
    ] = msg.content.match(prefixRegex);
    args = msg.content.slice(matchedPrefix.length).trim().split(/ +/);
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
      runCommand(msg, cmd, args, prefix);
    },
    timeLeft => {
      return msg.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.name}\` cmd.`);
    },
  );
};
