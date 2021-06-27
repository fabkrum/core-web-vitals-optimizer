const CONFIG = {};

CONFIG.DEBUG = true;
CONFIG.DEFAULT = {};
CONFIG.SHEET = {};
CONFIG.RANGE_BY_NAME = {};
CONFIG.RANGE = {};
CONFIG.CWV = {};
CONFIG.SETTINGS = {};

/** 
 * ====================================================================================================================================
 * Defaults
 * ====================================================================================================================================
 * */

CONFIG.DEFAULT.FORM_FACTOR = 'ALL_FORM_FACTORS';
CONFIG.DEFAULT.PAGE_AUDIT_NAME = 'Page Audit';
CONFIG.DEFAULT.PAGE_GROUP_AUDIT_NAME = 'PG Audit';
CONFIG.DEFAULT.WPT_URL = 'https://www.webpagetest.org/runtest.php';

 // Format: https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
CONFIG.DEFAULT.TIMEZONE = 'GMT+2';
CONFIG.DEFAULT.DATEFORMAT = 'yyyy-MM-dd';
CONFIG.DEFAULT.TIMEFORMAT = 'HH:mm:ss';
CONFIG.DEFAULT.EXECUTION_TIME = 1800000;

CONFIG.DEFAULT.CRUX_API_TIMEOUT = 250;
CONFIG.DEFAULT.CRUX_API_TIME = 350;
CONFIG.DEFAULT.CRUX_CACHE_TIME = 2700; // Cache sitemaps and urls for 45m
CONFIG.DEFAULT.CRUX_ALL_FORM_FACTORS = ['PHONE', 'DESKTOP', 'ALL_FORM_FACTORS'];
CONFIG.DEFAULT.AUDIT_STATUS_COLOR = 'ea4335';

/** 
 * ====================================================================================================================================
 * Settings
 * ====================================================================================================================================
 * */

// Timezone & Format (https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html)
CONFIG.SETTINGS.TIMEZONE = CONFIG.DEFAULT.TIMEZONE;
CONFIG.SETTINGS.DATEFORMAT = CONFIG.DEFAULT.DATEFORMAT;
CONFIG.SETTINGS.TIMEFORMAT = CONFIG.DEFAULT.TIMEFORMAT;
CONFIG.SETTINGS.EXECUTION_TIME = CONFIG.DEFAULT.EXECUTION_TIME;

// RUN TIME
CONFIG.SETTINGS.CRUX_API_TIMEOUT = CONFIG.DEFAULT.CRUX_API_TIMEOUT;
CONFIG.SETTINGS.CRUX_API_TIME = CONFIG.DEFAULT.CRUX_API_TIME;
CONFIG.SETTINGS.CRUX_CACHE_TIME = CONFIG.DEFAULT.CRUX_CACHE_TIME;

/** 
 * ====================================================================================================================================
 * Core Web Vitals
 * ====================================================================================================================================
 * */

CONFIG.CWV.FCP_GOOD = 1800;
CONFIG.CWV.FCP_POOR = 3000;
CONFIG.CWV.LCP_GOOD = 2500;
CONFIG.CWV.LCP_POOR = 4000; 
CONFIG.CWV.FID_GOOD = 100;
CONFIG.CWV.FID_POOR = 300;
CONFIG.CWV.CLS_GOOD = 0.1;
CONFIG.CWV.CLS_POOR = 0.25;
CONFIG.CWV.GOOD = 'Good';
CONFIG.CWV.NEEDS_IMPROVEMENT = 'Needs Improvement';
CONFIG.CWV.POOR = 'Poor';
CONFIG.CWV.COLOR_GOOD = '0cce6b';
CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT = 'ffa400';
CONFIG.CWV.COLOR_POOR = 'ff4e42';
CONFIG.CWV.COLOR_NEUTRAL = '000000';
CONFIG.CWV.TABLE_COLOR_GOOD = 'd9ead3';
CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT = 'fff2cc';
CONFIG.CWV.TABLE_COLOR_POOR = 'f4cccc';
CONFIG.CWV.TABLE_COLOR_NEUTRAL = '000000';

/** 
 * ====================================================================================================================================
 * Sheet Names
 * ====================================================================================================================================
 * */

