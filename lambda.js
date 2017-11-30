var _ = require('lodash');
var rp = require('request-promise');
var async = require('async');

exports.handler = function (event, context) {
    
  const harvestURL = type => (
    {
      uri: `https://api.harvestapp.com/${type}`,
      headers: {
        'Authorization': HARVEST_TOKEN,
        'Harvest-Account-ID': HARVEST_ID,
        'User-Agent': 'Poetic Timetracking Lambda (poeticsystems.com)'
      },
      json: true,
    }
  );

  const insertUsers = (users) => {
    users.forEach(({ first_name, last_name }) => {
      console.log('poetic user: ', `${first_name} ${last_name}`);
    })
  }

  const syncUsers = async () => {
    console.log('');
    console.log('syncUsers starting');
    console.log('');
    let syncing = true;
    let totalSynced = 0;
    while (syncing) {
      try {
        const harvestUsers = await rp(harvestURL('v2/users?page=1&per_page=100'))
        if (harvestUsers.users) {
          insertUsers(harvestUsers.users);
          totalSynced = totalSynced + harvestUsers.users.length;
        }
        console.log('');
        console.log(`syncUsers complete, ${totalSynced} users synced`);
        console.log('');
        syncing = false
      } catch(err) {
        console.log('');
        console.log('syncUsers err: ', err);
        console.log('');
        syncing = false
      }
    }
  }

  return syncUsers().then(() => {
    context.succeed('finished sync');
  })
};