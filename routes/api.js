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

      if (!req.body._id) {
        res.json({
          error: 'missing _id'
        })
      } else {
        if (Object.keys(req.body).length === 1) {
        res.json({
            error: 'no update field(s) sent',
            _id: req.body._id
          })
        } else {
          try {
            let index
            let issues = db[project]
            let idToUpdate = new ObjectId(req.body._id)
            for (let i = 0; i < issues.length; i++) {
              if (issues[i]._id.equals(idToUpdate)) {
                index = i
                break
              }
            }

            if (index === undefined) {
              throw Error('_id not in the database')
            } else {
              for (let prop of Object.keys(req.body)) {
                if (prop !== '_id') {
                  issues[index].prop = req.body[prop]
                }
              }
              issues[index].updated_on = new Date()

              res.json({
                result: 'successfully updated',
                _id: req.body._id
              })
            }
          } catch (err) {
            res.json({
              error: 'could not update',
              _id: req.body._id
            })
          }
        }
      }
    })

    .delete(function (req, res) {
      let project = req.params.project;

      if (!req.body._id) {
        res.json({
          error: 'missing _id'
        })
      } else {
        try {
          let index
          let issues = db[project]
          let idToDelete = new ObjectId(req.body._id)
          for (let i = 0; i < issues.length; i++) {
            if (issues[i]._id.equals(idToDelete)) {
              index = i
              break
            }
          }

          if (index === undefined) {
            throw Error('_id not in the database')
          } else {
            issues.splice(index, 1)

            res.json({
              result: 'successfully deleted',
              _id: req.body._id
            })
          }
        } catch (err) {
          res.json({
            error: 'could not delete',
            _id: req.body._id
          })
        }
      }      
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
