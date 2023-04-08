const express = require("express");
const { handleErr } = require("./errorHandler.js");
const { asyncWrapper } = require("./asyncWrapper.js");
const dotenv = require("dotenv");
dotenv.config();
const userModel = require("./userModel.js");
const { connectDB } = require("./connectDB.js");
const cors = require("cors");


const {
  PokemonBadRequest,
  PokemonDbError,
  PokemonAuthError
} = require("./errors.js");

const app = express();

const start = asyncWrapper(async () => {
  await connectDB({ "drop": false });


  // app.listen(process.env.authServerPORT, async (err) => {
  //   if (err)
  //     throw new PokemonDbError(err);
  //   else
  //     console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
  const doc = await userModel.findOne({ "username": "admin" });
  if (!doc)
    userModel.create({ username: "admin", password: bcrypt.hashSync("admin", 10), role: "admin", email: "admin@admin.ca" });
  // });
});
start();

app.use(express.json());
app.use(cors({
  exposedHeaders: ['auth-token-access', 'auth-token-refresh', 'Authorization']
}));

const bcrypt = require("bcrypt");
app.post('/register', asyncWrapper(async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !email || !password)
    throw new PokemonBadRequest("Missing fields");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userWithHashedPassword = { ...req.body, password: hashedPassword };
  try {
    const user = await userModel.create(userWithHashedPassword);
    res.send(user);
  } catch (error) {
    throw new PokemonBadRequest("Username already exists");
  }

}));

const jwt = require("jsonwebtoken");
app.post('/requestNewAccessToken', asyncWrapper(async (req, res) => {
  // console.log(req.headers);
  const auth = req.header('Authorization');
  if (!auth) {
    throw new PokemonAuthError("No Token: Please provide a token.");
  }

  const type = auth.split(" ")[0];
  const refreshToken = auth.split(" ")[1];
  const user = await userModel.findOne({ refreshToken });
  if (type != "Refresh" || !user) {
    // console.log("token: ", refreshToken);
    // console.log("refreshTokens", refreshToken);
    throw new PokemonAuthError("Invalid Token: Please provide a valid token.");
  }
  if (user.token_invalid) {
    throw new PokemonAuthError("Expired Token: Please login again.");
  }

  try {
    const payload = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ user: payload.user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2s' });
    res.header('Authorization', `Bearer ${accessToken}`);
    res.status(200).send("All good!");
  } catch (error) {
    throw new PokemonAuthError("Invalid Token: Please provide a valid token.");
  }
}));

app.post('/login', asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (!user)
    throw new PokemonAuthError("User not found");

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect)
    throw new PokemonAuthError("Password is incorrect");


  // if (!user.authToken) {
  const accessToken = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
  res.header('auth-token-access', accessToken);
  await userModel.updateOne({ username }, { authToken: accessToken });
  // } else {
  //   res.header('auth-token-access', user.authToken);
  // }

  if (!user.refreshToken) {
    const refreshToken = jwt.sign({ user: user }, process.env.REFRESH_TOKEN_SECRET);
    res.header('auth-token-refresh', refreshToken);

    await userModel.updateOne({ username }, { refreshToken: refreshToken });
  } else {
    res.header('auth-token-refresh', user.refreshToken);
  }
  const updatedUser = await userModel.findOneAndUpdate({ username }, { "token_invalid": false });
  res.send(user);
}));


app.get('/logout', asyncWrapper(async (req, res) => {
  const auth = req.header('Authorization');
  // const type = auth.split(" ")[0];
  const token = auth.split(" ")[1];

  const user = await userModel.findOne({ authToken: token });
  if (user) {
    // throw new PokemonAuthError("User not found");
    await userModel.updateOne({ token_invalid: true });
  }
  res.send("Logged out");
}));

app.use(handleErr);
module.exports = app;