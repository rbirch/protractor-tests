/**
 * Created by jorobi on 5/11/2016.
 */

var q = require('q');
var promise = require('promise');
var superAgent = require('superagent');
var agent = require('superagent-promise')(superAgent, promise);

function TestThread(author, receiverIds, subject, about, aboutUrl, messageBody) {
    this.id = undefined;
    //var authorId = sender.cisId;
    receiverIds.push(author.cisId);
    this.participantIds = receiverIds;
    this.subject = subject;
    this.about = about;
    this.aboutUrl = aboutUrl;
    this.firstMessage = { authorId: author.cisId, body: messageBody};

    this.post = function(callback) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads';

        agent.post(url)
            .send(JSON.stringify(this))
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + author.fsSessionId)
            .end()
            .then(function onSuccess(response){
                console.log('api post for new thread to ' + url + ' for user ' + author.cisId + '.. response: ' + response.status);
                defer.resolve();
                callback(response);
                return defer.promise;
            },
            function onFailure(response) {
                console.log('api post to ' + url + ' failed.. - reason: ' + response.error.text);
                defer.reject();
                return defer.promise;
        });
        return defer.promise;
    };

    this.softDelete = function(callback) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads/' + this.id + '/users/' + this.authorId + '/state';

        agent.put(url)
            .send(JSON.stringify('TRASH'))
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + author.fsSessionId)
            .end()
            .then(function onSuccess(response) {
                console.log('soft delete thread - api put to ' + url + ' succeeded.. response: ' + response.status);
                defer.resolve();
                callback;
                return defer.promise;
            }, function onFailure(response) {
                console.log('api put to ' + url + ' failed.. - reason: ' + response.error.text);
                defer.reject();
                return defer.promise;
        });
        return defer.promise;
    };
}

module.exports = TestThread;