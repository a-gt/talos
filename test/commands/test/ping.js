const { Command } = require('../../../src');

module.exports = new Command('ping', [], "The bot's ping.", {}, msg => {
  msg.channel.send({
    embed : {
      color       : '#2F3136',
      title       : ':ping_pong: Pong! :ping_pong:',
      description: `:globe_with_meridians: **Ping:** ***${Math.round(msg.client.ws.ping)}ms***`
    },
  });
});
