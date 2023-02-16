const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

require('dotenv').config()
const { MongoClient } = require('mongodb')
const uri = process.env['MONGO_URI']

chai.use(chaiHttp);

describe('Functional Tests', function () {
  // clean up before running all the tests
  before(function () {
    async function run() {
      const client = new MongoClient(uri);

      try {
        // const database = client.db('fcc_issue_tracker');
        const database = client.db('test');
        const issues = database.collection('issues');

        await issues.deleteMany()
      } finally {
        await client.close();
      }
    }
    run().catch(console.dir);
  })

  describe('POST /api/issues/{project}', function () {
    it('Test #1) create an issue with every field', function (done) {
      chai
        .request(server)
        .post('/api/issues/foo')
        .send({
          issue_title: 'issue title',
          issue_text: 'issue text',
          created_by: 'Mario',
          status_text: 'status text',
          assigned_to: 'Luigi'
        })
        .end(function (err, res) {
          assert.equal(res.body.issue_title, 'issue title')
          assert.equal(res.body.issue_text, 'issue text')
          assert.equal(res.body.created_by, 'Mario')
          assert.equal(res.body.status_text, 'status text')
          assert.equal(res.body.assigned_to, 'Luigi')
          assert.isTrue(res.body.open)

          assert.equal(Object.keys(res.body).length, 9)

          done()
        })
    })

    it('Test #2) create an issue with only required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/foo')
        .send({
          issue_title: 'issue title 2',
          issue_text: 'issue text',
          created_by: 'Mario',
        })
        .end(function (err, res) {
          assert.equal(res.body.issue_title, 'issue title 2')
          assert.equal(res.body.issue_text, 'issue text')
          assert.equal(res.body.created_by, 'Mario')
          assert.equal(res.body.status_text, '')
          assert.equal(res.body.assigned_to, '')
          assert.isTrue(res.body.open)

          assert.equal(Object.keys(res.body).length, 9)

          done()
        })
    })

    it('Test #3) create an issue with missing required fields', function (done) {
      chai
        .request(server)
        .post('/api/issues/foo')
        .send({
          created_by: 'Mario'
        })
        .end(function (err, res) {
          assert.equal(res.body.error, 'required field(s) missing')

          done()
        })
    })
  })
});
