const { Command } = require('../../../src');

module.exports = new Command(
  'avatar',
  [
    'a'
  ],
  "Sends the player's avatar.",
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
    msg.channel.send({ embed: { title: `${person.tag}'s Avatar`, image: { url: person.displayAvatarURL({ format: 'png', dynamic: true }) } } });
  },
);
