const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors());

// Your MongoDB models and controllers
const { generateToken } = require('./src/configs/jwToken');
const User = require('./src/models/userModel');
const Product = require('./src/models/productModel');
const validateMongodbId = require('./src/utils/validateMongodbId');
const jwt = require('jsonwebtoken');

const createUser = async(req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    if (!findUser) {
        // Create a new user
        const newUser = await User.create(req.body);
        res.json(newUser)
    } else {
        // User already exists
        throw new Error('User Already Exists');
    }
};

const loginUser = async(req, res) =>{
    const {email, password} = req.body;
    // check if user exist or not
    const findUser = await User.findOne({email})
    if(findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const Updateuser = await User.findByIdAndUpdate(
        findUser.id, 
        {
            refreshToken: refreshToken,
        }, 
        {
            new: true,
        }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            dateOfBirth: findUser?.dateOfBirth,
            department: findUser?.department,
            salary: findUser?.salary,
            email: findUser?.email,
            hireDate: findUser?.hireDate,
            jobTitle: findUser?.jobTitle,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
};

const loginAdmin = async(req, res) =>{
    const {email, password} = req.body;
    // check if user exist or not
    const findAdmin = await User.findOne({email})
    if(findAdmin.role !== 'admin') throw new Error('Not Authorised');
    if(findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const UpdateAdmin = await User.findByIdAndUpdate(
        findAdmin.id, 
        {
            refreshToken: refreshToken,
        }, 
        {
            new: true,
        }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            dateOfBirth: findAdmin?.dateOfBirth,
            department: findAdmin?.department,
            salary: findAdmin?.salary,
            email: findAdmin?.email,
            hireDate: findAdmin?.hireDate,
            jobTitle: findAdmin?.jobTitle,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
};
;
  const updateUser = async (req, res) => {
    const {_id} = req.user;
    validateMongodbId(_id)
    try {
        const UpdateaUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            dateOfBirth: req?.body?.dateOfBirth,
            department: req?.body?.department,
            salary: req?.body?.salary,
            email: req?.body?.email,
            hireDate: req?.body?.hireDate,
            jobTitle: req?.body?.jobTitle,
            mobile: req?.body?.mobile,
        },
        {
            new: true,
        }
        );
        res.json(UpdateaUser)
    } catch (error) {
        throw new Error(error);
    }
};

const getUsers = async(req, res) =>{
    try {
       const getUsers = await User.find();
       res.json(getUsers);
       }
     catch (error) {
           throw new Error(error)
       }
   };

   const getUser = async(req, res) => {
    const {id} = req.params;
    validateMongodbId(id)
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })
    } catch (error) {
        throw new Error(error);
    }
};

const deleteUser = async(req, res) => {
    const {id} = req.params;
    validateMongodbId(id)
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    } catch (error) {
        throw new Error(error);
    }
};

const createProduct = async (req, res) => {
    try {
      if (req.body.title) {
        req.body.slug = slugify(req.body.title);
      }
      const newProduct = await Product.create(req.body);
      res.json(newProduct);
    } catch (error) {
      throw new Error(error);
    }
  };
  
  const updateProduct = async (req, res) => {
      const id = req.params.id; // Corrected
    
      try {
        if (req.body.title) {
          req.body.slug = slugify(req.body.title);
        }
    
        // Update data, specifying the unique identifier
        const updateProduct = await Product.findOneAndUpdate(
          { _id: id },     // Corrected filter using _id
          req.body,
          { new: true }
        );
    
        if (!updateProduct) {
          return res.status(404).json({ message: "Product not found" });
        }
    
        res.json(updateProduct);
      } catch (error) {
        throw new Error(error);
      }
    };
    
  
  const deleteProduct = async (req, res) => {
    const id = req.params.id;
    validateMongodbId(id);
    try {
      const deleteProduct = await Product.findOneAndDelete({_id: id});
      res.json(deleteProduct);
    } catch (error) {
      throw new Error(error);
    }
  };
  
  const getProduct = async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
      const findProduct = await Product.findById(id);
      res.json(findProduct);
    } catch (error) {
      throw new Error(error);
    }
  };
  
  const getProducts = async (req, res) => {
    try {
      // Filtering
      const queryObj = { ...req.query };
      const excludeFields = ["page", "sort", "limit", "fields"];
      excludeFields.forEach((el) => delete queryObj[el]);
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      let query = Product.find(JSON.parse(queryStr));
  
      // Sorting
  
      if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
      } else {
        query = query.sort("-createdAt");
      }
  
      // limiting the fields
  
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
      } else {
        query = query.select("-__v");
      }
  
      // pagination
  
      const page = req.query.page;
      const limit = req.query.limit;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
      if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) throw new Error("This Page does not exists");
      }
      const product = await query;
      res.json(product);
    } catch (error) {
      throw new Error(error);
    }
  };

