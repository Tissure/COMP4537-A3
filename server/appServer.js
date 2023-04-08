const mongoose = require("mongoose");
const express = require("express");
const { connectDB } = require("./connectDB.js");
const { populatePokemons } = require("./populatePokemons.js");
const { getTypes } = require("./getTypes.js");
const { handleErr } = require("./errorHandler.js");
const apiRecordModel = require("./apiRecordModel");
const recordAPI = require("./apiRecorder");
const morgan = require("morgan");
const cors = require("cors");


const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError,
  PokemonAuthError
} = require("./errors.js");

const { asyncWrapper } = require("./asyncWrapper.js");

const dotenv = require("dotenv");
dotenv.config();



const app = express();
// const port = 5000
var pokeModel = null;

const start = asyncWrapper(async () => {
  await connectDB({ "drop": false });
  const pokeSchema = await getTypes();
  // pokeModel = await populatePokemons(pokeSchema);
  pokeModel = mongoose.model('pokemons', pokeSchema);
});
start();

async function topUsersForEachEndpoint() {
  let query = {};
  try {
    query = await monitorModel
      .aggregate([{
        $group: {
          _id: { endpoint: "$endpoint", username: "$username" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.endpoint": 1,
          count: -1,
        },
      },
      {
        $group: {
          _id: "$_id.endpoint",
          usernames: {
            $push: { username: "$_id.username", count: "$count" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          endpoint: "$_id",
          usernames: {
            $slice: ["$usernames", 10],
          },
        },
      },
      ])
      .exec();
  } catch (err) {
    console.error(err.message);
    return {};
  }

  return query;
}

async function topUsersAfter(afterDay, beforeDay) {
  //afterDay format yyyy-mm-dd
  let query = {};
  try {
    query = await monitorModel
      .aggregate([{
        $match: {
          timeStamp: {
            $gte: util.convertToDate(afterDay),
            $lte: util.convertToDate(beforeDay)
          },
        },
      }, {
        $group: {
          _id: "$username",
          count: { $sum: 1 },
        },
      }, {
        $project: {
          _id: 0,
          username: "$_id",
          count: 1,
        },
      },])
      .exec();
  } catch (err) {
    console.error(err.message);
    return {};
  }

  return query;
}

async function endpointError() {
  let query = {};
  try {
    query = await monitorModel
      .aggregate([{
        $group: {
          _id: { endpoint: "$endpoint", errorType: "$errorType" },
          count: { $sum: 1 },
        },
      },

      {
        $group: {
          _id: "$_id.endpoint",
          errorTypes: { $push: "$_id.errorType" },
        },
      },

      {
        $project: {
          _id: 0,
          endpoint: "$_id",
          errorTypes: { $setUnion: "$errorTypes" },
        },
      },
      ])
      .exec();
  } catch (err) {
    console.error(err.message);
    return {};
  }

  return query;
}

async function errorsAfter(afterDay, beforeDay) {
  let query = {};
  try {
    query = await monitorModel.aggregate([{
      $match: {
        timeStamp: {
          $gte: util.convertToDate(afterDay),
          $lte: util.convertToDate(beforeDay)
        }
      }
    },
    {
      $group: {
        _id: "$errorType",
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        errorType: "$_id"
      }
    }
    ]);

  } catch (err) {
    console.error(err.message);
    return {};
  }

  return query;
}


app.use(express.json());
const jwt = require("jsonwebtoken");
// const { findOne } = require("./userModel.js")
const userModel = require("./userModel.js");

// app.use(morgan("tiny"))
app.use(morgan(":method"));

app.use(cors());


const authUser = asyncWrapper(async (req, res, next) => {
  // const token = req.body.appid
  const auth = req.header('Authorization');
  if (!auth) {
    // throw new PokemonAuthError("No Token: Please provide an appid query parameter.")
    throw new PokemonAuthError("No Token: Please provide the access token using the headers.");
  }
  const type = auth.split(" ")[0];
  if (type != "Bearer")
    throw new PokemonAuthError("Invalid Token. Log in again.");

  const token = auth.split(" ")[1];
  const userWithToken = await userModel.findOne({ authToken: token });
  if (!userWithToken) {
    throw new PokemonAuthError("Please Login.");
  }
  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch (err) {
    res.status(400);
    throw new PokemonAuthError("Invalid Token Verification. Log in again.");
  }
});

const authAdmin = asyncWrapper(async (req, res, next) => {
  const auth = req.header('Authorization');
  const token = auth.split(" ")[1];
  const user = await userModel.findOne({ authToken: token });
  if (user.role !== "admin") {
    throw new PokemonAuthError("Access denied");
  }
  next();
});

app.use(authUser); // Boom! All routes below this line are protected
app.get('/api/v1/pokemons', asyncWrapper(async (req, res) => {
  if (!req.query["count"])
    req.query["count"] = 10;
  if (!req.query["after"])
    req.query["after"] = 0;
  // try {
  const docs = await pokeModel.find({})
    .sort({ "id": 1 })
    .skip(req.query["after"])
    .limit(req.query["count"]);
  res.json(docs);
  // } catch (err) { res.json(handleErr(err)) }
}), recordAPI);

app.get('/api/v1/pokemon', asyncWrapper(async (req, res) => {
  // try {
  const { id } = req.query;
  const docs = await pokeModel.find({ "id": id });
  if (docs.length != 0) res.json(docs);
  else res.json({ errMsg: "Pokemon not found" });
  // } catch (err) { res.json(handleErr(err)) }
}), recordAPI);

// app.get("*", (req, res) => {
//   // res.json({
//   //   msg: "Improper route. Check API docs plz."
//   // })
//   throw new PokemonNoSuchRouteError("");
// })

app.use(authAdmin);
app.post('/api/v1/pokemon/', asyncWrapper(async (req, res) => {
  // try {
  // console.log(req.body);
  if (!req.body.id) throw new PokemonBadRequestMissingID();
  const poke = await pokeModel.find({ "id": req.body.id });
  if (poke.length != 0) throw new PokemonDuplicateError();
  const pokeDoc = await pokeModel.create(req.body);
  res.json({
    msg: "Added Successfully"
  });
  // } catch (err) { res.json(handleErr(err)) }
}), recordAPI);

app.delete('/api/v1/pokemon', asyncWrapper(async (req, res) => {
  // try {
  const docs = await pokeModel.findOneAndRemove({ id: req.query.id });
  if (docs)
    res.json({
      msg: "Deleted Successfully"
    });
  else
    // res.json({ errMsg: "Pokemon not found" })
    throw new PokemonNotFoundError("");
  // } catch (err) { res.json(handleErr(err)) }
}), recordAPI);

app.put('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  // try {
  const selection = { id: req.params.id };
  const update = req.body;
  const options = {
    new: true,
    runValidators: true,
    overwrite: true
  };
  const doc = await pokeModel.findOneAndUpdate(selection, update, options);
  // console.log(docs);
  if (doc) {
    res.json({
      msg: "Updated Successfully",
      pokeInfo: doc
    });
  } else {
    // res.json({ msg: "Not found", })
    throw new PokemonNotFoundError("");
  }
  // } catch (err) { res.json(handleErr(err)) }
}), recordAPI);

app.patch('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  // try {
  const selection = { id: req.params.id };
  const update = req.body;
  const options = {
    new: true,
    runValidators: true
  };
  const doc = await pokeModel.findOneAndUpdate(selection, update, options);
  if (doc) {
    res.json({
      msg: "Updated Successfully",
      pokeInfo: doc
    });
  } else {
    // res.json({  msg: "Not found" })
    throw new PokemonNotFoundError("");
  }
  // } catch (err) { res.json(handleErr(err)) }
}), recordAPI);



