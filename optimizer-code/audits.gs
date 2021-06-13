function auditSheetObject(globalType) {
  "use strict";
  const globalSheet = SpreadsheetApp.getActive();

  if (globalType === 'pageGroups') {
    var globalReferenceSheet = globalSheet.getSheetByName(CONFIG.SHEET.REF_TABLE_GROUP_AUDIT);
    var globalReferences = globalReferenceSheet.getRange(CONFIG.RANGE.REFERENCE_AUDIT).getValues();
    var globalDataSheet = globalSheet.getSheetByName(CONFIG.SHEET.PAGE_GROUPS);
    var globalData = globalDataSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();
    var globalName = CONFIG.DEFAULT.PAGE_GROUP_AUDIT_NAME;    
  } else {
    var globalReferenceSheet = globalSheet.getSheetByName(CONFIG.SHEET.REF_TABLE_PAGE_AUDIT);
    var globalReferences = globalReferenceSheet.getRange(CONFIG.RANGE.REFERENCE_AUDIT).getValues();
    var globalDataSheet = globalSheet.getSheetByName(CONFIG.SHEET.PAGES);
    var globalData = globalDataSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();
    var globalName = CONFIG.DEFAULT.PAGE_AUDIT_NAME;
  }

  function run() {
    setConfiguration();
    updateReferences();

    for(var i=0; i < globalData.length; i++) {
      const id = i + 1;
      var data = getPageData(globalData[i]);      
      var name;
      var auditSheet;      

      // The audit exists already
      if (isValidAudit(data['audit'], data['url'])) { 
        log('The audit does already exists: ' + data['audit'], true);
      
      // Audit checkbox is checked     
      } else if (data['audit'] === true) {
        name = getAuditNameByUrl(data['url']);
        auditSheet = globalSheet.getSheetByName(name);
        
        // If there is alredy an audit page for a different form factor set a link
        if (auditSheet !== null) {          
          linkAuditSheet(id, name, auditSheet);
          log('Audit sheet exists. Update link: ' + name, true);
        } else {
          name = getAuditName(id);
          auditSheet = createAuditSheet(id, name, data['url']);
          log('New audit sheet created: ' + name, true);

          // Set the page data
          setPageData(data, auditSheet);
          
          if (globalType === 'pages') {
            // Set the sheet tab color to the worst metric
            updateDataSheet(data['url'], auditSheet);
            Logger.log('Get the CrUX data and update sheet: ' + data['url']);
          }

          if (CONFIG.SETTINGS.WPT_USER_CONSENT === true) {
            // TODO: WPT width Cookie Layer and without
          } else {
            // TODO WPT Only Desktop and Mobile
          }

          // Make the new audit sheet visible
          auditSheet.showSheet();
          Logger.log('Show sheet: ' + name);

          linkAuditSheet(id, name, auditSheet);
          Logger.log('New audit sheet is linked: ' + name);
        }
      } else {
        Logger.log('No sheet was created for: ' + data['url']);
      }
    }
  }

  // Find the first available id
  function getNextId() {
    var id;

    for (var i = 1; i <= globalReferences.length; i++) {    
      if ((globalReferences.indexOf(i) == -1) && (globalSheet.getSheetByName(globalName + i) === null)) {
        id = i;      
        break;
      }
    }

    return id;
  }

  function getAuditName(index) {
    var name = globalName + ' ' + index; 
    var id;

    // The name does already exists. Find a new one.
    if (globalReferences.includes(name)) {
      id = getNextId();
      name = globalName + ' ' + id;
    }

    return name;
  }

  // Udapte the CrUX data in all formats
  function updateDataSheet(url, auditSheet) {
    const formFactors = CONFIG.DEFAULT.CRUX_ALL_FORM_FACTORS;

    formFactors.forEach(function(formFactor) {
      getCrUXData('url', url, formFactor, auditSheet);
      Logger.log('Update Url: ' + url + ' \ Form Factor: ' + formFactor);
    });

    setTabColor(auditSheet);
  }

  function addRow(...args) {
    const formFactor = args[1];
    const fcp = args[5];
    const lcp = args[9];
    const fid = args[13];
    const cls = args[17];
    const auditSheet = args[18];
    const values = [[fcp, lcp, fid, cls]];
    const rangeDate = auditSheet.getRange(CONFIG.RANGE.AUDIT_UPDATE_DATE);
    var oldData = [];
    var diffs = [];
    var dataCells = [];
    var rangeHeader;
    var rangeData;
    var rangeDiffs;

    switch(formFactor) {
      case 'PHONE':
        rangeHeader = auditSheet.getRange('M4'); 
        rangeData = auditSheet.getRange('M6:P6');
        dataCells = ['M6', 'N6', 'O6', 'P6'];      
        rangeDiffs = auditSheet.getRange('M7:P7');
        Logger.log('Phone is updated');
        break;
      case 'DESKTOP':
        rangeHeader = auditSheet.getRange('Q4'); 
        rangeData = auditSheet.getRange('Q6:T6');
        dataCells = ['Q6', 'R6', 'S6', 'T6'];
        rangeDiffs = auditSheet.getRange('Q7:T7');
        Logger.log('Desktop is updated');
        break;
      case 'ALL_FORM_FACTORS':
        rangeHeader = auditSheet.getRange('U4'); 
        rangeData = auditSheet.getRange('U6:X6');
        dataCells = ['U6', 'V6', 'W6', 'X6'];
        rangeDiffs = auditSheet.getRange('U7:X7');
        Logger.log('All Form Factors are updated');
        break;          
    }

    Logger.log('values: ' + JSON.stringify(values));    
    oldData = rangeData.getValues();
    Logger.log('oldData: ' + JSON.stringify(oldData));
    rangeData.setValues(values);
    SpreadsheetApp.flush();
    diffs = getDiffs(values, oldData);
    Logger.log('diffs: ' + JSON.stringify(diffs));    
    rangeDiffs.setValues(diffs);
    SpreadsheetApp.flush();
    rangeDate.setValue(Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT));
    Logger.log('data: ' + JSON.stringify(Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT)));
    rangeDate.setHorizontalAlignment('center');
    updateColors(auditSheet, dataCells, rangeHeader, values);
  }

  function updateColors(auditSheet, dataCells, rangeHeader, values) {
    const fcp = values[0][0];
    const lcp = values[0][1];
    const fid = values[0][2];
    const cls = values[0][3];
    var status = [];

    const array = [
      [CONFIG.CWV.FCP_GOOD,CONFIG.CWV.FCP_POOR,fcp,dataCells[0]],
      [CONFIG.CWV.LCP_GOOD,CONFIG.CWV.LCP_POOR,lcp,dataCells[1]],
      [CONFIG.CWV.FID_GOOD,CONFIG.CWV.FID_POOR,fid,dataCells[2]],
      [CONFIG.CWV.CLS_GOOD,CONFIG.CWV.CLS_POOR,cls,dataCells[3]]
    ];

    // Update cells
    array.forEach(function(item) {
      const good = item[0];
      const poor = item[1];
      const metric = item[2];
      const dataCell = item[3];
      const range = auditSheet.getRange(dataCell);

      if (metric <= good) {
        range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_GOOD);
        status.push(CONFIG.CWV.GOOD);
      } else if (metric > poor) {
        range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_POOR);
        status.push(CONFIG.CWV.POOR);
      } else if (metric !== 0) {
        range.setBackground('#' + CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT);
        status.push(CONFIG.CWV.NEEDS_IMPROVEMENT);
      }
    });

    // Update headers
    if (status.includes(CONFIG.CWV.POOR)) {
      rangeHeader.setBackground('#' + CONFIG.CWV.COLOR_POOR);
    } else if (status.includes(CONFIG.CWV.NEEDS_IMPROVEMENT)) {
      rangeHeader.setBackground('#' + CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT);
    } else if (status.includes(CONFIG.CWV.GOOD)) {
      rangeHeader.setBackground('#' + CONFIG.CWV.COLOR_GOOD);
    }

    SpreadsheetApp.flush();
    Logger.log('Colors in CrUX Panel is updated');
  }

  function getDiffs(newData, oldData) {
    var diffs = [[]];    

    for (var i = 0; i < newData[0].length; i++) {      
      diffs[0][i] = parseFloat(oldData[0][i]) - parseFloat(newData[0][i]);
    }

    return diffs;
  }

  // Color the sheet based on the worst metric
  function setTabColor(auditSheet) {
    const colors = auditSheet.getRange('L4:W4').getBackgrounds();
    
    if (colors[0].includes('#' + CONFIG.CWV.COLOR_POOR)) {
      auditSheet.setTabColor(CONFIG.CWV.COLOR_POOR);
    } else if (colors[0].includes('#' + CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT)) {
      auditSheet.setTabColor(CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT);
    } else if (colors[0].includes('#' + CONFIG.CWV.COLOR_GOOD)) {
      auditSheet.setTabColor(CONFIG.CWV.COLOR_GOOD);
    }
    Logger.log('Tab sheet color is updated.')
  }

  function getAuditNameByUrl(url) {
    Logger.log('globalReferences: ' + JSON.stringify(globalReferences));
    for (var i = 0; i < globalReferences.length; i++) {
      Logger.log('i: ' + i + ' / DB Url: ' + globalReferences[i][2] + ' / URL: ' + url);
      if (globalReferences[i][2] === url) {
        Logger.log('----- MATCH -----');
        Logger.log('References: ' + JSON.stringify(globalReferences));
        Logger.log('Name: ' + globalReferences[i][1]);
        return globalReferences[i][1];
      }
    }

    return null;
  }

  function isValidAudit(sheetName, url) {
    var auditSheet = globalSheet.getSheetByName(sheetName);
    var auditSheetUrl;

    // Audit sheet exists
    if (auditSheet !== null) {
      auditSheetUrl = auditSheet.getRange(CONFIG.RANGE.AUDIT_URL).getValue();

      // Audit URL is correct
      if (auditSheetUrl == url) {
        return true;
      }        
    }

    return false;
  }

  // Link new audit page in the CrUX data table
  function linkAuditSheet (index, name, auditSheet) {      
    var cell = globalDataSheet.getRange(index + 2, 1);
    var auditSheetId = auditSheet.getSheetId();

    cell.clearDataValidations();
    cell.setHorizontalAlignment('center');
    cell.setValue(`=HYPERLINK("#gid=${auditSheetId}", "${name}")`);
  }

  function updateReferences() {
   
    globalReferences.forEach(function(row, index) {
      const name = row[1];
      const url = row[2];

      if (name !== '') {        
         // Check if audit sheet still exisits
         Logger.log('Remove element for sheet ---------------------------------: ' + name);
        var auditSheet = globalSheet.getSheetByName(name);

        // Remove sheet from the reference table and array if it doesn't exists anymore
        if (auditSheet === null) {
          Logger.log('Indes removed element: ' + index);
          removeAudit(index);
          setCheckbox(url);
          Logger.log('None existing audit sheet was removed from audit table: ' + name);
        } 
      }      
    });
  }

  function setCheckbox(url) {
    var rows = [];
    
    globalData.forEach(function(page, index){
      var pageUrl = page[3];
      
      if (pageUrl == url) {
        rows.push(index + 3);          
      }
    });

    if (rows.length) {
      rows.forEach(function(row) {
        
        globalDataSheet.getRange('A' + row).insertCheckboxes();
        Logger.log('Audit link was replaced by checkbox in row: ' + row);
      });      
    }
  }

  function removeAudit(index) {    
    // Remove if from reference sheet
    globalReferenceSheet.deleteRow(index + 3);
    
    // Remove it from the array
    globalReferences.splice(index, 1);
  }

  // Get the row data from the CrUX table
  function getPageData(page) {
    var data = [];

    if (globalType === 'pageGroups') {
      data['audit'] = page[0];
      data['url'] = page[1]; 
    } else {
      data['audit'] = page[0];
      data['url'] = page[3]; 
    }
    
    return data;
  }

  // Create a new audit sheet
  function createAuditSheet(id, name, url) {
    const template = CONFIG.SHEET.TEMPLATE_AUDIT;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    var newSheet = '';    
    var reference = [];
    var buttons = [];
    var range = null;


    // Template not found  
    if (!template || ss.getSheetByName(template) === null) {
      Logger.log('Template is missing');
      return false;
    }   

    // Copy template sheet and create a new sheet
    newSheet = ss.getSheetByName(template).copyTo(ss);

    reference.push(id, name, url, newSheet.getSheetId());
    
    // Save new audit sheet in reference table   
    globalReferenceSheet.appendRow(reference);

    // Save new audit sheet in reference array
    globalReferences.push(reference);
  
    // Set the name of the new sheet
    newSheet.setName(name);

    // Remove the CrUX widget for Page Groups
    if (globalType === 'pageGroups') {      
      range = newSheet.getRange(CONFIG.RANGE.AUDIT_CRUX_WIDGET);
      range.clearFormat();
      range.clearContent();

      // Remove the CrUX widget update button
      buttons = newSheet.getDrawings();
      buttons[3].remove();      
    }

    SpreadsheetApp.flush();
  
    return newSheet;
  }

  // Copy & Paste values from the CrUX table and settings
  function setPageData(data, auditSheet) {      
    auditSheet.getRange(CONFIG.RANGE.AUDIT_URL).setValue(data['url']);
    auditSheet.getRange(CONFIG.RANGE.AUDIT_WORKER_URL).setValue(CONFIG.SETTINGS.WORKER_URL);
  }

  function getCrUXData(key, value, formFactor, auditSheet) {
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
          cls.good, cls.ni, cls.poor, cls.p75,
          auditSheet);
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

  // Triggered by button on sheet.
  // Updates the CrUX data panel on the audit page.
  function update() {
    const auditSheet = SpreadsheetApp.getActive().getActiveSheet();
    const url = auditSheet.getRange(CONFIG.RANGE.AUDIT_URL).getValue();

    updateDataSheet(url, auditSheet);
  }

  return Object.freeze({
    objectName: 'auditSheetObject',
    run: run,
    update: update
  });
}
