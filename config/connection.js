// const mongoClinet=require('mongodb').MongoClient
const mongodb=require('mongodb')
const { get } = require('../app')
const mongoClient=mongodb.MongoClient

const state={db:null}

const connect = (done) => {
   const url='mongodb://localhost:27017'
   const dbname='shoping'

   mongoClient.connect(url,(err,data)=>{
      
      if(err) 
      return done(err)
      state.db = data.db(dbname)
      done()
   })
   
}

module.exports.connect = connect;


module.exports.get=function(){
   return state.db
}   
