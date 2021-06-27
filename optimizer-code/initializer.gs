/**
 * Adds a menu to the GUI
 */
function onOpen() {
  addMenu();
};

// Create a menu and add it to 
function addMenu() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('CrUX Pages')
    .addSubMenu(ui.createMenu('Pages')
      .addItem('Create CrUX Pages', 'initPages')
      .addItem('Continue creating CrUX Pages', 'initNextPages')
      .addItem('Update CrUX Pages data', 'initUpdatePages')
      .addItem('Create audits for marked pages', 'initPagesAuditSheets'))
    .addSubMenu(ui.createMenu('Page Groups')
      .addItem('Create/Update Page Groups', 'initPageGroups')
      .addItem('Recommend audits', 'initRecommendPageGroupAudits')
      .addItem('Create audits for marked pages', 'initPageGroupsAuditSheets'))    
    .addSubMenu(ui.createMenu('Origins')
      .addItem('Create/Update CrUX Origins', 'initOrigins'))
    .addSubMenu(ui.createMenu('Delete')
      .addItem('Cached URLs', 'initDeleteCache'))
    .addToUi();

    log('Updated menu', true);
}

/**
 * Functions which are triggered by menu actions
 * */
 
function onEdit(e) {
  const sheet = e.range.getSheet();
  const name = sheet.getName();    
  var color = '';

  // Audit status was updated - update sheet color
  if (e.range.getA1Notation() === CONFIG.RANGE.AUDIT_STATUS) {
    if (name.includes(CONFIG.DEFAULT.PAGE_AUDIT_NAME) || name.includes(CONFIG.DEFAULT.PAGE_GROUP_AUDIT_NAME)) {
      color = e.range.getBackgrounds();
      setTabColor(sheet, color);
    }      
  }
}

// Color the sheet based on the audit status
function setTabColor(auditSheet, color) {
  if (!color) {
    color = CONFIG.DEFAULT.AUDIT_STATUS_COLOR;
  }

  auditSheet.setTabColor(color);    
  log('Audit Status changed - tab sheet color updated.', true)
}

function initDeleteCache() {
  deleteCache();
}

function initPages() {
  var object = pagesObject();

  log('Menu: Pages sheet created/updated', true);
  object.run();
}

function initNextPages() {
  var object = pagesObject('continue');

  log('Menu: Continue creating CrUX Page', true);
  object.run();
}

function initUpdatePages() {
  var object = pagesObject('update');  

  log('Menu: Update CrUX data for Pages', true);
  object.run();
}

function initPageGroups() {
  var object = pageGroupsObject();

  log('Menu: Create/Update Page Groups', true);
  object.run();
}

function initRecommendPageGroupAudits() {
  var object = pageGroupsObject();

  log('Menu: Create/Update Page Groups', true);
  object.recommendAudits();
}

function initOrigins() {
  var object = originsObject();

  log('Menu: Origins sheet created/updated', true);
  object.run();
}

function initPagesAuditSheets() {
  var object = auditSheetObject('pages');

  log('Menu: Create page audits', true);
  object.run();
}

function initPageGroupsAuditSheets() {
  var object = auditSheetObject('pageGroups');

  log('Menu: Create group audits', true);
  object.run();
}

/**
 * Functions triggered by buttons
 */

function initAuditCruxPanelUpdate() {
  var object = auditSheetObject();

  log('Button: Update CrUX panel in audit sheet', true);
  object.update();
}

function initWptWorkerTest() {
  var object = wptObject('worker');

  log('Button: Test worker url with WPT', true);
  object.run();
}

function initWptOriginalTest() {
  var object = wptObject('original');

  log('Button: Test page url with WPT', true);
  object.run();
}

function initWptDeleteSelectedTests() {
  var object = wptObject();

  log('Button: Test page url with WPT', true);
  object.deleteSelectedTests();
}

/**
 * Helper functions
 */

// Shows a popup window in the lower right corner of the spreadsheet with the given title and message, that stays visible for a certain length of time.
function showMessage(message, title, closeAfterSeconds) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Set 3 second default value for message box
  if (!closeAfterSeconds) {
    closeAfterSeconds = 10;
  }

  ss.toast(message, title, closeAfterSeconds);
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

    if (value && (value !== '')) {
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
}'#' + CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT

