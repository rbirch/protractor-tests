/**
 * Created by rob birch on 5/6/2016.
 */
var testHelper = new (require('../util/TestHelper.js'));

var mailboxPage = function() {
    var until = protractor.ExpectedConditions;

    var spinner = element(by.className("fsmb-mailbox__spinner-shell"));
    browser.wait(until.invisibilityOf(spinner));

    //this.getValue = function(element) {
    //    return element.getText().then(function(text){
    //        //console.log("text: " + text);
    //        return text; });
    //};

    this.getValue = function(elementFinder) {
        var promise = protractor.promise.when(elementFinder);
        var text = promise.then(function(text) {
            return text;
        });
        return text;
    };

    this.getMessageCount = function() {
        browser.wait(until.invisibilityOf(spinner));
        //var elementFinder = element(by.css('span[class$="message-counts__messages"]'));//.getText();

        return element(by.css('span[class$="message-counts__messages"]')).getText();
        //return count;
    };

    this.getNoMessagesText = function() {
        return element(by.css("div[class='empty-state-wrapper']").getText());
    };

    this.getDeleteConversationDialogYesButton = function() {
        var dialog = element(by.css("div[class='fs-modal']"));
        browser.wait(until.visibilityOf(dialog));
        return dialog.element(by.css("button[data-cmd='deleteThread']"));
    };

    var getReportAbuseLink = function() {
        return element(by.css("button[data-cmd='showReportAbuseModal']"));
    };

    this.getNewMessageButton = function() {
        return element(by.css('button[class="fsmb-send-message-button fs-button ng-scope"]'));
    };

    // New Message Dialog
    this.NewMessageDialog = function() {
        //var newMessageDialog = element(by.css('div[class="fs-dlg"]'));
        var newMessageDialog = element.all(by.css('div[data-dialog-uid="0"]')).get(0);

        newMessageDialog.getToTextField = function() {
            return newMessageDialog.element(by.css('input[data-ng-if="multipleRecipients'));
        };

        newMessageDialog.getSelectedContact = function() {
            var el = newMessageDialog.element(by.css('span[class="fs-send-messsage__contact-name ng-binding"]'));
            browser.wait(until.visibilityOf(el));
            return el.getText();
        };

        return newMessageDialog;
    };


    // Thread Frame
    this.ThreadFrame = function() {
        var threadFrame =  element(by.css('div[class="fsmb-thread-list"]'));

        threadFrame.getNewMessageButton = function() {
            return threadFrame.element(by.css('button[class="fsmb-send-message-button fs-button ng-scope"]'));
        };

        //threadFrame.getThreadCount = function() {
        //    return getThreadButtons().length;
        //};
        //
        //this.getThreadButtonByIndex = function(index) {
        //    return getThreadButtons().get(index);
        //};
        //
        //this.getThreadIdForThreadButton = function(index) {
        //    return getThreadButtonByIndex(index).getAttribute("data-test-thread-id");
        //};
        //
        //this.getThreadIdsForAllVisibleThreadButtons = function() {
        //    var threadIds = [];
        //    for(var idx = 0; idx < getThreadCount(); idx++) {
        //        threadIds.push(getThreadIdForThreadButton(idx));
        //    }
        //    return threadIds;
        //};
        //
        //this.getThreadButtonIndexByThreadId = function(threadId) {
        //    var elem = getThreadButtonIndexByThreadId(threadId);
        //    return getThreadButtons().indexOf(elem);
        //};
        //
        //this.getThreadButtonByThreadId = function(threadId) {
        //    return threadFrame.element(by.css("button[data-test-thread-id='" + threadId + "']")).getText();
        //};
        //
        //this.getThreadRecipientNameByThreadId = function(threadId) {
        //    return getThreadButtonByThreadId(threadId)element(by.css("[class$='name ng-binding']")).getText();
        //};
        //
        //this.getThreadDateByThreadId = function(threadId) {
        //    return getThreadButtonByThreadId(threadId).element(by.css("[class$='date ng-binding']")).getText();
        //};
        //
        //this.getThreadAboutByThreadId = function(threadId) {
        //    return getThreadButtonByThreadId(threadId).element(by.css("[class$='about ng-binding']")).getText();
        //};
        //
        //this.getThreadSubjectByThreadId = function(threadId) {
        //    return getThreadButtonByThreadId(threadId).element(y.css("[class$='subject ng-binding']")).getText();
        //};
        //
        //this.checkForLoadMoreThreadsLink = function() {
        //    return threadFrame.element(by.css("button[data-fs-click^='loadMoreThreads']")).isDisplayed();
        //};
        //
        //this.clickLoadMoreThreadsLink = function() {
        //    threadFrame.element(by.css("button[data-fs-click^='loadMoreThreads']")).click();
        //    browser.wait(until.invisibilityOf(by.css("div[class='ng-show']")));
        //};

        //this.displayAllThreads = function() {
        //    do {
        //        if(checkForLoadMoreThreadsLink()) {
        //            clickLoadMoreThreadsLink();
        //            browser.wait(1000);
        //        }
        //        else {
        //            break;
        //        }
        //    } while (true);
        //};

        //this.getThreadButtons = function() {
        //    return threadFrame.all(by.css("button[data-thread='thread']"));
        //};

        return threadFrame;
    };

    // Message Frame
    this.MessageFrame = function() {
        browser.wait(until.visibilityOf(by.css("div[class='fsmb-messages']")));
        var messageFrame = by.css("div[class='fsmb-messages']");

        var getThreadSubjectHeader = function() {
            return messageFrame.by.css("[data-ng-bind-html='thread.subject']").getText();
        };

        var getThreadAboutHeader = function() {
            return messageFrame.by.css("div[class^='thread-about']").getText();
        };

        var getMessageCount = function() {
            return getAllMessagePanels().length();
        };

        var getMessageSender = function(index) {
            return getAllMessagePanels().get(index).by.css("[class='fsmb-message-header']").getText();
        };

        var getMessageDate = function(index) {
            return getAllMessagePanels().get(index).by.css("[class^='message-timestamp']").getText();
        };

        var getMessageBody = function(index) {
            return getAllMessagePanels().get(index).by.css("[class^='fsmb-message-body']").getText();
        };

        var getLoggedInUserMessagePanels = function() {
            return messageFrame.by.css("div[class$='ng-isolate-scope-mine']");
        };

        var getOtherUserMessagePanels = function() {
            return messageFrame.by.css("div[class$='ng-isolate-scope']")
        };

        var getAllMessagePanels = function() {
            return messageFrame.all(by.css("div[data-message='message']"));
        };

        return messageFrame;
    };

    // Reply Frame
    this.ReplyFrame = function() {
        browser.wait(until.visibilityOf(by.className("reply-box")));
        var replyFrame = by.className("reply-box");

        var getReplyTextBox = function() {
            return replyFrame.by.name("replyMessage");
        };

        return replyFrame;
    };

};

module.exports = mailboxPage;