CONFIG.SHEET.CONFIGURATION = 'Configuration';
CONFIG.SHEET.PAGES = 'Pages';
CONFIG.SHEET.PAGE_GROUPS = 'Page Groups';
CONFIG.SHEET.ORIGINS = 'Origins';
CONFIG.SHEET.REF_TABLE_PAGE_AUDIT = '<Reference Pages Audits>';
CONFIG.SHEET.REF_TABLE_GROUP_AUDIT = '<Reference Page Groups Audits>';
CONFIG.SHEET.TEMPLATE_AUDIT = '{Template Audit}';
CONFIG.SHEET.TEMPLATE_PAGES = '{Template Pages}';
CONFIG.SHEET.TEMPLATE_PAGE_GROUPS = '{Template Page Groups}';
CONFIG.SHEET.TEMPLATE_ORIGINS = '{Template Origins}';
CONFIG.SHEET.CACHE_URLS = '[Cache URLs]';
CONFIG.SHEET.CACHE_LAST_URL = '[Cache Last URL]';

/** 
 * ====================================================================================================================================
 * Ranges
 * ====================================================================================================================================
 * */

// Configuration
CONFIG.RANGE.ORIGINS = 'A3:A';
CONFIG.RANGE.SITEMAPS = 'B3:B';
CONFIG.RANGE.URLS = 'C3:C';
CONFIG.RANGE.PAGE_GROUPS = 'D3:D';

CONFIG.RANGE_BY_NAME.FORM_FACTOR_PHONE = 'ConfigFormFactorPhone';
CONFIG.RANGE_BY_NAME.FORM_FACTOR_DESKTOP = 'ConfigFormFactorDesktop';
CONFIG.RANGE_BY_NAME.FORM_FACTOR_ALL_FORM_FACTORS = 'ConfigFormFactorAllFormFactors';

CONFIG.RANGE_BY_NAME.AUDIT_CONDITIONS_POOR = 'ConfigAuditConditionPoor';
CONFIG.RANGE_BY_NAME.AUDIT_CONDITIONS_NEEDS_IMPROVEMENT = 'ConfigAuditConditionNeedsImprovement';
CONFIG.RANGE_BY_NAME.AUDIT_CONDITIONS_GOOD = 'ConfigAuditConditionGood';

// WebPageTest Configuration
CONFIG.RANGE_BY_NAME.WPT_IS_ACTIVE = 'ConfigWptIsActive';
CONFIG.RANGE_BY_NAME.WPT_USER_CONSENT = 'ConfigWptUserConsent';
CONFIG.RANGE_BY_NAME.WPT_LOCATION = 'ConfigWptLocation';
CONFIG.RANGE_BY_NAME.WPT_MOBILE_CONNECTION = 'ConfigWptMobileConnection';
CONFIG.RANGE_BY_NAME.WPT_MOBILE_BROWSER = 'ConfigWptMobileBrowser';
CONFIG.RANGE_BY_NAME.WPT_MOBILE_VIEWPORT_WIDTH = 'ConfigWptMobileViewportWidth';
CONFIG.RANGE_BY_NAME.WPT_MOBILE_VIEWPORT_HEIGHT = 'ConfigWptMobileViewportHeight';
CONFIG.RANGE_BY_NAME.WPT_DESKTOP_CONNECTION = 'ConfigWptDesktopViewportConnection';
CONFIG.RANGE_BY_NAME.WPT_DESKTOP_BROWSER = 'ConfigWptDesktopBrowser';
CONFIG.RANGE_BY_NAME.WPT_DESKTOP_VIEWPORT_WIDTH = 'ConfigWptDesktopViewportWidth';
CONFIG.RANGE_BY_NAME.WPT_DESKTOP_VIEWPORT_HEIGHT = 'ConfigWptDesktopViewportHeight';
CONFIG.RANGE_BY_NAME.WPT_AUTH_USER = 'ConfigWptAuthUser';
CONFIG.RANGE_BY_NAME.WPT_AUTH_PWD = 'ConfigWptAuthPwd';
CONFIG.RANGE_BY_NAME.WPT_SCRIPT = 'ConfigWptScript';
CONFIG.RANGE_BY_NAME.WPT_CUSTOM_METRICS = 'ConfigWptCustomMetrics';
CONFIG.RANGE_BY_NAME.WPT_TEST_RUNS = 'ConfigWptTestRuns';
CONFIG.RANGE_BY_NAME.WPT_REPEAT_VIEW = 'ConfigWptRepeatView';
CONFIG.RANGE_BY_NAME.WPT_SAVE_REQUEST_BODIES = 'ConfigWptSaveResponseBodies';
CONFIG.RANGE_BY_NAME.WPT_FULL_SIZE_VIDEO = 'ConfigWptFullSizeVideo';
CONFIG.RANGE_BY_NAME.WPT_JS_TRACE = 'ConfigWptJsTrace';
CONFIG.RANGE_BY_NAME.WPT_NETWORK_TRACE = 'ConfigWptNetworkTrace';
CONFIG.RANGE_BY_NAME.WPT_CALCULATOR = 'ConfigWptCalc';

