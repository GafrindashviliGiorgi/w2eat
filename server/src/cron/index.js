const dbKeepAliveCron = require("./dbKeepAlive.cron");

const initCrons = () => {
  // 🆕 ვრთავთ ბაზის Keep-Alive კრონს
  dbKeepAliveCron.start();
};

module.exports = initCrons;
