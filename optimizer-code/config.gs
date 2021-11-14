const CONFIG = {};

CONFIG.DEBUG = true;
CONFIG.DEFAULT = {};
CONFIG.SHEET = {};
CONFIG.RANGE_BY_NAME = {};
CONFIG.RANGE = {};
CONFIG.CWV = {};
CONFIG.CHECKLIST = {};
CONFIG.SETTINGS = {};

/** 
 * ====================================================================================================================================
 * Checklist
 * ====================================================================================================================================
 * */

CONFIG.CHECKLIST = [
  ["First Contentful Paint (FCP)",
    ["Network",
      ["Time To First Byte (TTFB) takes too long","https://www.cwv-optimizer.com/ttfb"],
      ["Critical resources are not loaded via CDN (network latency)",""],
      ["The used CDN doesn't prioritize HTTP2 requests properly",""],
      ["HTTP/2 Server Push delays rendering of the page (CPU/Bandwidth usage)",""],
      ["DNS is too slow",""],
      ["Outdated HTTP protocol is used (< HTTP/2)",""],
      ["QUIC (HTTP/3) is not supported",""],
      ["Outdated TLS protocols are used (< 1.3)",""],
      ["An Extended Validation (EV) SSL Certificate is used",""],
      ["OCSP Stapling is not supported",""],
      ["SSL is using slow cipher (only amber color in ssllabs test)",""],
      ["SSL session resumption (caching & tickets) is not used",""],
      ["Problems with the SSL Certificate Chain",""],
      ["Too many SAN names used",""],
      ["Strict-Transport-Security header is missing or not set to max-age=10886400;",""],
      ["Connections getting closed (keep-alive not active)",""],
      ["Unnecessary redirects in the critical render path add extra latency",""],
      ["Caching is not specified",""],
      ["Caching is disabled",""],
      ["Caching is too short",""],
      ["Files are not minified (HTML, CSS, JS)",""],
      ["Files are not compressed with Brotli (HTML, CSS, JS, JSON, SVG)",""],                                    
    "Client-side",
      ["Initial load exceeds recommended weight (100 kb HTML, 300 kb JS)",'https://cwv-optimizer.com/checklist-item'],
      ["Render-blocking resources use multiple connections (Single Point Of Failure)",""],
      ["The use of data URLs add fonts, icons, or images to the critical render path",""],
      ["Invalid HTML inside the <head> is causing an early termination of the <head>",""],
      ["<head> order is not optimal",""],
      ["Meta CSP (Content Security Policy) disables preload scanner",""],
      ["The title tag is placed after JS/CSS",""],
      ["Important origins are not preconnected",""],
      ["Too many or not used origins are preconnected",""],
      ["Critical resources are hidden from the preload scanner (CSS @import, document.write)",""],
      ["CSS blocks the execution of subsequent JS (sync/inline)",""],
      ["Synchronous JS blocks subsequent CSS @imports",""],
      ["Bloated HTML (too many nodes, data URLs, etc.)",""],
      ["Synchronous JavaScript in the <head> is render blocking",""],
      ["Render-blocking JS has a lot of unused code",""],
      ["Synchronous Ajax requests are blocking the main-thread",""],
      ["Ajax responds deliver more data than needed",""],
      ["Synchronous CSS in the <head> is render blocking",""],
      ["Render-blocking CSS has a lot of unused code",""],                                       
      ["Synchronous CSS in the <head> is not using media queries to load only breakpoint specific CSS",""],
      ["CSS is not build in a mobile-first fashion",""],
      ["Overprioritized resources are blocking the critical render path (e.g. preloaded web fonts)",""],
      ["Preloaded resources are not used on the page",""],
      ["Prefetched resources are blocking more important resources which are needed to render the current page",""],
      ["Prefetch is not used to load resources which are needed on the next page (resources are cached > 5 minutes)",""],
      ["Just-in-time/predicted prefetching are not used (e.g. instant page, guess.js)",""],
      ["Multiple step pages don't prerender the next step page (page is cached > 5 minutes)",""],
      ["404 errors detected (e.g. favicon.ico. manifest.json, sw.js)",""],
      ["404 error page is too heavy",""],
      ["JS Framework is used to render content on the client-side",""],
      ["Inline JS snippet is used to load JS async (e.g. tag manager) and hides it from the preload scanner",""],
      ["Tag Manager (e.g. Adobe Launch) is not self-hosted",""],                                       
      ["High Priority JS is loaded via Tag Manager",""],
      ["Anti-Flickr script hides page rendering",""],
      ["Text is not visible during the web fonts are loading",""],
      ["The paint time is a performance bottleneck",""],
      ["Missing woff2 file",""],
      ["Incorrect source order in @font-face (woff2, woff, ttf, eot)",""],
      ["Font files contain a lot of unused glyphs",""],
      ["Unicode-ranges are not used on international website (e.g. asian fonts are loaded on english site)",""],
      ["Web fonts are not self-hosted",""],
      ["Web fonts cause multiple reflows",""],
      ["Forced reflows are a performance bottleneck",""],
      ["JS scroll events are bound",""],
      ["An animated GIF is used instead of a video",""],
      ["Media is not loaded adaptively based on Client-Hints (Save-data, DPR, Accept) & Network Information API",""],
      ["Above the fold images are lazy loaded",""],
      ["Below the fold images are not lazy loaded",""],
      ["Modern image formats are not supported (e.g. WebP, AVIF)",""],                                                                       
      ["Images are not compressed well",""],
      ["Image dimension of loaded image is too big (no responsive image support)",""],
      ["Incorrect source order in picture tag (avif, webp, jpg/png)",""],
      ["Image support for a Device Pixel Ratio (DPR) > 2",""],
      ["Unload event is blocking page load",""],
    ],             
  ],
  ["Largest Contentful Paint (LCP)",
    ["Image & Video",     
      ["LCP image is not adding any value and should be removed",'https://cwv-optimizer.com/checklist-item'],
      ["LCP image should be replace by CSS",""],
      ["A sub-optimal image format is used (PNG, animated GIF)",""],
      ["LCP image has a transparent background for no good reason",""],
      ["LCP images is loaded from a different network connection than the HTML (Network latencey & TCP Slowstart)",""],
      ["LCP image is detected/loaded very late (e.g. CSS background-image)",""],
      ["LCP image rendering depends on JS (A/B tests, personalization, hydration, lazy loading)",""],
      ["LCP image is not preloaded",""],
      ["LCP image has not high priority (importance='high')",""],
      ["Preloaded LCP image is not using media-queries to load responsive images",""],
      ["LCP image is lazy loaded",""],
      ["An autotating slider makes it hard to predict the LCP image",""],                                                      
    "Text",
      ["Web font of LCP text is not preloaded",'https://cwv-optimizer.com/checklist-item'],
      ["LCP text depends on JS (e.g. Cookie-Layer, Pop-up)",""],
      ["Text on top of image is not readable until image is loaded (e.g., white text on white background)",""], 
    ]       
  ],
  ["First Input Delay (FID)",
    [
      ["Too many scripts are triggered at the same time (document.ready, Tag Manager events)",'https://cwv-optimizer.com/checklist-item'],
      ["Too much work is done on the main-thread",""],
      ["Long running JS tasks are blocking the main-thread",""],
      ["Client-side rendered content should be server-side rendered",""],
      ["JS gets loaded before it is needed (e.g. live-chat, video player, social media)",""],
      ["Idle until urgent pattern not used",""],
      ["JS Bundles are too big",""],                
      ["Interactive elements are not rendered via JS (e.g. Button is visible before the JS is ready) ",""],                
      ["Legacy code & polyfills are loaded on modern browsers",""],
      ["JS contains translations for multiple languages",""],
  ]],  
  ["Cumulative Layout Shift (CLS)",
    [
      ["Images with missing width and height attributes",'https://cwv-optimizer.com/checklist-item'],
      ["CSS Aspect-ratios for picture elements are not set",""],
      ["No min-height is set for containers with a dynamic height",""],
      ["Non-matching fallback fonts are being swapped",""],
      ["Animations taking longer than 500ms",""],
      ["Non-JS version of an element has a different dimension (progressive enhancement)",""],
      ["Space for dynamic content is not reservered (e.g. ads, embeds and iFrames)",""],
      ["Reserved space collapses if content is not loading (e.g. ad is not delivered)",""],    
    ]      
  ],
  ["Others",
    [
      ["Custom metrics for business critical functions are not in place",'https://cwv-optimizer.com/checklist-item'],
      ["Image sprites are used",""],
      ["Icon Fonts are used instead of SVGs",""],
      ["JS Framework is used for no good reasons",""],
      ["Third-party services with similar functionality are used",""],
      ["Not used third-party services are loladed",""],
      ["Progressive enhancement techniques are not used to provide the best experience for every user",""],
      ["Browser APIs like Save-data, Client Hints, Memory aren't used",""],
      ["CSS Animations trigger layout",""],
      ["Too many web fonts are loaded",""],
      ["External links are not using rel=noopener",""],
      ["Multiple versions of the same JS library are loaded",""],
      ["Outdated versions of JS Frameworks or Libraries are used",""],
      ["Optimistic UI pattern are not used",""],
      ["No animations used to keep the user in the active state (animated button, progessbar)",""],
      ["The difference between First Contentful Paint (FCP) and Time To Interactive (TTI) is larger than 1.25x",""],                
    ]      
  ] 
];

