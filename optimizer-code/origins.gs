function originsObject() {
  "use strict";
  const ss = SpreadsheetApp.getActive();
  var globalSheet = null;
  var globalExistingEntries = [];

  function run() {
    setConfiguration();

    globalSheet = resetSheet(CONFIG.SHEET.ORIGINS, CONFIG.SHEET.TEMPLATE_ORIGINS, true);

    // Open the Sheet
    ss.setActiveSheet(globalSheet);

    CONFIG.SETTINGS.FORM_FACTORS.forEach(function(formFactor) {
      CONFIG.SETTINGS.ORIGINS.forEach(function(origin) {
        if (!isDuplicate(origin, formFactor)) {
          getCrUXData('origin', origin, formFactor);
          log('Page Group added: ' + origin + ' / Form factor: ' + formFactor,true);
        } else {
          log('Duplicate entry: ' + origin + ' / Form factor: ' + formFactor,true);
        }
      });
    });
  };

  function isDuplicate(url, formFactor) {
    for(var i = 0; i < globalExistingEntries.length; i++) {
      var itemUrl = globalExistingEntries[i][2];
      var itemFormFactor = globalExistingEntries[i][3];

      if (url === itemUrl && formFactor === itemFormFactor) {
        return true;
      }
    }

    return false;
  }

  function addRow(...args) {      
    var firstRow = ss.getRangeByName(CONFIG.RANGE_BY_NAME.ORIGINS_FIRST_ROW);
    var lastRow = globalSheet.getLastRow() + 1;
    var lastColumn = globalSheet.getLastColumn();
    var row = [      
      Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.DATEFORMAT),
      Utilities.formatDate(new Date(), CONFIG.SETTINGS.TIMEZONE, CONFIG.SETTINGS.TIMEFORMAT),
      ...args
    ];
  
    globalSheet.appendRow(row);
    globalExistingEntries.push(row);
    
    // Apply the format from first row
    firstRow.copyFormatToRange(globalSheet, 1, lastColumn, lastRow, lastRow);
    updateFormating(lastRow);

    log('New row created: ' + row, true);
  };

  function updateFormating(row) {
    updateColumnFormat(globalSheet, 'H', 'L', 'P', 'T', 'E1', 'I1', 'M1', 'Q1');
    updateRowFormat(globalSheet, 'H', 'L', 'P', 'T', 'A', 'D', row);
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
    
    addRow(value, formFactor,
          fcp.good, fcp.ni, fcp.poor, fcp.p75,
          lcp.good, lcp.ni, lcp.poor, lcp.p75,
          fid.good, fid.ni, fid.poor, fid.p75,
          cls.good, cls.ni, cls.poor, parseFloat(cls.p75));
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

  return Object.freeze({
    objectName: 'originObject',
    run: run
  });
}
