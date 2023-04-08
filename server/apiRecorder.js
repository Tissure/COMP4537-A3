const apiRecordModel = require("./apiRecordModel");
const userModel = require("./userModel.js");
const mongoose = require("mongoose");

const recordAPI = async (statusCode, req, res, next) => {
    if (typeof statusCode !== "number") {
        return next(statusCode);
    }

    await mongoose.connect(process.env.DB_STRING);
    let apiRecord = {
        endpoint: req._parsedUrl.pathname,
        date: Date.now(),
        statusCode: statusCode,
        method: req.method,
    };

    if (req.header('Authorization')) {
        const auth = req.header('Authorization');
        const token = auth.split(" ")[1];
        const user = await userModel.findOne({ authToken: token });
        apiRecord["userId"] = user.id;
    }

    await apiRecordModel.create(apiRecord);
};

module.exports = recordAPI;