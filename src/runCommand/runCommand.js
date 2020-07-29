const parseArgs = require('./parseArgs.js');

const runCommand = async (msg, command, args, prefix) => {
  if (command.subCommands) {
    if (!command.subCommands.hasOwnProperty(args[0])) return parseArgs(msg, command, args, prefix);
    const sub = command.subCommands[args[0]];
    return parseArgs(msg, sub, args.splice(1, args.length), prefix);
  }
  return parseArgs(msg, command, args, prefix);
};

module.exports = runCommand;
