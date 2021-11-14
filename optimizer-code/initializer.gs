/**
 * Adds a menu to the GUI
 */
function onOpen() {
  addMenu();
  updateConfig();
};

/**
 * Functions which are triggered by menu actions
 * */
function onEdit(e) {
  const sheet = e.range.getSheet();
  const name = sheet.getName();  
  const notation = e.range.getA1Notation();
  var lastWorkflowStep;
  var bgColor = '';
  var fontColor = '';
  var status = '';

  // Audit issue status changed - filter planning sheet
  if (name.includes(CONFIG.DEFAULT.AUDIT_NAME) && notation.includes('A')) {
    planningObject().filter();    
  }

  // Audit status was updated - update sheet color
  if (name.includes(CONFIG.DEFAULT.AUDIT_NAME) && notation === CONFIG.RANGE.AUDIT_STATUS) {
    bgColor = e.range.getBackgrounds();
    fontColor = e.range.getFontColor();
    status = e.range.getValue();
    
    // Change the color of the audit tab
    setTabColor(sheet, bgColor);

    // If this is the last step in the workflow hide the tab
    if (isActiveAudit(status) === false) {
      sheet.hideSheet();        
      showMessage('The Audit Sheet: ' + name + ' has reached the last workflow step. You can unhide it in the menu Audits → Show all audit sheets', 'Audit Sheet was hidden', CONFIG.DEFAULT.MESSAGE_SHOW_TIME);
    }

    // Update Audit Status in Audit Overview   
    updateAuditReference(name, 'Status', status, bgColor, fontColor); 
  }
}

/**
 * Functions triggered by menu
 */
function initOrigins() {
  var object = originsObject();

  log('Menu: Origins sheet created/updated', true);
  object.run();
}

function initUpdateOrigins() {
  var object = originsObject('update');  

  log('Menu: Update CrUX data for Origins', true);
  object.run();
}

function getDateTime() {
  return Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT) + ' / ' + Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.TIMEFORMAT);
}

function getDate() {
  return Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT);
}

function linkSheet(cell, name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  const sheetId = sheet.getSheetId();
    
  cell.clearDataValidations();
  cell.setHorizontalAlignment('center');
  cell.setValue(`=HYPERLINK("#gid=${sheetId}"; "${name}")`);
}

function initToggleOriginsDetail() {
  var object = originsObject();

  log('Menu: Origins info detail toggled', true);
  object.toggleDetail();
}

function initTrends() {
  var object = trendsObject();

  log('Menu: Create Trends Sheets', true);
  object.run();
}

function initHideTrends() {
  var object = trendsObject();

  log('Menu: Hide Trend sheets', true);
  object.hideTrends();
}

function initShowTrends() {
  var object = trendsObject();

  log('Menu: Show Trend sheets', true);
  object.showTrends();
}

function initDeleteTrends() {
  var object = trendsObject();

  log('Menu: Delete all Trend sheets', true);
  object.deleteTrends();
}

function initPages() {
  var object = pagesObject();

  log('Menu: Pages sheet created/continued', true);
  object.run();
}

function initUpdatePages() {
  var object = pagesObject('update');  

  log('Menu: Update CrUX data for Pages', true);
  object.run();
}

function initTogglePagesDetail() {
  var object = pagesObject();

  log('Menu: Pages info detail toggled', true);
  object.toggleDetail();
}

function initPageGroups() {
  var object = pageGroupsObject();

  log('Menu: Create/Update Page Groups', true);
  object.run();
}

function initTogglePageGroupsDetail() {
  var object = pageGroupsObject();

  log('Menu: Page Groups info detail toggled', true);
  object.toggleDetail();
}

function initBenchmark() {
  var object = benchmarkObject();

  log('Menu: Create/Update Benchmark', true);
  object.run();
}

function initAudits() {
  // Pages
  log('Menu: Create page audits', true);
  var object = auditsObject('pages');
  object.run();

  // Page Groups
  log('Menu: Create page group audits', true);
  object = auditsObject('pageGroups');  
  object.run();
}

