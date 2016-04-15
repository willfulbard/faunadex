var chai = require('chai');
var expect = chai.expect;
chai.should();
var request = require('request');

var User = require('../../server/models/user.js');
var app = require('../../server/server.js');

//Create an object for testing use
var Site = function() {
  this.username = '';
  this.password = '';
  this.req = request.defaults({jar: true, followAllRedirects: true});
};

Site.prototype.post = function (uri, callback) {
  var data = {
    username: this.username,
    password: this.password
  };
  // request.agent(app).post(uri).send(data).withCredentials().redirects(1).expect(200).end(callback);
  this.req.post({ url: 'http://localhost:1337' + uri, form: data}, callback);
};

Site.prototype.get = function (uri, callback) {
  this.req.get({ url: 'http://localhost:1337' + uri }, callback);
};

var site = new Site();

//Delete our user if he already exists
new User({ username: 'bob123456' }).fetch().then (function (user) {
  if (user) {
    user.destroy();
  }
});


//Create a user that we will delete at the end
var bob = new User({ username: 'bob123456', password: 'bob' }).save();

describe('Basic Authentication', function () {
  describe('/api/user/signin and /api/user/isloggedin', function () {
    
    it('will not 404 when POST to /api/user/signin', function (done) {
      site.username = 'nancy';
      site.post('/api/user/signin', function(error, res, body) {
        expect(res.statusCode).to.equal(200);
        done();
      });
    });

    it('/api/user/isloggedin should return false when not logged in', function (done) {
      site.get('/api/user/isloggedin', function(error, res, body) {
        body.should.equal('false');
        done();
      });
    });

    it('will not sign a user in with improper credentials, and redirect to login page', function (done) {
      site.username = 'bob123456';
      site.password = '';
      site.post('/api/user/signin', function(error, res, body) {
        expect(error).to.equal(null);
        site.get('/api/user/isloggedin', function(error, res, body) {
          body.should.equal('false');
          done();
        });
      });
    });

    it('will sign a user in with proper credentials', function (done) {
      site.username = 'bob123456';
      site.password = 'bob';
      site.post('/api/user/signin', function(error, res, body) {
        var jsonBody = JSON.parse(body);
        expect(error).to.equal(null);
        expect(jsonBody.username).to.equal('bob123456');
        done();
      });
    });

    it('/api/user/isloggedin should return true when logged in', function (done) {
      site.get('/api/user/isloggedin', function(error, res, body) {
        body.should.equal('true');
        done();
      });
    });
  }); 

  describe('/api/user/signout', function() {
    it('should sign a user out', function(done) {
      site.get('/api/user/signout', function(error, res, body) {
        expect(error).to.equal(null);
        site.get('/api/user/isloggedin', function(error, res, body) {
          body.should.equal('false');
          done();
        });
      });
    });
  });

}); 

