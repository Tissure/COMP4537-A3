const { connectDB } = require("./connectDB.js");
const { asyncWrapper } = require("./asyncWrapper.js");

const dotenv = require("dotenv");
dotenv.config();

const auth = require('./authServer.js');
const app = require('./appServer.js');

let authServer, appServer;

const start = asyncWrapper(async () => {
    await connectDB({ "drop": false });

    authServer = auth.listen(process.env.authServerPORT, async (err) => {
        if (err)
            throw new PokemonDbError(err);
        else
            console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
    });

    appServer = app.listen(process.env.pokeServerPORT, (err) => {
        if (err)
            throw new PokemonDbError(err);
        else
            console.log(`Phew! Server is running on port: ${process.env.pokeServerPORT}`);
    });
});
start();