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

## What is the Core Web Vitals Optimizer?

The Core Web Vitals Optimizer is a tool based on Google Sheets which supports a proven workflow to achieve good CWV with any website:

* A Google Sheet with added Core Web Vitals functionality (see "Core Web Vital Optimizer" menu) (free)
* CrUX API integration to get Googles latest Core Web Vitals data (free - you have to create a free CrUX Api key)
* Identify pages that need to be improved
* Create audit sheets and follow the checklist to identify improvement opportunities
* New: Planning sheet with an overview of all audit outcomes let you easily plan the optimization tasks
* New: Trends: show charts for daily trends for origins
* New: Automatically update CrUX data daily
* New: Importer for page types and page views from analytics tool
* Webpagetest API integration - optional (you need to buy a [Webpagetest API Key](https://product.webpagetest.org/api)) **(this is not available yet)**
* Blogpost / Video to explain each audit step in detail **(this is not available yet)**

## Who is the Core Web Vitals Optimizer for?

* Web Performance experts
* Experienced Frontend Developers
* Everybody who wants to learn about how to optimize Web Performance

## How to get started

### Make a copy of the Google Sheet
File: [Google Sheet: CoreWebVitals-Optimizer-public-v.1](https://docs.google.com/spreadsheets/d/1eutI69t7xnOd1JNZLtxh3B_eq74FOwRPEpvAIpCHY3Q/edit?usp=sharing)

Menu: File → Make a copy

### Get a CrUX API Key (free)
You have to [create a free CrUX API key](https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey) which is needed to get the current CrUX data for your origns and high-traffic pages.

### Configuration
* Open the Configuration Sheet.
* Add the origin of your page (https://www.example.com) in the Origin column - addiontionally you can add the origins of your competitors to get a benchmark
* Add the sitemap xml(s) of your site. Usually you can copy & paste the sitemap.xml link(s) from your robots.txt file (https://www.example.com/robots.txt).
* If you don't have a sitemap.xml for your site you can add the URLs of your page in the URLs column.
* Find page groups which have Core Web Vitals issues in your [Google Search Console](https://search.google.com/search-console). Copy & paste one example page from each group into the Page Group Representatives (GSC) column.
* Select your Google account type (free/paid). Depending on this setting the script execution time is different (5m vs. 40m). The script will stop shortly before the time is up and and set a trigger to start again automatically.
* If you want to update the CrUX data on a daily basis you can activate the "Automatically upate CrUX Data daily" function.
* Copy & Paste the CrUX Api key into the cell F11. To hide the key the color of the text and background turns green.
* Webpagetest - this is still work in progress (don't buy a WPT API key yet) - feel free to add dummy data for the key and the test templates IDs to see a mockup in the audit sheets.

If you run the first function you get asked to grant access to the CrUX API.
This is needed to move on. Once you have granted the access you have to start the function again in the menu.

It is recommended to follow the order in the "Core Web Vitals Optimizer" menu

### 1. Origins
#### Create/Update CrUX Origins
Menu: Core Web Vitals Organizer → Origins → Create/Update CrUX Origins

The tool creates a Origin sheet and shows the Core Web Vital metrics based on the latest CrUX data.
If you run it again the page will be deleted and recreated.

#### Toggle detail

Menu: Core Web Vitals Organizer → Origins → Toggle detail

Changes the level of details shown on the sheet. This might be handy for making screenshots.

### 2. Page Groups

#### Create Page Groups
Menu: Core Web Vitals Organizer → Page Groups → Create Page Groups

As the page group example URLs are not in CrUX data set you have to set the data manually.

#### Toggle detail

Menu: Core Web Vitals Organizer → Page Groups → Toggle detail

Changes the level of details shown on the sheet. This might be handy for making screenshots.

### 3. Pages

#### Create CrUX Pages (or continue after timeout)
Menu: Core Web Vitals Organizer → Pages → Create CrUX Pages (or continue after timeout)

* A Pages sheet gets created
* All the URLs from the sitemaps and the URL columns get cached
* It makes a CrUX API call for all URLs and adds the found data to the table
* Depending how many pages your website has this can take very long (the CrUX API is free, but has a limit of 150 requests/minute). If the script time is exceeded the script stops and continues automatically where it stopped until all pages are tested. You know if the script is done when you see a white headline that says "High-traffic pages".

#### Update CrUX Pages table
Menu: Core Web Vitals Organizer → Pages → Update CrUX Data in Pages table

This functionality goes through all the URLs in the table and gets the newest CrUX data.
This is much faster then checking the complete sitemap.xml.
If you have the auto function activated you get the newest data automatically.
If the excecution time excecutes before all pages are updated the scripts automatically starts over and contuines the work until it is done.

#### Toggle detail
Menu: Core Web Vitals Organizer → Pages → Toggle detail

Changes the level of details shown on the sheet. This might be handy for making screenshots.

#### Delete cached URLs
Menu: Core Web Vitals Organizer → Pages → Delete cached URLs

When you create the pages sheet all URLs from the sitemap.xml(s) get chached in a hidden sheet.
If your website has a lot of new pages you can delete the cache and start fresh.

### 5. Import page data

#### Create Importer sheet
Menu: Core Web Vitals Organizer → Pages → Create page data importer sheet

This creates a sheet with three columns: URL, page views and page types.
If you can export this data from your analytics tool you can copy&paste it here.

#### Import data
Menu: Core Web Vitals Organizer → Pages → Import pages views and page types

This will copy the page views and pages types to your pages sheet and page groups sheet for matching URLs.


### 5. Audits

#### Recommend Audits
Menu: Core Web Vitals Organizer → Audits → Recommend Audits

Before you use the recommendation function you should add the page groups and pages sheet and set the page types and page views.
The recommendation engine sorts the entries by Core Web Vitals metrics (poor, needs improvement, poor), page types, page views.
It recommends the worst pages for each page type with the most page views. 

#### Create audits for marked pages
Menu: Core Web Vitals Organizer → Audits → Create audits for marked pages

It creates an audit sheet for each URL which has a activated check box in the audit column (pages & page groups).
For each URL only one audit sheet will be created.

#### Hide completed audit sheets
Menu: Core Web Vitals Organizer → Audits → Hide completed audit sheets

Hide all audit sheets with the status "Done".

#### Show completed audit sheets
Menu: Core Web Vitals Organizer → Audits → Show completed audit sheets

If you set the status in an Audit sheet to "done" the audit sheet gets automatically hidden. If you want to check completed audit sheets again, you can make them visible all at once (you can also use the Google Sheet functionality to show/hide single audit sheets)

### 6. Planning

#### Show planning sheet
Menu: Core Web Vitals Organizer → Planning → Show planning sheet

The planning sheet gives you a nice overview of all the audit outcomes:
* See all issues that were found in all audits on a glance
* See how many pages types are impacted by the issue
* See which page types are impacted by which problem
* See the maximum impact of the issues
* Estimate the effort to fix the issues
* Prioritize the task
* Link to a ticket to track the progress

### 7. Trends

#### Create Trend Sheets
Menu: Core Web Vitals Organizer → Trends → Create trend sheets for marked origins

This gives you a nice overview how the Core Web Vitals change over time.
You get two different chart types for each Core Web Vital metric.
It is recommended to activate the daily CrUX updates.


### Webpagetest.org integration (paid WPT API key needed) – work in progress

I am currently working together with the Webpagetest team to find the best way we can integrate the Webpagetest.org API into the tool.

The idea is to run multiple webpagetests simultanously (mobile, desktop, with & without Cookielayer)
and show the results of the median test in a table. This gives you a quick overview if things are getting better or not.

If you add random data for the Webpagetest API Key and the test
keys you can see a mockup which works based on random generated data.


### Customizations

If you open the config.gs (Extendions → Script Editor → config.gs) you can easily change the following settings:

#### Change Timezone ([Timezone Format](https://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html))
* CONFIG.DEFAULT.TIMEZONE = 'GMT+2';
* CONFIG.DEFAULT.DATEFORMAT = 'yyyy-MM-dd';
* CONFIG.DEFAULT.TIMEFORMAT = 'HH:mm:ss';

#### Change Workflows
Planning sheet (name, background color, font color):
* CONFIG.DEFAULT.VALIDATION_PRIO = [['Low','#d9ead3','#000000'], ['Medium','#b6d7a8','#000000'], ['High','#93c47d','#000000'], ['Highest','#6aa850','#000000']];
* CONFIG.DEFAULT.VALIDATION_EFFORT = [['S','#fff2ce','#000000'], ['M','#ffe599','#000000'], ['L','#ffd966','#000000'], ['XL','#f9c232','#000000']];
* CONFIG.DEFAULT.VALIDATION_STATUS = [['Open',null,null], ['In progress','#fbbc04','#000000'], ['Fixed','#34a853','#ffffff'], ['Won\'t fix','#ea4336','#ffffff']];

Audit (name, background color, font color):
* CONFIG.DEFAULT.VALIDATION_AUDIT_STATUS = [['Not started','#ea4336','#ffffff'], ['In progress','#fbbc04','#000000'], ['Done','#34a853','#ffffff']];

#### Change Checklist
* CONFIG.CHECKLIST - be careful to keep the arry structure in tact - Section / Sub Section / Checklist Item