// Your GraphQL schema
const typeDefs = gql`
  type User {
    _id: ID
    firstname: String
    lastname: String
    dateOfBirth: String
    department: String
    salary: Number
    email: String
    hireDate: String
    jobTitle: String
    mobile: String
    role: String
    refreshToken: String
  }

  type Product {
    _id: ID
    productName: String!
    description: String!
    category: String!
    price: Number!
    quantityInStock: Number!
    manufacturer: String!
    supplier: String!
    dateAdded: String!
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
    getProduct(id: ID!): Product
    getProducts: [Product]
  }

  type Mutation {
    createUser(userInput: UserInput): User
    updateUser(id: ID!, userInput: UserInput): User
    deleteUser(id: ID!): User
    createProduct(productInput: ProductInput): Product
    updateProduct(id: ID!, productInput: ProductInput): Product
    deleteProduct(id: ID!): Product
    login(email: String!, password: String!): User
    logout: Boolean
    adminLogin(email: String!, password: String!): User
  }

  input UserInput {
    firstname: String!
    lastname: String!
    dateOfBirth: String!
    department: String!
    salary: Number!
    email: String!
    hireDate: String!
    jobTitle: String!
    mobile: String!
    role: String
    refreshToken: String
  }

  input ProductInput {
    productName: String!
    description: String!
    category: String!
    price: Float!
    quantityInStock: Float!
    manufacturer: String!
    supplier: String!
    dateAdded: String!
  }
`;


// Your GraphQL resolvers
const resolvers = {
    Query: {
      getUser: async (_, { id }) => User.findById(id),
      getUsers: async () => User.find(),
      getProduct: async (_, { id }) => Product.findById(id),
      getProducts: async () => Product.find(),
    },
    Mutation: {
      createUser: async (_, { userInput }) => User.create(userInput),
      updateUser: async (_, { id, userInput }) => User.findByIdAndUpdate(id, userInput, { new: true }),
      deleteUser: async (_, { id }) => {
        const deletedUser = await User.findByIdAndRemove(id);
        return deletedUser;
      },
      createProduct: async (_, { productInput }) => Product.create(productInput),
      updateProduct: async (_, { id, productInput }) => Product.findByIdAndUpdate(id, productInput, { new: true }),
      deleteProduct: async (_, { id }) => {
        const deletedProduct = await Product.findByIdAndRemove(id);
        return deletedProduct;
      },
      login: async (_, { email, password }) => loginUser({ body: { email, password } }),
      logout: async (req, res) => {
            const cookie = req.cookies;
            if (!cookie?.refreshToken) {
              throw new Error('No Refresh Token in Cookies');
            }
          
            const refreshToken = cookie.refreshToken;
          
            const user = await User.findOne({ refreshToken });
          
            if (!user) {
              res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
              });
              return res.sendStatus(204); // No Content
            }
          
            await User.findOneAndUpdate(
              { refreshToken: refreshToken }, // Corrected filter
              { refreshToken: '' },          // Update data
              { new: true }                  // Options, if needed
            );
          
            res.clearCookie('refreshToken', {
              httpOnly: true,
              secure: true,
            });
            res.sendStatus(204); // No Content

        return true;
      },
      adminLogin: async (_, { email, password }) => loginAdmin({ body: { email, password } }),
    },
  };
  

// Create an ApolloServer instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  // Wait for the server to start before applying middleware
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
