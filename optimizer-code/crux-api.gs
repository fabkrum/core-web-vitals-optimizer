// Using the Chrome UX Report API
// https://web.dev/chrome-ux-report-api/

// Get your CrUX API key at https://goo.gle/crux-api-key.
// Set your CrUX API key at File > Project properties > Script properties (You have to use the legacy editor - link in top right corner)

const CrUXApiUtil = {};

//CrUXApiUtil.API_KEY = PropertiesService.getScriptProperties().getProperty('CRUX_API_KEY');
CrUXApiUtil.API_KEY = getCruxApiKey();

CrUXApiUtil.API_ENDPOINT = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CrUXApiUtil.API_KEY}`;
CrUXApiUtil.query = function (requestBody) {
  if (!CrUXApiUtil.API_KEY) {
    showAlert('Please add a valid CrUX API key on the Configuration Sheet.','CrUX API Key is missing');
    throw 'Script property `CRUX_API_KEY` not set. Get a key at https://goo.gle/crux-api-key.';
  }

  let response; 
  
  try {
    response = UrlFetchApp.fetch(CrUXApiUtil.API_ENDPOINT, {
      method: 'POST',
      payload: requestBody
    })
    response = JSON.parse(response.getContentText());
    if (response.error) {
      throw `Error: ${response.error.message} ${JSON.stringify(requestBody, null, 2)}`;
    }
  } catch (NOT_FOUND) {
      console.error('Url not found:', requestBody.url || requestBody.origin);
  }
  return response;
};