/** 
 * ====================================================================================================================================
 * Defaults
 * ====================================================================================================================================
 * */

CONFIG.DEFAULT.TREND_NAME = 'Trend';
CONFIG.DEFAULT.AUDIT_NAME = 'Audit';
CONFIG.DEFAULT.AUDIT_STATUS_COLOR = 'ea4335';
CONFIG.DEFAULT.COLOR_HEADLINE = '#cfe2f3';
CONFIG.DEFAULT.COLOR_BORDER = '#999999';

CONFIG.DEFAULT.VALIDATION_PRIO = [['Low','#d9ead3','#000000'], ['Medium','#b6d7a8','#000000'], ['High','#93c47d','#000000'], ['Highest','#6aa850','#000000']];
CONFIG.DEFAULT.VALIDATION_EFFORT = [['S','#fff2ce','#000000'], ['M','#ffe599','#000000'], ['L','#ffd966','#000000'], ['XL','#f9c232','#000000']];
CONFIG.DEFAULT.VALIDATION_STATUS = [['Open',null,null], ['In progress','#fbbc04','#000000'], ['Fixed','#34a853','#ffffff'], ['Won\'t fix','#ea4336','#ffffff']];
CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS = [['Not started','#ea4336','#ffffff'], ['In progress','#fbbc04','#000000'], ['Done','#34a853','#ffffff']];

