const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const CategorySchema = new Schema({

    main: {
        type: String
    },
    date: [{
        type: Date,
        default: Date.now()
    }],
    sub: [{
        name: {
            type: String
        }
    }],


});


module.exports = Category = mongoose.model("category", CategorySchema);
