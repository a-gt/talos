const { TalosClient } = require('../src');
const { token } = require('./config.json');

const client = new TalosClient({
  token,
});

client.connect();

client.on('ready', () => {
  console.log('Talos is alive!');
});