function initCreatePageDataImporter() {
  log('Menu: Create Page Data Importer', true);
  object = importerObject();
  object.createPageDataImporter();
}

function initImportPageData() {
  log('Menu: Import Page Views and Page Types', true);
  object = importerObject();
  object.importPageData();
}

function initRecommendAudits() {
  log('Menu: Recommend audits', true);
  object = auditsObject();
  object.recommendAudits();
}

function initPlanning() {
  var object = planningObject();

  log('Menu: Show Planning Sheet', true);
  object.run();
}

function initHideAudits() {
  var object = auditsObject();

  log('Menu: Hide all Audit sheets', true);
  object.hideAudits();
}

function initShowAllAudits() {
  var object = auditsObject();

  log('Menu: Show all Audit sheets', true);
  object.showAllAudits();
}

function initDeleteAudits() {
  var object = auditsObject();

  log('Menu: Delete all Audit sheets', true);
  object.deleteAudits();
}

function initShowActiveAudits() {
  var object = auditsObject();

  log('Menu: Show active Audit sheets', true);
  object.showActiveAudits();
}

function initDeleteCache() {
  deleteCache();
}

/**
 * Functions triggered by buttons
 */

function initAuditCruxPanelUpdate() {
  var object = auditsObject();

  log('Button: Update CrUX panel in audit sheet', true);
  object.update();
}

function initTrendCruxUpdate() {
  var object = trendsObject();

  log('Button: Update Trend sheet', true);
  object.update();
}

function initWptBenchmark() {
  var object = wptObject('benchmark');

  log('Button: Test Benchmark', true);
  object.run();
}

function initWptHypothesis() {
  var object = wptObject('hypothesis');

  log('Button: Test Hypothesis', true);
  object.run();
}

function initWptDeleteSelectedTests() {
  var object = wptObject();

  log('Button: Delete selected tests', true);
  object.deleteSelectedTests();
}

function initToggleAutomation() {
  const userTimezone = Session.getScriptTimeZone();
  const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(CONFIG.RANGE_BY_NAME.AUTOMATION_STATUS);
  Logger.log(userTimezone);

  if (hasTrigger('updateCruxData') === false) {
    ScriptApp.newTrigger('updateCruxData')
        .timeBased()
        .atHour(4)
        .nearMinute(0)
        .everyDays(1)
        .inTimezone(userTimezone)
        .create();

    // Mark Trend Sheets Green
    setTrendsTabColor(CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR);

    // Update Status in Configuration Sheet
    range.setValue(CONFIG.DEFAULT.AUTOMATION_ACTIVE);
    range.setBackground(CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR);
    range.setFontColor('#ffffff');
  } else {
    deleteTrigger('updateCruxData');

    // Mark Trend Sheets Red
    setTrendsTabColor(CONFIG.DEFAULT.AUTOMATION_INACTIVE_COLOR);

    // Update Status in Configuration Sheet
    range.setValue(CONFIG.DEFAULT.AUTOMATION_INACTIVE);
    range.setBackground(CONFIG.DEFAULT.AUTOMATION_INACTIVE_COLOR);
    range.setFontColor('#ffffff');
  }
}

/**
 * Helper functions
 */

// Put the sheets in order
function orderSheets() {
  const visibleTrends = SpreadsheetApp.getActive().getSheets().filter(s => !s.isSheetHidden()).filter(s => !s.getName().indexOf(CONFIG.DEFAULT.TREND_NAME)).map(s => s);
  const visibleAudits = SpreadsheetApp.getActive().getSheets().filter(s => !s.isSheetHidden()).filter(s => !s.getName().indexOf(CONFIG.DEFAULT.AUDIT_NAME)).map(s => s);
  const sheetOrder = CONFIG.DEFAULT.SHEET_ORDER;  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = [];

  // Merge sheets with audits and trends
  sheetOrder.forEach(function(sheet) {
    if (sheet === 'audits') {
      visibleAudits.forEach(function(sheet) {
        if (sheet.getName() !== CONFIG.SHEET.AUDITS_OVERVIEW) {
          sheets.push(sheet);            
        }        
      });
    } else if (sheet === 'trends') {
      visibleTrends.forEach(function(sheet) {
        sheets.push(sheet);
      });
    } else {      
      sheets.push(ss.getSheetByName(sheet));
    }
  });

  // Put the sheets in the correct order
  sheets.forEach(function(sheet,index) {    
    if (sheet !== null) {      
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(index + 1);
    }    
  });
}

