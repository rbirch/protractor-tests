/**
 * baseConf.js (Protractor Configuration File - For Javascript End to End Testing Framework)
 *
 *
 * By default tests are run in parallel, using localhost:5000, and a local selenium server and chrome-browser-driver
 *
 * Use the following commands to change the default settings
 * --reference=BETA        # change the target reference from integration.familysearch.org to beta.familysearch.org
 * --parallel=true         # turn on parallel processing of tests
 * --browserLocation=SAUCE # use sauce labs browser VMs instead of local browser and selenium server
 * --changeBasedTestSelection=true   # select tests to run based on related code changes that tests apply to
 * --testSuites=(all|home,smoke,...) # select tests to run based on all or comma separated list of test names
 * --multiBrowsers=true              # select tests to run in parallel in both firefox and chrome
 * --params.cleanOnly=true   # only clean the reservation list(s) in the printTempleCards test
 *
 *
 */

var q = require('q');
var testConfig = (new (require('qa-shared-base/lib/config/testConfig.js'))(__dirname)).getConfig();
//var setup = (new (require('./util/Setup.js')));

exports.config = {

  afterLaunch:testConfig.afterLaunch,

  // The timeout in milliseconds for each script run on the browser. This should
  // be longer than the maximum time your application needs to stabilize between
  // tasks.
  allScriptsTimeout: 900000,

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  baseUrl: testConfig.baseUrl,

  // A callback function called once configs are read but before any environment
  // setup. This will only run once, and before onPrepare.
  // You can specify a file containing code to run by setting beforeLaunch to
  // the filename string.
  //
  // At this point, global variable 'protractor' object will NOT be set up,
  // and globals from the test framework will NOT be available. The main
  // purpose of this function should be to bring up test dependencies.
  beforeLaunch: testConfig.beforeLaunch,

      // Protractor can launch your tests on one or more browsers. If you are
      // testing on a single browser, use the capabilities option. If you are
      // testing on multiple browsers, use the multiCapabilities array.
      //
      // For a list of available capabilities, see
      // https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities
      //
      // In addition, you may specify count, shardTestFiles, and maxInstances.
      //capabilities: {
      //  browserName: 'chrome',
      //  // Parallel Options
      //  maxInstances : testConfig.maxInstances,
      //  shardTestFiles : testConfig.shardTestFiles,
      //  //browserName: 'phantomjs',
      //  //'phantomjs.binary.path': require('phantomjs').path,
      //  name: "Acceptance test",
      //
      //  proxy: {
      //    proxyType: "PAC",
      //    proxyAutoconfigUrl: "https://gf.familysearch.org/gf-r1-2.pac"
      //  }
      //
      //},

      // Test framework to use. This may be one of:
      //  jasmine, jasmine2, cucumber, mocha or custom.
      //
      // When the framework is set to "custom" you'll need to additionally
      // set frameworkPath with the path relative to the config file or absolute
      //  framework: 'custom',
      //  frameworkPath: './frameworks/my_custom_jasmine.js',
      // See github.com/angular/protractor/blob/master/lib/frameworks/README.md
      // to comply with the interface details of your custom implementation.
      //
      // Jasmine and Jasmine2 are fully supported as test and assertion frameworks.
      // Mocha and Cucumber have limited support. You will need to include your
      // own assertion framework (such as Chai) if working with Mocha.
  framework: 'jasmine2',

  // How long to wait for a page to load.
  getPageTimeout:90000,

  implicitWait:10000,

  // Options to be passed to minijasminenode.
  //
  // See the full list at https://github.com/juliemr/minijasminenode/tree/jasmine1
  jasmineNodeOpts: testConfig.jasmineNodeOpts,

  // Maximum number of total browser sessions to run. Tests are queued in
  // sequence if number of browser sessions is limited by this parameter.
  // Use a number less than 1 to denote unlimited. Default is unlimited.
  maxSessions : testConfig.maxSessions,

  // A callback function called once protractor is ready and available, and
  // before the specs are executed.
  // If multiple capabilities are being run, this will run once per
  // capability.
  // You can specify a file containing code to run by setting onPrepare to
  // the filename string.
  //
  // At this point, global variable 'protractor' object will be set up, and
  // globals from the test framework will be available. For example, if you
  // are using Jasmine, you can add a reporter with:
  //     jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter(
  //         'outputdir/', true, true));
  //
  // If you need access back to the current configuration object,
  // use a pattern like the following:
  //     browser.getProcessedConfig().then(function(config) {
  //       // config.capabilities is the CURRENT capability being run, if
  //       // you are using multiCapabilities.
  //       console.log('Executing capability', config.capabilities);
  //     });

  //onPrepare: function() {
  //  testConfig.onPrepare;
  //  //testConfig.onPrepare(testConfig.beforeLaunchLogin,  testConfig.afterLaunchLogin, testConfig.generateHTMLReport);
  //  //'./util/Setup.js';
  //},
  onPrepare: testConfig.onPrepare,

      // The params object will be passed directly to the Protractor instance,
      // and can be accessed from your test as browser.params. It is an arbitrary
      // object and can contain anything you may need in your test.
      // This can be changed via the command line as:
      //   --params.runInParallel=true
  params: {
    runInParallel:false
  },

  // CSS Selector for the element housing the angular app - this defaults to
  // body, but is necessary if ng-app is on a descendant of <body>.
  rootElement: '#main', // or whatever selector the ng-app

  // If sauceUser and sauceKey are specified, seleniumServerJar will be ignored.
  // The tests will be run remotely using Sauce Labs.
  sauceKey: testConfig.sauceKey,
  sauceUser: testConfig.sauceUser,

  // The address of a running selenium server.
  seleniumAddress: testConfig.seleniumAddress,

  // Spec patterns are relative to the location of the spec file. They may include glob patterns.
  // Alternatively, suites may be used. When run without a command line
  // parameter, all suites will run. If run with --suite=smoke or
  // --suite=smoke,full only the patterns matched by the specified suites will
  // run.
  suites: testConfig.suites

};

console.log(testConfig.multiCapabilities);
exports.config.multiCapabilities = testConfig.multiCapabilities;
