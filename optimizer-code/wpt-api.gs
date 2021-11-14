const WptApiUtil = {};

// Get Webpagetest API Key at https://product.webpagetest.org/api
// Set your WPT API key at File > Project properties > Script properties (You have to use the legacy editor - link in top right corner)
WptApiUtil.API_KEY = getWptApiKey();
WptApiUtil.API_ENDPOINT = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CrUXApiUtil.API_KEY}`;