// Format: https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
CONFIG.DEFAULT.TIMEZONE = 'GMT+2';
CONFIG.DEFAULT.DATEFORMAT = 'yyyy-MM-dd';
CONFIG.DEFAULT.TIMEFORMAT = 'HH:mm:ss';
CONFIG.DEFAULT.MESSAGE_SHOW_TIME = 10; // Time in seconds how long messages should be visible before they close automatically

CONFIG.DEFAULT.NO_RESULT = 'n/a';

CONFIG.DEFAULT.RUNTIME_FREE = (4 * 60 + 30) * 1000; // 4m 40s (30 seconds safety time)
CONFIG.DEFAULT.RUNTIME_PAID = (29 * 60 + 30) * 1000; // 29m 40s (30 seconds safety time)

CONFIG.DEFAULT.CRUX_API_LIMIT = 150; // CrUX API: 150 calls per minute
CONFIG.DEFAULT.CRUX_API_TIMEOUT = 250; // 60.000ms/150 calls = 1 call every 400ms
CONFIG.DEFAULT.CRUX_API_TIME = CONFIG.DEFAULT.CRUX_API_TIMEOUT + 150;
CONFIG.DEFAULT.CRUX_FORM_FACTOR = 'ALL_FORM_FACTORS';
CONFIG.DEFAULT.CRUX_ALL_FORM_FACTORS = ['PHONE','DESKTOP','ALL_FORM_FACTORS'];

