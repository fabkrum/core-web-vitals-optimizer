function pagesObject(mode) {
  "use strict";

  // Global variables
  const globalSs = SpreadsheetApp.getActive();
  const globalCacheSheet = globalSs.getSheetByName(CONFIG.SHEET.CACHE_URLS);
  var globalCounterChecked = 0;
  var globalCounterAdded = 0;
  var globalTotalTests = 0;
  var globalActive = true;
  var globalLeftTests = 0;  
  var globalSheet = globalSs.getSheetByName(CONFIG.SHEET.PAGES);
  var globalExistingEntries = [];
  var globalUrl = '';
  var globalFormFactor = '';
  
  function run() {
    setConfiguration();

    // Generate a pages sheet from template if it doesn't exists
    if (globalSheet === null) {
      globalSheet = createSheetFromTemplate(CONFIG.SHEET.PAGES, CONFIG.SHEET.TEMPLATE_PAGES);  
    }

    // Open the Sheet
    globalSs.setActiveSheet(globalSheet);

    globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();

    switch(mode) {
      // Source: URLs from the Page table.
      // This reduces the necessary API calls dramatically and is much faster than the other modes.
      case 'update':
        updateEntries();
      break;

      // Checks the last row in the Pages table.
      // It skips fast foward to this URL before it starts making CrUX API calls.
      case 'continue':
        setStartCondition();
        globalActive = false;
        getNewEntries(false);
      break;

      // Loop all URLs that are hidden in the Config (Sitemap & URLs)
      // For each URL we have to make a CrUX API call. This is a very time consuming process.
      default:
        getNewEntries(true);
    }  
  }

  function updateEntries() {
    var numberOfTests = globalExistingEntries.length;
    
    sendStatusMessage(numberOfTests, 'Pages in table get updated');

    globalExistingEntries.forEach(function(entry, index) {      
      var url = entry[3];
      var formFactor = entry[4];
      
      globalCounterChecked++;
      logStatus(url, formFactor);
      
      getCrUXData('url', url, formFactor);
      Utilities.sleep(CONFIG.DEFAULT.CRUX_API_TIMEOUT);
    });    
  }

  function getNewEntries(showMessage) {
    var sitemaps = getSitemaps();
    var sitemapUrls = getSitemapUrls(sitemaps);
    var numberOfTests = getNumberOfTests(sitemapUrls.length);
    globalTotalTests = numberOfTests;

    if (showMessage === true) {
      sendStatusMessage(numberOfTests, 'All URLs from the Configuration sheet are checked');      
    }

    // Loop through all URLs and get the data from the CrUX API
    CONFIG.SETTINGS.FORM_FACTORS.forEach(function(formFactor) {
      CONFIG.SETTINGS.URLS.forEach(function(url) {
        checkStartCondition('url', url, formFactor, numberOfTests);
      });
      
      sitemapUrls.forEach(function(url) {            
        checkStartCondition('url', url, formFactor, numberOfTests);
      });
    });

    cacheLastUrl(globalUrl, globalFormFactor);
  }

  function addEntry(row) {
    globalExistingEntries.push(row);   
  }

  function isDuplicate(data) {
    var url = data[3];
    var form = data[4];
    var rowNumber = false;

    for (var i = 0; i < globalExistingEntries.length; ++i) {
      if (url === globalExistingEntries[i][3] && form === globalExistingEntries[i][4]) {
        rowNumber = i + 3;      
        break;
      }
    }

    return rowNumber;
  }

  function getEstimatedTestTime(numberOfTests) {    
    var ms = CONFIG.DEFAULT.CRUX_API_TIME * numberOfTests;

    return ms;  
  }

  function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);

    if (seconds < 60) return seconds + " seconds";
    else if (minutes < 60) return minutes + " minutes";
    else if (hours < 24) return hours + " hours";
    else return days + " days"
  }

  function getNumberOfTests(sitemapUrls) {
    var numberOfUrls = sitemapUrls + CONFIG.SETTINGS.URLS.length;
    var numberOfFormFactors = CONFIG.SETTINGS.FORM_FACTORS.length;

    return numberOfFormFactors * numberOfUrls;
  }

  function getSitemaps() {
    var maps = [];

    if (!CONFIG.SETTINGS.SITEMAPS.length) {
        return maps;
    }

    CONFIG.SETTINGS.SITEMAPS.forEach(function(map) {
        var entries = getSitemapEntries(map, 'sitemap');
        
        // Add all sitemaps from index
        if (entries.length) {
            maps.push(...entries);
        // Add a single sitemap
        } else {
            maps.push(map);
        }
    });

    if (maps.length) {
      log(maps.length.toLocaleString() + ' sitemap(s) found. It will take some time to extract all URLs.', true);
    }

    return maps;
  }

  function isValidCache() {
    const now = getTimestamp();
    var timestamp = globalCacheSheet.getRange(CONFIG.RANGE.CACHE_TIMESTAMP).getValue();
    
    if (timestamp === '') {
      return false;
    }
    
    // Calculate the timestamp from the date object    
    timestamp = getTimestamp(timestamp);

    // Check the expire date
    if ((now - timestamp) < CONFIG.DEFAULT.CRUX_CACHE_TIME) {
      return true;
    } else {
      deleteCache();
      return false;
    }
  }

  function deleteCache() {
    globalCacheSheet.getRange(CONFIG.RANGE.CACHE).clearContent();
    log('Deleted outdated cache.', true);
  }

  function getCachedUrls() {
    var cachedUrls = globalCacheSheet.getRange(CONFIG.RANGE.CACHE_URLS).getValues();
    var numberOfCachedUrls = cachedUrls.length;

    if (isValidCache() && numberOfCachedUrls > 1) {  
      const urls = cachedUrls.map(url => {
        return url[0];
      });

      log(numberOfCachedUrls.toLocaleString() + ' URLs from cache are used.', true);
      return urls;  
    } else {
      return null;
    }
  }

  function getTimestamp(date) {
    var timestamp;

    if (date) {
      timestamp = date.getTime();
    } else {
      timestamp = new Date().getTime();
    }

    // Get a timestamp based on seconds instead of miliseconds
    timestamp = Math.floor(timestamp / 1000);

    return timestamp;
  }

  function cacheUrls(urls) {
    const numberOfEntries = urls.length;
    const timestamp = new Date();
    const values = urls.map(url => {
      return [timestamp, url];
    });

    globalCacheSheet.getRange(3, 1, numberOfEntries, 2).setValues(values);
    log('Cached ' + numberOfEntries.toLocaleString() + ' URLs.', true);
  }

  function getSitemapUrls(maps) { 
      var urls = [];
      var cachedUrls = getCachedUrls();

      if (cachedUrls !== null) {
        return cachedUrls;
      }

      if (!maps.length) {
        return urls;        
      }          

      maps.forEach(function(map) {      
          var entries = getSitemapEntries(map, 'url');
        
          if (entries.length) {        
              urls.push(...entries);
          }
      });

      // Sort Urls alphabetically
      urls.sort();

      // Save URLs in Sitemap DB
      cacheUrls(urls);
    
      return urls;
  }

  function getSitemapEntries(url, type) { 
      try {          
        var xml = UrlFetchApp.fetch(url,{muteHttpExceptions:true}).getContentText();                  
        var document = XmlService.parse(xml);
        var root = document.getRootElement();
        var namespace = root.getNamespace().getURI();
        var sitemapNameSpace = XmlService.getNamespace(namespace);
        var entries = root.getChildren(type, sitemapNameSpace);
        var locs = [];
        for (var i = 0; i < entries.length; i++) {          
          locs.push(entries[i].getChild('loc', sitemapNameSpace).getText());
        }

        return locs;

      } catch(e) {
        console.log(e)
        if (e.toString().includes("The markup in the document preceding the root element must be well-formed")) {
          return "Parsing error: is this a valid XML sitemap?";
        } else {
          return e.toString()     
        }
      }
  }

  function setStartCondition() {
    const url = globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_URL);
    const formFactor = globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_FORM_FACTOR);
    const lastRow = globalSheet.getLastRow();
    var data = [];

    if (url !== null && formFactor !== null) {
      CONFIG.START_CONDITION_URL = url.getValue();
      CONFIG.START_CONDITION_FORM_FACTOR = formFactor.getValue();
      log('Start Condition is last cached URL: ' + CONFIG.START_CONDITION_URL + ' / FormFactor: ' + CONFIG.START_CONDITION_FORM_FACTOR, true);
    } else {
      data = globalSheet.getRange(lastRow, 4, 1, 2).getValues();
      CONFIG.START_CONDITION_URL = data[0][0];
      CONFIG.START_CONDITION_FORM_FACTOR = data[0][1];
      log('Start Condition is URL from last row: ' + CONFIG.START_CONDITION_URL + ' / FormFactor: ' + CONFIG.START_CONDITION_FORM_FACTOR, true);
    }
  }

  function cacheLastUrl(url, formFactor) {
    var leftTests = globalTotalTests - globalCounterChecked;
    globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_URL).setValue(url);
    globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_FORM_FACTOR).setValue(formFactor);
    globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.CACHE_LAST_URL_TESTS_LEFT).setValue(leftTests);
    log('Last checked URL is cached: ' + url + ' / Form Factor: ' + formFactor + ' / Tests left: ' + leftTests.toLocaleString());
  }

  function checkStartCondition(source, url, formFactor, numberOfTests) {
    if (globalActive === true) {
      globalUrl = url;
      globalFormFactor = formFactor;
      getCrUXData(source, url, formFactor);
      
      // After every 10th check save the last check URL
      if (globalCounterChecked > 0 && (globalCounterChecked % 10) === 0) {
        cacheLastUrl(url, formFactor);
      }

      globalCounterChecked++;
      logStatus(url, formFactor);
      
      Utilities.sleep(CONFIG.DEFAULT.CRUX_API_TIMEOUT);
    }

    if (globalActive === false) { 
        globalLeftTests++;

        // If the start condition has occured we switch the run mode and checking the CrUX API
        if (url == CONFIG.START_CONDITION_URL && formFactor == CONFIG.START_CONDITION_FORM_FACTOR) {
          globalActive = true;
          globalTotalTests = numberOfTests - globalLeftTests;
          
          sendStatusMessage((globalTotalTests), 'Script continues with new URLs');
        } 
    }

    return;
  }

  function logStatus(url, formFactor) {
    const percentAdded = Math.round((globalCounterAdded * 100 / globalCounterChecked) * 100) / 100;
      log(globalCounterAdded.toLocaleString() + '/' + globalCounterChecked.toLocaleString() + '/' + globalTotalTests.toLocaleString() + ' (' + percentAdded + '%) / '  + formFactor + ' / ' + url, true);
  }

  function sendStatusMessage(numberOfTests, message) {
    var executionTime = getEstimatedTestTime(numberOfTests);

    log(message + ': ' + numberOfTests.toLocaleString() + ' CrUX API Calls are required. Estimated time: ' + msToTime(executionTime), true);
    showMessage(message + ': ' + numberOfTests.toLocaleString() + ' CrUX API Calls are required. Estimated time: ' + msToTime(executionTime));  
  }

  function getStatus(fcp, lcp, fid, cls) {
    var output = '';

    if ((fcp > CONFIG.CWV.FCP_POOR) || (lcp > CONFIG.CWV.LCP_POOR) || (fid > CONFIG.CWV.FID_POOR) || (cls > CONFIG.CWV.CLS_POOR)) {
      output = 'Poor'; 
    } else if ((fcp > CONFIG.CWV.FCP_GOOD) || (lcp > CONFIG.CWV.LCP_GOOD) || (fid > CONFIG.CWV.FID_GOOD) || (cls > CONFIG.CWV.CLS_GOOD)) {
      output = 'Needs Improvement'
    } else {
      output = 'Good';
    }

    return output;
  }

  function setAudit(cell, fcp, lcp, fid, cls) {
    const audit = cell.getValue();
    const status = getStatus(fcp, lcp, fid, cls);
    
    // We already have an audit page or the user made a decision
    if (audit !== '') {
      return;
    }

    // Insert a checkbox
    cell.insertCheckboxes();
    log('Checkbox was added in audit column \ Status: ' + status + ' \ Conditions: ' + CONFIG.SETTINGS.AUDIT_CONDITIONS, true);

    // Check the box if the conditions
    if (CONFIG.SETTINGS.AUDIT_CONDITIONS.includes(status)) {
      cell.setValue(true);
      log('Checkbox was checked.', true);
    }   
  }

  function addRow(...args) {
    const firstRow = globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.PAGES_FIRST_ROW);
    const lastColumn = globalSheet.getLastColumn();
    const fcp = args[5];
    const lcp = args[9];
    const fid = args[13];
    const cls = args[17];    
    const row = [
      '',
      Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT),
      Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.TIMEFORMAT),
      ...args
    ];    
    const index = isDuplicate(row);
    var setValues = [];
    var lastRow;
    var auditCell;

    // Update the exising entry
    if (index !== false) {      
      row.shift();
      setValues.push(row);
      globalSheet.getRange(index, 2, 1, row.length).setValues(setValues);
      auditCell = globalSheet.getRange('A' + index);
      setAudit(auditCell, fcp, lcp, fid, cls);
      updateFormating(index);
      log("Updated Row (" + index + "): " + row, true);
    // Add a new entry
    } else {
      log("New Row: " + row, true);
      addEntry(row);
      globalSheet.appendRow(row);    
      globalCounterAdded++;
      lastRow = globalSheet.getLastRow();
      auditCell = globalSheet.getRange('A' + lastRow);
      setAudit(auditCell, fcp, lcp, fid, cls);

      // Apply the format from first row           
      firstRow.copyFormatToRange(globalSheet, 1, lastColumn, lastRow, lastRow);
      updateFormating(lastRow);
    }

    // Make the change immediately visible in the sheet    
    SpreadsheetApp.flush();
  };

  function updateFormating(row) {
    updateColumnFormat(globalSheet, 'I', 'M', 'Q', 'U', 'F1', 'J1', 'N1', 'R1');
    updateRowFormat(globalSheet, 'I', 'M', 'Q', 'U', 'A', 'E', row);
  }

  function getCrUXData(key, value, formFactor) {
    const response = callAPI({
      [key]: value,
      formFactor
    });

    if (!response) {     
      return;
    }
    
    const fcp = getMetricData(response.record.metrics.first_contentful_paint);
    const lcp = getMetricData(response.record.metrics.largest_contentful_paint);
    const fid = getMetricData(response.record.metrics.first_input_delay);
    const cls = getMetricData(response.record.metrics.cumulative_layout_shift);
    
    addRow(value, formFactor,
          fcp.good, fcp.ni, fcp.poor, fcp.p75,
          lcp.good, lcp.ni, lcp.poor, lcp.p75,
          fid.good, fid.ni, fid.poor, fid.p75,
          cls.good, cls.ni, cls.poor, cls.p75);
  }

  function callAPI(request) {
    try {
      return CrUXApiUtil.query(request);
    } catch (error) {
      console.error(error);
    }
  }

  function getMetricData(metric) {
    if (!metric) {
      return {};
    }
    
    return {
      good: metric.histogram[0].density,
      ni: metric.histogram[1].density,
      poor: metric.histogram[2].density,
      p75: metric.percentiles.p75
    };
  }

  return Object.freeze({
    objectName: 'pagesObject',
    run: run
  });
}
