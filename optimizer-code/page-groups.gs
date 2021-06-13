function pageGroupsObject() {
  "use strict";
  const globalSs = SpreadsheetApp.getActive();
  var globalSheet = globalSs.getSheetByName(CONFIG.SHEET.PAGE_GROUPS);
  var globalExistingEntries = [];

  function run() {
    setConfiguration();

    // Generate a page sheet from template if it doesn't exists
    if (globalSheet === null) {
      globalSheet = createSheetFromTemplate(CONFIG.SHEET.PAGE_GROUPS, CONFIG.SHEET.TEMPLATE_PAGE_GROUPS);
    }

    // Open the Sheet
    globalSs.setActiveSheet(globalSheet);

    globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();

    ['PHONE', 'DESKTOP'].forEach(function(formFactor) {
      CONFIG.SETTINGS.PAGE_GROUPS.forEach(function(url) {
        // Don't add duplicates
        if (!isDuplicate(url, formFactor)) {
          addRow(url, formFactor);          
          log('Page Group added: ' + url + ' / Form factor: ' + formFactor, true);
        } else {
          log('Duplicate entry: ' + url + ' / Form factor: ' + formFactor, true);
        }        
      });
    });
  };

  function isDuplicate(url, formFactor) {
    for(var i = 0; i < globalExistingEntries.length; i++) {
      var itemUrl = globalExistingEntries[i][1];
      var itemFormFactor = globalExistingEntries[i][2];

      if (url === itemUrl && formFactor === itemFormFactor) {
        return true;
      }
    }

    return false;
  }

  function addRow(url, formFactor) {      
    var firstRow = globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.PAGE_GROUPS_FIRST_ROW);
    var lastRow = globalSheet.getLastRow() + 1;
    var lastColumn = globalSheet.getLastColumn();
    var row = [
      '',
      url,
      formFactor
    ];
  
    globalSheet.appendRow(row);
    globalExistingEntries.push(row);
    
    // Apply the format from first row
    firstRow.copyFormatToRange(globalSheet, 1, lastColumn, lastRow, lastRow);
  };

  function recommendAudits() {    
    setConfiguration();

    if (globalSheet === null) {
      log('Page Groups sheet has to be created first.', true);
      return;
    }

    // Open the Sheet
    globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();
    globalSs.setActiveSheet(globalSheet);

    // Get the entries
    globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();

    globalExistingEntries.forEach(function(entry, index) {
      var audit = entry[0];
      var lcp = entry[3];
      var fid = entry[4];
      var cls = entry[5];
      var status = [lcp, fid, cls];
      var cell = globalSheet.getRange('A' + (index + 3));
      
      // If the audit is not empty insert a checkbox
      if (audit === '') {
        cell.insertCheckboxes();
        
        for (var i = 0; i < status.length; i++) {
          
          // The audit conditions are met. Check the checkbox          
          if (CONFIG.SETTINGS.AUDIT_CONDITIONS.includes(status[i])) {
            log('Checkbox checked',true);
            cell.setValue(true);
            break;
          }
        }    
      }
    });
  };

  return Object.freeze({
    objectName: 'pageGroupsObject',
    run: run,
    recommendAudits: recommendAudits
  });
}
