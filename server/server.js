var express = require('express');
var path = require('path');

var app = express();

require('./config/middleware.js')(app, express);
require('./config/routes.js')(app, express);

app.listen(1337);
console.log('1337 server started!');

