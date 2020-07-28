const Command = require('../command');
const emojis = require('../emojis');
const { PageMenu } = require('../common');
const _ = require('lodash');

module.exports = new Command(
  'help',
  [
    'commands',
    'command',
    'syntax',
  ],
  'Lists all the commands and their uses.',
  {
    cooldown : 5,
    args     : [
      {
        key  : 'command',
        type : 'string',
      },
    ],
  },
  (msg, args, prefix) => {
    const { commands, modules } = msg.client;
    const moduleArray = modules.array();
    const moduleNames = moduleArray
      .map((moduleData, index) => `**Page ${index + 2}:** ${moduleData.emoji || ':robot:'} | ***${moduleData.name}***`)
      .join('\n');
    const dataPage = [
      {
        author      : {
          name     : `${msg.client.user.username} Help`,
          icon_url : msg.client.user.displayAvatarURL({ format: 'png', dynamic: true }),
        },
        color       : '#2F3136',
        thumbnail   : {
          url : msg.client.user.displayAvatarURL({ format: 'png', dynamic: true }),
        },
        description : `${msg.client.config
          .description}\n\n:arrow_left: : Page Backward.\n :arrow_right: : Page Forward.\n :arrow_upper_right: : Go to any page.\n :wastebasket: : Close help menu.\n\n**Page 1:** :bust_in_silhouette: | ***${msg
          .client.user.username} Help***\n${moduleNames}`,
      },
    ];
    moduleArray.map(moduleData => {
      const fields = [];
      moduleData.cmds.map((command, i) => {
        fields.push({
          name  : `**${i + 1}. ${prefix}${command.usage}**`,
          value : `\`\`\`${command.description}\`\`\``,
        });
      });
      dataPage.push({
        author      : {
          name     : moduleData.name,
          icon_url : moduleData.image,
        },
        color       : moduleData.color,
        thumbnail   : {
          url : moduleData.image,
        },
        description : moduleData.description,
        fields,
      });
    });
    if (args.command === undefined) {
      new PageMenu(msg.channel, msg.author.id, 30000, { data: dataPage, trash: true, jump: true }, emojis.arrows);
      return;
    }
    const name = args.command.toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      const moduleData = modules.get(name);
      if (!moduleData) return msg.channel.send(":x: That's not a valid command or module.");
      let num = 0;
      moduleArray.forEach((moduleFromArray, i) => {
        if (moduleFromArray.moduleName === moduleData.moduleName) num = i + 2;
      });
      new PageMenu(
        msg.channel,
        msg.author.id,
        30000,
        { data: dataPage, trash: true, jump: true, start: num },
        emojis.arrows,
      );
      return;
    }

    const { moduleData } = command;
    const fetchedModule = modules.get(moduleData.toLowerCase());

    const data = {};

    data.title = `**${_.capitalize(command.name)} Command**  ➤  ${fetchedModule.name}`;
    data.fields = [
      {
        name  : 'Command',
        value : `\`\`\`${prefix}${command.usage}\`\`\``,
      },
    ];
    data.thumbnail = {
      url : fetchedModule.image,
    };
    data.color = fetchedModule.color;

    data.fields.push({
      name   : 'Aliases',
      value  : `\`\`\`${
        command.aliases === undefined ? 'None.' :
        command.aliases.join(', ')}\`\`\``,
      inline : true,
    });
    data.fields.push({
      name   : 'Cooldown',
      value  : `\`\`\`${command.cooldown || 3} second(s)\`\`\``,
      inline : true,
    });
    if (command.description)
      data.fields.push({
        name  : 'Description',
        value : `\`\`\`${command.description}\`\`\``,
      });
    if (command.subCommands) {
      data.fields.push({
        name  : 'Sub Commands',
        value : `**\`\`\`${command.subCommands
          .map((cmd, i) => {
            return `${i + 1}. ${prefix}${cmd.usage}\n  ⤷ ${cmd.description}`;
          })
          .join('\n\n')}\`\`\`**`,
      });
    }
    if (command.usage)
      data.fields.push({
        name  : 'Usage',
        value : `\`\`\`${command.usageWithoutCmd}\`\`\``,
      });

    msg.channel
      .send({
        embed : data,
      })
      .then(sent => {
        setTimeout(() => {
          sent
            .delete({
              timeout : 0,
              reason  : 'Free up clutter',
            })
            .moduleArraych(() => {
              return;
            });
        }, 70000);
      });
  },
);