// Get all users
app.get(
  "/api/v1/admin/uniqueUsers",
  asyncWrapper(async (req, res) => {
    // const { start, end } = req.query;
    const allLogs = await apiRecordModel.find({});
    const uniqueUsers = [...new Set(allLogs.map((log) => log.user))];
    res.json(uniqueUsers);
  })
);

// Top API users over a period of time
app.get(
  "/api/v1/admin/topUsers",
  asyncWrapper(async (req, res) => {
    // const { start, end } = req.query;
    const topUsers = await apiRecordModel
      .aggregate([
        // {
        //   $match: { timestamp: { $gte: new Date(start), $lte: new Date(end) } },
        // },
        { $group: { _id: "$user", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .limit(5);
    res.json(topUsers);
  })
);

// Top users for each endpoint
app.get(
  "/api/v1/admin/topUsersPerEndpoint",
  asyncWrapper(async (req, res) => {
    const topUsersPerEndpoint = await apiRecordModel.aggregate([
      {
        $group: {
          _id: { user: "$user", endpoint: "$endpoint" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    res.json(topUsersPerEndpoint);
  })
);

// 4xx Errors By Endpoint
app.get(
  "/api/v1/admin/errorsByEndpoint",
  asyncWrapper(async (req, res) => {
    const errorsByEndpoint = await apiRecordModel.aggregate([
      { $match: { status: { $gte: 400, $lt: 500 } } },
      { $group: { _id: "$endpoint", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(errorsByEndpoint);
  })
);

// Recent 4xx/5xx Errors
app.get(
  "/api/v1/admin/recentErrors",
  asyncWrapper(async (req, res) => {
    const recentErrors = await apiRecordModel
      .find({
        status: { $gte: 400 },
      })
      // .populate("user", "username")
      .sort({ timestamp: -1 })
      .limit(10);
    console.log("recentErrors: ", recentErrors);
    res.json(recentErrors);
  })
);


app.use(handleErr);

module.exports = app;