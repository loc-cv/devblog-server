import config from 'config';
import mongoose from 'mongoose';

const dbUrl = config
  .get<string>('dbUrl')
  .replace('<password>', config.get<string>('dbPassword'));

const connectDb = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connect to Database successfully.');
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDb, 5000);
  }
};

export default connectDb;
