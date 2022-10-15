const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(3000)
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
});
