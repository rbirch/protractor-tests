/**
 * Created by rob birch on 5/27/2016.
 */

var q = require('q');
var promise = require('promise');
var superAgent = require('superagent');
var agent = require('superagent-promise')(superAgent, promise);

function TestMessage(parentThread, messageBody, author, id) {
    //String
    this.id = id;
    //URI - resource location
    this.location = undefined;
    //TestUser
    this.author = author;
    //String
    this.body = messageBody;
    //TestThread
    this.parentThread = parentThread;

    var request = { authorId:this.author.cisId, body:this.body };

    this.post = function(callback) {
        var deferred = q.defer();
        var url = browser.testEnv.rootUrl + '/fst/fs-messages/threads/' + this.parentThread.id + '/messages';

        agent.post(url)
            .send(JSON.stringify(request))
            .accept('application/json')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + author.fsSessionId)
            .end()
            .then(function onSuccess(response) {
                console.log('api post for new message to ' + url + ' for user ' + author.cisId + '.. response: ' + response.status);
                var location = response.headers.location;
                this.location = location;
                this.id = location.substring(location.lastIndexOf('/')+ 1);

                deferred.resolve();
                callback(this);
                return deferred.promise;
            }.bind(this),
            function onFailure(response) {
                console.log('api post for new message to ' + url + ' for author ' + author.cisId + ' failed.. - reason: ' + response.response.error.message);
                deferred.reject();
                return deferred.promise
            });
        return deferred.promise;
    };
};

module.exports = TestMessage;


