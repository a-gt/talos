class Module {
  constructor (name, description, options) {
    this.name = name.toLowerCase();
    this.descriptions = description;
    this.group = options.group || 'public';
    this.color = options.color || '#18FFFF';
    this.emojis = options.emojis || ':robot:';
    this.image = options.image || 'https://i.imgur.com/L4BCSZw.png';
  }
}

module.exports = Module;