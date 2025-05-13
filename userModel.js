const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
   password: {
        type: String,
        required: true
    },
    above18: {
        type: Boolean,
        required: true,
        default: false
    },
    walletBalance: {
        type: Number,
        required: true,
        default: 0
    },
    nickName: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        required: true,
        enum: ["user", "admin", "agent" ],
        default: "user"
    },
    gender: {
        type: String,
        // required: true,
        // enum: ["male", "female", "prefer not to say" ],
        default: ""
    },
    country: {
        type: String,
        // required: true,
        default: ""
    },
    interests: {
        type: Array,
        // required: true,
        // enum: [ "football", "cricket", "basket ball", "tennis" ],
        default: []
    }
}, 

{timestamps: true}

)

const User = mongoose.model("User", userSchema)

module.exports = User

