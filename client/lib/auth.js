exports.login = (username, password, callback) => {
  if (exports.isSignedIn()) {
    $.ajaxSetup({ headers: { 'x-access-token': window.localStorage.getItem('com.faunadex') } });
    return callback(null, true);
  }
  
  $.post('/api/user/signin', {username: username, password: password})
    .retry({ times: 5, timeout: 500 })
    .done((data) => {
      if (data.type === 'USER') {
        window.localStorage.setItem('com.faunadex', data.token);
        $.ajaxSetup({ headers: { 'x-access-token': data.token } });
      }
      callback(null, data);
    })
  .fail((jqXHR, msg) => {
    callback(new Error(msg));
  });
};

exports.signup = (username, password, description, avatar, callback) => {
  if (exports.isSignedIn()) {
    $.ajaxSetup({ headers: { 'x-access-token': window.localStorage.getItem('com.faunadex') } });
    return callback(null, true);
  }

  $.post('/api/user/signup', {username: username, password: password, description: description, avatar: avatar})
    .retry({ times: 5, timeout: 500 })
    .done((data) => {
      if (data.type === 'USER') {
        window.localStorage.setItem('com.faunadex', data.token);
        $.ajaxSetup({ headers: { 'x-access-token': data.token } });
      }
      callback(null, data);
    })
  .fail((jqXHR, msg) => {
    callback(new Error(msg));
  });
};

exports.isSignedIn = () => !!window.localStorage.getItem('com.faunadex');

exports.signOut = function() {
  window.localStorage.removeItem('com.faunadex');
  $.get('/api/user/signout')
    .retry({ times: 5, timeout: 500 })
    .done(function(data) {
      window.location = '/';
    });
};