function setValidation(range,items,defaultValue,showDropdown) {
  var listItems = [];
  var rule;
  
  items.forEach(function(item){
    listItems.push(item[0]);
  });

  if (showDropdown === false) {
    rule = SpreadsheetApp.newDataValidation().requireValueInList(listItems,false).build();
  } else {
    rule = SpreadsheetApp.newDataValidation().requireValueInList(listItems,true).build();
  }
  
  range.setDataValidation(rule);

  // Set a default value
  if (defaultValue !== '') {
    range.setValue(defaultValue);
  }
}

function setConditionalFormatting(sheet,range,items) {
  var rules = sheet.getConditionalFormatRules();
  
  items.forEach(function(item) {      
    var rule;

    // Set Conditional Formatting
    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(item[0])
      .setBackground(item[1]) 
      .setFontColor(item[2]) 
      .setRanges([range])
      .build();

    rules.push(rule);
  });

  sheet.setConditionalFormatRules(rules);
}

// Change tab color of Trend sheets
function setTrendsTabColor(color) {
  const trendSheets = SpreadsheetApp.getActive().getSheets().filter(s => !s.getName().indexOf(CONFIG.DEFAULT.TREND_NAME)).map(s => s.getName());    
  
  trendSheets.forEach(function(name) {
    const sheet = SpreadsheetApp.getActive().getSheetByName(name);
    setTabColor(sheet, color);
  });
}

// Update CrUX data in all sheets
function updateCruxData() {
  // Remember the active sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(CONFIG.RANGE_BY_NAME.AUTOMATION_STATUS);
  
  // Update CrUX data
  initOrigins();
  updateTrendSheets();
  updateAuditSheetsCrux();
  initUpdatePages();
  
  // Update Status in Configuration Sheet
  range.setValue('Active (Last update: ' + getDateTime() + ')');
  range.setBackground(CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR);

  // Open the sheet which was active before we started
  sheet.activate();
}

function isTimeUp() {
  const now = Date.now();

  if ((now - CONFIG.SETTINGS.STARTIME) > CONFIG.SETTINGS.RUNTIME) {
    return true;
  } else {
    return false;
  }
}

function setTrigger(functionName,trigger) {
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyMinutes(1)
    .create();
  
  log('Trigger is set for ' + functionName, true);
  
  // Run this at the end, otherwise the trigger will be only set after the user clicked the OK button and the Excecution Timeout might be before
  if (trigger === 'user') {
      showAlert('The script execution time is up', 'The script will be automatically restarted in 1 minute to finish the task. Please do not start the function manually.');
  }
}

function deleteTrigger(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  
  triggers.forEach(function (trigger) {        
    if (trigger.getEventType() == ScriptApp.EventType.CLOCK && trigger.getHandlerFunction() == functionName) {
      ScriptApp.deleteTrigger(trigger);
      log('Trigger is deleted for ' + functionName, true);
    }
  });
}

function hasTrigger(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  var hasTrigger = false;

  triggers.every(function (trigger) {        
    if (trigger.getEventType() == ScriptApp.EventType.CLOCK && trigger.getHandlerFunction() == functionName) {
      hasTrigger = true;      
      return false;
    }

    return true;
  });

  return hasTrigger;
}

// Check if it is a valid timestamp
function isValidTimestamp(time) {
  return (new Date(time)).getTime() > 0;
}

