/**
 * Created by rob birch on 5/24/2016.
 */

var menuHeader = function() {
    var until = protractor.ExpectedConditions;
    var navContainer = element(by.className("global-util-nav-container clearfix"));
    browser.wait(until.invisibilityOf(navContainer));

    this.getMessagesLink = function() {
        return element(by.id('fs-messages-link'));
    };

    this.getShowAllLink = function() {
        return element(by.linkText('Show All'));
    };
};

module.exports = menuHeader;
