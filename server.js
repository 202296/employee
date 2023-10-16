const express = require('express');
const dbConnect = require('./src/configs/connectMongodb');
const app = express();
const cors = require('cors');

const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 5500;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const authRouter = require('./src/routes/authRoute');
const productRouter = require('./src/routes/productRoute')
const swaggerUi = require('swagger-ui-express');

// Use the JavaScript Swagger definition
const authSwaggerDefinition = require('./authSwagger.json');
const proSwaggerDefinition = require('./proSwagger.json');

// Serve Swagger UI at /docs
app.use('/api-prodDocs', swaggerUi.serve, swaggerUi.setup(proSwaggerDefinition));
app.use('/api-authDocs', swaggerUi.serve, swaggerUi.setup(authSwaggerDefinition));
const { notFound, errorHandler } = require('./src/middlewares/errorHandler');

dbConnect()

app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())


app.use('/api/user', authRouter);
app.use('/api/product', productRouter);


app.use(errorHandler)
app.use(notFound);


app.listen(PORT, ()=>{
    console.log(`Server is running at PORT ${PORT}`);
})
