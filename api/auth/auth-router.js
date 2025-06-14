const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Auth = require('./auth-model');


router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log("Register Attempt:", username);

    if(!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const existingUsers = await Auth.findBy({ username }).first();
    console.log('Existing User Register:', existingUsers);

    if(existingUsers) {
      return res.status(400).json({ message: "username taken"});
    }

    const hash = bcrypt.hashSync(password, 8);
    const newUser = await Auth.addUser({ username, password: hash });
    console.log("New User:", newUser);

    res.status(201).json(newUser)
  } catch(err) {
    console.log("Register Error:", err);
    next(err);
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  
});

router.post('/login', async(req, res, next) => {
  try {
    const { username, password} = req.body;
    
    if(!username || !password) {
      return res.status(400).json({ message: "username and password required"});
    }

    const [user] = await Auth.findBy({ username });

    if(user && bcrypt.compareSync(password, user.password)) {
      const token = Auth.buildToken(user);
      res.status(200).json({ message: `Welcome, ${username}`, token })
    } else {
      res.status(400).json({ message: 'invalid credentials' })
    }
    // const { username, password } = req.body;
    // console.log("Login Attempt:", username);


    // const existingUsers = await Auth.findBy({ username }).first();
    // console.log("Existing User Login:", existingUsers);

    // if(!existingUsers) {
    //   return res.status(400).json({ message: "invalid credentials" });
    // }

    // const validatePassword = bcrypt.compareSync(password, existingUsers.password);
    // console.log("Validating Password on Login:", validatePassword);

    // if(!validatePassword) {
    //   return res.status(400).json({ message: "invalid credentials" });
    // }

    // const token = Auth.buildToken(existingUsers)

    // res.status(200).json({
    //   message: `Welcome, ${username}`,
    //   token
    // })
  } catch(err) {
    console.log("Login Error:", err)
    next(err)
  }
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

module.exports = router;
