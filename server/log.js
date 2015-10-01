var winston = require('winston');
winston.add(winston.transports.File, {
    filename: "./logs.log"
});
winston.info('Log initialized!');

module.exports = winston;