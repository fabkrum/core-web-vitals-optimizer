# Core Web Vitals Optimizer (BETA)

## What are the Core Web Vitals?

Google's [Core Web Vitals](https://web.dev/vitals/) are a set of metrics to measure the user experience of web sites:
* Loading: [Largest Contentful Paint (LCP)](https://web.dev/lcp/)
* Interactivity: [First Input Delay (FID)](https://web.dev/fid/)
* Visual stability: [Cumulative Layout Shift (CLS)](https://web.dev/cls/)

[Learn more about the Core Web Vitals](https://www.cwv-optimizer.com/resources)


## What are the benefits of having good Core Web Vitals?

* A fast loading website with a good user experience has a positive impact on user engagement and conversions: [WPO stasts](https://wpostats.com/tags/core%20web%20vitals/)
* The Core Web Vitals are a search ranking factor in the Google mobile search since June 2021: [Official Google Announcement](https://developers.google.com/search/blog/2020/11/timing-for-page-experience?hl=en)

## How does the Core Web Vitals Optimizer work?

The Core Web Vitals Optimizer combines free and paid tools and a proven workflow:

* A Google Sheet which can connect to the CrUX API
* A workflow which lets you set the right priorities
* Audit checklist with rich explanations (n/a - work in progress)
* Verify your hypotheses quickly with Cloudflare Workers
* Monitor everything with Webpagetest (optional / [Get a Webpagetest API Key](https://product.webpagetest.org/api))


## Who is the Core Web Vitals Optimizer for?

* Web Performance experts
* Experienced Frontend Developers
* Everybody who wants to learn about how to optimize Web Performance

## How to get started

### Make a copy of the Google Sheet
Menu: File → Make a copy

### Get a CrUX API Key (free)
You have to [create a free CrUX API key](https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey) which is needed to get the current CrUX data for your origns and high-traffic pages.

### Configuration
* Open the Configuration Sheet.
* Add the origin of your page (https://www.example.com) in the Origin column - addiontionally you can add the origins of your competitors to get a benchmark
* Add the sitemap xml(s) of your site. Usually you can copy & paste the sitemap.xml link(s) from your robots.txt file (https://www.example.com/robots.txt).
* If you don't have a sitemap.xml for your site you can add the URLs of your page in the URLs column.
* Find page groups which have Core Web Vitals issues in your [Google Search Console](https://search.google.com/search-console). Copy & paste one example page from each group into the Page Group Representatives (GSC) column.
* Copy & Paste the CrUX Api key into the cell F4. To hide the key the color of the text and background turns green when a value was provided (there is no validaton of the key).
* Webpagetest - this is still work in progress (don't buy a WPT API key yet) - feel free to add dummy data for the key and the test templates IDs to see a mockup in the audit pages.

If you run the first function you get asked to grant access to the CrUX API.
This is needed to move on. Once you have granted the access you have to start the function again in the menu.

### Origins
Menu: Core Web Vitals Organizer → Origins → Create/Update CrUX Origins
The tool creates a Origin sheet and shows shows the Core Web Vital metrics based on the latest CrUX data.

Menu: Core Web Vitals Organizer → Origins → Toggle detail
Changes the level of details shown on the sheet. This might be handy for making screenshots.

### Page Groups
Menu: Core Web Vitals Organizer → Page Groups → Create Page Groups
As the page group example URLs are not in CrUX data set you have to set the data manually.

### Pages
Menu: Core Web Vitals Organizer → Pages → Create CrUX Pages
The tool creates a Origin sheet and shows shows the Core Web Vital metrics based on the latest CrUX data.

Menu: Core Web Vitals Organizer → Pages → Continue after execution timeout
Depending on the size of your website it is possible that you reach the script execution time (5m free Google Apps / 30m paid Google Apps). If this is the case you see an error message. To continue where you stopped last time you can use this functionality. 

Menu: Core Web Vitals Organizer → Pages → Update CrUX Pages table
The CrUX data gets updated on a daily base. This functin updates the data for all the URLs in the pages table.

Menu: Core Web Vitals Organizer → Pages → Toggle detail
Changes the level of details shown on the sheet. This might be handy for making screenshots.


### Audits

Menu: Core Web Vitals Organizer → Audits → Recommend Audits
Before you run this function you must fill out the page type for all pages with the device "ALL_FORM_FACTORS" (the script will copy the page type for the mobile and desktop devices for you). The script checks the audit checkboxes for one page with poor or needs improvement Core Web Vitals per page type. You can manually check and uncheck other pages you want to audit.

Menu: Core Web Vitals Organizer → Audits → Create audits for marked pages
It creates an audit sheet for each URL which has a activated check box in the audit column (pages & page groups).
For each URL only one audit sheet will be created.

Menu: Core Web Vitals Organizer → Audits → Hide completed audit sheets
Hide all audit sheets with the status "Done".

Menu: Core Web Vitals Organizer → Audits → Show completed audit sheets
If you set the status in an Audit sheet to "done" the audit sheet gets automatically hidden. If you want to check completed audit sheets again, you can make them visible all at once (you can also use the Google Sheet functionality to show/hide single audit sheets)


### Webpagetest.org integration (paid WPT API key needed) – work in progress

I am currently working together with the Webpagetest team on integrating
the Webpagetest.org API.

The idea is to run multiple webpagetests simultanously (mobile, desktop, with & without Cookielayer)
and show the results the data of the median test in a table.

If you add random data for the Webpagetest API Key and the test
keys you can see a mockup which works based on random generated data.



