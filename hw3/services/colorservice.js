const Colors = require('../model/Colors'); 

async function findAll( ) {
  return await Colors.find( {} );
}

module.exports = {findAll};
