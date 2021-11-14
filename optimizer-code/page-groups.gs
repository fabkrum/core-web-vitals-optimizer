function pageGroupsObject() {
  "use strict";
  const globalSs = SpreadsheetApp.getActive();
  var globalSheet = globalSs.getSheetByName(CONFIG.SHEET.PAGE_GROUPS);
  var globalExistingEntries = [];

  function run() {
    setConfiguration();   

    // Generate a page sheet from template if it doesn't exists
    if (globalSheet === null) {

      // Only create sheet if we have entries
      if (CONFIG.SETTINGS.PAGE_GROUPS < 1) {
        showAlert('Error: No Page Group URLs defined','Please go to the configuration sheet first and add URLs in the Page Group column.');
        return false;
      } else {
        globalSheet = createSheetFromTemplate(CONFIG.SHEET.PAGE_GROUPS, CONFIG.SHEET.TEMPLATE_PAGE_GROUPS, true);
        log('Page Groups Sheet was created',true);
        
        // Put the sheets in the right order
        orderSheets();
      }      
    }

    // Open the Sheet
    globalSs.setActiveSheet(globalSheet);

    globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();

    CONFIG.SETTINGS.PAGE_GROUPS.forEach(function(url) {
      // Don't add duplicates
      if (!isDuplicate(url)) {
        addRow(url);
        log('Page Group added: ' + url,true);
      } else {
        log('Duplicate entry: ' + url,true);
      }        
    });
  };

  function isDuplicate(url) {
    for(var i = 0; i < globalExistingEntries.length; i++) {
      var itemUrl = globalExistingEntries[i][2];

      if (url === itemUrl) {
        return true;
      }
    }

    return false;
  }

  function addRow(url) {      
    const firstRow = globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.PAGE_GROUPS_FIRST_ROW);
    const lastRow = globalSheet.getLastRow() + 1;
    const lastColumn = globalSheet.getLastColumn();
    const auditCell = globalSheet.getRange('A' + lastRow);
    
    var row = [
      '',
      getDateTime(),      
      url
    ];
  
    globalSheet.appendRow(row);
    globalExistingEntries.push(row);
    
    setCheckbox(auditCell);
    
    // Apply the format from first row
    firstRow.copyFormatToRange(globalSheet, 1, lastColumn, lastRow, lastRow);
  };

  function toggleDetail() {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(CONFIG.SHEET.PAGE_GROUPS);

    if (sheet === null) {
      showAlert('ERROR: Page Groups sheet not found','Pleaes create a Page Groups sheet first.');
      return false;
    }

    const audit = sheet.getRange('A1:A');
    const pageDetails = sheet.getRange('D1:E');
    const ranges = [audit, pageDetails];

    sheet.activate();

    // Figure out current view
    if (sheet.isColumnHiddenByUser(1)) {
      log('Show Detail');
      showDetail(sheet,ranges);
      
    } else {
      log('Hide Detail');
      hideDetail(sheet,ranges);    
    }     
  }

  return Object.freeze({
    objectName: 'pageGroupsObject',
    run: run,
    toggleDetail: toggleDetail
  });
}