CONFIG.DEFAULT.AUTOMATION_ACTIVE = 'Active: The CrUX data gets updated daily.';
CONFIG.DEFAULT.AUTOMATION_INACTIVE = 'Inactive: The CrUX data gets not updated automatically.';
CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR = '#34a853';
CONFIG.DEFAULT.AUTOMATION_INACTIVE_COLOR = '#ea4335';

/** 
 * ====================================================================================================================================
 * Settings
 * ====================================================================================================================================
 * */

// Timezone & Format (https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html)
CONFIG.SETTINGS.TIMEZONE = CONFIG.DEFAULT.TIMEZONE;
CONFIG.SETTINGS.DATEFORMAT = CONFIG.DEFAULT.DATEFORMAT;
CONFIG.SETTINGS.TIMEFORMAT = CONFIG.DEFAULT.TIMEFORMAT;

// RUN TIME
CONFIG.SETTINGS.CRUX_API_LIMIT = CONFIG.DEFAULT.CRUX_API_LIMIT;
CONFIG.SETTINGS.CRUX_API_TIMEOUT = CONFIG.DEFAULT.CRUX_API_TIMEOUT;
CONFIG.SETTINGS.CRUX_API_TIME = CONFIG.DEFAULT.CRUX_API_TIME;

// WPT
CONFIG.SETTINGS.AUDIT_WPT_FIRST_ROW = 12;
CONFIG.SETTINGS.AUDIT_WPT_DELETE_CHECKBOX_COLUMN = 1;

CONFIG.SETTINGS.WPT_URL = 'https://www.webpagetest.org/runtest.php';
CONFIG.SETTINGS.WPT_COMPARISON_URL = 'https://www.webpagetest.org/video/compare.php?tests=';
CONFIG.SETTINGS.AUDIT_LINK_COLOR = '#1155cc';

// Planning
CONFIG.SETTINGS.PLANNING_FIRST_ROW = 4;

/** 
 * ====================================================================================================================================
 * Core Web Vitals
 * ====================================================================================================================================
 * */

CONFIG.CWV.TTFB_GOOD = 500;
CONFIG.CWV.TTFB_POOR = 1500;
CONFIG.CWV.FCP_GOOD = 1800;
CONFIG.CWV.FCP_POOR = 3000;
CONFIG.CWV.LCP_GOOD = 2500;
CONFIG.CWV.LCP_POOR = 4000;
CONFIG.CWV.FID_GOOD = 100;
CONFIG.CWV.FID_POOR = 300;
CONFIG.CWV.TBT_GOOD = 300;
CONFIG.CWV.TBT_POOR = 600;
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
CONFIG.CWV.TABLE_COLOR_NO_DATA = 'eeeeee';

/** 
 * ====================================================================================================================================
 * Sheet Names
 * ====================================================================================================================================
 * */

