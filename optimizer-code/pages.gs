function pagesObject(mode) {
  "use strict";

  // Global variables
  const globalSs = SpreadsheetApp.getActive();
  const globalCacheSheet = globalSs.getSheetByName(CONFIG.SHEET.CACHE_URLS);
  var globalCounterChecked = 0;
  var globalCounterAdded = 0;
  var globalTotalTests = 0;  
  var globalSheet = globalSs.getSheetByName(CONFIG.SHEET.PAGES);
  var globalExistingEntries = [];
  var globalCounterApiCalls = 0;
  var globalTrigger = 'user';
  
  function run() {
    setConfiguration();
    var range;
    
    // Delete the trigger
    if (hasTrigger('initPages') || hasTrigger('initUpdatePages')) {
      globalTrigger = 'script';
      deleteTrigger('initPages');
      deleteTrigger('initUpdatePages');
    }

    // Generate a pages sheet from template if it doesn't exists
    if (globalSheet === null) {

      // Only create sheet if we have entries
      if (CONFIG.SETTINGS.SITEMAPS < 1 && CONFIG.SETTINGS.URLS < 1) {
        showAlert('Error: No Page URLs defined','Please go to the configuration sheet first and add URLs in the Sitemap.xml or URLs column.');
        return false;
      } else {
        globalSheet = createSheetFromTemplate(CONFIG.SHEET.PAGES, CONFIG.SHEET.TEMPLATE_PAGES, true);
        log('Pages Sheet was created',true);
        
        // Put the sheets in the right order
        orderSheets();
      }        
    }

    // Open the Sheet
    globalSs.setActiveSheet(globalSheet);

    // Change the headline to make the user aware that things are in progress
    range = globalSheet.getRange('A1');
    range.setFontColor('#ff4e42');
    range.setValue('<Work in progress. Please wait until you see the headline "High-Traffic Pages".>');   

    // Source: URLs from the Page table.
    // This reduces the necessary API calls dramatically and is much faster than the other modes.
    if (mode === 'update') {
      log('Run in update mode');
      updateEntries();
      
    // Source: Sitemap or Cache      
    } else {
      getNewEntries();
    }

    // Set headline after the script has finished
    if (hasTrigger('initPages') === false && hasTrigger('initUpdatePages') === false) {      
      range.setFontColor('#ffffff');
      range.setValue('High-Traffic Pages');
    }
  }
 
  function getNewEntries() {    
    var urls = globalCacheSheet.getRange(CONFIG.RANGE.CACHE).getValues();
    var numberOfTests = 0;
    var startIndex = 0;
    var startTime;

    // Work with the Cache
    if (hasValidEntries(urls)) {
      globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();
      log('Cached URLs found',true);

      // Get the index of the first not tested URL from Cache
      startIndex = getIndexOfFirstNotTestedUrl()
      log('Start Index: ' + startIndex,true);

      // Finish the not tested URLs
      if (startIndex !== null) {
        log('Untested URLs are detected. Move on with index: ' + startIndex);
        // Get all URLs which are in the CrUX DB
        urls = urls.map(url => {
          return url[1];
        });

        numberOfTests = urls.length;
        sendStatusMessage(numberOfTests, 'Checking the untested URLs from the Configuration sheet for "ALL_FORM_FACTORS"');

        startTime = Date.now();

        getData(urls,CONFIG.DEFAULT.CRUX_FORM_FACTOR,startIndex);

      // Start over / Update existing entries and test for new entries
      } else {
        initDeleteCache();
        showMessage('Lets start from scratch and see if there are new entries', 'Cached URLs were deleted');
        getTestUrls();
      }

    // No cached Urls - check sitemaps and Urls
    } else {
      log('No cached URLs found. Check sitemap and URLs');
      getTestUrls();
    }

    startTime = Date.now();
    getCruxApiCallsPerMinute(startTime);
  }

  function updateEntries() {
    var startIndex = null;
    var urls = [];

    globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();
    startIndex = getIndexOfContinueHere();

    if (startIndex !== null) {
      urls = globalExistingEntries.splice(startIndex);
      globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();
    } else {
      urls = globalExistingEntries;
    }

    globalTotalTests = urls.length;
    
    if (globalTotalTests > 0) {
      sendStatusMessage(globalTotalTests, 'Pages in table get updated');
    } else {
      showMessage('No pages found. Please run "Create CrUX Pages" first.', 'Error: No pages found');
      return false;
    }

    urls.every(function(entry) { 
      var url = entry[2];
      var index;      
      
      // Stop the script and set a trigger if the time is up
      if (isTimeUp()) {

        // Mark next entry where we should continue
        index = getIndexOfNextEntry(url);
        globalSheet.getRange(index, 2).setValue('Continue here');
        
        // Set the trigger
        setTrigger('initUpdatePages', globalTrigger);
        return false;
      } else {
        globalCounterChecked++;
        logStatus(url, CONFIG.DEFAULT.CRUX_FORM_FACTOR);
        
        getCrUXData('url', url, CONFIG.DEFAULT.CRUX_FORM_FACTOR);

        // If the number of calls will exceed the API limit set a timeout
        if (globalTotalTests > CONFIG.SETTINGS.CRUX_API_LIMIT) {
          Utilities.sleep(CONFIG.SETTINGS.CRUX_API_TIMEOUT);
        }

        return true;
      }
    });    
  }

  function getIndexOfNextEntry(url) {
    var nextIndex = null;

    globalExistingEntries.every(function(entry,index) {
      const entryUrl = entry[2];

      if (entryUrl === url) {
        nextIndex = index + 3;
        return false;
      } else {
        return true;
      }
    });

    return nextIndex;
  }

  function getTestUrls() {
    const urls = getUrls();
    const numberOfTests = urls.length;

    if (numberOfTests > 0) {
      sendStatusMessage(numberOfTests, 'Checking all URLs from the Configuration sheet for "' + CONFIG.DEFAULT.CRUX_FORM_FACTOR + '"');
    } else {
      showMessage('Please add the sitemap.xml and/or URLs in the configuration sheet.', 'No URLs found');
    }    

    // Check all URLs for all_form_factors and check if they are in the CrUX DB
    getData(urls,CONFIG.DEFAULT.CRUX_FORM_FACTOR,0);
  }

  function getCruxApiCallsPerMinute(startTime) {
    const time = Date.now() - startTime;
    const minutes = Math.floor(time / 60000);
    log('CrUX API calls per minute: ' + globalCounterApiCalls / minutes);
  }

  function hasValidEntries(urls) {
    var status = false;
    var length = urls.length;

    if (length > 1) {
      status = true;
    } else if (length === 1) {
      if (urls[0] != ',,' && urls[0] != '') {
        status = true;
      }
    }

    return status;
  }

  function getData(urls, formFactor, startIndex) {
    const numberOfTests = urls.length - startIndex;
    
    globalTotalTests = numberOfTests;
    sendStatusMessage(numberOfTests, 'Checking all URLs for ' + formFactor);   

    urls.every(function(url,index) {
      var status;

      // Stop the script if the time is up
      if (isTimeUp()) {
        showMessage('The script will start again automatically in 1 minute to check the remaining ' + (numberOfTests - globalCounterChecked) + ' URLs', 'The Script Excecution time is up');
        globalSheet.getRange('A1').setValue('<Work in progress: ' + (numberOfTests - globalCounterChecked) + ' URLs are left>');
        SpreadsheetApp.flush();       
        setTrigger('initPages', globalTrigger);
        return false;

      } else {
        if (index >= startIndex) {
          status = getCrUXData('url', url, formFactor);

          if (status === true) {
            updateCacheUrlStatus(index + 3, 'available');
            globalCounterAdded++;
          } else {
            updateCacheUrlStatus(index + 3, 'not available');
          }

          globalCounterChecked++;
          logStatus(url, formFactor);
          Utilities.sleep(CONFIG.SETTINGS.CRUX_API_TIMEOUT);
        }

        return true;
      }
    });
  }

  // Mark existing CrUX pages in the cache data base
  function updateCacheUrlStatus(index, status) {    
    // Update Timestamp
    globalCacheSheet.getRange(index,1).setValue(getDateTime());
    
    // Update Status
    globalCacheSheet.getRange(index,3).setValue(status);
    
    // Make sure to update the sheet to update the fields right away
    SpreadsheetApp.flush();
  }

  function getUrls() {
    const sitemaps = getSitemaps();
    const sitemapUrls = getSitemapUrls(sitemaps);
    const urls = CONFIG.SETTINGS.URLS;
    const mergedUrls = sitemapUrls.concat(urls);
    var uniqueUrls = [];

    // Get rid of duplicate entries
    uniqueUrls = [...new Set(mergedUrls)];

    // Sort Urls alphabetically
    uniqueUrls.sort();

    // Add the Urls to the Cache list
    if (uniqueUrls.length > 0) {
      cacheUrls(uniqueUrls);
    }

    return uniqueUrls;
  }

  function addEntry(row) {
    globalExistingEntries.push(row);   
  }

  function isDuplicate(data) {
    var url = data[2];    
    var rowNumber = false;

    for (var i = 0; i < globalExistingEntries.length; ++i) {
      if (url == globalExistingEntries[i][2]) {
        rowNumber = i + 3;
        break;
      }
    }

    return rowNumber;
  }

  function getSitemaps() {
    var maps = [];

    if (!CONFIG.SETTINGS.SITEMAPS.length) {
        log('No sitemaps found', true);
        return maps;
    }

    log('Sitempas ' + JSON.stringify(CONFIG.SETTINGS.SITEMAPS), true);

    CONFIG.SETTINGS.SITEMAPS.forEach(function(map) {
        log('Get entries for sitemap ' + map, true);
        var entries = getSitemapEntries(map, 'sitemap');
        
        // Add all sitemaps from index
        if (entries.length) {
            maps.push(...entries);
            log('Found entries', true);
        // Add a single sitemap
        } else {
            log('Found no entries', true);
            maps.push(map);
        }
    });    

    if (maps.length) {
      log(maps.length.toLocaleString() + ' sitemap(s) found. It will take some time to extract all URLs.', true);
      showMessage(maps.length.toLocaleString() + ' sitemap(s) found. It will take some time to extract all URLs.', 'Checking Sitemap(s)');
    }

    return maps;
  }

  function getIndexOfContinueHere() {
    var startIndex = null;

    globalExistingEntries.every(function(entry,index) {

      const timestamp = entry[1];
      const url = entry[2];

      if (timestamp === 'Continue here') {
        startIndex = index;
        log('Continue updating with page (index/url): ' + index + '/' + url,true);
        return false
      } else {
        return true
      }
    });

    return startIndex;
  }

  function getIndexOfFirstNotTestedUrl() {
    var cachedUrls = globalCacheSheet.getRange(CONFIG.RANGE.CACHE).getValues();
    var numberOfCachedUrls = cachedUrls.length;
    var startIndex = null;

    if (cachedUrls && numberOfCachedUrls > 0) {      
      cachedUrls.every(function(page,index) {
        const status = page[2];
        const url = page[1];

        if (status === 'not tested') {
          startIndex = index;
          log('Next not tested page (index/url): ' + index + '/' + url,true);
          return false;
        } else {
          return true;
        }          
      });
    }

    return startIndex;
  }

  function cacheUrls(urls) {
    const numberOfEntries = urls.length;
    const timestamp = getDateTime();
    const status = "not tested";    
    const values = urls.map(url => {
      return [timestamp, url, status];
    });

    globalCacheSheet.getRange(3, 1, numberOfEntries, 3).setValues(values);
    log('Cached ' + numberOfEntries.toLocaleString() + ' URLs.', true);
  }

  function getSitemapUrls(maps) { 
      var urls = [];
      var cachedUrls = globalCacheSheet.getRange(CONFIG.RANGE.CACHE_URLS).getValues();

      if (hasValidEntries(cachedUrls)) {
        log('RETURN CACHED URLS');
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
    
      return urls;
  }

  function getSitemapEntries(url, type) {  
      url = url.trim();    
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

  function logStatus(url) {
    log(globalCounterAdded.toLocaleString() + '/' + globalCounterChecked.toLocaleString() + '/' + globalTotalTests.toLocaleString() + ' / ' + url,true);
  }

  function addRow(...args) {
    const firstRow = globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.PAGES_FIRST_ROW);
    const lastColumn = globalSheet.getLastColumn();
    const numberFormat = [["0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "0.00"]];    
    var numberRange;
    var setValues = [];
    var lastRow;
    var auditCell;
    var row = [
      '',
      getDateTime(),
      ...args
    ];
    const index = isDuplicate(row);

    // Update the exising entry without overwriting audit, page type, and page view
    if (index !== false) {
      // Update Date
      globalSheet.getRange('B' + index).setValue(getDateTime());
      
      // Update CrUX Data    
      row = row.slice(-16);
      setValues.push(row);
      globalSheet.getRange(index, 6, 1, row.length).setValues(setValues);      
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
      setCheckbox(auditCell);
      
      // Apply the format from first row           
      firstRow.copyFormatToRange(globalSheet, 1, lastColumn, lastRow, lastRow);
      
      // Make sure the numbers are correctly formated
      numberRange = globalSheet.getRange('F' + lastRow + ':' + 'U' + lastRow);
      numberRange.setNumberFormats(numberFormat);

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

    globalCounterApiCalls += 1;

    // URL is not part of CrUX DB 
    if (!response) {              
      return false;
    }
    
    const fcp = getMetricData(response.record.metrics.first_contentful_paint);
    const lcp = getMetricData(response.record.metrics.largest_contentful_paint);
    const fid = getMetricData(response.record.metrics.first_input_delay);
    const cls = getMetricData(response.record.metrics.cumulative_layout_shift);

    if (cls.p75 != CONFIG.DEFAULT.NO_RESULT) {
      cls.p75 = parseFloat(cls.p75)
    }
    
    addRow(value,
          '',
          '',
          fcp.good, fcp.ni, fcp.poor, fcp.p75,
          lcp.good, lcp.ni, lcp.poor, lcp.p75,
          fid.good, fid.ni, fid.poor, fid.p75,
          cls.good, cls.ni, cls.poor, cls.p75);

    return true;          
  }

  function toggleDetail() {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(CONFIG.SHEET.PAGES);

    if (sheet === null) {
      showAlert('ERROR: Pages sheet not found','Pleaes create a Pages sheet first.');
      return false;
    }

    const lastRow = sheet.getLastRow();
    const audit = sheet.getRange('A1:A');
    const pageDetails = sheet.getRange('D1:E');
    const fcp = sheet.getRange('F1:H');
    const fcpTitle = sheet.getRange('F1:I1');
    const lcp = sheet.getRange('J1:L');
    const lcpTitle = sheet.getRange('J1:M1');
    const fid = sheet.getRange('N1:P');
    const fidTitle = sheet.getRange('N1:Q1');
    const cls = sheet.getRange('R1:T');
    const clsTitle = sheet.getRange('R1:U1');
    const ranges = [audit, pageDetails, fcp, lcp, fid, cls];
    const titlesShort = [[fcpTitle,'FCP'],[lcpTitle,'LCP'],[fidTitle,'FID'],[clsTitle,'CLS']];
    const titlesLong = [[fcpTitle,'First Contentful Paint (FCP)'],[lcpTitle,'LargestContenful Paint (LCP)'],[fidTitle,'First Input Delay (FID)'],[clsTitle,'Cumulative Layout Shift (CLS)']]; 
    var range;

    sheet.activate();

    // Figure out current view
    if (titlesShort[0][0].getValue() == titlesShort[0][1]) {
      log('Show Detail');

      for (var i = 1; i <= lastRow; i++) {
        range = sheet.getRange('C' + i);
        range.setBorder(null, null, null, false, null, null);
      }

      showDetail(sheet,ranges,titlesLong);
      
    } else {
      log('Hide Detail');
      hideDetail(sheet,ranges,titlesShort);

      for (var j = 1; j <= lastRow; j++) {
        range = sheet.getRange('C' + j);
        range.setBorder(null, null, null, true, null, null, "#999999", SpreadsheetApp.BorderStyle.SOLID_THICK);        
      }
    }     
  }

  return Object.freeze({
    objectName: 'pagesObject',
    run: run,
    toggleDetail: toggleDetail
  });
}
