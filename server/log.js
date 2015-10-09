var Logger = require('le_node');
var winston = require('winston');
winston.add(winston.transports.File, {
    filename: "./logs.log"
});
winston.add(winston.transports.Logentries, { token: '70874635-15a5-42ba-b82a-dbf7c63d0fbd' });
winston.info('Log initialized!');

module.exports = winston;