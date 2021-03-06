//var loopback = require('loopback');
//var boot = require('loopback-boot');
var logger = require('./log.js');
var crawler = require('../common/models/html-crawl');
var cors = require('cors')
var express = require('express');
var log = require('winston');

var app = express();
var port = (process.env.PORT || 3000);
app.use(cors());

//METHODS SUPPORTED
app.get('/webdata', function(req, res) {
    log.info('Called webdata method with: %s', req.url);
    var callback = function(result) {
        res.send(result);
    }
    crawler.getData(req.query.url, req.query.imgarr, req.query.generic, callback);
});

app.get('/images', function(req, res) {
    log.info('Called images method with: %s', req.url);
    var callback = function(result) {
        res.send(result);
    }
    crawler.getImages(req.query.url, callback);
});

//STARTING SERVER
app.listen(port, function () {
  log.info('Webdata Crawler listening on port 3000!');
});

process.on('uncaughtException', function(err) {
    log.info('Caught exception: ' + err);
});