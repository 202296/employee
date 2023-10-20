const express = require('express');
const dbConnect = require('./src/configs/connectMongodb');
const app = express();
const dotenv = require('dotenv').config();
const swaggerUi = require('swagger-ui-express');;
const PORT = process.env.PORT || 5500;
const authRouter = require('./src/routes/authRoute');
const productRouter = require('./src/routes/productRoute')
const blogRouter = require("./src/routes/blogRoute");
const colorRouter = require("./src/routes/colorRoute");
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./src/middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
dbConnect()

// Use the JavaScript Swagger definition
const swaggerDefinition = require('./swagger.json');
// Serve Swagger UI at /docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDefinition));


app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/color", colorRouter);


app.use(notFound);
app.use(errorHandler)

app.listen(PORT, ()=>{
    console.log(`Server is running at PORT ${PORT}`);
})