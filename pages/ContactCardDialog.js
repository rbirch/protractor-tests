/**
 * Created by rob birch on 5/25/2016.
 */

var contactCard = function() {
    var until = protractor.ExpectedConditions;

    var sendButton = element(by.css('button[ng-if="showSendButton"]'));
    browser.wait(until.visibilityOf(sendButton));

    this.sendMessageButton = function() {
        return sendButton;
    };

    // New Message Dialog
    this.newMessageDialog = function() {
        //var newMessageDialog = element(by.css('div[class="fs-dlg"]'));
        var newMessageDialog = element.all(by.css('div[data-dialog-uid="1"]')).get(0);
        browser.wait(until.visibilityOf(newMessageDialog));

        newMessageDialog.getSubjectTextBox = function() {
            return newMessageDialog.element(by.css("input[class^='fs-send-message__subject']"));
        };

        newMessageDialog.getMessageTextBox = function() {
            return newMessageDialog.element(by.css("[class^='fs-send-message__message']"));
        };

        newMessageDialog.getSendButton = function() {
            return newMessageDialog.element(by.css("button[data-ng-click='sendMessage()']"));
        };

        newMessageDialog.fillWithGarbageAndSend = function() {
            newMessageDialog.getSubjectTextBox().sendKeys('sUbJeCt');
            newMessageDialog.getMessageTextBox().sendKeys('mY sTuPiD mEsSaGe');
            newMessageDialog.getSendButton().click();
        };

        return newMessageDialog;
    };

};

module.exports = contactCard;
