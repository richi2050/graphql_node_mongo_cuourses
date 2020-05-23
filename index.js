const express = require('express')
const graphlHTTP = require('express-graphql')
const schema = require('./schema/schema');
const mongoose = require('mongoose')
const auth = require('./utils/auth')

mongoose.connect('mongodb://admin:admin-123@ds143461.mlab.com:43461/grapql_node_course', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify:false
})
.then(() => console.log('conectado a mongo'))
.catch(error => console.log('error mongoDB'))

const app = express()

app.use(
  auth.checkHeaders
)
app.use('/graphql', graphlHTTP((req)=>{
  return{
    schema,
    graphiql: true,
    context: {
      user: req.user
    }
  }
}))


app.get('/', function (req, res) {
  res.send('Hello World')
})



app.listen(3000, () => {
  console.log('esta en el puerto 3000')
})