const mongoose = require('mongoose');

async function connectDB() {
  console.log("Try to connect with mongoDB...");
  try {
    await mongoose.connect(
      "mongodb://mongo/pompier?retryWrites=true&w=majority",
      {
        useNewUrlParser: true
      }
    );

    console.log('MongoDB is connected.');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = {connectDB}