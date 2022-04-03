//importing db
const mongoose = require('mongoose');
//importing config
const dotenv = require('dotenv');

/*process.on('uncaughtException', err => {
    console.log('Uncaught Exception...Shutting down');
    console.log(err.name, err.message);
    process.exit(1);
});
*/
dotenv.config({
    path: './config.env'
});
// importing modules
const app = require('./app');

const DB = process.env.DATABASE_ATLAS.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('Database is connected...'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App is listening on port ${port}...`);
})
/*
/*
process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection... Shutting down');
    cosnole.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    })
});*/