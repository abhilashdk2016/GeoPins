const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
require('dotenv').config();
const { findOrCreateUser } = require('./controllers/userController');

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true }).then(_ => console.log("DB Connected")).catch(error => console.error(error));

const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: async ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
      authToken = req.headers.authorization;
      if(authToken) {
        currentUser = await findOrCreateUser(authToken);
      }
    } catch (error) {
      console.log(error);
      console.log(`Unable to authenticate user with token ${authToken}`)
    }
    return { currentUser }
  }
});

server.listen().then(({ url }) => console.log(url));
