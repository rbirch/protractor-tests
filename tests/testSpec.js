// testSpec.js

var base = new (require('qa-shared-base/lib/protractor-lib.js'));
var mailbox = new (require('../pages/MailboxPage.js'));

var menu = new (require('../pages/MenuHeader.js'));
var testHelper = new (require('../util/TestHelper.js'));
var TestMessage = require('../util/TestMessage.js');
var PersonPage = require('../pages/PersonPage.js');
var ContactCard = require('../pages/ContactCardDialog.js');
var q = require('q');

q.longStackSupport = true;

describe('FamilySearch Mailbox Test', function() {
    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
    browser.get(browser.testEnv.rootUrl);

    var promise = testHelper.setup();

    it('should have a title', function() {
        expect(browser.getTitle()).toContain('Free Family History');
    });

    it('should show logged in user', function() {
        base.cookieUtils.setSessionCookie(testHelper.commonUser.fsSessionId);
        browser.refresh();
    });

    //it('the contact card should have a send message link', function() {
    //    var userPage = new PersonPage(testHelper.commonUser.personId);
    //    protractor.promise.when(userPage.getPersonHeader())
    //    .then(function onSuccess() {
    //        console.log('good person details page..');
    //        try {
    //            userPage.displayContactCard();
    //            var userContactCard = new ContactCard();
    //            expect(userContactCard.sendMessageButton().isDisplayed()).toBe(true);
    //        }
    //        catch(error) {
    //            console.log("couldn't display contact card.. - error: " + error);
    //        }
    //    },
    //    function onFailure() {
    //        console.log('no data on person page..');
    //    });
    //});

    //it("should show the 'Messages' and the 'Show All' links in header", function() {
    //    expect(menu.getMessagesLink().isDisplayed()).toBe(true);
    //    menu.getMessagesLink().click();
    //    expect(menu.getShowAllLink().isDisplayed()).toBe(true);
    //});

    it('should show mailbox page', function() {
        browser.get(browser.testEnv.rootUrl + '/messaging/mailbox');
        expect(browser.getTitle()).toContain("FamilySearch Mailbox");
    });

    it('verified there\'s at least one message', function() {
        mailbox.getMessageCount()
        .then(function(text) {
            var count = text.substring(text.indexOf(' ') + 1);
            expect(count > 0).toBe(true);
        });
    });

    it('verified the correct thread count in the mailbox header', function() {
        browser.refresh();
        var count = mailbox.getMessageCount();
        expect(count).toContain("Messages: " + testHelper.testThreads.length);
    });

    it('verified the "display more threads" link loads more threads', function() {
        var threadFrame = mailbox.ThreadFrame();
        // get the number of thread buttons
        var beforeCount = threadFrame.getThreadCount();
        expect(beforeCount).toEqual(10);
        threadFrame.displayAllThreads();
        var afterCount = threadFrame.getThreadCount();
        expect(afterCount).toEqual(testHelper.testThreads.length);
    });

    it('verified that the thread fields (about, subject) are correct for all the threads', function() {
        var threadFrame = mailbox.ThreadFrame();

        testHelper.testThreads.forEach(function(thread) {
            threadFrame.getThreadButtonByThreadId(thread.id).click();
            var expectedAbout = 'About: ' + thread.about;
            var actualAbout = threadFrame.getThreadAboutByThreadId(thread.id);
            expect(actualAbout).toEqual(expectedAbout);

            var expectedSubject = 'Subject: ' + thread.subject;
            var actualSubject = threadFrame.getThreadSubjectByThreadId(thread.id);
            expect(actualSubject).toEqual(expectedSubject);
        });
    });

    it('verified that the threads are displayed in order - newest to oldest, top to bottom', function() {
        testHelper.testThreads.sort(testHelper.sortBy('lastModified')).reverse();
        var threadFrame = mailbox.ThreadFrame();
        testHelper.testThreads.forEach(function(thread) {
            threadFrame.getThreadButtonByThreadId(thread.id).click();
            threadFrame.getThreadButtonIndexByThreadId(thread.id, function(actualIndex) {
                expect(actualIndex).toEqual(testHelper.testThreads.indexOf(thread));
            });
        });
    });

    it('verified a reply to a thread is displayed for the author', function() {
        // chose a thread in the middle of the thread frame..
        var thread = testHelper.testThreads[5];
        var threadFrame = mailbox.ThreadFrame();
        threadFrame.getThreadButtonByThreadId(thread.id).click();

        var replyFrame = mailbox.ReplyFrame();
        var message = testHelper.getRandomString();
        replyFrame.getReplyTextBox().sendKeys(message);
        replyFrame.getSendButton().click();
        thread.addMessage(new TestMessage(thread, message, testHelper.commonUser));

        //verify message is displayed
        var messageFrame = mailbox.MessageFrame();
        messageFrame.getMessageCount().then(function(count) {
            var actualBody = messageFrame.getMessageBody(count - 1);
            expect(actualBody).toEqual(message);
        });
    });

    it('verified the thread with a new message is moved to the top of the thread list for the author', function() {
        // select the same thread used in the previous test
        var threadId = testHelper.testThreads[5].id;
        var threadFrame = mailbox.ThreadFrame();
        threadFrame.getThreadButtonByThreadId(threadId).click();
        threadFrame.getThreadButtonIndexByThreadId(threadId, function(actualIndex) {
            expect(actualIndex).toEqual(0);
        })
    });

    it('verified that the posted reply is displayed for a thread participant', function() {
        // needs to be the same thread as in the previous - reply to a thread - test
        var thread = testHelper.testThreads[0];
        var user = testHelper.getParticipantForThread(thread);
        testHelper.switchUser(user);

        var threadFrame = mailbox.ThreadFrame();
        threadFrame.getThreadButtonByThreadId(thread.id).click();
        var expected = thread.messages[thread.messages.length - 1].body;

        var messageFrame = mailbox.MessageFrame();
        messageFrame.getMessageCount().then(function(count) {
            var actualBody = messageFrame.getMessageBody(count - 1);
            expect(actualBody).toEqual(expected);
        });
    });

    it('verified the thread with a new message is moved to the top of the thread list for the other participants', function() {
        // select the same thread used in the previous test
        var thread = testHelper.testThreads[5];
        var user = testHelper.getParticipantForThread(thread);
        testHelper.switchUser(user);

        var threadFrame = mailbox.ThreadFrame();
        threadFrame.getThreadButtonByThreadId(thread.id).click();
        threadFrame.getThreadButtonIndexByThreadId(thread.id, function(actualIndex) {
            expect(actualIndex).toEqual(0);
        })
    });

    it('verified that the new message button opens the New Message dialog', function() {
        var threadFrame = mailbox.ThreadFrame();
        threadFrame.getNewMessageButton().click();
        expect(mailbox.NewMessageDialog().isDisplayed()).toBe(true);
    });

    it('verified the user\'s recent contacts are selectable in the New Message dialog \'To\' dropdown', function() {
        var newMessageDialog = mailbox.NewMessageDialog();
        var toTextBox = newMessageDialog.getToTextField();
        var expectedContact = TEST_USERS[0].userName;
        toTextBox.sendKeys(expectedContact);
        $('body').sendKeys(protractor.Key.ENTER);

        var actualContact = newMessageDialog.getSelectedContact();
        expect(actualContact).toEqual(expectedContact);
        newMessageDialog.getCancelLink().click();
    });

    it('verified that a thread can be deleted and is no longer displayed for the user', function() {
        testHelper.switchUser(testHelper.commonUser);
        var threadFrame = mailbox.ThreadFrame();
        var threadId = testHelper.testThreads[0].id;
        threadFrame.getThreadButtonByThreadId(threadId).click();

        mailbox.getDeleteLink().click();
        mailbox.getDeleteConversationDialogYesButton().click();
        protractor.promise.when(threadFrame.getThreadIdsForAllVisibleThreadButtons()).then(function(threadIds) {
            expect(threadIds.indexOf(threadId)).toEqual(-1); // deleted thread should no longer be there
        }.bind(threadId));
    });

    it('verified that the deleted thread is still displayed for the other thread participants', function() {
        // use the same threadId as the previous test where the thread was deleted
        var thread= testHelper.testThreads[0];
        var user = testHelper.getParticipantForThread(thread);
        testHelper.switchUser(user);

        var threadFrame = mailbox.ThreadFrame();
        threadFrame.getThreadButtonByThreadId(thread.id).click();

        protractor.promise.when(threadFrame.getThreadIdsForAllVisibleThreadButtons()).then(function(threadIds) {
            expect(threadIds.indexOf(thread.id) >= 0).toBe(true);
        }.bind(thread.id));
    });

    it("verified that the 'No Messages' message is displayed when there aren't any threads", function() {
        var threadFrame = mailbox.ThreadFrame();
        threadFrame.deleteAllThreads();
        expect(mailbox.getNoMessagesText()).toContain("You don't have any messages yet.");
    });

    it("verified there's no 'New Message' button when there are no threads", function() {
        var threadFrame = mailbox.ThreadFrame();
        expect(threadFrame.getNewMessageButton().isPresent()).toBe(false);
    });

    it('removed all user sessions', function() {
        testHelper.deleteAllUserSessions();
    });
});

