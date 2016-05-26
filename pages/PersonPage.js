/**
 * Created by rob birch on 5/25/2016.
 * The tree person page
 */
var testHelper = new (require('../util/TestHelper.js'));

var personPage = function(personId) {
    browser.get(browser.testEnv.rootUrl + '/tree/#view=ancestor&section=details&person=' + personId);

    var until = protractor.ExpectedConditions;

    var spinner = element(by.className("fs-dialog__spinner-shell"));
    var showDetails = element.all(by.css('a[class="showDetails"]')).get(0);
    browser.wait(until.invisibilityOf(spinner));
    browser.wait(until.visibilityOf(showDetails));

    this.getOpenDetailsLink = function() {
        return showDetails;
    };

    this.getContributorLink = function() {
        return element.all(by.css('a[class="contributorLink"]')).get(0);
    };

    this.displayContactCard = function() {
        this.getOpenDetailsLink().click();
        this.getContributorLink().click();
    };

};

module.exports = personPage;
