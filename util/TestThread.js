/**
 * Created by rob birch on 5/11/2016.
 */

var q = require('q');
var promise = require('promise');
var superAgent = require('superagent');
var agent = require('superagent-promise')(superAgent, promise);
var TestMessage = require('./TestMessage');

function TestThread(author, receiverIds, subject, about, aboutUrl, messageBody) {
    this.id = undefined;
    this.location = undefined;
    this.lastModified = undefined;
    this.messages = [];

    receiverIds.push(author.cisId);
    this.participantIds = receiverIds;
    this.subject = subject;
    this.about = about;
    this.aboutUrl = aboutUrl;

    var firstMessage = { authorId: author.cisId, body: messageBody };
    var request = { subject:subject, about:about, aboutUrl:aboutUrl, firstMessage:firstMessage, participantIds:this.participantIds};

    this.post = function(callback) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads';
        var promises = [];

        agent.post(url)
            .send(JSON.stringify(request))
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + author.fsSessionId)
            .end()
            .then(function onSuccess(response){
                console.log('api post for new thread to ' + url + ' for user ' + author.cisId + '.. response: ' + response.status);
                var location = response.headers.location;
                this.location = location;
                this.id = location.substring(location.lastIndexOf('/') + 1);

                // need to get the first message id since there's no body returned.. :(
                defer.promise = this.getMessages(function processResponse(response) {
                    this.addMessage(new TestMessage(this, messageBody, author, response.body.messages[0].id));
                }.bind(this));
                promises.push(promise);
                defer.resolve();
                callback(this);
                //return defer.promise;
                return q.all(promises);
            }.bind(this),
            function onFailure(response) {
                console.log('api post to ' + url + ' failed.. - reason: ' + response.response.error.text);
                defer.reject();
                return defer.promise;
            });
        return defer.promise;
    };

    this.addMessage = function(testMessage) {
        this.messages.push(testMessage);
        // need to get the lastUpdated time
        var promise = testMessage.author.getThreads(function processResponse(response) {
            var threadSummaries = response.body.userThreadSummaries;
            var threadSummary = threadSummaries.find(function(summary) {
                return summary.threadId === this.id;
            }.bind(this));
            this.lastModified = threadSummary.lastModifiedTime;
        }.bind(this));
    };

    this.getRepresentation = function(callback) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads/' + this.id;// + '/messages';

        agent.get(url)
            .send()
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + author.fsSessionId)
            .end()
            .then(function onSuccess(response) {
                console.log('api get to ' + url + '.. response: ' + response.status);
                defer.resolve();
                callback(response);
                return defer.promise;
            }.bind(this),
            function onFailure(response) {
                console.log('api get to ' + url + ' failed.. - reason: ' + response.error.text);
                defer.reject();
                return defer.promise;
            });
        return defer.promise;
    };

    this.getMessages = function(callback) {
        var defer = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads/' + this.id + '/messages';

        agent.get(url)
            .send()
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + author.fsSessionId)
            .end()
            .then(function onSuccess(response) {
                    console.log('api get to ' + url + '.. response: ' + response.status);
                    defer.resolve();
                    callback(response);
                    return defer.promise;
                }.bind(this),
                function onFailure(response) {
                    console.log('api get to ' + url + ' failed.. - reason: ' + response.error.text);
                    defer.reject();
                    return defer.promise;
                });
        return defer.promise;
    };

    this.softDelete = function(callback) {
        var defer = q.defer();
        var authorId = this.firstMessage.authorId;
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads/' + this.id + '/users/' + authorId + '/state';

        var author = TEST_USERS.find(function(user) {
            return user.cisId === authorId;
        });

        agent.put(url)
            .send(JSON.stringify({status : 'TRASH'}))
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