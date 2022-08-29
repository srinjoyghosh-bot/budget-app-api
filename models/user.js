const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  budget: {
    type: String,
    default: '0',
  },
  transactions:[
    {
        type:Schema.Types.ObjectId,
        ref:'Transaction'
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
