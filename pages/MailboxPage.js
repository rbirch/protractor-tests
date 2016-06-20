/**
 * Created by rob birch on 5/6/2016.
 */
//var testHelper = new (require('../util/TestHelper.js'));
//var q = require('q');

var mailboxPage = function() {
    var until = protractor.ExpectedConditions;

    var spinner = element(by.className("fsmb-mailbox__spinner-shell"));
    browser.wait(until.invisibilityOf(spinner));

    this.getMessageCount = function() {
        browser.wait(until.invisibilityOf(spinner));
        return element(by.css('span[class$="message-counts__messages"]')).getText();
    };

    this.getNoMessagesText = function() {
        browser.wait(until.invisibilityOf(spinner));
        return element(by.css("div[class='empty-state-wrapper']")).getText();
    };

    this.getDeleteLink = function() {
        browser.wait(until.invisibilityOf(spinner));
        return element(by.css('button[data-cmd="showDeleteThreadModal"]'));
    };

    this.getDeleteConversationDialogYesButton = function() {
        var dialog = element.all(by.css("div[class='fs-modal']")).get(0);
        browser.wait(until.visibilityOf(dialog));
        return dialog.element(by.css("button[data-cmd='deleteThread']"));
    };

    this.getReportAbuseLink = function() {
        browser.wait(until.invisibilityOf(spinner));
        return element(by.css("button[data-cmd='showReportAbuseModal']"));
    };

    this.getNewMessageButton = function() {
        return element(by.css('button[class="fsmb-send-message-button fs-button ng-scope"]'));
    };

    // New Message Dialog
    this.NewMessageDialog = function() {
        var newMessageDialog = element.all(by.css('div[data-dialog-uid="0"]')).get(0);

        newMessageDialog.getToTextField = function() {
            return newMessageDialog.element(by.css('input[data-ng-if="multipleRecipients'));
        };

        newMessageDialog.getSelectedContact = function() {
            var el = newMessageDialog.element(by.css('span[class="fs-send-messsage__contact-name ng-binding"]'));
            browser.wait(until.visibilityOf(el));
            return el.getText();
        };

        newMessageDialog.getSendButton = function() {
            return newMessageDialog.element(by.id('submit-button'))
        };

        newMessageDialog.getCancelLink = function() {
            return newMessageDialog.element(by.id('cancel-button'))
        };

        return newMessageDialog;
    };

    // Thread Frame
    this.ThreadFrame = function() {
        browser.wait(until.invisibilityOf(spinner));
        var threadFrame =  element(by.css('div[class="fsmb-thread-list"]'));

        threadFrame.getNewMessageButton = function() {
            browser.wait(until.invisibilityOf(spinner));
            return threadFrame.element(by.css('button[class="fsmb-send-message-button fs-button ng-scope"]'));
        };

        threadFrame.getThreadButtonByIndex = function(index) {
            return threadFrame.getThreadButtons().get(index);
        };

        threadFrame.getThreadIdForThreadButton = function(index) {
            var threadButton = threadFrame.getThreadButtonByIndex(index);
            return threadButton.getAttribute('data-test-thread-id')
                .then(function(id) {
                    return id;
                });
        };

        threadFrame.getThreadIdsForAllVisibleThreadButtons = function() {
            //browser.sleep(1000);
            return threadFrame.getThreadButtons()
                .map(function(elem) {
                    return elem.getAttribute('data-test-thread-id');
                })
        };

        threadFrame.getThreadButtonIndexByThreadId = function(threadId, callback) {
            threadFrame.getThreadButtons().then(function(threadButtons) {
                threadButtons.filter(function (elem, index) {
                    elem.getAttribute('data-test-thread-id')
                    .then(function (value) {
                        if (value === threadId) {
                            callback(index);
                        }
                    });
                });
            });
        };


        threadFrame.getThreadButtonByThreadId = function(threadId) {
            browser.wait(until.invisibilityOf(spinner));
            return threadFrame.element(by.css("button[data-test-thread-id='" + threadId + "']"));
        };
        //
        //this.getThreadRecipientNameByThreadId = function(threadId) {
        //    return getThreadButtonByThreadId(threadId)element(by.css("[class$='name ng-binding']")).getText();
        //};
        //
        //this.getThreadDateByThreadId = function(threadId) {
        //    return getThreadButtonByThreadId(threadId).element(by.css("[class$='date ng-binding']")).getText();
        //};
        //
        threadFrame.getThreadAboutByThreadId = function(threadId) {
            return threadFrame.getThreadButtonByThreadId(threadId).element(by.css("[class$='about ng-binding']")).getText();
        };

        threadFrame.getThreadSubjectByThreadId = function(threadId) {
            return threadFrame.getThreadButtonByThreadId(threadId).element(by.css("[class$='subject ng-binding']")).getText();
        };

        threadFrame.checkForLoadMoreThreadsLink = function() {
            return threadFrame.element(by.css("button[data-fs-click^='loadMoreThreads']")).isDisplayed();
        };

        threadFrame.getLoadMoreThreadsLink = function() {
            return threadFrame.element(by.css("button[data-fs-click^='loadMoreThreads']"));
        };

        threadFrame.displayAllThreads = function() {
            //do {
                threadFrame.getLoadMoreThreadsLink().click();
                browser.wait(until.invisibilityOf(element(by.css('div[data-ng-show="loadingMoreThreads"]'))));
                //browser.wait(until.invisibilityOf(by.css('div[data-ng-show="loadingMoreThreads"]')));
            //} while (threadFrame.getThreadCount() < testHelper.prototype.testThreads.length);
        };

        threadFrame.deleteAllThreads = function() {
            threadFrame.displayAllThreads();
            threadFrame.getThreadCount().then(function(count) {
                var mailbox = new mailboxPage();
                do {
                    browser.wait(until.invisibilityOf(spinner));
                    threadFrame.getThreadButtonByIndex(0).click();
                    browser.wait(until.invisibilityOf(spinner));
                    mailbox.getDeleteLink().click();
                    mailbox.getDeleteConversationDialogYesButton().click();
                }while(--count > 0);
            });
        };

        threadFrame.getThreadCount = function() {
            return threadFrame.getThreadButtons().then(function getCount(threadButtons) {
                return threadButtons.length;
            });
        };

        threadFrame.getThreadButtons = function() {
            browser.wait(until.invisibilityOf(spinner));
            return threadFrame.all(by.css('button[class^="thread-button"]'));
        };

        return threadFrame;
    };

    // Message Frame
    this.MessageFrame = function() {
        var messageFrame = element(by.css('div[class="fsmb-messages"]'));
        browser.wait(until.invisibilityOf(spinner));

        messageFrame.getThreadSubjectHeader = function() {
            return messageFrame.by.css('[data-ng-bind-html="thread.subject"]').getText();
        };

        messageFrame.getThreadAboutHeader = function() {
            return messageFrame.by.css('div[class^="thread-about"]').getText();
        };

        messageFrame.getMessageCount = function() {
            return messageFrame.getAllMessagePanels().then(function getCount(messagePanels) {
                return messagePanels.length;
            });
        };

        messageFrame.getMessageSender = function(index) {
            return messageFrame.getAllMessagePanels().get(index).element(by.css('[class="fsmb-message-header"]')).getText();
        };

        messageFrame.getMessageDate = function(index) {
            return messageFrame.getAllMessagePanels().get(index).element(by.css('[class^="message-timestamp"]')).getText();
        };

        messageFrame.getMessageBody = function(index) {
            return messageFrame.getAllMessagePanels().get(index).element(by.css('[class^="fsmb-message-body"]')).getText();
        };

        messageFrame.getLoggedInUserMessagePanels = function() {
            return messageFrame.by.css('div[class$="ng-isolate-scope-mine"]');
        };

        messageFrame.getOtherUserMessagePanels = function() {
            return messageFrame.by.css('div[class$="ng-isolate-scope"]');
        };

        messageFrame.getAllMessagePanels = function() {
            browser.wait(until.invisibilityOf(spinner));
            return messageFrame.all(by.css('div[data-message="message"]'));
        };

        return messageFrame;
    };

    // Reply Frame
    this.ReplyFrame = function() {
        var replyFrame = element(by.css('div[class^="reply-box"]'));
        browser.wait(until.visibilityOf(replyFrame));

        replyFrame.getReplyTextBox = function() {
            return replyFrame.element(by.name("replyMessage"));
        };

        replyFrame.getSendButton = function() {
            return replyFrame.element(by.css('button[class$="fs-send-button"]'))
        };

        return replyFrame;
    };

};

module.exports = mailboxPage;

