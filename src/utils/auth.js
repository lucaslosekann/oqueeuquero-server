const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config");
const pool = require("./db").pool;
const bcrypt = require("bcrypt");

//Creates a new token using jwt, sign it with the user id and the return it to whatever called the function
exports.newToken = (id) =>
  jwt.sign({ id }, config.secret, {
    expiresIn: config.exp,
  });

//Verify the authenticity of a token asynchronously
const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secret, (error, payload) => {
      if (!!error) return reject(error);
      resolve(payload);
    });
  });
exports.verifyToken = verifyToken;


//Checks if a user is logged in taking in a authorization header in the model:
/*
  {
    authorization: 'Bearer JWT'
  }
 */
exports.protect = async (req, res, next) => {
  const bearer = req.headers.authorization;
  //Verify the authorization header formatting
  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).send({message: 'Invalid authorization header', code: 21});
  }

  const token = bearer.split("Bearer ")[1].trim();
  let payload;
  try {
    //Verify the authenticity of a token
    payload = await verifyToken(token);
  } catch (e) {
    return res.status(401).send({message: 'Invalid token', code: 22});
  }

  //Selects a user with the id stored in the token payload
  try{

    const user = await pool
    .promise()
    .query(
      `SELECT users.id, users.name as name, email, roles.name as role FROM users INNER JOIN roles ON users.role_id = roles.id WHERE users.id = ?`,
      [payload.id]
    );
    if (user[0].length <= 0) {
      return res.status(401).send({message: 'Invalid user id', code: 23});
    }
    req.isAdmin = user[0][0].role === "admin";
    req.user = user[0][0];
    next();
  }catch (e) {
    return res.status(500).send({message: "Internal server error", code: 51})
  }

};

//Checks if the user is admin
//Requires the protect middleware to be called before
exports.protectAdmin = async (req, res, next) => {
  if (req.isAdmin) {
    next();
  } else {
    res.status(401).send({message: 'User is not an admin', code: 24});
  }
};

//Checks if 2 passwords match
exports.checkPassword = (password, passwordHash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        return reject(err);
      }
      resolve(same);
    });
  });
}

//Encrypts the provided password
exports.encryptPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 8, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}