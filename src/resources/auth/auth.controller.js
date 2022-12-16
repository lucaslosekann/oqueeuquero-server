const {
  newToken, encryptPassword, checkPassword
} = require("../../utils/auth");
const pool = require("../../utils/db").pool;
const { signup, signin } = require("./auth.validation")



//Checks a email and password taking in a JSON in the model:
/*{
  "email":"lucas1losekann@gmail.com",
  "password":"*(&#geDASd8973A",
  }
  Returning a JWT
  */
exports.signin = async (req, res) => {
  //Define the invalid email/password response
  const invalid = {
    message: "Email or password is invalid",
    code: 12,
  };

  try {
    //Validates incoming data
    const data = await signin.validateAsync(req.body)

    //Checks if the user exists 
    const user = await pool
      .promise()
      .query(`SELECT users.name as name, email, password, roles.name as role, users.id as id FROM users
              INNER JOIN roles ON roles.id = users.role_id WHERE email = ?`, [
        data.email,
      ]);
    if (!user?.[0]?.[0]) {
      return res.status(401).send(invalid);
    }


    //Checks if the sent password and the database password match 
    const match = await checkPassword(data.password, user[0][0].password);
    if (!match) {
      return res.status(401).send(invalid);
    }


    //If the user exists and the password matches send a JWT token to the client
    const token = newToken(user[0][0].id);
    return res.status(201).send({
      token,
      user:{
        name: user[0][0].name,
        role: user[0][0].role
      }
    });
  } catch (e) {
    console.error(e)
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }
};



//Creates a new user taking in a JSON in the model:
/*{
  "email":"lucas1losekann@gmail.com",
  "password":"123456aA",
  "name": "Lucas",
}
  Returning a JWT
*/
exports.signup = async (req, res) => {
  
  let data;
  //Check if user exists with that email
  try {
    //Check if frontend sent all the necessary data
    data = await signup.validateAsync(req.body)
    let dbReponse = await pool
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [data.email]);
    let email = dbReponse[0];
    if (email.length > 0) {
      return res.status(400).send({
        message: `User already exists with that email`,
        code: 16,
      });
    }
  } catch (e) {
    if(e.isJoi) return res.status(400).send({message: e.details[0].message, code: 61})
    return res.status(500).send({message: "Internal server error", code: 51})
  }



  try {
    //Creates a hash of the password using bcrypt
    const passwordHash = await encryptPassword(data.password);



    let [user] = await pool
      .promise()
      .query(`INSERT INTO users(email, password, name, role_id)
      VALUES(?,?,?,(SELECT id FROM roles WHERE name='user'))`, [
        data.email,
        passwordHash,
        data.name,
      ]);
    //Creates a JWT token and send it to the server.
    const token = newToken(user.insertId);
    return res.status(201).send({
      token,
      user:{
        name: data.name,
        role: 'user'
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Internal server error",
      code: 51,
    });
  }
};