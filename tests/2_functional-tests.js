require('dotenv').config()
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient

chai.use(chaiHttp);

let URI = process.env.MONGO_URI
const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true })

suite('Functional Tests', function() {
  this.timeout(5000)
  this.beforeAll(function() {
    async function run() {
      try {
        await client.connect()
        const projectIssues = client.db('issue_tracker').collection('ourlibraries')
        let docs = [
          {
            _id: new ObjectId('634b7306d1852520da835db1'),
            created_by: 'asdf',
            open: true,
            issue_title: 'asdf',
            issue_text: 'asdf'
          }, 
          {
            _id: new ObjectId('634b7306d1852520da835db2'),
            created_by: 'asdf',
            open: true,
            issue_title: 'asdf',
            issue_text: 'asdf'
          },
          {
            _id: new ObjectId('634b7306d1852520da835db3'),
            created_by: 'asdf',
            open: true,
            issue_title: 'asdf',
            issue_text: 'asdf'
          }
        ]
        await projectIssues.insertMany(docs)
      } finally {
        await client.close()
      }
    }

    run().catch(console.dir)
  })

  suite('POST /api/issues/:project', function() {
    // #1
    test('#1 create an issue with every field', function(done) {
      chai
        .request(server)
        .post('/api/issues/ourlibraries')
        .type('form')
        .send({
          issue_title: 'banner not centered',
          issue_text: 'banner not centered',
          created_by: 'mj',
          assigned_to: 'mj',
          status_text: 'in QA'
        })
        .end(function(err, res) {
          assert.isOk(res.body.insertedId)
          done()
        })
    })

    test('#2 create an issue with only required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/ourlibraries')
        .type('form')
        .send({
          issue_title: 'search button not working',
          issue_text: 'button is not responding to clicks',
          created_by: 'jm'
        })
        .end(function(err, res) {
          assert.isOk(res.body.insertedId)
          done()
        })
    })

    test('#3 create an issue with missing required fields', function(done) {
      chai
        .request(server)
        .post('/api/issues/ourlibraries')
        .type('form')
        .send({
          created_by: 'mj'
        })
        .end(function(err, res) {
          assert.isOk(res.body.error)
          done()
        })
    })
  })

  suite('GET /api/issues/:project', function() {
    test('#4 view issues on a project', function(done) {
      chai
        .request(server)
        .get('/api/issues/ourlibraries')
        .end(function(err, res) {
          assert.isArray(res.body)

          if (res.body.length > 0) {
            assert.isOk(res.body[0].issue_title)
            assert.isOk(res.body[0].issue_text)
            assert.isOk(res.body[0].created_by)
          }

          done()
        })
    })

    test('#5 view issues on a project with one filter', function(done) {
      chai
        .request(server)
        .get('/api/issues/ourlibraries?created_by=mj')
        .end(function(err, res) {
          for (let i = 0; i < res.body.length; i++) {
            assert.equal(res.body[i].created_by, 'mj')
          }
          done()
        })
    })

    test('#6 view issues on a project with multiple filters', function(done) {
      chai
        .request(server)
        .get('/api/issues/ourlibraries?created_by=mj&open=false')
        .end(function(err, res) {
          for (let i = 0; i < res.body.length; i++) {
            assert.equal(res.body[i].created_by, 'mj')
            assert.equal(res.body[i].open, false)
          }
          done()
        })
    })
  })

  suite('PUT /api/issues/:project', function() {
    test('#7 update one field on an issue', function(done) {
      chai
        .request(server)
        .put('/api/issues/ourlibraries')
        .type('form')
        .send({
          _id: '634b7306d1852520da835db1',
          created_by: 'MJ'
        })
        .end(function(err, res) {
          assert.equal(res.body.modifiedCount, 1)
          done()
        })
    })

    test('#8 update multiple fields on an issue', function(done) {
      chai
        .request(server)
        .put('/api/issues/ourlibraries')
        .type('form')
        .send({
          _id: '634b7306d1852520da835db2',
          created_by: 'MJ',
          open: false
        })
        .end(function(err, res) {
          assert.equal(res.body.modifiedCount, 1)
          done()
        })
    })

    test('#9 update issue with missing _id', function(done) {
      chai
        .request(server)
        .put('/api/issues/ourlibraries')
        .type('form')
        .send({
          created_by: 'MJ'
        })
        .end(function(err, res) {
          assert.isOk(res.body.error)
          done()
        })
    })

    test('#10 update an issue with no fields to update', function(done) {
      chai
        .request(server)
        .put('/api/issues/ourlibraries')
        .type('form')
        .send({
          _id: '634b7306d1852520da835db2'
        })
        .end(function(err, res) {
          assert.isOk(res.body.error)
          done()
        })
    })

    test('#11 update an issue with an invalid _id', function(done) {
      chai
        .request(server)
        .put('/api/issues/ourlibraries')
        .type('form')
        .send({
          _id: '34d039e1d1d84258c91913b'
        })
        .end(function(err, res) {
          assert.isOk(res.body.error)
          done()
        })
    })
  })

  suite('DELETE /api/issues/:project', function() {
    test('#12 delete an issue', function(done) {
      chai
        .request(server)
        .delete('/api/issues/ourlibraries')
        .type('form')
        .send({
          _id: '634b7306d1852520da835db1'
        })
        .end(function(err, res) {
          assert.equal(res.body.deletedCount, 1)
          done()
        })
    })

    test('#13 delete an issue with an invalid _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/ourlibraries')
        .type('form')
        .send({
          _id: '34d039e1d1d84258c91913b'
        })
        .end(function(err, res) {
          assert.isOk(res.body.error)
          done()
        })
    })

    test('#14 delete an issue with a missing _id', function(done) {
      chai
        .request(server)
        .delete('/api/issues/ourlibraries')
        .type('form')
        .send({})
        .end(function(err, res) {
          assert.isOk(res.body.error)
          done()
        })
    })
  })
});