// Create a menu and add it to 
function addMenu() {
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu('Core Web Vital Optimizer')
    .addSubMenu(ui.createMenu('1. Origins')
      .addItem('Create/Update CrUX Origins', 'initOrigins')      
      .addSeparator()
      .addItem('Toggle detail', 'initToggleOriginsDetail'))
    .addSubMenu(ui.createMenu('2. Page Groups')
      .addItem('Create/Update Page Groups', 'initPageGroups')
      .addSeparator()
      .addItem('Toggle detail', 'initTogglePageGroupsDetail'))     
    .addSubMenu(ui.createMenu('3. Pages')
      .addItem('Create/update CrUX Pages', 'initPages')
      .addSeparator()
      .addItem('Update CrUX data in Pages table', 'initUpdatePages')
      .addSeparator()
      .addItem('Toggle detail', 'initTogglePagesDetail')
      .addSeparator()
      .addItem('Delete cached URLs', 'initDeleteCache')
      .addItem('Reset cache URL status', 'initResetCache'))
    .addSubMenu(ui.createMenu('4. Import page data')
      .addItem('Create Page Data Importer sheet', 'initCreatePageDataImporter')
      .addSeparator()
      .addItem('Import Page Views and Page Types', 'initImportPageData'))
    .addSubMenu(ui.createMenu('5. Audits')
      .addItem('Recommend audits', 'initRecommendAudits')
      .addSeparator()
      .addItem('Create Audit sheets for marked pages', 'initAudits')
      .addSeparator()
      .addItem('Hide all Audit sheets', 'initHideAudits')      
      .addItem('Show active Audit sheets', 'initShowActiveAudits')
      .addItem('Show all Audit sheets', 'initShowAllAudits')
      .addSeparator()
      .addItem('Delete all Audit & Planning sheets', 'initDeleteAudits'))
    .addSubMenu(ui.createMenu('6. Planning')
      .addItem('Show Planning Sheet', 'initPlanning'))
    .addSubMenu(ui.createMenu('7. Trends')
      .addItem('Create Trend sheets for marked origins', 'initTrends')
      .addSeparator()
      .addItem('Hide Trend sheets', 'initHideTrends')
      .addItem('Show Trend sheets', 'initShowTrends')
      .addSeparator()
      .addItem('Delete all Trend sheets', 'initDeleteTrends'))    
    .addToUi();

    log('Custom menu was updated.',true);
    showMessage('Core Web Vitals functionality was added to the main nav.','Custom menu is available');
}

function getScriptId() {
  return scriptId = ScriptApp.getScriptId();
}

function callAPI(request) {
  try {
    return CrUXApiUtil.query(request);
  } catch (error) {
    console.error(error);
  }
}

// Set the color of the sheet tab
function setTabColor(sheet, color) {
  if (!color) {
    color = CONFIG.DEFAULT.AUDIT_STATUS_COLOR;
  }

  sheet.setTabColor(color);    
  log('Tab sheet color updated for ' + sheet.getName(), true)
}

function getCwvStatus(lcp,fid,cls) {
  status = [];

  status.push(getMetricStatus(lcp,CONFIG.CWV.LCP_GOOD, CONFIG.CWV.LCP_POOR));
  status.push(getMetricStatus(fid,CONFIG.CWV.FID_GOOD, CONFIG.CWV.FID_POOR));
  status.push(getMetricStatus(cls,CONFIG.CWV.CLS_GOOD, CONFIG.CWV.CLS_POOR));

  if (status.includes(CONFIG.CWV.POOR)) {
    return CONFIG.CWV.POOR;
  } else if (status.includes(CONFIG.CWV.NEEDS_IMPROVEMENT)) {
    return CONFIG.CWV.NEEDS_IMPROVEMENT;
  } else if (status.includes(CONFIG.CWV.GOOD)) {
    return CONFIG.CWV.GOOD;
  } else {
    return null;
  }
}

function getMetricStatus(number,good,poor) {
  if (isNaN(number) || isNaN(good) || isNaN(poor)) {
    return null;
  }

  if (number <= good) {
    return CONFIG.CWV.GOOD;
  } else if (number > poor) {
    return CONFIG.CWV.POOR;
  } else {
    return CONFIG.CWV.NEEDS_IMPROVEMENT;
  }
}

