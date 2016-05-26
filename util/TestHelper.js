/**
 * Created by jorobi on 5/11/2016.
 */
var q = require('q');
var TestThread = require('./TestThread.js');
var TestUser = require('./TestUser.js');
var base = new (require('qa-shared-base/lib/protractor-lib.js'));

var TestHelper = function() {
    TestHelper.prototype.testUsers = [];
    TestHelper.prototype.testThreads = [];
    TestHelper.prototype.commonUser = undefined;
    var commonUser;

    var TOTAL_USERS = 3;
    var TOTAL_THREADS = 5;

    this.setup = function() {
        try {
            TestHelper.prototype.commonUser = this.commonUser;
            console.log('common user: ' + this.commonUser.cisId);
            TestHelper.prototype.testUsers.push({key: this.commonUser.cisId, value: this.commonUser});
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
        deferred.promise.then(function onSuccess(testUser) {
            console.log('got logged in user ' + testUser.cisId);
            TestHelper.prototype.testUsers.push({key: testUser.cisId, value: testUser});

            if (TestHelper.prototype.testUsers.length >= TOTAL_USERS) {
                deferred.resolve();
                return deferred.promise;
            }

            return deferred.promise;
        },
        function onFailure(err) {
            console.log('failed.. ' + err);
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
            deferred.promise = postNewThread();
            promises.push(deferred.promise);
        }
        return q.all(promises);
    }

    function postNewThread() {
        var deferred = q.defer();

        var sender = TestHelper.prototype.commonUser;
        var receiverIds = [TestHelper.prototype.testUsers[1].key, TestHelper.prototype.testUsers[2].key];
        var threadSubject = "web test subject";
        var threadAbout = "about";
        var aboutUrl = "http://familysearch.org/lyrcs/hokeypokey.html";
        var messageBody = "threadBody";
        var thread = new TestThread(sender, receiverIds, threadSubject, threadAbout, aboutUrl, messageBody);

        thread.post(function processResponse(response) {
            var location = response.headers.location;
            thread.location = location;
            thread.id = location.substring(location.lastIndexOf('/') + 1);
            TestHelper.prototype.testThreads.push({key: thread.id, value: thread});

            if(TestHelper.prototype.testThreads.length >= MAX_THREADS) {
                deferred.resolve();
            }
        });
        return deferred.promise;
    }

    function softDeleteUserThreads() {
        var deferred = q.defer();
        var promises = [];
        var duplicates = [];
        TestHelper.prototype.testUsers.forEach(function(testUser) {
            var user = new TestUser(testUser.value);
            if(duplicates.indexOf(user > -1)) {
                deferred.promise = user.softDeleteThreads();
                promises.push(deferred.promise);
                duplicates.push(user);
            }
        });
        return q.all(promises);
    }

    this.deleteAllUserSessions = function() {
        TestHelper.prototype.testUsers.forEach(function(testUser) {
            base.loginService.deleteSession(testUser.value.fsSessionId);
        });
    };

    //element should be an elementFinder from a page
    this.getValue = function(element) {
        var promise = protractor.promise.when(element);
        promise.then(function(elementFinder) {
            return elementFinder;
        });
    };
};

module.exports = TestHelper;
