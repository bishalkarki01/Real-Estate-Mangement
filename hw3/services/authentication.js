var User = require('../model/User');


async function findAll( ) {
    return await User.find( {} );
}


async function findById( id ) {
    return await User.findOne( { '_id' : id });
}


async function findByEmail( email ) {
    return await User.findOne( { 'email' : email } );
}


module.exports = { findByEmail, findById, findAll};