CONFIG.SHEET.CONFIGURATION = 'Configuration';
CONFIG.SHEET.PAGES = 'Pages';
CONFIG.SHEET.PAGE_GROUPS = 'Page Groups';
CONFIG.SHEET.ORIGINS = 'Origins';
CONFIG.SHEET.PLANNING = 'Planning';
CONFIG.SHEET.PAGE_DATA_IMPORTER = 'Page Data Importer';
CONFIG.SHEET.AUDITS_OVERVIEW = 'Audits Overview';
CONFIG.SHEET.BLUEPRINT_AUDIT = '{Blueprint Audit}';
CONFIG.SHEET.TEMPLATE_PAGE_DATA_IMPORTER = '{Template Page Data Importer}';
CONFIG.SHEET.TEMPLATE_AUDIT = '{Template Audit}';
CONFIG.SHEET.TEMPLATE_AUDITS_OVERVIEW = '{Template Audits Overview}';
CONFIG.SHEET.TEMPLATE_PAGES = '{Template Pages}';
CONFIG.SHEET.TEMPLATE_PAGE_GROUPS = '{Template Page Groups}';
CONFIG.SHEET.TEMPLATE_ORIGINS = '{Template Origins}';
CONFIG.SHEET.TEMPLATE_PLANNING = '{Template Planning}';
CONFIG.SHEET.TEMPLATE_TRENDS = '{Template Trends}';
CONFIG.SHEET.TEMPLATE_BENCHMARK = '{Benchmark}';
CONFIG.SHEET.CACHE_URLS = '[Cache URLs]';

// Order of the tables in the sheet
CONFIG.DEFAULT.SHEET_ORDER = [CONFIG.SHEET.CONFIGURATION,CONFIG.SHEET.ORIGINS,CONFIG.SHEET.PAGE_GROUPS,CONFIG.SHEET.PAGES,CONFIG.SHEET.AUDITS_OVERVIEW,CONFIG.SHEET.PLANNING,'audits','trends'];

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

// Google Account
CONFIG.RANGE.GOOGLE_ACCOUNT = 'ConfigGoogleAccount';

// WebPageTest Configuration
CONFIG.RANGE.WPT_TESTS = 'ConfigWptTests';
CONFIG.RANGE_BY_NAME.WPT_API_KEY = 'ConfigWptApiKey';

// CrUX Configuration
CONFIG.RANGE_BY_NAME.CRUX_API_KEY = 'ConfigCruxApiKey';

// Automation
CONFIG.RANGE_BY_NAME.AUTOMATION_STATUS = 'ConfigAutomationStatus';

// Audits
CONFIG.RANGE.AUDIT_URL = 'D1';
CONFIG.RANGE.AUDIT_UPDATE_DATE = 'M6';
CONFIG.RANGE.AUDIT_CRUX_WIDGET = 'M3:Z7';
CONFIG.RANGE.AUDIT_CRUX_WIDGET_DATA = 'O6:Z7';
CONFIG.RANGE.AUDIT_CRUX_WIDGET_TRENDS = 'O7:Z7';
CONFIG.RANGE.AUDIT_WITHOUT_USER_CONSENT = 'AI:BI';
CONFIG.RANGE.AUDIT_NEXT_ROW = 'A11';
CONFIG.RANGE.AUDIT_PAGE_TYPE = 'D3';
CONFIG.RANGE.AUDIT_PAGE_VIEWS = 'D4';
CONFIG.RANGE.AUDIT_PAGE_TOTAL_OPPORTUNITIES = 'M16';
CONFIG.RANGE.AUDIT_PAGE_CHECKLIST_FIRST_ROW = 16;

// Audit Overview
CONFIG.RANGE_BY_NAME.AUDIT_OVERVIEW_FIRST_ROW = 'AuditOverviewFirstRow';
CONFIG.RANGE.AUDITS_OVERVIEW_DATA = 'A3:H';
CONFIG.RANGE.AUDIT_STATUS = 'A1';

// Pages
CONFIG.RANGE.PAGES_DATA = 'A3:U';
CONFIG.RANGE_BY_NAME.PAGES_FIRST_ROW = 'PagesFirstRow';
CONFIG.RANGE.PAGES_AUDITS = 'A3:A';

// Page Groups
CONFIG.RANGE.PAGE_GROUPS_DATA = 'A3:H';
CONFIG.RANGE_BY_NAME.PAGE_GROUPS_FIRST_ROW = 'PageGroupsFirstRow';
CONFIG.RANGE.PAGE_GROUPS_AUDITS = 'A3:A';

