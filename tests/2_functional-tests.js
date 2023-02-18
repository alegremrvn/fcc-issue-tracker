const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let mlID

describe('Functional Tests', function () {
  // clean up before running all the tests
  before(function (done) {
    chai
      .request(server)
      .get('/dump/db')
      .end(function (err, res) {
        done()
      })
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

  describe('GET /api/issues/{project}', function () {
    it('Test #4) view issues on a project', function (done) {
      chai
        .request(server)
        .get('/api/issues/foo')
        .end(function (err, res) {
          assert.equal(res.body.length, 2)
          assert.equal(res.body[0].created_by, 'Mario')
          assert.equal(res.body[1].created_by, 'Mario')

          done()
        })
    })

    it('Test #5) view issues on a project with one filter', function (done) {
      chai
        .request(server)
        .get('/api/issues/foo?created_by=Mario')
        .end(function (err, res) {
          assert.equal(res.body.length, 2)
          assert.equal(res.body[0].created_by, 'Mario')
          assert.equal(res.body[1].created_by, 'Mario')

          done()
        })
    })

    it('Test #6) view issues on a project with multiple filters', function (done) {
      chai
        .request(server)
        .get('/api/issues/foo?created_by=Mario&assigned_to=Luigi')
        .end(function (err, res) {
          assert.equal(res.body.length, 1)
          assert.equal(res.body[0].created_by, 'Mario')
          assert.equal(res.body[0].assigned_to, 'Luigi')

          done()
        })
    })
  })

  describe('PUT /api/issues/{project}', function () {
    before(function (done) {
      chai
        .request(server)
        .get('/api/issues/foo')
        .end(function (err, res) {
          if (res.body[0].created_by == 'Mario' &&
            res.body[0].assigned_to == 'Luigi') {
            mlID = res.body[0]._id
          } else {
            mlID = res.body[1]._id
          }

          done()
        })
    })

    it('Test #7) update one field on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/foo')
        .send({
          _id: mlID,
          assigned_to: 'Lea'
        })
        .end(function (err, res) {
          assert.equal(res.body.result, 'successfully updated')
          assert.equal(res.body._id, mlID)

          done()
        })
    })

    it('Test #8) update multiple fields on an issue', function (done) {
      chai
        .request(server)
        .put('/api/issues/foo')
        .send({
          _id: mlID,
          created_by: 'Maria',
          assigned_to: 'Luigi'
        })
        .end(function (err, res) {
          assert.equal(res.body.result, 'successfully updated')
          assert.equal(res.body._id, mlID)

          done()
        })
    })

    it('Test #9) update an issue with missing _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/foo')
        .send({
          created_by: 'Maria',
          assigned_to: 'Luigi'
        })
        .end(function (err, res) {
          assert.equal(res.body.error, 'missing _id')

          done()
        })
    })

    it('Test #10) update an issue with no fields to update', function (done) {
      chai
        .request(server)
        .put('/api/issues/foo')
        .send({
          _id: mlID,
        })
        .end(function (err, res) {
          assert.equal(res.body.error, 'no update field(s) sent')
          assert.equal(res.body._id, mlID)

          done()
        })
    })

    it('Test #11) update an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .put('/api/issues/foo')
        .send({
          _id: 'bar',
          created_by: 'Steve'
        })
        .end(function (err, res) {
          assert.equal(res.body.error, 'could not update')
          assert.equal(res.body._id, 'bar')

          done()
        })
    })
  })

  describe('DELETE /api/issues/{project}', function () {
    it('Test #12) delete an issue', function (done) {
      chai
        .request(server)
        .delete('/api/issues/foo')
        .send({
          _id: mlID
        })
        .end(function (err, res) {
          assert.equal(res.body.result, 'successfully deleted')
          assert.equal(res.body._id, mlID)

          done()
        })
    })

    it('Test #13) delete an issue with an invalid _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/foo')
        .send({
          _id: 'bar'
        })
        .end(function (err, res) {
          assert.equal(res.body.error, 'could not delete')
          assert.equal(res.body._id, 'bar')

          done()
        })
    })

    it('Test #14) delete an issue with missing _id', function (done) {
      chai
        .request(server)
        .delete('/api/issues/foo')
        .send({
          created_by: 'Mario'
        })
        .end(function (err, res) {
          assert.equal(res.body.error, 'missing _id')

          done()
        })
    })
  })
});
