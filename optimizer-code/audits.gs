function auditsObject(globalType) {
  "use strict";
  const globalSheet = SpreadsheetApp.getActive();
  var globalAuditOverviewSheet = globalSheet.getSheetByName(CONFIG.SHEET.AUDITS_OVERVIEW);  
  
  var globalReferences = getAuditSheets();
  var globalData = null;
  var globalPageTypes = [];
  
  if (globalType === 'pageGroups') {
    var globalDataSheet = globalSheet.getSheetByName(CONFIG.SHEET.PAGE_GROUPS);   

    if (globalDataSheet !== null) {
      globalData = globalDataSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();
      log('PageType: PageGroups', true);
    } else {
      log('Page Group Sheet does not exist.', true);
    }
  } else {
    var globalDataSheet = globalSheet.getSheetByName(CONFIG.SHEET.PAGES);
    
    if (globalDataSheet !== null) {
      globalData = globalDataSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();
      log('PageType: Pages', true);
    } else {
      log('Pages Sheet does not exist.', true);
    }     
  }      

  setConfiguration();

  // Get all page types that are already audited (Audit reference list)
  globalPageTypes = globalReferences.map(audit => {return audit[5]});

  log('Global Page Types: ' + JSON.stringify(globalPageTypes), true); 

  function run() {
    if (globalData === null) {
      return false;
    }

    log('Global References: ' + JSON.stringify(globalReferences), true);

    for(var i=0; i < globalData.length; i++) {
      var data = getPageData(globalData[i]);
      var ids = globalReferences.map(audit => {return audit[0]});
      var auditSheet = getAuditSheet(data['url']);
      var templateSheet;
      var planningSheet;
      var auditOverviewSheet;
      var name;      
      var row = i + 1;
      var id;

      log('Audit IDs: ' + JSON.stringify(ids), true);

      // Audit sheet for this URL exsits, update the link
      if (auditSheet !== null) {        
        linkAuditSheet(row,auditSheet[1]);
      
      // Checkbox is set - create a new Audit Sheet
      } else if (data['audit'] === true) {

        // Create an audit overview sheet first if not availble
        auditOverviewSheet = globalSheet.getSheetByName(CONFIG.SHEET.AUDITS_OVERVIEW);
        if (auditOverviewSheet === null) {
          createAuditOverviewSheet();
        }

        // Create a planning sheet first if not availble
        planningSheet = globalSheet.getSheetByName(CONFIG.SHEET.PLANNING);
        if (planningSheet === null) {
          planningObject().create();
        }

        // Create the audit template first if not available
        templateSheet = globalSheet.getSheetByName(CONFIG.SHEET.TEMPLATE_AUDIT);    
        if (templateSheet === null) {
          createAuditTemplate();          
        }
        
        id = getNextId(ids);
        name = CONFIG.DEFAULT.AUDIT_NAME + ' ' + id;
        createAuditSheet(id, name, data['url'], data['pageType'], data['pageViews'], row);      
      
      // Unchecked Box. Do nothing.
      } else if (data['audit'] === false) {
      
      // Replace unexpected or outdated content with an empty checkbox.
      } else {
        globalDataSheet.getRange('A' + (row + 2)).insertCheckboxes();
      }      
    }

    // Open the Origin Sheet
    if (globalAuditOverviewSheet !== null) {
      globalAuditOverviewSheet.activate();
    }    
  }

  function getAuditSheets() {
    const sheets = SpreadsheetApp.getActive().getSheets().filter(s => !s.getName().indexOf(CONFIG.DEFAULT.AUDIT_NAME)).map(s => s);
    var auditSheets = [];

    sheets.forEach(function(sheet) {
      const name = sheet.getName();

      if (name !== CONFIG.SHEET.AUDITS_OVERVIEW) {
        const id = parseInt(name.replace(/[^0-9]/g, ''));
        const sheetId = sheet.getSheetId();
        const url = sheet.getRange(CONFIG.RANGE.AUDIT_URL).getValue();
        const status = sheet.getRange(CONFIG.RANGE.AUDIT_STATUS).getValue();
        const pageType = sheet.getRange(CONFIG.RANGE.AUDIT_PAGE_TYPE).getValue();
        const pageViews = sheet.getRange(CONFIG.RANGE.AUDIT_PAGE_VIEWS).getValue();
        
        auditSheets.push([id, name, url.trim(), status, sheetId, pageType, pageViews]);
      }      
    });

    return auditSheets;
  }

  function getAuditSheet(url) {
    var sheet = null;

    globalReferences.every(function(entry) {        
        if (url === entry[2]) {
          sheet = entry;
          return false;
        }
        
        return true;
    })

    return sheet;
  }

  function createAuditOverviewSheet() {
    const templateName = CONFIG.SHEET.TEMPLATE_AUDITS_OVERVIEW;
    const sheetName = CONFIG.SHEET.AUDITS_OVERVIEW;
    
    globalAuditOverviewSheet = createSheetFromTemplate(sheetName,templateName,true);    
  }

  function createAuditTemplate() {
    const blueprintName = CONFIG.SHEET.BLUEPRINT_AUDIT;
    const templateName = CONFIG.SHEET.TEMPLATE_AUDIT;
    const templateSheet = createSheetFromTemplate(templateName, blueprintName, false);    
    const rangeWorkflow = templateSheet.getRange('A1');
    const wptTestConfig = getWptConfig();
    const testRange = templateSheet.getRange('F9:S13');
    const testRangeRows = 5;
    const testRangeColumns = 14;
    const startRow = 9;    
    var startColumn = 6;    
    var buttons;

    // Adapt the WPT table
    if (wptTestConfig !== null && wptTestConfig.length > 1) {
      wptTestConfig.forEach(function(config, index) { 

        // Add enough columns to fit in the test block
        if (index === 1) {          
          templateSheet.insertColumnsAfter((parseInt(startColumn) + 7), 6);
        } else if (index > 1) {          
          templateSheet.insertColumnsAfter((startColumn - 1), testRangeColumns);  
        }
               
        // Copy & paste test range
        testRange.copyTo(templateSheet.getRange(startRow,startColumn,testRangeRows,testRangeColumns));
        
        // Update table header
        templateSheet.getRange((startRow + 1),startColumn).setValue(config[0])

        // Update the startColumn
        startColumn = (parseInt(startColumn) + parseInt(testRangeColumns));
      });
        
    // Update table headline
    } else if (wptTestConfig !== null && wptTestConfig.length === 1) {
      templateSheet.getRange('F10').setValue(wptTestConfig[0][0]);

    // Remove WPT table  
    } else {
      // Remove the WPT buttons
      buttons = templateSheet.getDrawings();
      buttons[0].remove();
      buttons[1].remove();
      buttons[2].remove();

      // Remove table - Starting row, number of rows
      templateSheet.deleteRows(9,6);

      // Update settings
      CONFIG.RANGE.AUDIT_PAGE_TOTAL_OPPORTUNITIES = 'M10';
      CONFIG.RANGE.AUDIT_PAGE_CHECKLIST_FIRST_ROW = 10;
    }

    // Set Audit Workflow
    setValidation(rangeWorkflow,CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS,CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS[0][0]);
    setConditionalFormatting(templateSheet,rangeWorkflow,CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS);

    // Create checklist
    createChecklist(templateSheet);
  }

  function addAuditsOverviewRow(sheetId, name, status, url, type) {
    const data = [`=HYPERLINK("#gid=${sheetId}"; "${name}")`, status, getDateTime(), url, `='${name}'!${CONFIG.RANGE.AUDIT_PAGE_TYPE}`, `='${name}'!${CONFIG.RANGE.AUDIT_PAGE_VIEWS}`, `='${name}'!${CONFIG.RANGE.AUDIT_PAGE_TOTAL_OPPORTUNITIES}`, type];
    const numberFormat = [["#,###", "#,###"]];
    var lastRow;
    var range;      

    // Add data row
    globalAuditOverviewSheet.appendRow(data);
    
    // If it is the first row add validation rules and conditional formating
    lastRow = globalAuditOverviewSheet.getLastRow();
    
    if (lastRow === 3) {
      // Add formating
      range = globalAuditOverviewSheet.getRange(CONFIG.RANGE.AUDITS_OVERVIEW_DATA);
      range.setFontColor('#000000');
      range.setFontWeight('normal');
      range.setFontFamily('Open Sans');
      range.setBackground('#FFFFFF');
      range.setFontSize(12);
      range.setHorizontalAlignment('center');

      // Add alternating row color
      range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);

      // Protect data
      range.protect()
        .setWarningOnly(true)
        .setDescription('This data is referencing audit sheet data and shouldn\'t be changed here.');      

      // Show the URLs left aligned
      range = globalAuditOverviewSheet.getRange('D3:D');
      range.setHorizontalAlignment('left');      
        
      // Create Data Validation and Conditional Formating in Audit Overview page    
      range = globalAuditOverviewSheet.getRange('B3:B');
      setValidation(range,CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS,CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS[0][0],false);
      setConditionalFormatting(globalAuditOverviewSheet,range,CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS);

      // Freeze rows and columns
      globalAuditOverviewSheet.setFrozenRows(2);
    }

    // Set number formats
    range = globalAuditOverviewSheet.getRange('F' + lastRow + ':G' + lastRow);
    range.setNumberFormats(numberFormat);

    // Set borders
    // setBorder(top, left, bottom, right, vertical, horizontal, color, style)
    range = globalAuditOverviewSheet.getRange(CONFIG.RANGE.AUDITS_OVERVIEW_DATA);
    range.setBorder(null, null, null, true, true, false, "#999999", SpreadsheetApp.BorderStyle.SOLID);
    range.setBorder(null, null, null, null, null, true, "#ffffff", SpreadsheetApp.BorderStyle.SOLID);
  }

  // Create a new audit sheet
  function createAuditSheet(id, name, url, pageType, pageViews, row) {
    const template = CONFIG.SHEET.TEMPLATE_AUDIT;
    const newSheet = createSheetFromTemplate(name, template, true);
    var newSheetId;    
    var buttons = [];
    var range = null;
    var status;        

    if (newSheet === null) {
      return null;      
    }

    newSheetId = newSheet.getSheetId();
    status = newSheet.getRange(CONFIG.RANGE.AUDIT_STATUS).getValue();

    // Add the new audit sheet in audit overview    
    addAuditsOverviewRow(newSheetId,name,status,url,globalType);

    // Save new audit sheet in reference array
    globalReferences.push([id, name, url, status, newSheetId, globalType, '']);
        
    // Copy & Paste values from the CrUX table and settings
    newSheet.getRange(CONFIG.RANGE.AUDIT_URL).setValue('     ' + url);  
    newSheet.getRange(CONFIG.RANGE.AUDIT_PAGE_TYPE).setValue(pageType);
    newSheet.getRange(CONFIG.RANGE.AUDIT_PAGE_VIEWS).setValue(pageViews);

    // Remove the CrUX widget for Page Groups
    if (globalType === 'pageGroups') {      
      range = newSheet.getRange(CONFIG.RANGE.AUDIT_CRUX_WIDGET);
      range.clearFormat();
      range.clearContent();

      // Remove the CrUX widget update button
      buttons = newSheet.getDrawings();
      buttons[3].remove();
    }

    // Update the CrUX data
    if (globalType === 'pages') {
      updateDataSheet(url, newSheet);      
    }

    // Set Tab Color of audit sheet
    setTabColor(newSheet);
    
    // Go to the new Sheet
    newSheet.activate();
        
    // Add the first row of data
    update();

    linkAuditSheet(row,name);

    // Add a reference to the planning sheet
    planningObject().linkAuditSheet(newSheet);

    SpreadsheetApp.flush();
  
    return newSheet;
  }

  // Udapte the CrUX data in all formats
  function updateDataSheet(url, auditSheet) {
    var range = auditSheet.getRange(CONFIG.RANGE.AUDIT_CRUX_WIDGET_DATA);
    var oldValues = range.getValues();
    var oldValuesPart = [];
    var newValues = [[],[]];    
    var backgrounds = [[],[]];
    var fontColors = [[],[]];
    var headerBackgrounds = [[]];
    var cruxData;
    var diffs;

    // Get the new data
    for (var i = 0; i < CONFIG.DEFAULT.CRUX_ALL_FORM_FACTORS.length; i++) {
      cruxData = getCrUXData('url', url, CONFIG.DEFAULT.CRUX_ALL_FORM_FACTORS[i]);

      // New Values
      newValues[0] = newValues[0].concat(cruxData[0]);      
      backgrounds[0] = backgrounds[0].concat(cruxData[1]);
      fontColors[0] = fontColors[0].concat("#000000","#000000","#000000","#000000");

      // Diffs
      oldValuesPart = oldValues[0].slice((i * 4), (i * 4) + 4);
      diffs = getDiffs(cruxData[0],oldValuesPart);
      newValues[1] = newValues[1].concat(diffs[0]);
      backgrounds[1] = backgrounds[1].concat(diffs[1]);
      fontColors[1] = fontColors[1].concat("#ffffff","#ffffff","#ffffff","#ffffff");

      // Headers
      if (cruxData[1].includes('#' + CONFIG.CWV.TABLE_COLOR_POOR)) {
        headerBackgrounds[0] = headerBackgrounds[0].concat('#' + CONFIG.CWV.COLOR_POOR,'#' + CONFIG.CWV.COLOR_POOR,'#' + CONFIG.CWV.COLOR_POOR,'#' + CONFIG.CWV.COLOR_POOR);
      } else if (cruxData[1].includes('#' + CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT)) {
        headerBackgrounds[0] = headerBackgrounds[0].concat('#' + CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT,'#' + CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT,'#' + CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT,'#' + CONFIG.CWV.COLOR_NEEDS_IMPROVEMENT);
      } else if (cruxData[1].includes('#' + CONFIG.CWV.TABLE_COLOR_GOOD)) {
        headerBackgrounds[0] = headerBackgrounds[0].concat('#' + CONFIG.CWV.COLOR_GOOD,'#' + CONFIG.CWV.COLOR_GOOD,'#' + CONFIG.CWV.COLOR_GOOD,'#' + CONFIG.CWV.COLOR_GOOD);
      }
    }

    // Update Values and Backgrounds
    range.setValues(newValues);
    range.setBackgrounds(backgrounds);
    range.setFontColors(fontColors);

    // Update Header Backgrounds
    range = auditSheet.getRange('O4:Z4');    
    range.setBackgrounds(headerBackgrounds);

    // Update the date
    range = auditSheet.getRange(CONFIG.RANGE.AUDIT_UPDATE_DATE);
    range.setValue(getDate());

    SpreadsheetApp.flush();

    showMessage('The CrUX Panel was successfully updated.','CrUX data is up to date');
  }

  function getDiffs(newData, oldData) {
    var diffs = [[],[]];
    var diff;
    var oldValue = 0;
    var newValue = 0;

    for (var i = 0; i < newData.length; i++) {
      oldValue = parseFloat(oldData[i]);
      newValue = parseFloat(newData[i]);

      if (!isNaN(oldValue) && !isNaN(newValue)) {
        diff  = newValue - oldValue;
        
        if (diff > 0) {
          diffs[0] = diffs[0].concat(diff + " ↑");
          diffs[1] = diffs[1].concat('#' + CONFIG.CWV.COLOR_POOR);
        // Metric has improved
        } else if (diff < 0) {
          diffs[0] = diffs[0].concat((diff * (-1)) + " ↓");
          diffs[1] = diffs[1].concat('#' + CONFIG.CWV.COLOR_GOOD);
        } else {
          diffs[0] = diffs[0].concat('–');
          diffs[1] = diffs[1].concat('#' + CONFIG.CWV.COLOR_NEUTRAL);
        }

      } else {
        diffs[0] = diffs[0].concat('–');
        diffs[1] = diffs[1].concat('#' + CONFIG.CWV.COLOR_NEUTRAL);
      }  
    }

    return diffs;
  }

  // Link new audit page in the CrUX data table
  function linkAuditSheet (index, name) {      
    var cell = globalDataSheet.getRange(index + 2, 1);

    linkSheet(cell, name);    
  }

  // Get the row data from the CrUX table
  function getPageData(page) {
    var data = [];
    
    data['audit'] = page[0];
    data['url'] = page[2];
    data['pageType'] = page[3];
    data['pageViews'] = page[4];
    
    return data;
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
      cls.p75 = parseFloat(cls.p75).toFixed(2);
    }

    return([[fcp.p75,lcp.p75,fid.p75,cls.p75],[formatFcp(fcp.p75),formatLcp(lcp.p75),formatFid(fid.p75),formatCls(cls.p75)]]);
  }

  function callAPI(request) {
    try {
      return CrUXApiUtil.query(request);
    } catch (error) {
      console.error(error);
    }
  }

  // Triggered by button on sheet.
  // Updates the CrUX data panel on the audit page.
  function update() {
    const auditSheet = SpreadsheetApp.getActive().getActiveSheet();
    const url = auditSheet.getRange(CONFIG.RANGE.AUDIT_URL).getValue();

    updateDataSheet(url, auditSheet);
  }

  // Hide all audit sheets with the status Done
  function hideAudits() {
    hideSheetsOfType(CONFIG.DEFAULT.AUDIT_NAME);
  }

  // Show all audit sheets
  function showAllAudits() {
    showSheetsOfType(CONFIG.DEFAULT.AUDIT_NAME);
    
    // Make sure the sheets are in the right order
    orderSheets();
  }

  // Delete all Audit Sheets and clean Audit Overview Sheet
  function deleteAudits() {
    var auditOverviewSheet;
    var pagesSheet;
    var pagegroupsSheet;
    var auditTemplateSheet;
    var planningSheet;
    var range;
    
    // Delete Audit Sheets
    if (deleteSheetsOfType(CONFIG.DEFAULT.AUDIT_NAME,'Audit') === true) {
      // Delete the Planning Sheet
      planningSheet = globalSheet.getSheetByName(CONFIG.SHEET.PLANNING);
      if (planningSheet !== null) {
        globalSheet.deleteSheet(planningSheet);
      }
      
      // Delete the Audit Template Sheet
      auditTemplateSheet = globalSheet.getSheetByName(CONFIG.SHEET.TEMPLATE_AUDIT);
      if (auditTemplateSheet !== null) {
        globalSheet.deleteSheet(auditTemplateSheet);
      }

      // Delete the Audit Overview Sheet
      auditOverviewSheet = globalSheet.getSheetByName(CONFIG.SHEET.AUDITS_OVERVIEW);
      if (auditOverviewSheet !== null) {
        globalSheet.deleteSheet(auditOverviewSheet);
      }

      // Replace links to audit sheets with empty checkboxes in the pages sheet
      pagesSheet = globalSheet.getSheetByName(CONFIG.SHEET.PAGES);
      if (pagesSheet !== null) {
        range = pagesSheet.getRange('A3:A');
        range.insertCheckboxes();
      }

      // Replace links to audit sheets with empty checkboxes in the page groups sheet
      pagegroupsSheet = globalSheet.getSheetByName(CONFIG.SHEET.PAGE_GROUPS);
      if (pagegroupsSheet !== null) {
        range = pagegroupsSheet.getRange('A3:A');
        range.insertCheckboxes();
      }

      log('Checkboxes were reset in Pages and Page Group sheet');
    }
  }

  // Show all audit sheets that don't have the status done
  function showActiveAudits() {
    var hiddenSheets = SpreadsheetApp.getActive().getSheets().filter(s => s.isSheetHidden()).filter(s => !s.getName().indexOf(CONFIG.DEFAULT.AUDIT_NAME)).map(s => s.getName());
    
    hiddenSheets.forEach(function(name) {
      const sheet = SpreadsheetApp.getActive().getSheetByName(name);
      var status = sheet.getRange(CONFIG.RANGE.AUDIT_STATUS).getValue();
      
      if (isActiveAudit(status) === true) {
        sheet.showSheet();
        log('Made sheet visible: ' + name,true);
      }        
    });

    // Make sure the sheets are in the right order
    orderSheets();
  }

  function recommendAudits() {
    const pagesSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.PAGES);
    const pageGroupsSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.PAGE_GROUPS);    
    var pagesData;
    var pageGroupsData;
    var audits = false;
    var response;
    var object;
    var normalized = [];
    var normalizedSorted = [];
    var pageTypes = [];
    var candidates = [];

    if (pageGroupsSheet === null && pagesSheet === null) {
      showAlert('ERROR: Pages and Page Groups sheets not found','To get audit recommendations please create first the Pages and Page Groups sheet and fill out the page type and page views.');
      return false;
    }

    if (pagesSheet !== null) {
      pagesData = pagesSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();
      pagesData.forEach(function(item,index) {
        var status;

        // If no audit exists so far add the page to the list
        if (item[0] === true || item[0] === false) {
          status = getCwvStatus(item[12],item[16],item[20]);
          normalized.push({audit: item[0], url: item[2], pageType: item[3], pageViews: parseInt(item[4]), status: status, sheet: pagesSheet, row: (index + 3)});
        } else {
          pageTypes.push(item[3]);
          audits = true;
        }      
      });
    }
    
    if (pageGroupsSheet !== null) {
      pageGroupsData = pageGroupsSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();
      pageGroupsData.forEach(function(item,index) {
        var status;
        var cwvStatus;

        // If no audit exists so far add the page to the list
        if (item[0] === true || item[0] === false) {
          cwvStatus = [item[5],item[6],item[7]];
          status;

          if (cwvStatus.includes(CONFIG.CWV.POOR)) {
            status = CONFIG.CWV.POOR;
          } else if (cwvStatus.includes(CONFIG.CWV.NEEDS_IMPROVEMENT)) {
            status = CONFIG.CWV.NEEDS_IMPROVEMENT;
          } else if (cwvStatus.includes(CONFIG.CWV.GOOD)) {
            status = CONFIG.CWV.GOOD;  
          } else {
            status = null;
          }
        
          // audit, url, pageType, pageViews, status, sheet, row
          normalized.push({audit: item[0], url: item[2], pageType: item[3], pageViews: parseInt(item[4]), status: status, sheet: pageGroupsSheet, row: (index + 3)});
        } else {
          pageTypes.push(item[3]);
          audits = true;
        }        
      });
    }      

    // Sort the array after the status, the page type, and page views.
    // This way we make sure that the first hit is the best page to audit.
    normalizedSorted = multiSort(normalized,{
        status: 'desc',
        pageType: 'asc',
        pageViews: 'desc'
    });
     
    log('Normalized Sorted: ' + JSON.stringify(normalizedSorted));

    normalizedSorted.forEach(function(item) {
      var pageType = item['pageType'];
      var range;

      // If there is no audit yet for this page type and the status is not good
      if (pageType !== '' && !pageTypes.includes(pageType) && item['status'] !== CONFIG.CWV.GOOD) {
        pageTypes.push(item['pageType']);
        range = item['sheet'].getRange('A' + item['row']);
        range.setValue('TRUE');
        candidates.push(item);     
      }
    });

    // We can't give a good recommendation without data
    if (candidates.length < 1) {
      if (audits === false) {
        showAlert('ERROR: Page Type and Page Views are missing','To get recommendations please fill out the page type and page views in the Pages and Page Groups sheets.');
      } else {
        showAlert('No audit recommendations found','You have already audits for all page types that have not a good Core Web Vital. No further audits are recommended.');
      }      
    } else {
      response = showAlertWithButton(candidates.length + ' audit recommendations found','Please press YES to accept the recommendations and create the audit sheets.\nIf you press NO the recommendations will be deleted.');
      if (response === true) {
        object = auditsObject('pageGroups');
        object.run();

        object = auditsObject('pages');
        object.run();
      } else {
        candidates.forEach(function(item) {
          var range = item['sheet'].getRange('A' + item['row']);
          range.setValue('FALSE');
        });
      }
    }
  }

  function multiSort(array, sortObject = {}) {
    const sortKeys = Object.keys(sortObject);

    // Return array if no sort object is supplied.
    if (!sortKeys.length) {
        return array;
    }

    // Change the values of the sortObject keys to -1, 0, or 1.
    for (let key in sortObject) {
        sortObject[key] = sortObject[key] === 'desc' || sortObject[key] === -1 ? -1 : (sortObject[key] === 'skip' || sortObject[key] === 0 ? 0 : 1);
    }

    const keySort = (a, b, direction) => {
        direction = direction !== null ? direction : 1;

        if (a === b) { // If the values are the same, do not switch positions.
            return 0;
        }

        // If b > a, multiply by -1 to get the reverse direction.
        return a > b ? direction : -1 * direction;
    };

    return array.sort((a, b) => {
        let sorted = 0;
        let index = 0;

        // Loop until sorted (-1 or 1) or until the sort keys have been processed.
        while (sorted === 0 && index < sortKeys.length) {
            const key = sortKeys[index];

            if (key) {
                const direction = sortObject[key];

                sorted = keySort(a[key], b[key], direction);
                index++;
            }
        }

        return sorted;
    });
  }

  function createChecklist(sheet) {
    const numberFormat = ["#,###"];      
    let counter = 0;
    let checklist = [];
    let sections = [];
    let subSections = [];
    let checklistItems = [];
    let numberFormats = [];     
    let firstRow;
    let rule;
    let rules;
    let range;
    let rows;

    CONFIG.CHECKLIST.forEach(function(section) {
      let sectionName = section[0];

      checklist.push(createSection(sectionName));
      sections.push(counter);
      numberFormats.push(numberFormat);
      counter++;

      section[1].forEach(function(subsection) {                       
          if (!Array.isArray(subsection)) { 
            checklist.push(createSubSection(subsection));
            subSections.push(counter);
            numberFormats.push(numberFormat);
            counter++;            
          } else {            
            checklist.push(createChecklistItem(subsection));
            checklistItems.push(counter);
            numberFormats.push(numberFormat);
            counter++;            
          }
      });    
    });

    rows = checklist.length;  
    firstRow = sheet.getLastRow() + 1;

    range = sheet.getRange('A' + firstRow + ':K' + (firstRow + rows - 1));
    range.setValues(checklist);
    
    // Alternating rows
    range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
    
    // Format
    range.setFontColor('#000000');
    range.setFontWeight('normal');
    range.setFontFamily('Open Sans');
    range.setFontSize(12);

    // Set number format
    range = sheet.getRange('J' + (firstRow) + ':J');
    range.setNumberFormats(numberFormats);

    // Make the info icon bigger
    range = sheet.getRange('I' + (firstRow) + ':I');
    range.setFontSize(18);
    range.setFontLine('none');

    // Borders for info column
    // setBorder(top, left, bottom, right, vertical, horizontal, color, style)
    range = sheet.getRange('I' + (firstRow - 1) + ':I');
    range.setBorder(null, true, false, true, false, false, "#999999", SpreadsheetApp.BorderStyle.SOLID);
    
    // Right border of the table
    range = sheet.getRange('K' + (firstRow) + ':K');
    range.setBorder(null, null, null, true, null, null, "#999999", SpreadsheetApp.BorderStyle.SOLID_THICK);

    // White top and bottom borders to separate lines better
    range = sheet.getRange('A' + (firstRow - 1) + ':K');
    range.setBorder(null, null, null, null, null, true, "#ffffff", SpreadsheetApp.BorderStyle.SOLID);

    // Thick block sourrounding border for headline
    range = sheet.getRange('A' + (firstRow - 1) + ':K' + (firstRow - 1));
    range.setBorder(true, true, true, true, null, null, "#000000", SpreadsheetApp.BorderStyle.SOLID_THICK);

    // Add Checkboxes with conditional formatting
    range = sheet.getRange('A' + (firstRow) + ':A');
    range.insertCheckboxes();
    
    rules = sheet.getConditionalFormatRules();

    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("TRUE")
      .setFontColor("#ffffff")
      .setBackground('#ff4e42') 
      .setRanges([range])
      .build();

    rules.push(rule);    

    range = sheet.getRange('B' + (firstRow) + ':K');

    rule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=COUNTIF($A' + firstRow + '; TRUE)')
      .setFontColor("#ffffff")
      .setBackground('#ff4e42')      
      .setRanges([range])
      .build();

    rules.push(rule);      

    sheet.setConditionalFormatRules(rules); 

    // Merge Cells
    range = sheet.getRange('B' + firstRow + ':H' + (firstRow + rows - 1));
    range.mergeAcross();

    range = sheet.getRange('J' + firstRow + ':K' + (firstRow + rows - 1));
    range.mergeAcross();

    // Format sections
    formatSection(sheet,firstRow,sections);
    formatSubSection(sheet,firstRow,subSections);

    // Show the stats
    createStats(sheet,firstRow,sections); 
  }

  function createSection(name) {
    return ['',name,'','','','','','','','',''];
  }

  function createSubSection(name) {
    return ['',name,'','','','','','','','',''];    
  }

  function createChecklistItem(name) {
    let row;

    if (isURL(name[1])) {
      row = ['',name[0],'','','','','','',`=HYPERLINK("${name[1]}"; "ℹ")`,'',''];
    } else {
      row = ['',name[0],'','','','','','','','',''];
    }

    return row;
  }

  function removeCheckbox(range) {
    range.removeCheckboxes();
  }

  function formatSection(sheet,firstRow,sections) {
    sections.forEach(function(section) {
      let row = (firstRow + section);
      let range = sheet.getRange('A' + row + ':K' + row);
      
      range.setBackground('#cfe2f3');
      range.setFontSize(14);
      range.setFontWeight('bold');

      // Remove Checkbox
      removeCheckbox(sheet.getRange('A' + row));
    });
  }

  function formatSubSection(sheet,firstRow,subSections) {
    subSections.forEach(function(subSection) {
      let row = (firstRow + subSection);
      let range = sheet.getRange('A' + row + ':K' + row);
      
      range.setBackground('#fff2cc');      
      range.setFontWeight('bold');

      // Remove Checkbox
      removeCheckbox(sheet.getRange('A' + row));      
    });
  }

  function createStats(sheet,firstRow,sections) {
    var range;
    var lastRow = sheet.getLastRow();
    var sectionName;
    var startRow;
    var endRow;
    var values = [['','Optimization Opportunities','','','','','',''],[`=SUM(M${firstRow + 1}:M${firstRow + sections.length})`,'Total Optimization Opportunities','','','','','','']];

    for (var i = 0; i < sections.length; i++ ) {
      startRow = firstRow + sections[i];
      
      if (sections[i + 1]) {
        endRow = firstRow + sections[i + 1];
      } else {
        endRow = lastRow;
      }
      
      sectionName = sheet.getRange('B' + startRow).getValue();
      values.push([`=COUNTIF(A${startRow + 1}:A${endRow};TRUE)`, sectionName,'','','','','','']);
    };

    range = sheet.getRange('M' + (firstRow-1) + ':T' + (firstRow-2 + values.length));
    range.setValues(values);

    // Borders for info column
    // setBorder(top, left, bottom, right, vertical, horizontal, color, style)
    range = sheet.getRange('M' + (firstRow - 1) + ':T' + (firstRow - 1));
    range.setBorder(true, true, true, true, false, false, "#000000", SpreadsheetApp.BorderStyle.SOLID_THICK);
    range = sheet.getRange('M' + (firstRow) + ':T' + (firstRow-2 + values.length));
    range.setBorder(null, true, true, true, false, false, "#999999", SpreadsheetApp.BorderStyle.SOLID_THICK);
    range = sheet.getRange('M' + (firstRow + 1) + ':T' + (firstRow-2 + values.length));
    range.setBorder(null, null, null, null, false, true, "#999999", SpreadsheetApp.BorderStyle.SOLID);
    range = sheet.getRange('M' + (firstRow + 1) + ':T' + (firstRow + 1));
    range.setBorder(true, null, null, null, null, null, "#999999", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    // Merge Cells
    range = sheet.getRange('N' + (firstRow-1) + ':T' + (firstRow-2 + values.length));
    range.mergeAcross();

    // Format Headline
    range = sheet.getRange('M' + (firstRow-1) + ':T' + (firstRow-1));
    range.setBackground('#000000');

    // Format Total
    range = sheet.getRange('M' + (firstRow) + ':T' + (firstRow));
    range.setFontColor('#000000');
    range.setBackground('#cfe2f3');
    range.setFontSize(14);
    range.setFontFamily('Open Sans');
    range.setFontWeight('bold');

    // Format Table
    range = sheet.getRange('M' + (firstRow + 1) + ':T' + (endRow));
    range.setFontSize(12);
    range.setFontColor('#000000');
    range.setBackground('#ffffff');
    range.setFontFamily('Open Sans');
    range.setFontWeight('normal');

    range = sheet.getRange('M' + (firstRow) + ':M' + (endRow));
    range.setHorizontalAlignment('center');    
  }

  return Object.freeze({
    objectName: 'auditsObject',
    run: run,
    update: update,
    hideAudits: hideAudits,
    showAllAudits: showAllAudits,
    showActiveAudits: showActiveAudits,
    deleteAudits: deleteAudits,
    recommendAudits: recommendAudits  
  });
}
