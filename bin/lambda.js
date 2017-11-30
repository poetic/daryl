'use strict';

var _ = require('lodash');
var rp = require('request-promise');
var async = require('async');

exports.handler = function (event, context) {

  var harvestURL = function harvestURL(type) {
    return {
      uri: 'https://api.harvestapp.com/' + type,
      headers: {
        'Authorization': HARVEST_TOKEN,
        'Harvest-Account-ID': HARVEST_ID,
        'User-Agent': 'Poetic Timetracking Lambda (poeticsystems.com)'
      },
      json: true
    };
  };

  var insertUsers = function insertUsers(users) {
    users.forEach(function (_ref) {
      var first_name = _ref.first_name,
          last_name = _ref.last_name;

      console.log('poetic user: ', first_name + ' ' + last_name);
    });
  };

  var syncUsers = function syncUsers() {
    function _recursive() {
      if (syncing) {
        return Promise.resolve().then(function () {
          return Promise.resolve().then(function () {
            return rp(harvestURL('v2/users?page=1&per_page=100'));
          }).then(function (_resp) {
            harvestUsers = _resp;

            if (harvestUsers.users) {
              insertUsers(harvestUsers.users);
              totalSynced = totalSynced + harvestUsers.users.length;
            }
            console.log('');
            console.log('syncUsers complete, ' + totalSynced + ' users synced');
            console.log('');
            syncing = false;
          }).catch(function (err) {
            console.log('');
            console.log('syncUsers err: ', err);
            console.log('');
            syncing = false;
          });
        }).then(function () {
          return _recursive();
        });
      }
    }

    var syncing, totalSynced, harvestUsers;
    return Promise.resolve().then(function () {
      console.log('');
      console.log('syncUsers starting');
      console.log('');
      syncing = true;
      totalSynced = 0;
      return _recursive();
    }).then(function () {});
  };

  return syncUsers().then(function () {
    context.succeed('finished sync');
  });
};