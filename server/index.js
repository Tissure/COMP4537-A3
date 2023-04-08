
const { connectDB } = require("./connectDB.js");


const dotenv = require("dotenv");
dotenv.config();

const auth = require('./authServer.js');
const app = require('./appServer.js');

const start = async () => {

    await connectDB({ "drop": false });
    // const pokeSchema = await getTypes();
    // // pokeModel = await populatePokemons(pokeSchema);
    // pokeModel = mongoose.model('pokemons', pokeSchema);
    // console.log("Listening");
    auth.listen(process.env.authServerPORT, async (err) => {
        if (err)
            throw new PokemonDbError(err);
        else
            console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
        //     const doc = await userModel.findOne({ "username": "admin" })
        //     if (!doc)
        //         userModel.create({ username: "admin", password: bcrypt.hashSync("admin", 10), role: "admin", email: "admin@admin.ca" })
    });

    app.listen(process.env.pokeServerPORT, (err) => {
        if (err)
            throw new PokemonDbError(err);
        else
            console.log(`Phew! Server is running on port: ${process.env.pokeServerPORT}`);
    });
};
start();