// Worker Configuration
CONFIG.RANGE_BY_NAME.WORKER_URL = 'ConfigWorkerUrl';

// Audits
CONFIG.RANGE.AUDIT_WPT_FIRST_ROW = 'A12:BJ12';
CONFIG.RANGE.AUDIT_URL = 'D1';
CONFIG.RANGE.AUDIT_WORKER_URL = 'D5';
CONFIG.RANGE.AUDIT_UPDATE_DATE = 'K6';
CONFIG.RANGE.AUDIT_CRUX_WIDGET = 'K3:X7';
CONFIG.RANGE.AUDIT_CRUX_WIDGET_DATA = 'L6:W6';
CONFIG.RANGE.AUDIT_CRUX_WIDGET_TRENDS = 'L7:W7';
CONFIG.RANGE.AUDIT_WITHOUT_USER_CONSENT = 'AI:BI';
CONFIG.RANGE.AUDIT_NEXT_ROW = 'A11';

// Pages
CONFIG.RANGE.PAGES_DATA = 'A3:U';
CONFIG.RANGE_BY_NAME.PAGES_FIRST_ROW = 'PagesFirstRow';
CONFIG.RANGE.PAGES_AUDITS = 'A3:A';

// Page Groups
CONFIG.RANGE.PAGE_GROUPS_DATA = 'A3:F';
CONFIG.RANGE_BY_NAME.PAGE_GROUPS_FIRST_ROW = 'PageGroupsFirstRow';
CONFIG.RANGE.PAGE_GROUPS_AUDITS = 'A3:A';

// Origins
CONFIG.RANGE.ORIGINS_DATA = 'A3:T';
CONFIG.RANGE_BY_NAME.ORIGINS_FIRST_ROW = 'OriginsFirstRow';

// Cache
CONFIG.RANGE.CACHE = 'A3:B';
CONFIG.RANGE.CACHE_URLS = 'B3:B';
CONFIG.RANGE.CACHE_TIMESTAMP = 'A3';
CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_URL = 'CacheLastUrlUrl';
CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_FORM_FACTOR = 'CacheLastUrlFormFactor';
CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_TESTS_LEFT = 'CacheLastUrlTestsLeft';

// Audit References
CONFIG.RANGE.REFERENCE_AUDIT = 'A3:D';
CONFIG.RANGE.AUDIT_STATUS = 'A1';
CONFIG.RANGE.AUDIT_WPT_FIRST_ROW = '12';


/** 
 * ====================================================================================================================================
 * Helper Functions - Don't change
 * ====================================================================================================================================
 * */

// @TODO: Check if URLS & format are valid when added in Config

// Get the current configurations from the Configuration sheet
function setConfiguration() { 
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONFIG.SHEET.CONFIGURATION);
  CONFIG.SETTINGS.ORIGINS = getConfigData(sheet.getRange(CONFIG.RANGE.ORIGINS).getValues());
  CONFIG.SETTINGS.SITEMAPS = getConfigData(sheet.getRange(CONFIG.RANGE.SITEMAPS).getValues());
  CONFIG.SETTINGS.URLS = getConfigData(sheet.getRange(CONFIG.RANGE.URLS).getValues());
  CONFIG.SETTINGS.PAGE_GROUPS = getConfigData(sheet.getRange(CONFIG.RANGE.PAGE_GROUPS).getValues());
  CONFIG.SETTINGS.FORM_FACTORS = getFormFactors();
  CONFIG.SETTINGS.AUDIT_CONDITIONS = getAuditConditions();  
  CONFIG.SETTINGS.WORKER_URL = ss.getRangeByName(CONFIG.RANGE_BY_NAME.WORKER_URL).getValue();
  CONFIG.SETTINGS.WPT_MOBILE = getWptMobileConfig();
  CONFIG.SETTINGS.WPT_DESKTOP = getWptDesktopConfig();
}

