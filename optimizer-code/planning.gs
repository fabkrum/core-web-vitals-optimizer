function planningObject() {
  "use strict";
  const globalSheet = SpreadsheetApp.getActive();
  const globalPlanningSheet = globalSheet.getSheetByName(CONFIG.SHEET.PLANNING);      

  setConfiguration();

  function run() {
    // Filter the sheet
    filter();

    // Make sheet visible
    globalPlanningSheet.showSheet();

    // Make it the active sheet
    globalPlanningSheet.activate();

    // Put the sheets in the right order
    orderSheets();
  }

  function create() {
    const templateSheet = createSheetFromTemplate(CONFIG.SHEET.PLANNING, CONFIG.SHEET.TEMPLATE_PLANNING, false);

    if (templateSheet !== null) {
      createIssueList(templateSheet);
    } else {
      return false;
    }
  };

  function createIssueList(sheet) {
    let counter = 0;
    let checklist = [];
    let checklistItems = [];
    let firstRow = CONFIG.SETTINGS.PLANNING_FIRST_ROW;
    let range;
    let rows;

    CONFIG.CHECKLIST.forEach(function(section) {
      section[1].forEach(function(subsection) {                       
          if (Array.isArray(subsection)) { 
            checklist.push(createChecklistItem(subsection));
            checklistItems.push(counter);
            counter++;            
          }
      });    
    });

    rows = checklist.length;
    range = sheet.getRange('A' + firstRow + ':H' + (firstRow + rows - 1));
    range.setValues(checklist);

    // Format
    range.setFontColor('#000000');
    range.setFontWeight('normal');
    range.setFontFamily('Open Sans');
    range.setBackground('#FFFFFF');
    range.setFontSize(12);
    range.setHorizontalAlignment('center');

    // Update total impact formula
    sheet.getRange('G3').setValue(`=SUM(G4:G)`);

    // Create Dropdowns for Status, Effort, and Prio
    range = sheet.getRange('A' + firstRow + ':A');
    setValidation(range,CONFIG.DEFAULT.VALIDATION_STATUS,CONFIG.DEFAULT.VALIDATION_STATUS[0][0]);
    setConditionalFormatting(sheet,range,CONFIG.DEFAULT.VALIDATION_STATUS);
    
    range = sheet.getRange('F' + firstRow + ':F');
    setValidation(range,CONFIG.DEFAULT.VALIDATION_EFFORT);
    setConditionalFormatting(sheet,range,CONFIG.DEFAULT.VALIDATION_EFFORT);
    
    range = sheet.getRange('E' + firstRow + ':E');
    setValidation(range,CONFIG.DEFAULT.VALIDATION_PRIO);
    setConditionalFormatting(sheet,range,CONFIG.DEFAULT.VALIDATION_PRIO);

    // Left Align Checklist Items
    range = sheet.getRange('B' + firstRow + ':B');
    range.setHorizontalAlignment('left');

    // Make the info icon bigger
    range = sheet.getRange('C' + firstRow + ':C');
    range.setFontSize(18);
    range.setFontLine('none');    

    // Borders for info column
    // setBorder(top, left, bottom, right, vertical, horizontal, color, style)
    range = sheet.getRange('A' + (firstRow - 2) + ':H');
    range.setBorder(null, false, false, false, true, false, "#999999", SpreadsheetApp.BorderStyle.SOLID);
    
    // Right border of the table
    range = sheet.getRange('H1:H');
    range.setBorder(null, null, null, true, null, null, "#999999", SpreadsheetApp.BorderStyle.SOLID_THICK);
    
    // Protect ranges that users shouldn't change in this sheet
    range = sheet.getRange('B'+ firstRow + ':C');
    range.protect()
      .setWarningOnly(true)
      .setDescription('This data is referencing audit sheet data and shouldn\'t be changed here.');

    range = sheet.getRange('G'+ firstRow + ':H');
    range.protect()
      .setWarningOnly(true)
      .setDescription('This data is referencing audit sheet data and shouldn\'t be changed here.');      

    // Freeze rows and columns
    sheet.setFrozenRows(firstRow - 1);
  }

  function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0)
    {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }

  function linkAuditSheet(auditSheet) {
    const sheet = globalPlanningSheet;
    const lastColumn = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    const auditPageType = auditSheet.getRange(CONFIG.RANGE.AUDIT_PAGE_TYPE).getValue();
    const auditSheetName = auditSheet.getName();
    const auditSheetId = auditSheet.getSheetId();
    const firstRow = CONFIG.SETTINGS.PLANNING_FIRST_ROW;
    const columnLetter = columnToLetter(lastColumn + 2);
    var counter = firstRow;
    var checklist = []
    var summary = [];
    var values = [];
    var range;
    
    sheet.insertColumnsAfter((lastColumn), 2);
    
    // Set Headline with pageType and link to audit
    range = sheet.getRange(2,(lastColumn + 1));

    // Use the page type as a headline (Audit sheet name fallback) and link it to the audit
    if (auditPageType !== '') {
      range.setValue(`=HYPERLINK("#gid=${auditSheetId}"; "${auditPageType}")`);
    } else {
      range.setValue(`=HYPERLINK("#gid=${auditSheetId}"; "${auditSheetName}")`);
    }
    
    // Merge heading cells
    range = sheet.getRange(2,(lastColumn + 1),1,2);
    range.mergeAcross();

    // Set subheadlineS
    range = sheet.getRange(3,(lastColumn + 1));
    range.setValue('Issue');

    range = sheet.getRange(3,(lastColumn + 2));
    range.setValue('Impact');

    // Get Audit Checklist
    checklist = auditSheet.getRange('A' + CONFIG.RANGE.AUDIT_PAGE_CHECKLIST_FIRST_ROW + ':K').getValues();
    checklist.forEach(function(item,index) {      
      var row = index + CONFIG.RANGE.AUDIT_PAGE_CHECKLIST_FIRST_ROW;
      var checkbox = item[0];
      var columnRange;
      var impact;
      var issue;

      // If it is a checklist item and not a header, create an entry
      if (checkbox !== "") {        
        issue = `='${auditSheetName}'!A${row}`;
        impact = `='${auditSheetName}'!J${row}`;
        columnRange = 'I'+ counter +':' + columnLetter + counter;
        counter++;

        values.push([issue,impact]);
        summary.push([`=max(${columnRange})`,`=COUNTIF(${columnRange};TRUE)`]);            
      }
    });

    // Link checkbox and impact cells
    range = sheet.getRange(firstRow,(lastColumn + 1),(lastRow - firstRow + 1),2);
    range.setValues(values);

    // Update summary formulas
    range = sheet.getRange(firstRow,7,(lastRow - firstRow + 1),2);
    range.setValues(summary);

    // Set borders
    // setBorder(top, left, bottom, right, vertical, horizontal, color, style)
    range = sheet.getRange(3,(lastColumn + 1),(lastRow - 1),1);
    range.setBorder(null, null, null, true, null, null, "#999999", SpreadsheetApp.BorderStyle.SOLID);    

    // Grey horizontal borders to separate lines better
    range = sheet.getRange(firstRow,1,(lastRow - 1),(lastColumn + 2));
    range.setBorder(null, null, null, null, null, true, "#999999", SpreadsheetApp.BorderStyle.SOLID);

    range = sheet.getRange(3,(lastColumn + 2),(lastRow - 1),1);
    range.setBorder(null, null, null, true, null, null, "#999999", SpreadsheetApp.BorderStyle.SOLID_THICK);

    range = sheet.getRange(2,(lastColumn),1,1);
    range.setBorder(null, null, null, true, null, null, "#999999", SpreadsheetApp.BorderStyle.SOLID_THICK);

    // Freeze columns of planning block
    sheet.setFrozenColumns(8);

    // Create Conditional formating
    range = sheet.getRange(firstRow,(lastColumn + 1),(lastRow - 1),1);
    setConditionalFormatting(sheet,range,[['TRUE','#ff4e42','#ff4e42'],['FALSE','#0cce6b','#0cce6b']]);

    // Protect the range 
    range = sheet.getRange(1,(lastColumn + 1),(lastRow - 1),2);
    range.protect()
      .setWarningOnly(true)
      .setDescription('This data is referencing audit sheet data and shouldn\'t be changed here.');
  }

  function createChecklistItem(name) {
    let row;

    if (isURL(name[1])) {
      row = ['',name[0],`=HYPERLINK("${name[1]}"; "ℹ")`,'','','','',''];
    } else {
      row = ['',name[0],'','','','','',''];
    }

    return row;
  }

  // Only show checklist items that are an issue in at least one audit
  function filter() {
    const firstRow = CONFIG.SETTINGS.PLANNING_FIRST_ROW;
    const rows = globalPlanningSheet.getRange('H' + firstRow +':H').getValues();

    rows.forEach(function(row,index) {
      if (row[0] > 0) {
        globalPlanningSheet.showRows(firstRow + index);
      } else {
        globalPlanningSheet.hideRows(firstRow + index);        
      }
    });
  }

  return Object.freeze({
    objectName: 'planningObject',
    run: run,
    create: create,
    filter: filter,
    linkAuditSheet: linkAuditSheet
  });
}