function updateAuditReference(name, field, value, bgColor, fontColor) {
  const auditReferenceSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.AUDITS_OVERVIEW);
  const auditReferences = auditReferenceSheet.getRange(CONFIG.RANGE.AUDITS_OVERVIEW_DATA).getValues();

  log('Update Audit Overview: ' + name + " " + field + " " + value + " " + bgColor, true);

  auditReferences.every(function(audit,index) {
    const row = index + 3;
    var range;

    if (name == audit[0]) {
        switch (field) {
        case 'Status':
          range = auditReferenceSheet.getRange('B' + row);
          
          // Update Last Change Date
          auditReferenceSheet.getRange('C' + row).setValue(getDateTime());

          log('Status is updated: ' + value, true);
          break;

        case 'Page Type':
          range = auditReferenceSheet.getRange('E' + row);
          log('Page Type is updated: ' + value, true);
          break;

        case 'Page Views':
          range = auditReferenceSheet.getRange('F' + row);
          log('Page Type is updated: ' + value, true);
          break;            
        
        default:
          log('Field is not available: ' + field, true);
      }

      range.setValue(value);        

      if (bgColor != '') {
        range.setBackground(bgColor);
      }

      if (fontColor != '') {
        range.setFontColor(fontColor);
      }

      return false; 
      
    } else {
      return true;
    }
  });
}

// Shows a popup window in the lower right corner of the spreadsheet with the given title and message, that stays visible for a certain length of time.
function showMessage(message, title, closeAfterSeconds) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (!closeAfterSeconds) {
    closeAfterSeconds = CONFIG.DEFAULT.MESSAGE_SHOW_TIME;
  }

  ss.toast(message, title, closeAfterSeconds);
}

function sendStatusMessage(numberOfTests, message) {  
  log(message + ': ' + numberOfTests.toLocaleString() + ' CrUX API Calls are required.', true);
  showMessage(message + ': ' + numberOfTests.toLocaleString() + ' CrUX API Calls are required.');  
}

function showAlertWithButton(title,message) {
  const ui = SpreadsheetApp.getUi(); // Same variations.
  const result = ui.alert(
    title,
    message,
    ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (result == ui.Button.YES) {
    log('User clicked YES');
    return true;
  } else {
    log('User clicked NO');
    return false;
  }
}

function showAlert(title,message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert(title,message,ui.ButtonSet.OK);
}

function getAverage(values) {  
  var length = values.length;
  var sum = 0;
  var average;
  var divider = 0;
  var value = '';
  var float = 0;

  if (length) {
    for (var i = 0; i < length; i++) {
      value = values[i];
      float = parseFloat(value, 10);

      if (isNaN(float)) {
        continue;
      }

      sum += float;
      divider++;
    }

    average = sum / divider;

    return average;
  } else {
    return 0;
  }
}

// Update the header
function updateColumnFormat(sheet, fcpColumn, lcpColumn, fidColumn, clsColumn, fcpHead, lcpHead, fidHead, clsHead) {
  const array = [
    [CONFIG.CWV.FCP_GOOD,CONFIG.CWV.FCP_POOR,sheet.getRange(fcpColumn + '3:' + fcpColumn).getValues(),sheet.getRange(fcpHead)],
    [CONFIG.CWV.LCP_GOOD,CONFIG.CWV.LCP_POOR,sheet.getRange(lcpColumn + '3:' + lcpColumn).getValues(),sheet.getRange(lcpHead)],
    [CONFIG.CWV.FID_GOOD,CONFIG.CWV.FID_POOR,sheet.getRange(fidColumn + '3:' + fidColumn).getValues(),sheet.getRange(fidHead)],
    [CONFIG.CWV.CLS_GOOD,CONFIG.CWV.CLS_POOR,sheet.getRange(clsColumn + '3:' + clsColumn).getValues(),sheet.getRange(clsHead)]
  ];

  array.forEach(function(item) {
    var good = item[0];
    var poor = item[1];
    var values = item[2];
    var range = item[3];
    var average = getAverage(values);

    if (average <= good) {
      range.setBackground('#' + CONFIG.CWV.COLOR_GOOD);
    } else if(average > poor) {
      range.setBackground('#' + CONFIG.CWV.COLOR_POOR);
    } else if(average !== 0) {
      range.setBackground('#' + CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT);  
    } else {
      range.setBackground('#' + CONFIG.CWV.COLOR_NEUTRAL);  
    }
  });
}  

// Update the row
function updateRowFormat(sheet, fcpColumn, lcpColumn, fidColumn, clsColumn, urlColumn, formFactorColumn, row) {
  const range = sheet.getRange(urlColumn + row + ':' + formFactorColumn + row);
  const array = [
    [CONFIG.CWV.FCP_GOOD,CONFIG.CWV.FCP_POOR,sheet.getRange(fcpColumn + row)],
    [CONFIG.CWV.LCP_GOOD,CONFIG.CWV.LCP_POOR,sheet.getRange(lcpColumn + row)],
    [CONFIG.CWV.FID_GOOD,CONFIG.CWV.FID_POOR,sheet.getRange(fidColumn + row)],
    [CONFIG.CWV.CLS_GOOD,CONFIG.CWV.CLS_POOR,sheet.getRange(clsColumn + row)]
  ];
  var status = [];

  // Update the cell
  array.forEach(function(item) {
    var good = item[0];
    var poor = item[1];
    var range = item[2];
    var value = range.getValue();

    if (value !== CONFIG.DEFAULT.NO_RESULT) {
      if(value <= good) {
        range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_GOOD);
        status.push(CONFIG.CWV.GOOD);           
      } else if(value > poor) {
        range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_POOR);
        status.push(CONFIG.CWV.POOR);
      } else {        
        range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT);
        status.push(CONFIG.CWV.NEEDS_IMPROVEMENT);
      }
    } else {
      range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_NO_DATA);
    }
  });

  // Update the URL (row summary)
  if (status.includes(CONFIG.CWV.POOR)) {
    range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_POOR);
  } else if (status.includes(CONFIG.CWV.NEEDS_IMPROVEMENT)) {
    range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT);
  } else if (status.includes(CONFIG.CWV.GOOD)) {
    range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_GOOD);
  }
}

