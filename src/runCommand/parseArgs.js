const types = require('./argTypes');

const run = (client, msg, argsReturn, command, prefix) => {
  client.emit('preCommand', msg, command);
  try {
    return command.run(msg, argsReturn, prefix);
  } catch (error) {
    client.config.onCommandError(msg, command, error);
  }
  client.emit('postCommand', msg, command);
};

const parseArgs = async (client, msg, command, args, prefix) => {
  const argArray = command.args;
  const argsReturn = {};
  let go = true;
  const checkArgs = async () => {
    await Promise.all(
      argArray.map(async (arg, i) => {
        const equivalent = args[i];
        let type = function (z) {
          return z;
        };
        if (arg.type) {
          if (arg.type.toLowerCase() === 'custom') type = arg.customType;
          else type = types[arg.type.toLowerCase()];
        }
        let returnType = await type(client, equivalent, msg);
        if (!equivalent && arg.required) {
          go = false;
          return client.config.invalidArg.missing(msg, command, arg, prefix);
        }
        else if (equivalent && !returnType) {
          go = false;
          return client.config.invalidArg.invalidType(msg, command, arg, prefix);
        }
        else if (!equivalent) return (argsReturn[arg.key] = arg.default);
        else if (i === argArray.length - 1) {
          const val = await type(client, args.slice(i, args.length).join(' '), msg);
          return (argsReturn[arg.key] = val || undefined);
        }
        else return (argsReturn[arg.key] = returnType);
      }),
    );
  };
  if (command.group.toLowerCase() === 'public') {
    await checkArgs();
    if (go) return run(client, msg, argsReturn, command, prefix);
  }
  else if (client.config.groups[command.group.toLowerCase()](msg, msg.author) === true) {
    await checkArgs();
    if (go) return run(client, msg, argsReturn, command, prefix);
  }
  else if (client.config.groups[command.group.toLowerCase()] === undefined) {
    throw new Error(`Invalid group. \nGroup: "${command.group}"\nCommand: "${command.name}"`);
  }
  else if (go) {
    return client.config.userNoPermissions(msg, command);
  }
  else return;
};

module.exports = parseArgs;