function getWptMobileConfig() {
  const ss = SpreadsheetApp.getActive();
  var config = [
    ['connection', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_MOBILE_CONNECTION).getValue()],
    ['browser', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_MOBILE_BROWSER).getValue()],
    ['viewportWidth', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_MOBILE_VIEWPORT_WIDTH).getValue()],
    ['viewportHeight', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_MOBILE_VIEWPORT_HEIGHT).getValue()]
  ];

  config.concat(getWptGeneralConfig());
  
  return config;
}

function getWptDesktopConfig() {
  const ss = SpreadsheetApp.getActive();
  var config = [    
    ['connection', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_DESKTOP_CONNECTION).getValue()],
    ['browser', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_DESKTOP_BROWSER).getValue()],
    ['viewportWidth', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_DESKTOP_VIEWPORT_WIDTH).getValue()],
    ['viewportHeight', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_DESKTOP_VIEWPORT_HEIGHT).getValue()]
  ];

  config.concat(getWptGeneralConfig());

  return config;
}

function getWptGeneralConfig() {
  const ss = SpreadsheetApp.getActive();
  var config = [
    ['location', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_LOCATION).getValue()],
    ['authUser', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_AUTH_USER).getValue()],
    ['authPwd', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_AUTH_PWD).getValue()],
    ['script', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_SCRIPT).getValue()],
    ['customMetrics', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_CUSTOM_METRICS).getValue()],
    ['testRuns', ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_TEST_RUNS).getValue()],
    ['repeatViews', isChecked(CONFIG.RANGE_BY_NAME.WPT_REPEAT_VIEW)],
    ['saveResponseBodies', isChecked(CONFIG.RANGE_BY_NAME.WPT_SAVE_REQUEST_BODIES)],
    ['fullsizeVideo', isChecked(CONFIG.RANGE_BY_NAME.WPT_FULL_SIZE_VIDEO)],
    ['javascriptTrace', isChecked(CONFIG.RANGE_BY_NAME.WPT_JS_TRACE)],
    ['networkTrace', isChecked(CONFIG.RANGE_BY_NAME.WPT_NETWORK_TRACE)]    
  ];

  return config;
}

function isUserConsent() {
  return isChecked(CONFIG.RANGE_BY_NAME.WPT_USER_CONSENT);
}

function isWpt() {
  return isChecked(CONFIG.RANGE_BY_NAME.WPT_IS_ACTIVE);
}

function isChecked(namedRange) {
  const ss = sheet = SpreadsheetApp.getActive();

  if (ss.getRangeByName(namedRange).getValue() === true) {
    return true;
  } else {
    return false;
  }
}

function getFormFactors() {
  const ss = sheet = SpreadsheetApp.getActive();
  var output = [];

  if (ss.getRangeByName(CONFIG.RANGE_BY_NAME.FORM_FACTOR_PHONE).getValue() === true) {
    output.push('PHONE');
  }

  if (ss.getRangeByName(CONFIG.RANGE_BY_NAME.FORM_FACTOR_DESKTOP).getValue() === true) {
    output.push('DESKTOP');
  }

  if (ss.getRangeByName(CONFIG.RANGE_BY_NAME.FORM_FACTOR_ALL_FORM_FACTORS).getValue() === true) {
    output.push('ALL_FORM_FACTORS');
  }

  // If no form factors are selected take the default one
  if (!output.length) {
    output.push(CONFIG.DEFAULT.FORM_FACTOR);
  }
  
  return output;
}

function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

function getAuditConditions() {
  const ss = SpreadsheetApp.getActive();
  var output = [];

  if (ss.getRangeByName(CONFIG.RANGE_BY_NAME.AUDIT_CONDITIONS_POOR).getValue() === true) {
    output.push(CONFIG.CWV.POOR);
  }

  if (ss.getRangeByName(CONFIG.RANGE_BY_NAME.AUDIT_CONDITIONS_NEEDS_IMPROVEMENT).getValue() === true) {
    output.push(CONFIG.CWV.NEEDS_IMPROVEMENT);
  }

  if (ss.getRangeByName(CONFIG.RANGE_BY_NAME.AUDIT_CONDITIONS_GOOD).getValue() === true) {
    output.push(CONFIG.CWV.GOOD);
  }

  return output;
}

function getConfigData(values) {
  var output = [];

  for(var i=0; i<= values.length; i++) {
    
    if (values[i][0].length === 0) {      
      return output;
    } else if(isURL(values[i][0])) {
      output.push(values[i][0]);        
    } else {
      Logger.log(values[i][0] + ' is not a valid URL.');
    }
  }

  return output;
}
