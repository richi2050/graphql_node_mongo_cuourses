const graphql = require('graphql')
const Course = require('../models/course')
const Professor = require('../models/professor')
const User = require('../models/user')
const {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLBoolean, GraphQLList,  GraphQLSchema} = graphql
const bcrypt = require('bcrypt')
const auth = require('../utils/auth')

/*
var courses = [
  {id: '1', name: 'curso 1', language: 'len 1', date: '2020', professorId:'1'},
  {id: '2', name: 'curso 2', language: 'len 2', date: '2020', professorId:'4'},
  {id: '3', name: 'curso 3', language: 'len 3', date: '2020', professorId:'5'},
  {id: '4', name: 'curso 4', language: 'len 4', date: '2020', professorId:'4'},
  {id: '5', name: 'curso 5', language: 'len 5', date: '2020', professorId:'5'},
  {id: '6', name: 'curso 6', language: 'len 6', date: '2020', professorId:'3'},
  {id: '7', name: 'curso 7', language: 'len 7', date: '2020', professorId:'2'},
]

var professors = [
  {id: '1', name: 'profesor 1', age: 21 , active: true, date: '2020'},
  {id: '2', name: 'profesor 2', age: 21 , active: true, date: '2020'},
  {id: '3', name: 'profesor 3', age: 21 , active: true, date: '2020'},
  {id: '4', name: 'profesor 4', age: 21 , active: true, date: '2020'},
  {id: '5', name: 'profesor 5', age: 21 , active: true, date: '2020'},
]

var users = [
  { id: '1', name: 'user 1', email: 'correo', password: '12354',date: '2020'},
  { id: '2', name: 'user 2', email: 'correo', password: '12354',date: '2020'},
  { id: '3', name: 'user 3', email: 'correo', password: '12354',date: '2020'},
  { id: '4', name: 'user 4', email: 'correo', password: '12354',date: '2020'},
  { id: '5', name: 'user 5', email: 'correo', password: '12354',date: '2020'},
]
*/

const CourseType = new GraphQLObjectType({
  name: 'Course',
  fields: () => ({
    id: {type:GraphQLID},
    name: {type:GraphQLString},
    language: {type:GraphQLString},
    date: {type:GraphQLString},
    professor:{
      type: ProfessorType,
      resolve(parent, args){
        return Professor.findById(parent.professorId)
        //return professors.find(profesor => profesor.id === parent.professorId)
      }
    }
  })
})

const ProfessorType = new GraphQLObjectType({
  name: 'Professor',
  fields: () => ({
    id: {type:GraphQLID},
    name: {type:GraphQLString},
    age: {type:GraphQLInt},
    active: {type:GraphQLBoolean},
    date: {type:GraphQLString},
    course:{
      type: new GraphQLList(CourseType),
      resolve(parent, args){
        //return courses.filter(curso => curso.professorId === parent.id)
        return Course.find({professorId: args.id})
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: ()=>({
      id: {type: GraphQLID},
      name: {type: GraphQLString},
      email: {type: GraphQLString},
      password: {type: GraphQLString},
      date: {type: GraphQLString}
  })
})

const MessageType = new GraphQLObjectType({
  name:'Message',
  fields: () =>({
    message: { type: GraphQLString},
    token: { type: GraphQLString},
    error: { type: GraphQLString}
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    course: {
      type: CourseType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args, context){
        console.log('el contesto es ')
        console.log(context)
        //return courses.find(curso => curso.id === args.id)
        if(!context.user.auth){
          throw new Error('Unauthenticated .......')
        }
        return Course.findById(args.id)
      }
    },

    courses: {
      type: new GraphQLList(CourseType),
      resolve(parent, args){
        //return courses
        return Course.find()

      }
    },
    professor: {
      type: ProfessorType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args){
        //return professors.find(profesor => profesor.id === args.id)
        return Professor.findById(args.id)
      }
    },
    professors: {
      type: new GraphQLList(ProfessorType),
      resolve(parent, args){
          //return professors
          return Professor.find()
      }
    },
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLID }
      },
      resolve(parent, args){
        return users.find(user => user.id === args.id)
      }
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addCourse:{
      type: CourseType,
      args:{
        name: { type : GraphQLString },
        language: { type : GraphQLString },
        date: { type : GraphQLString },
        professorId: {type: GraphQLID}
      },
      resolve(parent, args){
        let course = new Course({
          name: args.name,
          language: args.language,
          date: args.date,
          professorId: args.professorId
        })
        return course.save()
      }
    },
    updateCourse:{
      type: CourseType,
      args:{
        id: { type: GraphQLID},
        name: { type : GraphQLString },
        language: { type : GraphQLString },
        date: { type : GraphQLString },
        professorId: {type: GraphQLID}
      },
      resolve(parent, args){
        return Course.findByIdAndUpdate(
          args.id,
          {
            name: args.name,
            language: args.language,
            date: args.date,
            professorId: args.professorId
          },
          {
            new: true
          }
        )
      }
    },
    deleteCourse:{
      type: CourseType,
      args:{
        id: { type: GraphQLID}
      },
      resolve(parent, args){
        return Course.findByIdAndDelete(args.id)
      }
    },
    deleteCourses:{
      type: CourseType,
      resolve(parent, args){
        return Course.deleteMany({})
      }
    },
    addProfessor:{
      type: ProfessorType,
      args:{
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        active: {type: GraphQLBoolean},
        date: {type: GraphQLString}
      },
      resolve(parent, args){
        return Professor(args).save()
      }
    },
    updateProfessor:{
        type: ProfessorType,
        args:{
            id:{type: GraphQLID},
            name: {type: GraphQLString},
            age: {type: GraphQLInt},
            active: {type: GraphQLBoolean},
            date: {type: GraphQLString}
        },
        resolve(parent, args){
            return Professor.findByIdAndUpdate(args.id,{
                name: args.name,
                age: args.age,
                active: args.active,
                date: args.date
            },
            {
                new: true
            })
        }
    },
    deleteProfessor:{
        type: ProfessorType,
        args: {
            id: {type: GraphQLID}
        },
        resolve(parent, args){
            return Professor.findByIdAndDelete(args.id)
        }
    },
    addUser:{
      type: MessageType,
      args:{
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        date: {type: GraphQLString}
      },
      async resolve(parent, args){
        let user = await User.findOne({email:args.email})
        if(user) return {error: 'Usuario ya esta en la base de datos'}
          const salt = await bcrypt.genSalt(10)
          const hashPassword = await bcrypt.hash(args.password, salt)
          user = new User({
            name: args.name,
            email: args.email,
            date: args.date,
            password: hashPassword
          })
          user.save()
          return {message: 'Usuario registardo correcatmente'}
      }
    },
    login:{
      type: MessageType,
      args:{
        email: { type: GraphQLString },
        password: { type: GraphQLString }
      },
      async resolve(parent, args){
        const result = await auth.login(args.email, args.password,'1234')
        return {
          message: result.message,
          error: result.error,
          token: result.token
        }
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})