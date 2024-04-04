const Font = require('../model/Fonts'); 

async function findAll( ) {
  return await Font.find( {} );
}

module.exports = {findAll};