function deleteCache() {
  const cacheSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.CACHE_URLS);
  const firstRow = 3;
  const lastRow = cacheSheet.getRange(CONFIG.RANGE.CACHE).getLastRow() - 2;

  if (lastRow < 3) {
    log('Cache was empty.', true);
    return;
  } else {
    cacheSheet.deleteRows(firstRow, lastRow);
    log('Deleted cache. First row: ' + firstRow + ' / Last row: ' + lastRow, true);
  }
}

function initResetCache() {
  const cacheSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.CACHE_URLS);
  const firstRow = 3;
  const lastRow = cacheSheet.getRange(CONFIG.RANGE.CACHE).getLastRow();
  var values = [];
  var rows;
  
  if (lastRow < 3) {
    log('Cache is empty.', true);
    return;
  } else {
    rows = lastRow - firstRow;
    
    for (i=0; i <= rows; i++) {
      values.push(['not tested']);
    }

    cacheSheet.getRange(CONFIG.RANGE.CACHE_STATUS).setValues(values);    
    log('Reset Cache URLs to status "not tested"', true);
  }
}

function updateTrendSheets() {
  const trendSheets = SpreadsheetApp.getActive().getSheets().filter(s => !s.getName().indexOf(CONFIG.DEFAULT.TREND_NAME)).map(s => s);  

  log('Now starting updating trend sheets',true);

  // Loop through audit sheets and update CrUX data panel
  if (trendSheets !== undefined && trendSheets.length > 0) {
    trendSheets.forEach(function(sheet) {      
      const name = sheet.getName();

      log('Update CrUX data in Trend sheet: ' + name,true);

      // Open Spreadsheet
      sheet.activate();
      
      // Update CrUX Panel
      initTrendCruxUpdate();      
           
    });
  } else {
    return false;
  }  
}

