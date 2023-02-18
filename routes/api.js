'use strict';

const { ObjectId } = require('mongodb')

let db = {}

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;

      if (!db.hasOwnProperty(project)) {
        db[project] = []
        res.json([])
      } else {
        if (Object.keys(req.query).length === 0) {
          res.json(db[project])
        } else {
          let issues = db[project].slice(0)

          let filters = Object.keys(req.query)

          filters.forEach(filter => {
            let drop = []
            for (let i = 0; i < issues.length; i++) {
              if (req.query[filter] != issues[i][filter]) drop.push(i)
            }

            for (let i = drop.length - 1; i >= 0; i--) {
              issues.splice(drop[i], 1)
            }
          })
          res.json(issues)
        }
      }
    })

    .post(function (req, res) {
      let project = req.params.project;

      if (!db.hasOwnProperty(project)) db[project] = []

      if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
        if (!req.body.assigned_to) req.body.assigned_to = ''
        if (!req.body.status_text) req.body.status_text = ''
        req.body.created_on = new Date()
        req.body.updated_on = new Date()
        req.body.open = true
        req.body._id = new ObjectId()

        db[project].push(req.body)

        res.json(req.body)
      } else {
        res.json({
          error: 'required field(s) missing'
        })
      }
    })

    .put(function (req, res) {
      let project = req.params.project;

    })

    .delete(function (req, res) {
      let project = req.params.project;

    });

  app.route('/dump/db')

    .get(function (req, res) {
      db = {}
      console.log('db dumped')

      res.json({
        message: 'db dumped'
      })
    })
};
