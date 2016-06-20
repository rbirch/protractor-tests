/**
 * Created by jorobi on 5/11/2016.
 */
var q = require('q');
var TestThread = require('./TestThread.js');
var TestMessage = require('./TestMessage.js');
var TestUser = require('./TestUser.js');
var base = new (require('qa-shared-base/lib/protractor-lib.js'));


var TestHelper = function() {
    TEST_USERS = [];
    TestHelper.prototype.testThreads = [];

    var TOTAL_USERS = 2;
    var TOTAL_THREADS = 12;

    this.setup = function() {
        try {
            this.commonUser = new TestUser(browser.testEnv.testUser);
            TestHelper.prototype.commonUser = this.commonUser;
            console.log('common user: ' + this.commonUser.cisId);

        }catch(error) {
            console.log(error);
        }

        var deferred = q.defer();

        setupUsers()
            .then(function() {
                softDeleteUserThreads();
            })
            .then(function() {
                setupThreads();
            })
            .fail(function onError(err) {
                console.log('error: ' + err);
                deferred.reject('setup failed.. error: ' + err);
            })
            .done(function() {
                deferred.resolve();
            });

        return deferred.promise;
    };

    function setupUsers() {
        console.log('getting ' + TOTAL_USERS + ' users..');
        var deferred = q.defer();
        var promises = [];
        for (var idx = 0; idx < TOTAL_USERS; idx++) {
            deferred.promise = getLoggedInUser();
            promises.push(deferred.promise);
        }
        return q.all(promises);
    }

    function getLoggedInUser() {
        var deferred = q.defer();
        deferred.promise = base.loginService.getLoggedInUserFromTestDataAPI({lockUser: true, accountType: "MEMBER"});
        deferred.promise.then(function onSuccess(user) {
            console.log('got logged in user ' + user.cisId);
            TEST_USERS.push(new TestUser(user));

            if(TEST_USERS.length >= TOTAL_USERS) {
                deferred.resolve();
                return deferred.promise;
            }

            return deferred.promise;
        },
        function onFailure(err) {
            console.log('failed.. ' + err.message);
            deferred.reject();
            return deferred.promise;
        });

        return deferred.promise;
    }

    function setupThreads() {
        var deferred = q.defer();
        console.log('setting up ' + TOTAL_THREADS + ' threads..');
        var promises = [];

        for(var idx = 0; idx < TOTAL_THREADS; idx++) {
            deferred.promise = postNewThread(idx);
            promises.push(deferred.promise);
        }
        return q.all(promises);
    }

    function postNewThread(idx) {
        var deferred = q.defer();
        var promises = [];

        var sender = TestHelper.prototype.commonUser; //new TestUser(TestHelper.prototype.commonUser);
        var receiverIds = [TEST_USERS[0].cisId, TEST_USERS[1].cisId];
        var threadSubject = 'web test subject ' + getRandomString();
        var threadAbout = idx + '_about ' + getRandomString();
        var aboutUrl = "http://familysearch.org/lyrcs/hokeypokey.html";
        var messageBody = getRandomString();
        var testThread = new TestThread(sender, receiverIds, threadSubject, threadAbout, aboutUrl, messageBody);

        var promise = testThread.post(function processResponse(testThread) {
            TestHelper.prototype.testThreads.push(testThread);

            // now add some messages
            for(var idx = 0; idx < 2; idx++) {
                postNewMessage(testThread);
            }

            if(TestHelper.prototype.testThreads.length >= TOTAL_THREADS) {
                console.log(TOTAL_THREADS + ' threads have been created.. resolving');
                deferred.resolve();
            }
        });
        promises.push(promise);
        return q.all(promises);
    }

    function postNewMessage(testThread) {
        var promises = [];
        var author = getParticipantForThread(testThread);
        var messageBody = getRandomString();
        var testMessage = new TestMessage(testThread, messageBody, author);
        var promise = testMessage.post(function processResponse(testMessage) {
            testThread.addMessage(testMessage);
        });
        promises.push(promise);
        return promises;
    }

    this.getParticipantForThread = function(testThread) {
        return getParticipantForThread(testThread);
    };

    function getParticipantForThread(testThread) {
        var idx = Math.floor(Math.random() * (TEST_USERS.length));
        return TEST_USERS[idx];

        //var idx = Math.floor(Math.random() * (testThread.participantIds.length));
        //return TEST_USERS.find(function(user) {
        //    return user.cisId === testThread.participantIds[idx];
        //    if(user.cisId === testThread.participantIds[idx]) {
        //        return user;
        //    }
        //});
    }

    function softDeleteUserThreads() {
        var deferred = q.defer();
        var promises = [];
        var duplicates = [];
        var users = TEST_USERS.slice();
        users.push(TestHelper.prototype.commonUser);
        users.forEach(function(testUser) {
            var user = new TestUser(testUser);
            if(duplicates.indexOf(user > -1)) {
                deferred.promise = user.getThreads(function(response) {
                    var threadSummaries = response.body.userThreadSummaries;
                    if(threadSummaries.length > 0) {
                        threadSummaries.forEach(function (thread) {
                            var promise = user.softDeleteThread(thread);
                            promises.push(promise);
                        });
                    }
                    promises.push(deferred.promise);
                    duplicates.push(user);
                });
            }
        });
        return q.all(promises);
    }

    this.getRandomString = function() {
        return getRandomString();
    };

    function getRandomString() {
        var str = Math.random().toString(36);
        var rndStr = str.slice(2, 18);
        return rndStr;
    }

    this.switchUser = function(newUser) {
        base.cookieUtils.setSessionCookie(newUser.fsSessionId);
        browser.refresh();
        browser.get(browser.testEnv.rootUrl + '/messaging/mailbox');
    };

    this.deleteAllUserSessions = function() {
        var users = TEST_USERS.slice();
        users.push(TestHelper.prototype.commonUser);
        users.forEach(function(testUser) {
            base.loginService.deleteSession(testUser.fsSessionId);
        });
    };

    this.sortBy = function(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function(a,b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    };

};

module.exports = TestHelper;
