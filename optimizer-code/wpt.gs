function wptObject(globalTestType) {
  "use strict";
  const globalSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  function run() {
    setConfiguration();
    const testUrl = getTestUrl();
    const hasBenchmark = hasBenchmarkTest();

    if (globalTestType === 'benchmark') {
      log('Run Benchmark Test for ' + testUrl,true);

      testBenchmark(testUrl);

      // Update the diffs after we update the benchmark test
      if (hasBenchmark === true) {       
        updateDiffs();
      }
    } else {
      
      // Run the benchmark test first
      if (hasBenchmark === false) {       
        testBenchmark();
      }

      log('Run Hypothesis Test for ' + testUrl,true);      
      testHypothesis(testUrl);
    }
  }

  function hasBenchmarkTest() {
    const range = globalSheet.getRange(CONFIG.SETTINGS.AUDIT_WPT_FIRST_ROW,2,1,1);

    if (range.isBlank() === false) {
      return true;
    } else {
      return false;
    }
  }

  function testBenchmark(url) {
    const label = 'Benchmark test';
    const testData = runTests(url);    
    var columns = 4;    
    var range;
    var values = [Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT),label,null,null];
    var backgrounds = ['#ffffff','#ffffff','#ffffff','#ffffff'];
    var fontColors = [null,null,null,null];
    var testIds = [];
    var lastRow = getNextRow();

    testData.forEach(function(test) {
      var ttfb = test[0];
      var startRender = test[1];
      var fcp = test[2];
      var lcp = test[3];
      var tbt = test[4];
      var cls = test[5];
      var testUrl = test[6];
      var lcpElement = test[7];
      var value = [
        ttfb,
        'Diff',
        startRender,
        'Diff',
        fcp,
        'Diff',
        lcp,
        'Diff',
        tbt,
        'Diff',
        cls,
        'Diff',
        testUrl,
        null
      ];

      var background = [
        formatTtfb(ttfb),
        CONFIG.DEFAULT.COLOR_HEADLINE,
        formatFcp(startRender),
        CONFIG.DEFAULT.COLOR_HEADLINE,
        formatFcp(fcp),
        CONFIG.DEFAULT.COLOR_HEADLINE,
        formatLcp(lcp),
        CONFIG.DEFAULT.COLOR_HEADLINE,
        formatTbt(tbt),
        CONFIG.DEFAULT.COLOR_HEADLINE,
        formatCls(cls),
        CONFIG.DEFAULT.COLOR_HEADLINE,
        '#ffffff',
        CONFIG.DEFAULT.COLOR_HEADLINE
      ];

      var fontColor = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        CONFIG.SETTINGS.AUDIT_LINK_COLOR,
        null
      ]

      values = values.concat(value);
      backgrounds = backgrounds.concat(background);
      fontColors = fontColors.concat(fontColor);
      testIds.push(getWptTestId(testUrl));

      // Set the LCP element for the test
      range = globalSheet.getRange(lastRow,(columns + 2), 1, 1);
      range.setValue(lcpElement);
      
      columns += 14;
    });

    // Set data
    range = globalSheet.getRange(12, 2, 1, columns);
    range.setValues([values]);
    range.setBackgrounds([backgrounds]);
    range.setFontColors([fontColors]);

    // Create a row wpt comparison link
    range = globalSheet.getRange(12, 5, 1, 1);
    range.setValue(`=HYPERLINK("${CONFIG.SETTINGS.WPT_COMPARISON_URL}${testIds.join(',')}"; "Compare all")`);
    range.setFontColor(CONFIG.SETTINGS.AUDIT_LINK_COLOR);
  
    // Update the B&A test links and the column comparison WPT
    updateComparisonWptLinks();
  }  

  function testHypothesis(url) {
    const row = getNextRow();
    const label = getLabel();
    var testData = null;
    var columns = 4;
    var range;
    var values = [];
    var backgrounds = [];
    var fontColors = [];
    var testIds = [];

    if (label === null) {
      log('No label was provided.', true);
      //showAlert('Please provide a label to be able to identify the test. The ','Error: Mandatory label is missing');
      return false;
    }

    // Add a new row after the last test
    globalSheet.insertRowAfter(row - 1);

    // Merge cells for Label
    range = globalSheet.getRange(row,3,1,2);
    range.mergeAcross();

    // Set borders
    range = globalSheet.getRange(row,1,1,5);
    range.setBorder(null, true, null, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_THICK);
    range.setBorder(null, null, true, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

    // Add a checkbox
    range = globalSheet.getRange(row,1,1,1);
    range.insertCheckboxes();

    testData = runTests(url);

    values = [Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT),label,null,null];
    backgrounds = ['#ffffff','#ffffff','#ffffff','#ffffff'];
    fontColors = [null,null,null,null];
    
    testData.forEach(function(test,index) {
      var ttfb = test[0];
      var startRender = test[1];
      var fcp = test[2];
      var lcp = test[3];
      var tbt = test[4];
      var cls = test[5];
      var testUrl = test[6];
      var testId = getWptTestId(testUrl);    

      var value = [
        ttfb,
        null,
        startRender,
        null,
        fcp,
        null,
        lcp,
        null,
        tbt,
        null,
        cls,
        null,
        testUrl,
        null
      ];

      var background = [
        formatTtfb(ttfb),
        null,
        formatFcp(startRender),
        null,
        formatFcp(fcp),
        null,
        formatLcp(lcp),
        null,
        formatTbt(tbt),
        null,
        formatCls(cls),
        null,
        null,
        null
      ];

      var fontColor = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        CONFIG.SETTINGS.AUDIT_LINK_COLOR,
        CONFIG.SETTINGS.AUDIT_LINK_COLOR
      ]      
      
      values = values.concat(value);
      backgrounds = backgrounds.concat(background);
      fontColors = fontColors.concat(fontColor);
      testIds.push(testId);

      // Set borders
      // setBorder(top, left, bottom, right, vertical, horizontal, color, style)
      range = globalSheet.getRange(row,columns + 2,1,2);
      range.setBorder(null, true, null, null, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_THICK);
      range.setBorder(null, null, true, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      range.setBorder(null, null, null, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID);

      range = globalSheet.getRange(row,(columns + 4),1,2);
      range.setBorder(null, true, true, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      range.setBorder(null, null, null, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID);

      range = globalSheet.getRange(row,(columns + 6),1,2);
      range.setBorder(null, true, true, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      range.setBorder(null, null, null, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID);

      range = globalSheet.getRange(row,(columns + 8),1,2);
      range.setBorder(null, true, true, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      range.setBorder(null, null, null, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID);

      range = globalSheet.getRange(row,(columns + 10),1,2);
      range.setBorder(null, true, true, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      range.setBorder(null, null, null, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID);

      range = globalSheet.getRange(row,(columns + 12),1,2);
      range.setBorder(null, true, true, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
      range.setBorder(null, null, null, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID);

      range = globalSheet.getRange(row,(columns + 14),1,2);
      range.setBorder(null, null, null, true, null, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_THICK);
      range.setBorder(null, true, true, null, true, null, CONFIG.DEFAULT.COLOR_BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

      columns += 14;
    });

    // Add the data and format it
    range = globalSheet.getRange(row, 2, 1, columns);

    range.setValues([values]);
    range.setBackgrounds([backgrounds]);
    range.setFontColors([fontColors]);

    // Create a row wpt comparison link
    range = globalSheet.getRange(row, 5, 1, 1);
    range.setValue(`=HYPERLINK("${CONFIG.SETTINGS.WPT_COMPARISON_URL}${testIds.join(',')}"; "Compare all")`);
    range.setFontColor(CONFIG.SETTINGS.AUDIT_LINK_COLOR);

    // Set the index of the next row
    setNextRow(row + 1);

    // Set the differences
    updateDiffs();

    // Set the B&A and column comparison links
    updateComparisonWptLinks();   
  }

  function getTestId(cell) {
    var testUrl = cell.getRichTextValue().getLinkUrl(); 
    var testId = getWptTestId(testUrl);
    
    return testId;
  }

  function updateDiffs() {
    const tests = getWptConfig().length;
    var firstRow = CONFIG.SETTINGS.AUDIT_WPT_FIRST_ROW;
    var lastRow = (getNextRow() - 1);    
    var rows = (lastRow - firstRow) + 1;
    var columns = 14;    
    var column = 6;
    var range;
    var values;
    var diff;
    var row;
    var rowBackgrounds;
    var rowFontColors;   
    var benchmark;    
    var backgrounds;
    var fontColors;
    var oldValue;
    var newValue;

    // Make sure we have at lest one Hypothesis test
    if (lastRow == (CONFIG.SETTINGS.AUDIT_WPT_FIRST_ROW)) {
      return false;      
    }

    // Loop through all test types
    for (var i = 0; i < tests; i++) {
      // Get the metrics from the test without the comparison links
      range = globalSheet.getRange(firstRow, (column), rows, (columns - 2));
      values = range.getValues();
      backgrounds = range.getBackgrounds();
      fontColors = range.getFontColors();
      
      // Benchmark test results
      benchmark = values.shift();
      backgrounds.shift();
      fontColors.shift();

      // Loop rows
      for (var j = 0; j < values.length; j++) {
        row = values[j];
        rowBackgrounds = backgrounds[j];
        rowFontColors = fontColors[j];
        
        // Loop columns
        for (var k = 1; k < row.length; k += 2) {
          // CLS should have 2 digits, all the other metrics are integers
          if (k !== 11) {
            oldValue = parseInt(benchmark[k-1]);
            newValue = parseInt(row[k-1]);
            diff = newValue - oldValue;
          } else {
            oldValue = parseFloat(benchmark[k-1]).toFixed(2);
            newValue = parseFloat(row[k-1]).toFixed(2);
            diff = parseFloat(newValue - oldValue).toFixed(2);
          }          

          // Metric got worse
          if (diff > 0) {
            row[k] = diff + " ↑";
            rowBackgrounds[k] = '#' + CONFIG.CWV.COLOR_POOR;
            rowFontColors[k] = '#ffffff';
          
          // Metric has improved
          } else if (diff < 0) {
            row[k] = (diff * (-1)) + " ↓";
            rowBackgrounds[k] = '#' + CONFIG.CWV.COLOR_GOOD;
            rowFontColors[k] = '#ffffff';

          // Metric stayed the same
          } else {
            row[k] = diff + " -";
            rowBackgrounds[k] = '#' + CONFIG.CWV.COLOR_NEUTRAL;
            rowFontColors[k] = '#ffffff';
          }
        };

        values[j] = row;
        backgrounds[j] = rowBackgrounds;
        fontColors[j] = rowFontColors;
      };

      // Write the diffs into the table
      range = globalSheet.getRange((firstRow + 1), (column), (rows - 1), (columns - 2));

      range.setValues(values)
        .setBackgrounds(backgrounds)
        .setFontColors(fontColors)
        .setHorizontalAlignment('right');

      // Go the next test range
      column += columns;
    }
  }  

  function updateComparisonWptLinks() {
    const tests = getWptConfig().length;
    var firstRow = CONFIG.SETTINGS.AUDIT_WPT_FIRST_ROW;
    var lastRow = (getNextRow() - 1);    
    var rows = lastRow - firstRow;
    var columns = 14;
    var column = 6;
    var baComparisonLinks;
    var benchmarkTestId;
    var testIds;    
    var testId;
    var range;

    // Make sure we have at lest one Hypothesis test
    if (lastRow == (CONFIG.SETTINGS.AUDIT_WPT_FIRST_ROW)) {
      // Remove Column Comparison links
      // Loop through all test types
      for (var i = 0; i < tests; i++) { 
        range = globalSheet.getRange((lastRow + 1), (column + 12), 1, 1);
        range.clearContent();
        
        // Go the next test range
        column += columns;
      }

      return false;      
    }

    // Loop through all test types
    for (var i = 0; i < tests; i++) {
      testIds = [];
      baComparisonLinks = [];

      // Get testId for each row
      for (var j = firstRow; j <= (firstRow + rows); j++) {
        range = globalSheet.getRange(j, (column + 12),1,1);
        testId = getTestId(range);
        testIds.push(testId);
      }

      // Update Row Comparison link
      range = globalSheet.getRange((lastRow + 1), (column + 12), 1, 1);
      range.setValue(`=HYPERLINK("${CONFIG.SETTINGS.WPT_COMPARISON_URL}${testIds.join(',')}"; "Compare all")`);
      range.setFontColor(CONFIG.SETTINGS.AUDIT_LINK_COLOR);

      // Update the Before&After comparison links
      benchmarkTestId = testIds.shift();

      testIds.forEach(function(id) {
        baComparisonLinks.push([`=HYPERLINK("${CONFIG.SETTINGS.WPT_COMPARISON_URL}${benchmarkTestId},${id}"; "B&A")`]);
      });

      range = globalSheet.getRange((firstRow + 1), (column + 13), (rows), 1);
      range.setValues(baComparisonLinks);
      range.setFontColor(CONFIG.SETTINGS.AUDIT_LINK_COLOR);

      // Go the next test range
      column += columns;
    }  
  }

  /** START -- Can be deleted when WPT is connected */
  function getRandomTestData() {    
    var testIdNew = '210622_AiDcJX_6dea59eb14c79eb094fce0c0f5df21f9_' + getRandomInt(100);
    var result = [
      getRandomNumber(200, 1000),
      getRandomNumber(1100, 2300),
      getRandomNumber(1100, 2300),
      getRandomNumber(2300, 5000),
      getRandomNumber(20, 500),
      getRandomNumber(0.01, 1.5),      
      `=HYPERLINK("https://www.webpagetest.org/result/${testIdNew}"; "WPT")`,
      'slider > img.lcp'
    ];

    return result;
  }

  function getRandomNumber(min, max) {
    var random = min + Math.random() * (max - min);
    
    return random;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  /** END -- Can be deleted when WPT is connected */

  function runTests(testUrl) {
    const tests = getWptConfig();
    var results = [];

    tests.forEach(function(test) {
      const label = test[0];
      const testId = test[2];
      const result = getRandomTestData(testUrl, testId, label);

      results.push(result);
    });

    return results;
  }

  // Get the test ID from the test URL
  function getWptTestId(url) {
    url = JSON.stringify(url);
    var testId = null;
    var result = url.match(/\/result\/([a-zA-Z0-9_]+)/);

    if (result !== null && result.length == 2) {
      testId = result[1];
    }

    return testId;
  }

  function setNextRow(row) {
    globalSheet.getRange(CONFIG.RANGE.AUDIT_NEXT_ROW).setValue(row);
  }

  function getNextRow() {
    return globalSheet.getRange(CONFIG.RANGE.AUDIT_NEXT_ROW).getValue();    
  }

  function getTestUrl() {  
    return globalSheet.getRange(CONFIG.RANGE.AUDIT_URL).getValue().trim();
  }

  function getLabel() {
    var ui = SpreadsheetApp.getUi();
    var result = ui.prompt('Add Test Label','Please describe in a few words what was changed:',ui.ButtonSet.OK_CANCEL);
    var button = result.getSelectedButton();
    var text = result.getResponseText();

    if (button == ui.Button.OK) {            
      return text;
    } else {
      ui.alert('A label is mandatory. The test got cancelled.');
      return null;
    }
  }

  function callWpt(testUrl, testId, label) {
    const apiKey = PropertiesService.getScriptProperties().getProperty('WPT_API_KEY');
    const url = `https://www.webpagetest.org/runtest.php?k=${apiKey}&f=json`;

    // Make a POST request with a JSON payload.
    var data = {
      'k': apiKey,
      'url': 'Bob Smith',
      'age': 35,
      'pets': ['fido', 'fluffy']
    };

    var options = {
      'method' : 'post',
      'contentType': 'application/json',
      // Convert the JavaScript object to a JSON string.
      'payload': JSON.stringify(data)
    };

    return UrlFetchApp.fetch(url, options);
  }

  function deleteSelectedTests() {
    const firstRow = CONFIG.SETTINGS.AUDIT_WPT_FIRST_ROW;
    const lastRow = getNextRow();    
    const numberOfRows = lastRow - firstRow;
    const column = CONFIG.SETTINGS.AUDIT_WPT_DELETE_CHECKBOX_COLUMN;
    const range = globalSheet.getRange(firstRow,column,numberOfRows);
    const values = range.getValues();
    var deleteRows = [];
    var counter = 0;
    var nextRow = 0;

    // Get selected Rows
    values.forEach(function(value, index) {
      if (value == 'true') {
        deleteRows.push(index + firstRow);       
      }
    });

    // Delete selected Rows
    deleteRows.forEach(function(value) {
      globalSheet.deleteRows(value - counter, 1);        
      counter++;
    });

    // Update Next Row
    nextRow = lastRow - counter;

    setNextRow(nextRow);
    log('Deleted the selected tests', true);

    // Update the B&A & row comparison links
    updateComparisonWptLinks();

    SpreadsheetApp.flush();
  } 

  return Object.freeze({
    objectName: 'wptObject',
    run: run,
    deleteSelectedTests: deleteSelectedTests
  });
}    
