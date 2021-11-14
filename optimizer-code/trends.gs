function trendsObject(mode) {
  "use strict";

  // Global variables
  const globalSs = SpreadsheetApp.getActive();
  var globalSheet = globalSs.getSheetByName(CONFIG.SHEET.ORIGINS);
  var globalData = globalSheet.getRange(CONFIG.RANGE.ORIGINS_DATA).getValues();
  var globalReferences = getTrendSheets();

  function run() {
    setConfiguration();

    // Check if the required Origin Sheet is available
    if (globalSheet === null || globalData === undefined) {
      showAlert('Missing Origins Sheet', 'Please create the Origin Sheet first.');
      return;
    }

    for (var i=0; i < globalData.length; i++) {
      var trend = globalData[i][0];
      var url = globalData[i][2];
      var trendSheet = getTrendSheet(url);      
      var cell = globalSheet.getRange('A' + (i + 3));
      var ids = globalReferences.map(trend => {return trend[0]});
      var id;
      var name;
      var sheet;      

      // Trend sheet for this URL exsits, update the link
      if (trendSheet !== null) {
        linkSheet(cell,trendSheet[1]);
      
      // Checkbox is set - create a new Trend Sheet
      } else if (trend === true) {
        id = getNextId(ids);
        name = CONFIG.DEFAULT.TREND_NAME + ' ' + id;
        sheet = createTrendSheet(id, name, url);        

        if (sheet !== null) {
          linkSheet(cell, name);
          
          // Go to the new Sheet
          sheet.activate();
          
          // Add the first row of data
          update();                    
        }        
      
      // Unchecked Box. Do nothing.
      } else if (trend === false) {
      
      // Replace unexpected or outdated content with an empty checkbox.
      } else {
        cell.insertCheckboxes();
      }
    }
    
    // Sort the sheets
    orderSheets();

    // Open the Origin Sheet
    globalSs.setActiveSheet(globalSheet);
  }

  // Create a new Trend sheet
  function createTrendSheet(id, name, url) {
    const template = CONFIG.SHEET.TEMPLATE_TRENDS;    
    const newSheet = createSheetFromTemplate(name, template, true);
    var newSheetId;    

    if (newSheet === null) {
      return null;      
    }

    // Set the URL in the head of the new sheet
    newSheet.getRange('A1').setValue(url);

    // Set the right tab color
    if (hasTrigger('updateCruxData') === false) {
      setTabColor(newSheet, CONFIG.DEFAULT.AUTOMATION_INACTIVE_COLOR);
    } else {
      setTabColor(newSheet, CONFIG.DEFAULT.AUTOMATION_ACTIVE_COLOR);
    }

    // Save new trend sheet in the references
    newSheetId = newSheet.getSheetId();  
    globalReferences.push([id,name,url,newSheetId]);
  
    return newSheet;
  }

  function getTrendSheets() {
    const sheets = SpreadsheetApp.getActive().getSheets().filter(s => !s.getName().indexOf(CONFIG.DEFAULT.TREND_NAME)).map(s => s);
    var trendSheets = [];

    sheets.forEach(function(sheet) {
      const name = sheet.getName();
      const id = parseInt(name.replace(/[^0-9]/g, ''));
      const sheetId = sheet.getSheetId();
      const url = sheet.getRange('A1').getValue();
      
      trendSheets.push([id, name, url, sheetId]);
    });

    return trendSheets;
  }

  function getTrendSheet(url) {
    var trendSheet = null;

    globalReferences.every(function(entry) {        
        if (url === entry[2]) {
          trendSheet = entry;
          return false;
        }
        
        return true;
    })

    return trendSheet;
  }

  // Update trend sheet data
  function update() {
    const sheet = SpreadsheetApp.getActive().getActiveSheet();
    const data = sheet.getRange(CONFIG.RANGE.TRENDS_DATA).getValues();
    const dates = data.map(item => {return item[0]}).reverse(); // Array with the dates of all entries, beginning with the newest
    const url = sheet.getRange('A1').getValue();
    const name = sheet.getName();
    const lastColumn = sheet.getLastColumn();    
    var lastRow;
    var range;
    var row;

    if (isUpdatedToday(dates) === false) {      
      
      // Add the new CrUX data in the last empty row      
      lastRow = findNextEmptyRow(data);

      if (lastRow !== null) {
        row = getCrUXData('origin', url);
        range = sheet.getRange(lastRow,1,1,lastColumn);
        range.setValues(row);

        // Update the data format for the new line
        formatCruxData(sheet, lastRow);

        SpreadsheetApp.flush();

        // TODO: The updateChart function is not working as I couldn't find a way to update the ranges for the series and the x-axis with Google app script.
        // There is created now enough rows for the next 10 years in the document instead of adding a row for each day via an app script. 
        // Once this would be possible the upateCharts function could be changed and used
      } else {
        log('Unvalid last row in trend sheet ' + name,true);
      }

      log('Trend sheet ' + name + ' was updated.',true);
    } else {
      log('Trend sheet ' + name + ' has been already updated earlier today.',true);
    }
  }

  function findNextEmptyRow(data) {
    var row = null;

    data.every(function(item,index) {
      if (item[0] === '') {        
        row = (index + 5);
        return false;
      } else {
        return true;          
      }      
    });

    return row;

    CONFIG.RANGE.TRENDS_DATA
  }

  function isUpdatedToday(dates) {
    const today = getDate();
    var isUpdatedToday = false;

    dates.every(function(date) {
      if (date == '') {
        return true;
      }

      date = Utilities.formatDate(date, CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT);

      if (date === today) {
        isUpdatedToday = true;
        return false;
      } 

      return true;
    });

    return isUpdatedToday;
  }

  function getCrUXData(key, value) {
    const formFactor = CONFIG.DEFAULT.CRUX_FORM_FACTOR;
    const date = getDate();
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

    return([[date,
           fcp.good, fcp.ni, fcp.poor, fcp.p75,
           lcp.good, lcp.ni, lcp.poor, lcp.p75,
           fid.good, fid.ni, fid.poor, fid.p75,
           cls.good, cls.ni, cls.poor, cls.p75]]);
  }

  function formatCruxData (sheet, row) {
    const dateRange = sheet.getRange('A' + row);
    const array = [
      [CONFIG.CWV.FCP_GOOD,CONFIG.CWV.FCP_POOR,sheet.getRange('E' + row)],
      [CONFIG.CWV.LCP_GOOD,CONFIG.CWV.LCP_POOR,sheet.getRange('I' + row)],
      [CONFIG.CWV.FID_GOOD,CONFIG.CWV.FID_POOR,sheet.getRange('M' + row)],
      [CONFIG.CWV.CLS_GOOD,CONFIG.CWV.CLS_POOR,sheet.getRange('Q' + row)]
    ];
    var status = [];    

    array.forEach(function(entry) {
      var good = entry[0];
      var poor = entry[1];
      var range = entry[2];
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
      dateRange.setBackground('#' + CONFIG.CWV.TABLE_COLOR_POOR);
    } else if (status.includes(CONFIG.CWV.NEEDS_IMPROVEMENT)) {
      dateRange.setBackground('#' + CONFIG.CWV.TABLE_COLOR_NEEDS_IMPROVEMENT);
    } else if (status.includes(CONFIG.CWV.GOOD)) {
      dateRange.setBackground('#' + CONFIG.CWV.TABLE_COLOR_GOOD);
    }
  }

  // Delete all Trend Sheets
  function deleteTrends() {
    const range = globalSheet.getRange('A3:A');
    
    if (deleteSheetsOfType(CONFIG.DEFAULT.TREND_NAME,'Trend') === true) {
      // Add empty checkboxes in Origin trend column
      range.insertCheckboxes();
      log('Checkboxes were reset in Origin sheet');      
    }
  }

  // Hide all audit sheets with the status Done
  function hideTrends() {
    hideSheetsOfType(CONFIG.DEFAULT.TREND_NAME);
    showMessage('Use the "Show Trend sheets" function in the Trend menu to make them visible again.','Trend sheets are hidden');
  }

  // Show all hidden audit sheets with the status Done
  function showTrends() {
    showSheetsOfType(CONFIG.DEFAULT.TREND_NAME);
    showMessage('Use the "Hide Trend sheets" function in the Trend menu to hide them again.','Trend sheets are visible');

    // Make sure the sheets are in the right order
    orderSheets();
  }

  // These function aren't used at the moment, as it is not possible to match range to the x-axis and the series.

  function updateCharts(sheet) {
    const charts = sheet.getCharts();
    const firstRow = 5;
    const lastRow = sheet.getLastRow(); 
    const rangeDate = sheet.getRange('A' + firstRow + ':A' + lastRow);
    const fcp = [rangeDate,sheet.getRange('B' + firstRow + ':B' + lastRow),sheet.getRange('C' + firstRow + ':C' + lastRow),sheet.getRange('D' + firstRow + ':D' + lastRow),sheet.getRange('E'+ firstRow +':E' + lastRow)];
    const lcp = [rangeDate,sheet.getRange('F' + firstRow + ':F' + lastRow),sheet.getRange('G' + firstRow + ':G' + lastRow),sheet.getRange('H' + firstRow + ':H' + lastRow),sheet.getRange('I'+ firstRow +':I' + lastRow)];
    const fid = [rangeDate,sheet.getRange('J' + firstRow + ':J' + lastRow),sheet.getRange('K' + firstRow + ':K' + lastRow),sheet.getRange('L' + firstRow + ':L' + lastRow),sheet.getRange('M'+ firstRow +':M' + lastRow)];
    const cls = [rangeDate,sheet.getRange('N' + firstRow + ':N' + lastRow),sheet.getRange('O' + firstRow + ':O' + lastRow),sheet.getRange('P' + firstRow + ':P' + lastRow),sheet.getRange('Q'+ firstRow +':Q' + lastRow)];

    charts.forEach(function(chart) {
      const title = chart.getOptions().get('title');

      switch (title) {
        case 'First Contentful Paint (FCP) - Line Chart':
          log('Update Chart: First Contentful Paint (FCP) - Line Chart',true);
          updateChartRanges(sheet, chart, 'line', fcp);          
          break;
        case 'First Contentful Paint (FCP) - Column Chart':
          log('Update Chart: First Contentful Paint (FCP) - Column Chart',true);
          updateChartRanges(sheet, chart, 'column', fcp);
          break;
        case 'Largest Contentful Paint (LCP) - Line Chart':
          log('Update Chart: Largest Contentful Paint (LCP) - Line Chart',true);
          updateChartRanges(sheet, chart, 'line', lcp);
          break;
        case 'Largest Contentful Paint (LCP) - Column Chart':
          log('Update Chart: Largest Contentful Paint (LCP) - Column Chart',true);
          updateChartRanges(sheet, chart, 'column', lcp);
          break;
        case 'First Indput Delay (FID) - Line Chart':
          log('Update Chart: First Indput Delay (FID) - Line Chart',true);
          updateChartRanges(sheet, chart, 'line', fid);
          break;
        case 'First Indput Delay (FID) - Column Chart':
          log('Update Chart: First Indput Delay (FID) - Column Chart',true);
          updateChartRanges(sheet, chart, 'column', fid);
          break;
        case 'Cumulative Layout Shift (CLS) - Line Chart':
          log('Update Chart: Cumulative Layout Shift (CLS) - Line Chart',true);
          updateChartRanges(sheet, chart, 'line', cls);
          break;
        case 'Cumulative Layout Shift (CLS) - Column Chart':
          log('Update Chart: Cumulative Layout Shift (CLS) - Column Chart',true);
          updateChartRanges(sheet, chart, 'column', cls);
          break;
      }
    });
  }

  function logRanges(chart,text) {
    const ranges = chart.getRanges();

    const logRanges = [];
    
    for (var i in ranges) {
      logRanges.push(ranges[i].getA1Notation());      
    }

    log(text + ': ' + JSON.stringify(logRanges),true);
  }

  function updateChartRanges(sheet, chart, type, ranges) {
    var newChart;
    var series;
    
    logRanges(chart,'Ranges Before');

    if (type === 'column') {
      series = {
        0:{targetAxisIndex:1},
        1:{targetAxisIndex:0},
        2:{targetAxisIndex:0},
        3:{targetAxisIndex:0}
      }
      newChart = chart.modify()
        .clearRanges()
        .addRange(ranges[0])
        .addRange(ranges[1])
        .addRange(ranges[2])
        .addRange(ranges[3])
        .setOption("series",series)
        .build();
    } else {
      series = {
        0:{targetAxisIndex:1},
        1:{targetAxisIndex:0},
        2:{targetAxisIndex:0},
        3:{targetAxisIndex:0},
        4:{targetAxisIndex:0},
      }
      newChart = chart.modify()
        .clearRanges()
        .addRange(ranges[0])
        .addRange(ranges[1])
        .addRange(ranges[2])
        .addRange(ranges[3])
        .addRange(ranges[4])
        .setOption("series",series)        
        .build();      
    }      

    sheet.updateChart(newChart);

    logRanges(newChart,'Ranges After');
    
    // Make sure the Charts are shown correctly
    SpreadsheetApp.flush(); 
  }

  function addRow(...args) {
    const sheet = SpreadsheetApp.getActive().getActiveSheet();
    const date = getDate();
    const row = [date, ...args];    

    sheet.appendRow(row);

    const firstRow = sheet.getRange(CONFIG.RANGE.TRENDS_FIRST_ROW);
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const numberFormat = [["yyy-mm-dd", "0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "#,###", "0.00%", "0.00%", "0.00%", "0.00"]]; 
    const numberRange = sheet.getRange('A' + lastRow + ':' + 'Q' + lastRow);
   
    // Apply the format from first row           
    firstRow.copyFormatToRange(sheet, 1, lastColumn, lastRow, lastRow);
    
    // Make sure the numbers are correctly formated    
    numberRange.setNumberFormats(numberFormat);

    // Color code the p75 cells
    formatCruxData(sheet, lastRow)

    SpreadsheetApp.flush();   
  }  

  return Object.freeze({
    objectName: 'trendsObject',
    run: run,
    update: update,
    deleteTrends: deleteTrends,
    hideTrends: hideTrends,
    showTrends: showTrends    
  });
}
