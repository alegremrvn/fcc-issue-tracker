'use strict';

require('dotenv').config()
const { MongoClient } = require('mongodb')
const uri = process.env['MONGO_URI']

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;

      const client = new MongoClient(uri)

      async function run() {
        try {
          await client.connect()
          const issues = client.db('test').collection('issues')

          req.query.project_name = project
          const proj_issues = issues.find(req.query)

          const output = []
          await proj_issues.forEach(issue => {
            delete issue.project_name
            output.push(issue)
          })

          res.json(output)
        } finally {
          await client.close()
        }
      }
      run().catch(console.dir)
    })

    .post(function (req, res) {
      let project = req.params.project;

      const client = new MongoClient(uri)

      async function run() {
        try {
          await client.connect()
          const issues = client.db('test').collection('issues')

          if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
            if (!req.body.assigned_to) req.body.assigned_to = ''
            if (!req.body.status_text) req.body.status_text = ''
            req.body.created_on = new Date()
            req.body.updated_on = new Date()
            req.body.open = true
            req.body.project_name = project

            const insertResult = await issues.insertOne(req.body)

            if (insertResult.acknowledged === true) {
              delete req.body.project_name
              res.json(req.body)
            } else {
              res.json({
                error: 'unable to create an issue at the moment'
              })
            }
          } else {
            res.json({
              error: 'required field(s) missing'
            })
          }
        } finally {
          client.close()
        }
      }
      run().catch(console.dir)
    })

    .put(function (req, res) {
      let project = req.params.project;

    })

    .delete(function (req, res) {
      let project = req.params.project;

    });

};
