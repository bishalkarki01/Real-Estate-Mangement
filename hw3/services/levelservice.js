const Levels = require('../model/Levels'); 

async function findAll( ) {
  return await Levels.find( {} );
}

module.exports = {findAll};
