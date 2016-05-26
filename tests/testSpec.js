// testSpec.js

var base = new (require('qa-shared-base/lib/protractor-lib.js'));
var mailbox = new (require('../pages/MailboxPage.js'));
var personPage = require('../pages/PersonPage.js');
var contactCard = require('../pages/ContactCardDialog.js');
var menu = new (require('../pages/MenuHeader.js'));
var testHelper = new (require('../util/TestHelper.js'));
var q = require('q');

q.longStackSupport = true;

describe('FamilySearch Mailbox Test', function() {

    browser.ignoreSynchronization = true;
    browser.driver.manage().window().maximize();
    browser.get(browser.testEnv.rootUrl);

    testHelper.commonUser = browser.testEnv.testUser;

    var promise = testHelper.setup();
    //promise.then(function runTests() {

        it('should have a title', function() {
            expect(browser.getTitle()).toContain('Free Family History');
        });

        it('should show logged in user', function() {
            base.cookieUtils.setSessionCookie(testHelper.commonUser.fsSessionId);
            browser.refresh();
        });

        it("should show 'Messages' link in header", function() {
            expect(menu.getMessagesLink().isDisplayed()).toBe(true);
            menu.getMessagesLink().click();
            expect(menu.getShowAllLink().isDisplayed()).toBe(true);
        });

        it('the contact card should have a send message link', function() {
            var userPage = new personPage(testHelper.commonUser.personId);
            userPage.displayContactCard();
            var userContactCard = new contactCard();
            expect(userContactCard.sendMessageButton().isDisplayed()).toBe(true);
        });

        it('should show mailbox page', function() {
            browser.get(browser.testEnv.rootUrl + '/messaging/mailbox');
            expect(browser.getTitle()).toContain("FamilySearch Mailbox");
        });

        it('should verify there\'s at least one message', function() {
            protractor.promise.when(mailbox.getMessageCount())
            .then(function(text) {
                var count = text.substring(text.indexOf(' ') + 1);
                if (count == 0) {
                    var userPage = new personPage(testHelper.commonUser.personId);
                    userPage.displayContactCard();

                    var userContactCard = new contactCard();
                    userContactCard.sendMessageButton().click();
                    userContactCard.newMessageDialog().fillWithGarbageAndSend();
                    browser.get(browser.testEnv.rootUrl + '/messaging/mailbox');
                }
            });
        });

        it('should show the correct message count', function() {

            var count = mailbox.getMessageCount();
            expect(count).toContain("Messages: " + testHelper.testThreads.length);
        });

        it('should click the new message button and open the New Message dialog', function() {
            var threadFrame = mailbox.ThreadFrame();
            var el = threadFrame.getNewMessageButton();
            el.click();

            expect(mailbox.NewMessageDialog().isDisplayed()).toBe(true);
        });

        it('should verify the user\'s recent contacts are selectable in the dropdown', function() {
            var newMessageDialog = mailbox.NewMessageDialog();
            var toTextBox = newMessageDialog.getToTextField();
            var expectedContact = testHelper.testUsers[1].value.username;
            toTextBox.sendKeys(expectedContact.substr(0, 1));
            $('body').sendKeys(protractor.Key.ENTER);

            var actualContact = newMessageDialog.getSelectedContact();
            expect(actualContact).toEqual(expectedContact);
        });

        it('should remove the session', function() {
            testHelper.deleteAllUserSessions();
        });
    //};,
    //,
    //function fail(err) {
    //    console.log("tests failed!! - " + err);
    //});
});