function reset(args) {

  args.forEach(function() {
    switch (mode) {
      case 'audits':
        deleteAuditSheets('pages');
        deleteAuditSheets('pageGroups');
        break;

      case 'pages':
        resetSheet(CONFIG.SHEET.PAGES, CONFIG.SHEET.TEMPLATE_PAGES);
        break;

      case 'pageGroups':
        resetSheet(CONFIG.SHEET.PAGE_GROUPS, CONFIG.SHEET.TEMPLATE_PAGE_GROUPS);
        break;

      case 'origins':
        resetSheet(CONFIG.SHEET.ORIGINS, CONFIG.SHEET.TEMPLATE_ORIGINS);
        break;

      case 'config':
        resetSheet(CONFIG.SHEET.CONFIGURATION, CONFIG.SHEET.TEMPLATE_CONFIGURATION);
        break;                        

      case 'all':
        deleteAuditSheets('all');
        resetSheet(CONFIG.SHEET.PAGES, CONFIG.SHEET.TEMPLATE_PAGES);
        resetSheet(CONFIG.SHEET.PAGE_GROUPS, CONFIG.SHEET.TEMPLATE_PAGE_GROUPS);
        resetSheet(CONFIG.SHEET.ORIGINS, CONFIG.SHEET.TEMPLATE_ORIGINS);
        resetSheet(CONFIG.SHEET.CONFIGURATION, CONFIG.SHEET.TEMPLATE_CONFIGURATION);
        deleteCache();
    }    
  });
}

function deleteCache() {
  const cacheSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.CACHE_URLS);
  const firstRow = 3;
  const lastRow = cacheSheet.getRange(CONFIG.RANGE.CACHE).getLastRow() - 2;

  if (lastRow < 3) {
    log('Cache is deleted.', true);
    return;
  } else {
    cacheSheet.deleteRows(firstRow, lastRow);
    log('Deleted cache. First row: ' + firstRow + ' / Last row: ' + lastRow, true);
  }  
}

function deleteAuditSheets(type) {
  const ss = SpreadsheetApp.getActive();
  const allsheets = ss.getSheets();
  var name = '';

  if (type === 'pages') {
    name = CONFIG.DEFAULT.PAGE_AUDIT_NAME;    
  } else if (type === 'pageGroups') {
    name = CONFIG.DEFAULT.PAGE_GROUP_AUDIT_NAME;    
  }

  clearAuditReferenceSheet(type);
  resetAuditColumn(type);
  
  // Loop through all sheets
  for (var s in allsheets) {
    var sheet = allsheets[s];
    var name = sheet.getName();

    // Stop iteration execution if the condition is met.
    if (name.startsWidth(name)) {
      ss.deleteSheet(sheet);
      Logger.log('Deleted sheet ' + name);
    }
  } // end of loop
}

function clearAuditReferenceSheet(type) {
  const ss = SpreadsheetApp.getActive();
  var range = '';

  if (type === 'pages') {
    range = ss.getRangeByName(CONFIG.RANGE.REFERENCE_PAGES_AUDIT);    
  } else if (type === 'pageGroups') {
    range = ss.getRangeByName(CONFIG.RANGE.REFERENCE_PAGE_GROUPS_AUDIT);
  }

  range.clearContent();
}

function resetAuditColumn(type) {
  const ss = SpreadsheetApp.getActive();
  var range = '';

  if (type === 'pages') {
    range = ss.getRangeByName(CONFIG.RANGE.PAGES_AUDITS);    
  } else if (type === 'pageGroups') {
    range = ss.getRangeByName(CONFIG.RANGE.PAGE_GROUPS_AUDITS);
  }
  
  range.insertCheckboxes();
  range.setBackground(null);
}

function resestConfigurationUrls() {
  const ss = SpreadsheetApp.getActive();
  const namedRanges = [
    CONFIG.RANGE.ORIGINS,
    CONFIG.RANGE.SITEMAPS,
    CONFIG.RANGE.URLS,
    CONFIG.RANGE.PAGE_GROUPS
  ];

  namedRanges.forEach(function(range) {
    ss.getRangeByName(range).clearContent();
  });
}

function createSheetFromTemplate(name, template) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);
  var newSheet = null;

  if (sheet === null) {
    // Create a new page sheet from template
    newSheet = ss.getSheetByName(template).copyTo(ss);

    // Rename new sheet
    newSheet.setName(name);
    
    // Unhide new sheet
    newSheet.showSheet();

    Logger.log('Created sheet ' + name);
  } else {
    Logger.log('Sheet ' + name + ' already exsits.');
  }

  return newSheet;
}

function resetSheet(name, template) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name);
  var newSheet = null;
  
  // Delete sheet
  if (sheet !== null) {
    ss.deleteSheet(sheet);
    Logger.log('Deleted Sheet ' + name);
  }

  newSheet = createSheetFromTemplate(name, template);
  
  return newSheet;
}

// Logger
function log(msg, debug) {
  if (debug === true && CONFIG.DEBUG === true) {
    Logger.log(msg);
  } else if (debug !== true) {
    Logger.log(msg);
  }
}
