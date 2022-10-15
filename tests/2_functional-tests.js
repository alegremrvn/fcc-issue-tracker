const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(1000)
  suite('POST /api/issues/:project', function() {
    // #1
    test('#1 create an issue with every field', function() {
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
        })
    })
  })
});
