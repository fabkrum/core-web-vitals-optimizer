function importerObject(globalType) {
  "use strict";

  setConfiguration();
  
  function createPageDataImporter() {
    var sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.PAGE_DATA_IMPORTER);
  
    if (sheet === null) {
      sheet = createSheetFromTemplate(CONFIG.SHEET.PAGE_DATA_IMPORTER, CONFIG.SHEET.TEMPLATE_PAGE_DATA_IMPORTER, true);
      sheet.activate();
      showAlert('Import your data','1. Copy & Paste your data into the sheet ' + CONFIG.SHEET.PAGE_DATA_IMPORTER + '.\n2. Open the menu and select "Import page data" →  "Import Page Views and Page Types"');
    } else {
      sheet.activate();
      showAlert('ERROR: Page Data Importer sheet already exists','Please import your data into the sheet ' + CONFIG.SHEET.PAGE_DATA_IMPORTER);
    }
  }

  function importPageData() {
    const pagesSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.PAGES);
    const pageGroupsSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.PAGE_GROUPS);
    const importerSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG.SHEET.PAGE_DATA_IMPORTER);
    var pagesData;
    var pageGroupsData;
    var importerData;
    var status = false;
    
    if (importerSheet !== null) {
      importerData = importerSheet.getRange(CONFIG.RANGE.IMPORTER_DATA).getValues();
    } else {
      showAlert('ERROR: Page Data Importer sheet doesn\'t exists','The sheet will be creadted for you when you press the button.');
      createPageDataImporter();
      return false;
    }

    if (pagesSheet !==null) {
      pagesData = pagesSheet.getRange(CONFIG.RANGE.PAGES_DATA).getValues();

      pagesData.forEach(function(page) {
        var url = page[2];
        var pageType;
        var pageViews;
        
        importerData.every(function(item) {
          if (url === item[0]) {
            pageViews = item[1];
            pageType = item[2];            
            status = true;
            return false;              
          } 

          return true;
        });

        page[3] = pageType;
        page[4] = pageViews;

        log('Pages Page: ' + page,true);
      });

      // Update the page
      pagesSheet.getRange(CONFIG.RANGE.PAGES_DATA).setValues(pagesData);

    } else {
      showAlert('WARNING: Pages Sheet doesn\'t exists','It is recommended to create a Pages Sheet first.');
    }

    if (pageGroupsSheet !==null) {
      pageGroupsData = pageGroupsSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).getValues();

      pageGroupsData.forEach(function(page) {
        var url = page[2];
        var pageType;
        var pageViews;
        
        importerData.every(function(item) {
          if (url === item[0]) {
            pageViews = item[1];
            pageType = item[2];            
            status = true;
            return false;              
          } 

          return true;
        });

        page[3] = pageType;
        page[4] = pageViews;
        log('Page Groups Page: ' + page,true);
      });

      // Update the Page Groups Sheet
      pageGroupsSheet.getRange(CONFIG.RANGE.PAGE_GROUPS_DATA).setValues(pageGroupsData);

    } else {
      showAlert('WARNING: Page Groups Sheet doesn\'t exists','It is recommended to create a Page Groups Sheet first.');
    }

    if (status === true) {
      if (showAlertWithButton('Page Data was successfully imported','Do you want to delete the importer sheet?') === true) {
        SpreadsheetApp.getActive().deleteSheet(importerSheet);        
      }
    } else {
      showAlert('ERROR: Page data couldn\'t be imported','Please create the Pages and the Page Groups sheets first.\nMake sure the URLs in the sheet match with URLs in your importer sheet.');
    }
  }

  return Object.freeze({
    objectName: 'importerObject',    
    createPageDataImporter: createPageDataImporter,
    importPageData: importPageData   
  });
}
