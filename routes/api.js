'use strict';
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient

const URI = process.env.MONGO_URI
const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true })

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
      async function run() {
        try {
          await client.connect()
          const projectIssues = client.db('issue_tracker').collection(project)
          const doc = {
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            status_text: req.body.status_text
          }
          const result = await projectIssues.insertOne(doc)
          res.json(result)
        } finally {
          await client.close()
        }
      }

      if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
        run().catch(console.dir)
      } else {
        res.json({error: 'Fill all required fields.'})
      }
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
