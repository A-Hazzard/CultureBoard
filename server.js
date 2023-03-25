const express = require('express')
const session = require('express-session')
const cors = require('cors')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = express()
const port = 3001

const pool = mysql.createPool({
  host: '10.147.20.173',
  user: 'drgnstudio',
  password: 'password',
  database: 'drgn_studio',
})


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: '5aae85ef00ed4ec029b6933afcd6e10f85227438b82ea3a555d98ad64a01aedfb9cf8049cf5f9c8e1a568389e6f44c8799f01b7240a516c6074320154e81b449',
  resave: false,
  saveUninitialized: true
}));

//Password hasing function
async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}


app.post('/signup', async (request, response) => {
  const {username, email, password1, password2} = request.body;

  console.log(`Name: ${username}, Email: ${email}, Password: ${password1}`)

  // Check if username, email, or password are invalid 
  if (!username || !email || !password1 || !password2) return response.status(400).json({ error: 'Missing required field' });
  
  if(password2 != password1) return response.status(400).json({error: 'Passwords do not match'})

  const hashedPassword = await hashPassword(password1)

  pool.getConnection((error, connection) => {
    if (error) throw error;

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (errors, results) => {
      if (errors) {
        connection.release();
        console.error(errors);
        return response.status(500).json({ error: 'Internal server error' });
      }

      if (results.length > 0) {
        connection.release();
        console.log('Back End Email already exists')
        return response.status(409).json({ error: 'Email already exists' });
      }

      connection.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?);", [username, email, hashedPassword], (errors, result) => {
        connection.release();
        if (errors) {
          console.error(errors);
          return response.status(500).json({ error: 'Internal server error' });
        }

        console.log(`New user created with id: ${result.insertId} \nRegistered successfully` );
      });

      connection.query('SELECT * FROM users WHERE email = ?', [email], async (errors, users) =>{
        if(errors){
          console.error(errors)
          return response.status(500).json({ error: 'Internal server error' });
        }
  
        if(users == 0) return response.status(500).json({error: 'An unexpected error occurred. User not registered.'})


        const passwordMatch = await bcrypt.compare(password1, users[0].password)
  
        if (!passwordMatch) {
          return response.status(401).json({ error: 'Invalid Password' });
        }

        const user = {
          id: users[0].id,
          name: users[0].username,
          email: users[0].email,
          created_at: users[0].created_at   
        }
  
        const token = jwt.sign(user, '5aae85ef00ed4ec029b6933afcd6e10f85227438b82ea3a555d98ad64a01aedfb9cf8049cf5f9c8e1a568389e6f44c8799f01b7240a516c6074320154e81b449');
  
        console.log('Login successful')
        return response.status(200).json({message: 'Login successful', token, user})

      });

    });
  });
});

app.post('/login', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  // console.log(`Email: ${email}, Password: ${password}, isStaff: ${is_Staff}`)
  console.log(`Email: ${email}, Password: ${password}`)

   // Check if email or password is invalid 
   if (!email || !password) return response.status(400).json({ error: 'Missing required field' });
   
   pool.getConnection((error, connection) => {
    if(error) throw error;

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (errors, users) =>{
      if(errors){
        console.error(errors)
        return response.status(500).json({ error: 'Internal server error' });
      }

      if(users == 0) return response.status(500).json({error: 'Invalid Email'})

      const passwordMatch = await bcrypt.compare(password, users[0].password)
  
      if (!passwordMatch) {
        return response.status(401).json({ error: 'Invalid Password' });
      }

      const user = {
        id: users[0].id,
        name: users[0].username,
        email: users[0].email,
        created_at: users[0].created_at   
      }

      const token = jwt.sign(user, '5aae85ef00ed4ec029b6933afcd6e10f85227438b82ea3a555d98ad64a01aedfb9cf8049cf5f9c8e1a568389e6f44c8799f01b7240a516c6074320154e81b449');

      console.log(token)
      return response.status(200).json({message: 'Login successful',
        token: token,
        user: user
      })
    });
  });
});

app.post('/logout', (request, response) => {
  console.log('logging out user...')
  request.session.destroy((error) => {
    if (error) {
      console.log(error);
      response.status(500).json({ error: 'Internal server error' });
    } else {
      response.clearCookie('connect.sid');
      response.status(200).json({ message: 'Logout successful' });
    }
  });
});

app.post('/user', (request, response) => {
  const token = request.headers.authorization?.split(' ')[1]; // get the JWT token from the request headers
  
  if (!token) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, '5aae85ef00ed4ec029b6933afcd6e10f85227438b82ea3a555d98ad64a01aedfb9cf8049cf5f9c8e1a568389e6f44c8799f01b7240a516c6074320154e81b449');
    console.log(`Decoded token: ${JSON.stringify(decodedToken)}`);
    const user = {
      id: decodedToken.id,
      name: decodedToken.name,
      email: decodedToken.email,
      created_at: decodedToken.created_at   
    };
    console.log(`Found user ${user.name}`)
    
    return response.status(200).json({ user: user });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Internal server error' });
  }
});




app.listen(port, () => {
  console.log("NE1-FREELANCE server listening on port " + port);
});