function updateAuditSheetsCrux() {
  const auditSheets = SpreadsheetApp.getActive().getSheets().filter(s => !s.getName().indexOf(CONFIG.DEFAULT.AUDIT_NAME)).map(s => s);  

  // Loop through audit sheets and update CrUX data panel
  if (auditSheets !== undefined && auditSheets.length > 0) {
    auditSheets.forEach(function(sheet) {      
      const name = sheet.getName();

      if (name !== CONFIG.SHEET.AUDITS_OVERVIEW) {
        log('Update CrUX data in audit ' + name, true);

        // Open Spreadsheet
        sheet.activate();
        
        // Update CrUX Panel
        initAuditCruxPanelUpdate();    
      }      
    });
  } else {
    return false;
  }
}

function createSheetFromTemplate(name, template, show) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);
  const templateSheet = ss.getSheetByName(template);
  var newSheet = null;

  // The page we want to create does already exists
  if (sheet === null) {
    // Error: Template Sheet doesn't exists
    if (templateSheet === null) {
      showAlert('Missing Template Sheet','The Template ' + template + ' is required but missing.');      
    } else {
      // Create a new page sheet from template
      newSheet = templateSheet.copyTo(ss);

      // Rename new sheet
      newSheet.setName(name);
      
      // Unhide new sheet
      if (show === true) {
        newSheet.showSheet();         
      }

      log('Created sheet ' + name, true);
    }    
  } else {
    log('Sheet ' + name + ' already exsits.', true);
    showAlert('Sheet does alrady exists','A sheet with the name ' + name + ' does already exist and can not be created');
  }

  return newSheet;
}

function showDetail(sheet,ranges,titles) {    
  ranges.forEach(function(range) {
    sheet.unhideColumn(range);      
  });

  if (titles !== undefined) {
    titles.forEach(function(title) {
      title[0].setValue(title[1]);
    });
  }  
}

function hideDetail(sheet,ranges,titles) {
  ranges.forEach(function(range) {
    sheet.hideColumn(range);      
  });

  if (titles !== undefined) {
    titles.forEach(function(title) {      
      title[0].setValue(title[1]);      
    });
  }    
}

// Formats CWV data (number) and sets the no_result default if the metric has no value
function getMetricData(metric) {
  if (!metric) {
    return {
      good: CONFIG.DEFAULT.NO_RESULT,
      ni: CONFIG.DEFAULT.NO_RESULT,
      poor: CONFIG.DEFAULT.NO_RESULT,
      p75: CONFIG.DEFAULT.NO_RESULT
    };
  }

  metric.histogram.forEach(function(value, index) {      
    if (!value.hasOwnProperty('density')) {
      metric.histogram[index].density = CONFIG.DEFAULT.NO_RESULT;
    }
  });

  if (!metric.histogram[2].hasOwnProperty('percentiles')) {
    metric.histogram[2].percentiles = CONFIG.DEFAULT.NO_RESULT;
  }

  return {
    good: metric.histogram[0].density,
    ni: metric.histogram[1].density,
    poor: metric.histogram[2].density,
    p75: metric.percentiles.p75
  };
}

// Show all sheets of a type (CONFIG.DEFAULT_SHEET-TYPE-NAME)
function showSheetsOfType(type) {
  const hiddenSheets = SpreadsheetApp.getActive().getSheets().filter(s => s.isSheetHidden()).filter(s => !s.getName().indexOf(type)).map(s => s.getName());
  
  hiddenSheets.forEach(function(name) {
    const sheet = SpreadsheetApp.getActive().getSheetByName(name);
    
    sheet.showSheet();      
    log('Made sheet visible: ' + name,true);
  });
}

// Hide all sheets of a type (CONFIG.DEFAULT_SHEET-TYPE-NAME)
function hideSheetsOfType(type) {
  const visibleSheets = SpreadsheetApp.getActive().getSheets().filter(s => !s.isSheetHidden()).filter(s => !s.getName().indexOf(type)).map(s => s.getName());    
  
  visibleSheets.forEach(function(name) {
    if (name != CONFIG.SHEET.AUDITS_OVERVIEW) {
      const sheet = SpreadsheetApp.getActive().getSheetByName(name);
    
      sheet.hideSheet();
      log('Hidded sheet: ' + name,true); 
    }
  });
}

