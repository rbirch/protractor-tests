/**
 * Created by jorobi on 5/17/2016.
 */

var q = require('q');
var promise = require('promise');
var superAgent = require('superagent');
var agent = require('superagent-promise')(superAgent, promise);

function TestUser(testUser) {
    this.cisId = testUser.cisId;
    this.fsSessionId = testUser.fsSessionId;
    var cisId = testUser.cisId;
    var fsSessionId = testUser.fsSessionId;

    this.softDeleteThreads = function() {
        var defer = q.defer();
        var userThreadUrl = browser.testEnv.rootUrl + '/fst/fs-messages/users/' + cisId + '/threads';
        var promises = [];

        agent.get(userThreadUrl)
            .send()
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + this.fsSessionId)
            .end()
            .then(function onSuccess(response) {
                var threadCount = response.body.userThreadSummaries.length;
                console.log('soft delete.. api get to ' + userThreadUrl + ' retrieved ' + threadCount + ' threads..  response: ' + response.status);

                if(threadCount > 0) {
                    response.body.userThreadSummaries.forEach(
                        defer.promise = softDeleteThread);
                        promises.push(defer.promise);
                }
                else {
                    defer.resolve();
                }
                //return defer.promise;
                return q.all(promises);
            },
            function onFailure(response) {
                console.log('soft delete.. api get to ' + url + ' failed.. reason: ' + response.error.text);
                defer.resolve();
                return q.all(promises);
            });
        return q.all(promises);
    };

    function softDeleteThread(element, index, array) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads/' + element.threadId + '/users/' + cisId + '/state';

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
                console.log('thread soft delete - api put to ' + url + ' failed.. - reason: ' + response.error.text);
                defer.resolve();
                return defer.promise;
            });
        return defer.promise;
    }
}

module.exports = TestUser;