// Importer
CONFIG.RANGE.IMPORTER_DATA = 'A3:C';

// Origins
CONFIG.RANGE.ORIGINS_DATA = 'A3:S';
CONFIG.RANGE_BY_NAME.ORIGINS_FIRST_ROW = 'OriginsFirstRow';

// Trends
CONFIG.RANGE.TRENDS_DATA = 'A5:Q';
CONFIG.RANGE.TRENDS_FIRST_ROW = 'A5:Q5';

// Cache
CONFIG.RANGE.CACHE = 'A3:C';
CONFIG.RANGE.CACHE_URLS = 'A3:A';
CONFIG.RANGE.CACHE_STATUS = 'C3:C';

/** 
 * ====================================================================================================================================
 * Helper Functions - Don't change
 * ====================================================================================================================================
 * */

// Get the current configurations from the Configuration sheet
function setConfiguration() { 
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONFIG.SHEET.CONFIGURATION);
  CONFIG.SETTINGS.ORIGINS = getConfigUrls(sheet.getRange(CONFIG.RANGE.ORIGINS).getValues());
  CONFIG.SETTINGS.SITEMAPS = getConfigUrls(sheet.getRange(CONFIG.RANGE.SITEMAPS).getValues());
  CONFIG.SETTINGS.URLS = getConfigUrls(sheet.getRange(CONFIG.RANGE.URLS).getValues());
  CONFIG.SETTINGS.PAGE_GROUPS = getConfigUrls(sheet.getRange(CONFIG.RANGE.PAGE_GROUPS).getValues());  
  CONFIG.SETTINGS.RUNTIME = getRuntime();
  CONFIG.SETTINGS.STARTIME = Date.now();
  CONFIG.SETTINGS.WPT_TESTS = CONFIG.DEFAULT.WPT_TESTS;
}

function getRuntime() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONFIG.SHEET.CONFIGURATION);
  const account = sheet.getRange(CONFIG.RANGE.GOOGLE_ACCOUNT).getValue();
  var runtime;

  // Paid Account
  if (account == 'Paid') {
    runtime = CONFIG.DEFAULT.RUNTIME_PAID;
  } else {
    runtime = CONFIG.DEFAULT.RUNTIME_FREE;
  }
  
  return runtime;
}

function getWptApiKey() {
  const ss = SpreadsheetApp.getActive();
  const apiKey = ss.getRangeByName(CONFIG.RANGE_BY_NAME.WPT_API_KEY).getValue();

  if (apiKey !== '') {
    return apiKey
  } else {
    return null;
  }
}

function getCruxApiKey() {
  const ss = SpreadsheetApp.getActive();
  const apiKey = ss.getRangeByName(CONFIG.RANGE_BY_NAME.CRUX_API_KEY).getValue();

  if (apiKey !== '') {
    return apiKey
  } else {
    return null;
  }
}

function getWptConfig() {
  const ss = SpreadsheetApp.getActive();
  const apiKey = getWptApiKey();
  const configs = ss.getRangeByName(CONFIG.RANGE.WPT_TESTS).getValues();
  var wptConfig = [];
  
  if (apiKey !== null) {
    configs.forEach(function(config) {
      if (apiKey !== '' && config[0] !== '' && config[1] !== '' && config[2] !== '') {
        wptConfig.push(config);          
      }      
    });
  } else {
    wptConfig = null;
  }

  return wptConfig;
}

function isChecked(namedRange) {
  const ss = sheet = SpreadsheetApp.getActive();

  if (ss.getRangeByName(namedRange).getValue() === true) {
    return true;
  } else {
    return false;
  }
}

function isURL(str) {
  if (!str || str == '') {
    return false;
  }

  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

function getConfigUrls(values) {
  var output = [];
  var url;

  for (var i = 0; i < values.length; i++) {    
    url = values[i][0].trim();

    if (isURL(url)) {
      output.push(url);        
    }
  }

  return output;
}
