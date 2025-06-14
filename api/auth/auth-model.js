const db = require('../../data/dbConfig');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

async function addUser(user) {
    const [id] = await db('users').insert(user);
    return db('users').where({ id }).first();
}

function findBy(user) {
    return db('users').where(user);
}

function buildToken(user) {
    const payload = {
        subject: user.id,
        username: user.username,
    };
    const options = {
        expiresIn: '1d'
    };
    const secret = process.env.JWT_SECRET || "shhh";
    return jwt.sign(payload, secret, options);
}

module.exports = {
    addUser,
    findBy,
    buildToken,
};