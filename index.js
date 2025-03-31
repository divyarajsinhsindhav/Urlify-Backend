require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')

const indexRouter = require('./routes/index.routes')  
const apiRouter = require('./routes/v1.routes')

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allows cookies & authentication headers
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
}))
app.use(morgan('dev'))
app.use('/', indexRouter)
app.use('/api/v1', apiRouter)

mongoose.connect(process.env.DATABASE_URL)
        .then(() => console.log('Mongoose connected to ' + process.env.DATABASE_URL))
        .catch((e) => console.error('Mongoose connection error: ' + e))

app.use("*", (req, res) => {
    res.status(404).send("404 Error")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
