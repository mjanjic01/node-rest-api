/* eslint-disable no-console, global-require, import/no-extraneous-dependencies */

const mongoose = require('mongoose');
const chalk = require('chalk');

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
    .then(({ db: { databaseName } }) => console.log(`${chalk.green('✓')} Connected to mongodb: ${databaseName}`));
} else {
  const { Mockgoose } = require('mockgoose');
  const mockgoose = new Mockgoose(mongoose);

  mockgoose.prepareStorage().then(() => {
    mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
      .then(({ db: { databaseName } }) => console.log(`${chalk.green('✓')} Connected to in-memory mongodb: ${databaseName}`));
  });
}

mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

module.exports = mongoose;
