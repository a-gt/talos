const { Command, PageMenu } = require('../../../src');

module.exports = new Command(
  'page',
  [],
  'Test PageMenu',
  {
    args : [
      {
        key  : 'user',
        type : 'user',
      },
    ],
  },
  (msg, { user }) => {
    const person = user || msg.author;
    new PageMenu(
      msg.channel,
      msg.author.id,
      30000,
      {
        data  : [
          'asdasdasd',
          'asdasd',
        ],
        embed : {
          title  : `Pages`,
          color  : '#2F3136',
          footer : {
            text     : `${person.tag}`,
            icon_url : person.displayAvatarURL({
              format  : 'png',
              dynamic : true,
            }),
          },
        },
      },
      [
        '⬅️',
        '➡️',
      ],
    );
  },
);
