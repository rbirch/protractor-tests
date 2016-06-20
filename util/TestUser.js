/**
 * Created by rob birch on 5/17/2016.
 */

var q = require('q');
var promise = require('promise');
var superAgent = require('superagent');
var agent = require('superagent-promise')(superAgent, promise);

function TestUser(testUser) {
    this.cisId = testUser.cisId;
    this.fsSessionId = testUser.fsSessionId;
    this.userName = testUser.username;
    var cisId = testUser.cisId;
    var fsSessionId = testUser.fsSessionId;


    this.getThreads = function(callback) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/users/' + cisId + '/threads?pageSize=100';
        var promises = [];

        agent.get(url)
            .send()
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + this.fsSessionId)
            .end()
            .then(function onSuccess(response) {
                var threadCount = response.body.userThreadSummaries.length;
                console.log('get user threads.. api get to ' + url + ' retrieved ' + threadCount + ' threads..  response: ' + response.status);
                defer.resolve();
                callback(response);
                return q.all(promises);
            },
            function onFailure(response) {
                console.log('get user threads.. api get to ' + url + ' failed.. reason: ' + response.error.text);
                defer.resolve();
                return q.all(promises);
            });
        return q.all(promises);
    };

    this.softDeleteThread = function(thread) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads/' + thread.threadId + '/users/' + cisId + '/state';

        agent.put(url)
            .send(JSON.stringify({status : 'TRASH'}))
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + fsSessionId)
            .end()
            .then(function onSuccess(response) {
                console.log('thread soft delete - api put to ' + url + '.. set state to ' + response.body.status + ' - response: ' + response.status);
                defer.resolve();
                return defer.promise;
            },
                function onFailure(response) {
                console.log('thread soft delete - api put to ' + url + ' failed.. - reason: ' + response.response.error.message);
                defer.resolve();
                return defer.promise;
            });
        return defer.promise;
    };
}

module.exports = TestUser;