// Delete all sheets of a type
function deleteSheetsOfType(type,alert) {
  const sheets = SpreadsheetApp.getActive().getSheets().filter(s => !s.getName().indexOf(type)).map(s => s.getName());
  const userFeedback = showAlertWithButton('WARNING: You are about to delete data!','Are you really sure you want to delete all sheets of the type  ' + alert + ' permanently?');

  if (userFeedback === false) {
    log('User Feedback (function stopped): ' + userFeedback);
    return false;
  }

  sheets.forEach(function(name) {
    if (name != CONFIG.SHEET.AUDITS_OVERVIEW) {
      const ss = SpreadsheetApp.getActive();
      const sheet = ss.getSheetByName(name);

      ss.deleteSheet(sheet);
      log('Deleted sheet: ' + name,true);
    }
  });
  
  return true;
}

function getNextId(usedIds) {    
  var i = 1;
  var id = null;

  do {
    if (usedIds.includes(i)) {
      i++
    } else {
      id = i;
    }
  } while (id === null);

  return id;
}

function setCheckbox(cell) {
  const checkbox = cell.getValue();
  
  // We already have an audit page or the user made a decision
  if (checkbox !== '') {
    return;
  }

  // Insert a checkbox
  cell.insertCheckboxes();    
}

function formatTtfb(value) {
  return formatMetric(CONFIG.CWV.TTFB_GOOD,CONFIG.CWV.TTFB_POOR,value);
}

function formatFcp(value) {
  return formatMetric(CONFIG.CWV.FCP_GOOD,CONFIG.CWV.FCP_POOR,value);
}  

function formatLcp(value) {
  return formatMetric(CONFIG.CWV.LCP_GOOD,CONFIG.CWV.LCP_POOR,value);
}

function formatTbt(value) {
  return formatMetric(CONFIG.CWV.TBT_GOOD,CONFIG.CWV.TBT_POOR,value);
}

function formatFid(value) {
  return formatMetric(CONFIG.CWV.FID_GOOD,CONFIG.CWV.FID_POOR,value);  
}

function formatCls(value) {
  return formatMetric(CONFIG.CWV.CLS_GOOD,CONFIG.CWV.CLS_POOR,value);  
}

function formatMetric(good,poor,value) {
  var color = null;

  if (value <= good) {
    color = CONFIG.CWV.TABLE_COLOR_GOOD;
  } else if(value > good && value <= poor) {
    color = CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT;  
  } else if(value > poor) {
    color = CONFIG.CWV.TABLE_COLOR_POOR;
  }

  return '#' + color;
}

function updateConfig() {
  const range = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(CONFIG.RANGE_BY_NAME.AUTOMATION_STATUS);
  const background = range.getBackground();

  // We have a trigger but the status is inactive: Update the status
  if (hasTrigger('updateCruxData') === true && background === CONFIG.DEFAULT.AUTOMATION_INACTIVE_COLOR) {
    // Update Status in Configuration Sheet
    range.setValue(CONFIG.DEFAULT.AUTOMATION_ACTIVE);
    range.setBackground(CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR);
    range.setFontColor('#ffffff');
    
    // Mark Trend Sheets Green
    setTrendsTabColor(CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR);    

  // We have no trigger but it 
  } else if (hasTrigger('updateCruxData') === false && background === CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR) {
    range.setValue(CONFIG.DEFAULT.AUTOMATION_INACTIVE);
    range.setBackground(CONFIG.DEFAULT.AUTOMATION_INACTIVE_COLOR);
    range.setFontColor('#ffffff');

    // Mark Trend Sheets Red
    setTrendsTabColor(CONFIG.DEFAULT.AUTOMATION_INACTIVE_COLOR);
  };
}

// Audit status was updated - update sheet color
function isActiveAudit(status) {
  const lastWorkflowStep = (CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS.length - 1);
  const lastStatus = CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS[lastWorkflowStep][0];

  if (lastStatus === status) {
    return false;
  } else {
    return true;
  }
}

// Logger
function log(msg, debug) {
  if (debug === true && CONFIG.DEBUG === true) {
    Logger.log(msg);
  } else if (debug !== true) {
    Logger.log(msg);
  }
}
