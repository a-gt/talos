const EventEmitter = require('events');
const allEmojis = require('../emojis');
/*eslint no-new: "error"*/

const chunk = (chunkSize, array) => {
  var R = [];
  for (var i = 0; i < array.length; i += chunkSize) R.push(array.slice(i, i + chunkSize));
  return R;
};

class FieldPageMenu {
  constructor (channel, userId, time, args, emojis, emojiFunctions) {
    this.events = new EventEmitter();
    this.channel = channel;
    this.userId = userId;
    this.time = time;
    this.maxFields = args.maxFields || 10;
    if (this.maxFields > 25) {
      this.maxFields = 25;
    }
    this.data = chunk(this.maxFields, args.data) || [
      [],
    ];
    this.start = args.start - 1 || 0;
    this.embed = args.embed || {
      title : 'Field Page Menu',
    };
    this.end =
      args.end ||
      (message => {
        message
          .delete({
            timeout : 0,
            reson   : 'Free up clutter',
          })
          .catch(() => {
            return;
          });
      });
    this.error = args.error || (error => console.error(error));
    this.pageEmojis = [
      emojis[0] || emojis.arrows[0],
      emojis[emojis.length - 1] || emojis.arrows[1],
    ];
    this.emojis = emojis.splice(1, emojis.length - 2) || [];
    const extras = [];
    if (args.trash || args.jump) {
      if (args.jump) {
        extras.push(allEmojis.jump);
      }
      if (args.trash) {
        extras.push(allEmojis.trash);
      }
    }
    this.allEmojis = [
      this.pageEmojis[0],
      ...this.emojis,
      ...extras,
      this.pageEmojis[1],
    ];
    this.emojiFunctions = emojiFunctions;
    this.parsedData = [];
    this.pageNumbers =

        args.pageNumbers === undefined ? true :
        args.pageNumbers;
    this.trash =

        args.trash === undefined ? false :
        args.trash;
    this.jump =

        args.jump === undefined ? false :
        args.jump;
    this.loop =

        args.loop === undefined ? true :
        args.loop;
    this.setup();
    this.page = this.start;
    this.message;
  }

  setup () {
    const embed = this.embed;
    const pageNumbers = this.pageNumbers;
    const data = this.data;
    data.forEach((el, index) => {
      let thisParsed;
      if (pageNumbers) {
        thisParsed = {
          embed : {
            ...embed,
            fields    : el,
            footer    : {
              text : `Page ${index + 1}/${data.length}`,
            },
            timestamp : new Date(),
          },
        };
      }
      else {
        thisParsed = {
          embed : {
            ...embed,
            fields : el,
          },
        };
      }
      this.parsedData.push(thisParsed);
    });
    this.channel.send(this.parsedData[this.start]).then(message => {
      this.message = message;
      this.allEmojis.forEach(emoji => message.react(emoji));
      this.reaction();
    });
  }

  async deleteReaction () {
    const user = this.userId;
    const userReactions = this.message.reactions.cache.filter(reactionUser => reactionUser.users.cache.has(user));
    try {
      for (const reactionEmoji of userReactions.values()) {
        await reactionEmoji.users.remove(user);
      }
    } catch (error) {
      this.error(error);
    }
  }

  changePage (number) {
    let page = number;
    if (this.loop) {
      if (page < 0) page = this.data.length - 1;
      if (page > this.data.length - 1) page = 0;
    }
    else {
      if (page < 0) page = 0;
      if (page > this.data.length - 1) page = this.data.length - 1;
    }
    this.page = page;
    this.message.edit(this.parsedData[this.page]);
    this.events.emit('changePage', page);
    this.deleteReaction();
  }

  forward () {
    this.changePage(this.page + 1);
    this.events.emit('forward', this.message);
  }

  back () {
    this.changePage(this.page - 1);
    this.events.emit('back', this.message);
  }

  reaction () {
    const message = this.message;
    const filter = (reaction, user) => {
      return this.allEmojis.includes(reaction.emoji.name || reaction.emoji.id) && user.id === this.userId;
    };
    message
      .awaitReactions(filter, {
        max    : 1,
        time   : this.time,
        errors : [
          'time',
        ],
      })
      .then(collected => {
        const reaction = collected.first();
        const pageEmojis = this.pageEmojis;
        const name = reaction.emoji.name || reaction.emoji.id;

        if (pageEmojis.includes(name)) {
          if (name === pageEmojis[0]) {
            this.back();
          }
          else {
            this.forward();
          }
        }
        else if (name === '🗑️') {
          if (this.trash) {
            message
              .delete({
                timeout : 0,
                reson   : 'Free up clutter',
              })
              .catch(() => {
                return;
              });
          }
        }
        else if (name === '↗️') {
          if (this.jump) {
            const filter = response => {
              return !isNaN(parseInt(response));
            };
            message.channel.send('Please say what page you would like to go to.').then(sent => {
              message.channel
                .awaitMessages(filter, {
                  max    : 1,
                  time   : 30000,
                  errors : [
                    'time',
                  ],
                })
                .then(collected => {
                  const num = parseInt(collected.first().content);
                  if (num > this.data.length) {
                    collected
                      .first()
                      .delete({
                        timeout : 0,
                        reason  : '',
                      })
                      .catch(() => {
                        return;
                      });
                    sent
                      .delete({
                        timeout : 0,
                        reason  : '',
                      })
                      .catch(() => {
                        return;
                      });
                    return message.channel.send(`That is greater than ${this.data.length}.`).then(sentError =>
                      sentError
                        .delete({
                          timeout : 3000,
                          reason  : '',
                        })
                        .catch(() => {
                          return;
                        }),
                    );
                  }
                  this.changePage(num - 1);
                  collected
                    .first()
                    .delete({
                      timeout : 0,
                      reason  : '',
                    })
                    .catch(() => {
                      return;
                    });
                  sent
                    .delete({
                      timeout : 0,
                      reason  : '',
                    })
                    .catch(() => {
                      return;
                    });
                });
            });
          }
        }
        else {
          this.emojiFunctions[this.emojis.indexOf(name)](this.message);
          this.deleteReaction();
        }

        this.reaction();
      })
      .catch(collected => {
        this.end(message, collected);
      });
  }

  on (event, callback) {
    this.events.on(event, callback);
  }
}

module.exports = FieldPageMenu;
