const TalosClient = require('./client/client.js');
const Command = require('./command');
const Module = require('./module');
const { PageMenu, Cooldown } = require('./common');
const emojis = require('./emojis');

module.exports = {
  TalosClient,
  Command,
  Module,
  PageMenu,
  emojis,
  Cooldown,
};
