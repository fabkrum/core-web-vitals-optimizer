function originsObject(mode) {
  "use strict";
  const globalSs = SpreadsheetApp.getActive();
  var globalSheet = globalSs.getSheetByName(CONFIG.SHEET.ORIGINS);
  var globalExistingEntries = [];
  var globalCounterAdded = 0;
  var globalTotalTests = 0;

  function run() {
    setConfiguration(); 

    // Generate a pages sheet from template if it doesn't exists
    if (globalSheet === null) {

      // Only create sheet if we have entries
      if (CONFIG.SETTINGS.ORIGINS < 1) {
        showAlert('Error: No Origins URLs defined','Please go to the configuration sheet first and add URLs in the Origin column.');
        return false;
      } else {
        globalSheet = createSheetFromTemplate(CONFIG.SHEET.ORIGINS, CONFIG.SHEET.TEMPLATE_ORIGINS, true);
        log('Origins Sheet was created',true);
        
        // Put the sheets in the right order
        orderSheets();        
      }        
    }

    log('globalSheet: ' + globalSheet);

    // Open the Sheet
    globalSs.setActiveSheet(globalSheet);
    globalExistingEntries = globalSheet.getRange(CONFIG.RANGE.ORIGINS_DATA).getValues();
    getNewEntries();    
  }

  function getNewEntries() {
    const urls = CONFIG.SETTINGS.ORIGINS;
    const uniqueUrls = [...new Set(urls)];    
    globalTotalTests = uniqueUrls.length;

    uniqueUrls.forEach(function(url) {
      getCrUXData('origin', url, CONFIG.DEFAULT.CRUX_FORM_FACTOR);              
    });    
  }

  function isDuplicate(data) {
    var url = data[2];
    var rowNumber = false;

    for (var i = 0; i < globalExistingEntries.length; ++i) {
      if (url === globalExistingEntries[i][2]) {
        rowNumber = i + 3;      
        break;
      }
    }

    return rowNumber;
  }

  function addRow(...args) {
    const firstRow = globalSs.getRangeByName(CONFIG.RANGE_BY_NAME.ORIGINS_FIRST_ROW);
    const lastColumn = globalSheet.getLastColumn();
    var row = [
      '',
      getDateTime(),
      ...args
    ];    
    const index = isDuplicate(row);
    const numberFormat = [["0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "0.00"]];
    var numberRange;
    var setValues = [];
    var lastRow;
    var trendCell;

    // Update the exising entry
    if (index !== false) {
      row.shift();
      setValues.push(row);
      globalSheet.getRange(index, 2, 1, row.length).setValues(setValues);          
      updateFormating(index);
      log("Updated Row (" + index + "): " + row, true);

    // Add a new entry
    } else {
      log("New Row: " + row, true);
      globalExistingEntries.push(row);
      globalSheet.appendRow(row);    
      globalCounterAdded++;
      lastRow = globalSheet.getLastRow();
      trendCell = globalSheet.getRange('A' + lastRow);
      setCheckbox(trendCell);

      // Apply the format from first row           
      firstRow.copyFormatToRange(globalSheet, 1, lastColumn, lastRow, lastRow);
      
      // Make sure the numbers are correctly formated
      numberRange = globalSheet.getRange('D' + lastRow + ':' + 'S' + lastRow);
      numberRange.setNumberFormats(numberFormat);

      updateFormating(lastRow);
    }

    // Make the change immediately visible in the sheet    
    SpreadsheetApp.flush();
  };

  function updateFormating(row) {
    updateColumnFormat(globalSheet, 'G', 'K', 'O', 'S', 'D1', 'H1', 'L1', 'P1');
    updateRowFormat(globalSheet, 'G', 'K', 'O', 'S', 'A', 'C', row);
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

    if (cls.p75 != CONFIG.DEFAULT.NO_RESULT) {     
      cls.p75 = parseFloat(cls.p75)
    }        
    
    addRow(value,
          fcp.good, fcp.ni, fcp.poor, fcp.p75,
          lcp.good, lcp.ni, lcp.poor, lcp.p75,
          fid.good, fid.ni, fid.poor, fid.p75,
          cls.good, cls.ni, cls.poor, cls.p75);
  }

  function toggleDetail() {
    const ss = SpreadsheetApp.getActive();
    const sheet = ss.getSheetByName(CONFIG.SHEET.ORIGINS);

    if (sheet === null) {
      showAlert('ERROR: Origin sheet not found','Pleaes create a Origin sheet first.');
      return false;
    }

    const trends = sheet.getRange('A1:A');
    const fcp = sheet.getRange('D1:F');
    const fcpTitle = sheet.getRange('D1:G1');
    const lcp = sheet.getRange('H1:J');
    const lcpTitle = sheet.getRange('H1:K1');
    const fid = sheet.getRange('L1:N');
    const fidTitle = sheet.getRange('L1:O1');
    const cls = sheet.getRange('P1:R');
    const clsTitle = sheet.getRange('P1:S1');
    const ranges = [trends, fcp, lcp, fid, cls];
    const titlesShort = [[fcpTitle,'FCP'],[lcpTitle,'LCP'],[fidTitle,'FID'],[clsTitle,'CLS']];
    const titlesLong = [[fcpTitle,'First Contentful Paint (FCP)'],[lcpTitle,'LargestContenful Paint (LCP)'],[fidTitle,'First Input Delay (FID)'],[clsTitle,'Cumulative Layout Shift (CLS)']];

    sheet.activate();
        
    // Figure out current view
    if (titlesShort[0][0].getValue() == titlesShort[0][1]) {
      log('Show Detail');
      showDetail(sheet,ranges,titlesLong);
    } else {
      log('Hide Detail');
      hideDetail(sheet,ranges,titlesShort);
    }
  }

  return Object.freeze({
    objectName: 'originObject',
    run: run,
    toggleDetail: toggleDetail
  });
}
