const mongoose = require("mongoose");
const express = require("express");
const { connectDB } = require("./connectDB.js");
const { populatePokemons } = require("./populatePokemons.js");
const { getTypes } = require("./getTypes.js");
const { handleErr } = require("./errorHandler.js");
const morgan = require("morgan");
const cors = require("cors");

const { asyncWrapper } = require("./asyncWrapper.js");

const dotenv = require("dotenv");
dotenv.config();

const auth = require('./authServer.js');
const app = require('./appServer.js');

let authServer, appServer;

const start = asyncWrapper(async () => {
    await connectDB({ "drop": false });
    // const pokeSchema = await getTypes();
    // // pokeModel = await populatePokemons(pokeSchema);
    // pokeModel = mongoose.model('pokemons', pokeSchema);
    // console.log("Listening");
    authServer = auth.listen(process.env.authServerPORT, async (err) => {
        if (err)
            throw new PokemonDbError(err);
        else
            console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
        //     const doc = await userModel.findOne({ "username": "admin" })
        //     if (!doc)
        //         userModel.create({ username: "admin", password: bcrypt.hashSync("admin", 10), role: "admin", email: "admin@admin.ca" })
    });

    appServer = app.listen(process.env.pokeServerPORT, (err) => {
        if (err)
            throw new PokemonDbError(err);
        else
            console.log(`Phew! Server is running on port: ${process.env.pokeServerPORT}`);
    });
    return;
});
const shutdown = function () {
    authServer.close();
    appServer.close();
};
module.exports = { start, shutdown, auth, app };