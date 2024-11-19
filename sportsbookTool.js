(function () {

    var url, iframeURL;
    var isSportsbookInIframeWithoutObgTools = false;
    class URLParam {
        constructor(key, value) {
            this.key = key;
            this.value = value;
        }
    }
    const EXPOSE_OBGRT = new URLParam("exposeObgRt", "1");
    const EXPOSE_OBGSTATE = new URLParam("exposeObgState", "1");
    const TURN_SEALSTORE_OFF = new URLParam("sealStore", "0");

    const IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED = isDefined("obgClientEnvironmentConfig");
    const IS_NODECONTEXT_EXPOSED = isDefined("nodeContext");
    const IS_OBGSTARTUP_EXPOSED = isDefined("obgStartup");
    const IS_OBGSTATE_EXPOSED = isDefined("obgState.sportsbook");
    const IS_XSBSTATE_EXPOSED = isDefined("xSbState");
    const IS_OBGSTATE_OR_XSBSTATE_EXPOSED = IS_OBGSTATE_EXPOSED || IS_XSBSTATE_EXPOSED;
    const IS_OBGRT_EXPOSED = isDefined("obgRt");
    const IS_OBGNAVIGATIONSUPPORTED_EXPOSED = isDefined("obgNavigationSupported");
    const IS_SPORTSBOOK_IN_IFRAME = getIsSportsbookInIframe();
    const IS_B2B_IFRAME_ONLY = getIsB2BIframeOnly();
    const IS_B2B_WITH_HOST_PAGE = IS_SPORTSBOOK_IN_IFRAME && !IS_B2B_IFRAME_ONLY;
    const IS_MFE = getIsMFE();

    function getState() {
        return IS_XSBSTATE_EXPOSED ? window["xSbState"] : window["obgState"];
    }

    function getIsMFE() {
        return document.getElementsByTagName("obg-sportsbook-mfe-container").length > 0;
    }

    if (!getIsItSportsbookPage()) {
        alert("You are not on a Sportsbook page.\nIf you think you are, please contact: gergely.glosz@betssongroup.com");
        return;
    }

    if (isSportsbookInIframeWithoutObgTools) {
        if (confirm("Sportsbook is in iframe so Sportsbook Tool does not work from here.\nDo you want to open the iframe itself?")) {
            url = new URL(iframeURL);
            reloadPageWithSearchParams([EXPOSE_OBGSTATE, EXPOSE_OBGRT]);
            return;
        } else {
            return;
        }
    }

    if (!getIsAnyEssentialObjectExposed()) {
        alert("Make obgState exposed in order to use this tool");
        return;
    }


    // ************** REMOTE ****************
    removeExistingSportsbookTool();
    const sportsbookTool = document.createElement("div");
    sportsbookTool.id = "sportsbookTool";
    createWindow();
    // // ************* /REMOTE ****************

    // ************** LOCAL ****************
    // const sportsbookTool = getElementById("sportsbookTool");
    // ************* /LOCAL ****************

    const accCollection = getElementsByClassName("accordion");
    const accHeadCollection = getElementsByClassName("accHeading");
    var versionNumber;
    var eventId, lockedEventId;
    var participants, selectedParticipantId;
    var participants = [];
    var previousEventId, previousMarketId, previousSelectionId, previousPriceBoosts, previousFreeBets, previousProfitBoosts;
    var eventLabel; //,savedEventLabel;
    // var mockedEventPhase;
    var marketId, lockedMarketId, marketLabel, marketTemplateId, marketVersion;
    var marketTemplateTagsToDisplay;
    var categoryId, competitionId;
    var selectionId, lockedSelectionId, selectionLabel;
    var selectionIdArray = [];
    var detectionResultText;
    var initialOdds, lockedInitialOdds;
    var accaInsName, accaInsId, priceBoostId, freeBetId, profitBoostId, accaBoostId;
    var segmentGuid, previousSegmentGuid, segmentName, segmentLegacyId;
    var intervalIdForPolling;
    var intervalIdsForPolling = [];
    var previousIframeURL;
    var brands;
    var routes;
    // var betBuilderEvents, previousBetBuilderEvents = [];
    var labelRow;
    var threeColumnLayouts;
    var carouselOrCardsDefined;
    var isPageValidForCarousel, previousIsPageValidForCarousel;
    var lastDateTimeSet;
    var eventIdArray = [];
    var orderedCategories, orderedRegions, orderedCompetitions;

    // const IS_UNSECURE_HTTP = isUnsecureHTTP();
    const SB_TOOL_VERSION = "v1.6.53";
    const DEVICE_TYPE = getDeviceType();
    const DEVICE_EXPERIENCE = getDeviceExperience();
    const SB_ENVIRONMENT = getSbEnvironment();
    const ENVIRONMENT_TO_DISPLAY = getEnvironmentToDisplay();
    // const IS_B2B_WITH_HOST_PAGE = IS_SPORTSBOOK_IN_IFRAME && !IS_B2B_IFRAME_ONLY;
    const B2X = getB2X();
    const BRAND_NAME = getBrandName();
    const BRAND_FRIENDLY_NAME = getBrandFriendlyName(BRAND_NAME);
    const CULTURE = getCulture();
    const LANGUAGECODE = getLanguageCode();
    const BRAND_NAME_WITH_LANGUAGECODE = BRAND_FRIENDLY_NAME + " (" + LANGUAGECODE.toUpperCase() + ")";
    const BROWSER_VERSION = getBrowserVersion();
    const SB_VERSION = getSbVersion();
    const NOT_FOUND = "Not found.";
    // const IS_LOCALHOST_WITH_PROD = !(IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED && IS_OBGSTATE_EXPOSED);
    const POLLING_INTERVAL = 100;
    // const IS_SGP_USED = getIsSGPUsed();
    const IS_BLE = getIsBLE();

    // cleanupSearchParams("configOverride");
    // example: configOverride=[(matSportsbookUi.eventContainer.enableEventSelectorDropdown,false,boolean)]
    // https://www.test.betsson.com/sv/odds?configOverride=[(sportsbookUi.sportsbookCarousel.autoplayInterval,1000000,number)]
    initHeader();
    initAccordions();
    initBrands();
    initContext();
    initTouchDependent();
    checkEnabledFeatures();

    function createWindow() {
        document.body.appendChild(sportsbookTool);
        var htmlContent =
            '<div id="sportsbookToolHeader"><div id="sportsbookToolHeaderTitle"><div id="sportsbookToolNameRow"><span id="sportsbookToolName"><span id="sportsbookToolNameLeft">sportsbook</span><span id="sportsbookToolNameRight">tool</span></span><span id="sportsbookToolVersion"></span></div><div id="sportsbookToolAuthorName">by gergely.glosz@betssongroup.com</div></div><div id="sportsbookToolHeaderButtonRow" class="floatRight"><button id="btZoomInOut" class="sportsbookToolHeaderButtons" onclick="zoomInOut()"><img id="iconZoomInOut" class="iconZoomOut iconHeader"></button><button id="btMinimizeClosed" class="sportsbookToolHeaderButtons" onclick="toggleClosedAccordionsVisibility()"><img id="iconMinimizeClosed" class="iconMinimize iconHeader"></button><button id="btClose" class="sportsbookToolHeaderButtons" onclick="closePopup()"><img class="iconClose iconHeader"></button></div></div><div id="sportsbookToolContent"><div id="sbToolsContext" class="accordion open"><button id="contextAccordion" class="accHeading" onclick="initContext()">Context<span id="limitedFunctionsMessage"></span></button><div class="accContent"><div id="obgStateAndRtSection" class="hide"><div id="obgStateAndRtRow" class="resolveLimitationRow">Expose obg/xSbState and obgRt<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("exposeObgStateAndRt")\'><span>Expose</span></button></div><hr class="hRule"></div><div id="disableSealStoreSection" class="hide"><div id="disableSealStoreRow" class="resolveLimitationRow">Disable sealStore<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("disableSealStore")\'><span>Disable</span></button></div><hr class="hRule"></div><div id="openIframeSection" class="hide"><div id="openIframeRow" class="resolveLimitationRow">Open Sportsbook iframe<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("openIframe")\'>SB iframe</button></div><div id="notMatchingIframeSection" class="hide"><div id="iframeNotMatchingWarningMessage">Mismatch between host page and SB iframe environments, meaning you are testing<span id="notMatchingIframeEnvSpan"></span>Sportsbook</div><div id="openMatchingIframeRow" class="marginBottom2px resolveLimitationRow">Open just the matching SB iframe<button id="btOpenMatchingIframe" class="btSimple btGreen" onclick=\'reloadPageWithFeature("openMatchingIframe")\'></button></div><div id="replaceIframeSrcRow" class="resolveLimitationRow"><div>Keep host page and fix SB iframe with matching one</div><button id="btOpenFullPageWithMatchingIframe" class="btSimple btOrange" onclick=\'reloadPageWithFeature("hostPageWithMatchingIframe")\'></button></div></div><div class="itemsJustified marginTop10px"><div id="iframeUrlValue" class="displayInGreen sportsbookLink width100percent"></div><button class="btCopy btIcon" id="btIframeUrl" onclick=\'copyToClipboard("iframeURL")\'><img class="iconCopy"></button></div><hr class="hRule"></div><div id="contextSection"><div class="displayFlex"><div class="keyForContext">SB Environment:</div><div class="valueForContext" id="environment"></div></div><div class="displayFlex"><div class="keyForContext">Device / Login:</div><div class="valueForContext"><span id="deviceType"></span><span id="loginState"></span></div></div><div class="displayFlex"><div class="keyForContext">Brand (Market):</div><div class="valueForContext itemsJustified"><div id="brandName"></div><button class="btCopy btIcon" onclick=\'copyToClipboard("brand")\'><img class="iconCopy"></button></div></div><div class="displayFlex"><div class="keyForContext">Browser:</div><div class="valueForContext itemsJustified"><div id="browserVersion"></div><button class="btCopy btIcon" onclick=\'copyToClipboard("browserVersion")\'><img class="iconCopy"></button></div></div><div class="displayFlex"><div class="keyForContext">SB Version:</div><div class="valueForContext itemsJustified"><div><span id="obgVersion"></span><span id="B2BorB2C" class="displayInLightGrey"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("obgVersion")\'><img class="iconCopy"></button></div></div><button onclick=\'toggleSection("contextUtilities")\' class="moreLess">Extras</button><div id="contextUtilities" class="marginTop10px hide"><div class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Jira QA Table</span><span class="displayInLightGrey">from the above data</span></div><button class="btCopy btIcon" id="btCreateJiraTable" onclick=\'copyToClipboard("jiraTemplate")\'><img class="iconCopy"></button></div><div class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Deep Link</span><span class="displayInLightGrey">of the actual page & slip</span></div><button class="btCopy btIcon" id="btCreateDeepLink" onclick=\'copyToClipboard("deepLink")\'><img class="iconCopy"></button></div><div id="postMessageRow" class="itemsJustified hide"><div class="width95Percent"><span class="keyColumnForExtras">PostMessage</span><span class="displayInLightGrey">routeChangeIn in native</span></div><button class="btCopy btIcon" id="btCreatePostMessage" onclick=\'copyToClipboard("postMessage")\'><img class="iconCopy"></button></div><div id="disableCacheRow" class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off Cache</span><span class="displayInLightGrey">with page reload</span></div><button class="btReload btIcon" onclick=\'reloadPageWithFeature("disableCache")\'><img class="iconReload"></button></div><div id="disableSSRRow" class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off SSR</span><span class="displayInLightGrey">with page reload</span></div><button class="btReload btIcon" onclick=\'reloadPageWithFeature("disableSSR")\'><img class="iconReload"></button></div><div id="disableGeoFencingRow" class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off GeoFencing</span><span class="displayInLightGrey">for Betsson ArBa login</span></div><button class="btReload btIcon" onclick=\'reloadPageWithFeature("disableGeoFencing")\'><img class="iconReload"></button></div><div class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Landing from A-Z</span><span class="displayInLightGrey">on which page</span></div><button class="btCopy btIcon" onclick="landingFromLHSM()"><img class="iconInfoCircle"></button></div><div id="landingFromLhsmContent" class="hide"><hr class="hRule"><div id="landingFromLhsmError" class="displayInRed hide">Expose obgSate/xSbSate first</div><div id="landingFromLhsmNoError" class="fontSizeSmaller hide"><div class="fontBold lineHeight13px marginTopBottom10px">You should land on these pages upon clicking on the category links from LHSM > A-Z:</div><div><div class="marginTop5px"><div class="marginLeft5px"><span class="marginRight5px">Category Page</span><span class="displayInLightGrey">(having 2+ regions and/or All Leagues* tab)</span></div><div id="landingOnCategoryPageList" class="landingOnPageList"></div></div><div class="marginTop5px"><div class="marginLeft5px"><span class="marginRight5px">Region Page</span><span class="displayInLightGrey">(having 1 region, which has 2+ competitions)</span></div><div id="landingOnRegionPageList" class="landingOnPageList"></div></div><div class="marginTop5px"><div class="marginLeft5px"><span class="marginRight5px">Competition Page</span><span class="displayInLightGrey">(having 1 region, which has 1 competition)</span></div><div id="landingOnCompetitionPageList" class="landingOnPageList"></div></div></div></div></div></div></div></div></div><div id="sbToolsSegments" class="accordion closed"><button id="segmentsAccordion" class="accHeading" onclick="initSegments()"><span class="accordionTitle">Segment</span><span class="accordionHint">Get/Set SegmentGuid</span></button><div class="accContent"><div class="marginBottom10px"><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="width17percent">Name:</span><span id="segmentNameSpan" class="width100percent displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentName")\'><img class="iconCopy"></button></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="width17percent">Guid:</span><span id="segmentGuidSpan" class="width100percent displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentGuid")\'><img class="iconCopy"></button></div><hr class="hRule"><div><div class="width95Percent displayFlex"><span class="marginRight5px">Segment ID (used in ISA/Redis):</span><span id="segmentLegacyIdSpan" class="displayInGreen"></span></div></div></div><button onclick=\'toggleSection("segmentChangers")\' class="moreLess">Set Segment</button><div id="segmentChangers" class="hide"><div class="segmentChangeSectionHint">Partially useful features, no data refresh triggered on change</div><div>New Segment</div><select id="segmentSelector" onchange="setSegmentGuid(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div>Enter Segment Guid manually</div><div class="itemsJustified"><input id="fdSegmentGuid" class="fdSbTools width100percent height20px"><button class="btSimple btSubmit" onclick="changeSegmentGuid()">Set</button></div><div class="checkBoxRowToRight marginTop5px"><span>Segment data known to this tool</span><button class="btOpenInNewWindow btIcon chkInline" onclick=\'openInNewWindow("brandsJson")\'><img class="iconOpenInNewWindow"></button></div></div></div></div><div id="sbToolsEvent" class="accordion closed"><button id="eventAccordion" class="accHeading" onclick="initSbToolsEvent()"><span class="accordionTitle">Event</span><span class="accordionHint">Set Phase & Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsEvent">Detected event:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsEventInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="eventLabelForSbToolsEvent"></div><div id="lockEventSectionForSbToolsEvent" class="lockSection hide">Lock <input type="checkbox" id="chkLockEventForSbToolsEvent" class="chkLock chkSbTools" onclick="lockEvent()"></div></div><div id="eventFeaturesSection" class="hide"><button onclick=\'toggleSection("eventDetailsSection")\' class="moreLess">Event Details</button><div id="eventDetailsSection" class="marginTopBottom10px hide"><div class="displayFlex"><span class="keyForEventDetails">Event ID:</span><span class="valueForEventDetails itemsJustified"><span id="eventIdForEventDetails" class="displayInGreen"></span><span><button class="btCopy btIcon" id="btCopyEventId" onclick=\'copyToClipboard("eventId")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Start Date:</span><span id="startDateForEventDetails" class="valueForEventDetails displayInGreen"></span></div><div class="displayFlex"><span class="keyForEventDetails">Category:</span><span class="valueForEventDetails itemsJustified displayInGreen"><span id="categoryForEventDetails"></span><span id="categoryIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Region:</span><span class="valueForEventDetails itemsJustified displayInGreen"><span id="regionForEventDetails"></span><span id="regionIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Competition:</span><span class="valueForEventDetails itemsJustified displayInGreen"><span id="competitionForEventDetails"></span><span id="competitionIdForEventDetails"></span></span></div><hr class="hRule"><details><summary class="sbtSummary">Providers</summary><div class="detailsExpanded"><div id="providersMessage" class="alignItemsCenter displayInLightGrey marginBottom10px"><span class="iconInfoCircle opacity20 marginRight5px"></span><span>Live stream data not fetched → open a Statistics tab</span></div><div id="providersSection"><div><span class="keyForEventPageProviders">Streaming:</span><span id="streamingProvider" class="displayInGreen">-</span></div><div><span class="keyForEventPageProviders">Visual:</span><span id="visualProvider" class="displayInGreen">-</span></div><div><span class="keyForEventPageProviders">Prem. Statistics:</span><span id="statisticsProvider" class="displayInGreen">-</span></div><div><span class="keyForEventPageProviders">Live Statistics:</span><span id="liveStatisticsProvider" class="displayInGreen">-</span></div></div></div></details><hr class="hRule"><details><summary class="sbtSummary">External Tools</summary><div class="detailsExpanded"><div id="sbEventIdForOddsManagerSection" class="itemsJustified"><span class="width95Percent itemsJustified paddingRight8px"><span>Legacy Event ID</span><span class="displayInLightGrey">for ISA/Redis/SB Admin Client</span></span><button class="btIcon btOpenInNewWindow" onclick="getLegacyEventId()"><img class="iconOpenInNewWindow"></button></div><div id="sbEventIdForOddsManagerSection" class="itemsJustified"><span class="width95Percent itemsJustified paddingRight8px"><span>Whole ISA response</span><span class="displayInLightGrey">el[0].sr.pbbpoe = popularity</span></span><button class="btIcon btOpenInNewWindow" onclick="getWholeIsaResponse()"><img class="iconOpenInNewWindow"></button></div><div class="itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("event")\'><img class="iconOpenInNewWindow"></button></div></div></details></div><div><button onclick=\'toggleSection("renameEventSection")\' class="moreLess">Participants & Label</button><div id="renameEventSection" class="marginTopBottom10px hide"><div id="renameParticipantLabelSection"><div>Participant ID:<span id="selectedParticipantIdSpan" class="displayInGreen marginLeft5px"></span><button class="btCopy btIcon" onclick=\'copyToClipboard("participantId")\'><img class="iconCopy"></button><span class="accordionHint">displayed for normal Matches</span></div><select id="participantSelector" onchange="selectParticipant(value)" class="comboSbTools width100percent height20px"></select><div id="renameParticipantLabelRow" class="itemsJustified marginTop5px"><span contenteditable="true" id="fdRenameParticipantLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setParticipantLabel()"><img class="width16px iconSubmit"></button></div></div><div class="marginTop10px">Label:<span class="accordionHint">displayed for Outrights, Boosts Page</span></div><div class="itemsJustified"><span contenteditable="true" id="fdRenameEventLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setEventLabel()"><img class="width16px iconSubmit"></button></div></div></div><div><button onclick=\'toggleSection("setEventPhaseSection")\' class="moreLess">Set Event Phase / Scoreboards</button><div id="setEventPhaseSection" class="marginTopBottom10px hide"><div id="setEventPhaseButtonsLayout"><button id="btSetEventPhaseLive" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Live")\'><span class="iconLiveBetting iconOnBtSimple iconSvgSmall"></span><span id="setEventPhaseLiveBtLabel" class="labelOnBtSimple">Live</span></button><button id="btSetEventPhasePrematch" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Prematch")\'><span class="iconStartingSoon iconOnBtSimple iconSvgSmall"></span><span class="labelOnBtSimple">Prematch</span></button><button id="btSetEventPhaseOver" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Over")\'><span class="iconEventEnded iconOnBtSimple iconSvgSmall"></span><span class="labelOnBtSimple">Over</span></button></div><div class="checkBoxRowToLeft"><input type="checkbox" class="chkInlineRight chkSbTools" id="chkSuspendAllMarkets"><span>\'Over\' suspends all markets</span></div><div id="liveAddsScoreBoardSection" class="checkBoxRowToLeft"><input type="checkbox" checked="checked" class="chkInlineRight chkSbTools" id="chkLiveAddsScoreBoard" onclick="toggleScoreBoardExtras()"><span id="scoreBoardSupportedMessage"></span></div><div id="scoreBoardExtrasSection"><hr class="hRule"><details><summary class="sbtSummary">Scoreboard Extras</summary><div class="scoreBoardExtrasDetails"><div id="footballScoreBoardExtrasSection"><div class="radioRowToLeft"><span class="scoreBoardExtrasKey">Match Clock</span><span class="footballScoreBoardExtrasThreeInputs"><input id="radioHalfTime" type="radio" class="radioSbTools" name="matchClock"><span>Half Time</span></span><span class="footballScoreBoardExtrasThreeInputs"><input id="radioExtraTime" type="radio" class="radioSbTools" name="matchClock"><span>Extra Time</span></span><span class="footballScoreBoardExtrasThreeInputs"><input type="radio" class="radioSbTools" name="matchClock" checked="checked"><span>Neither</span></span></div><hr class="hRule"><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Stats Counter</span><span class="footballScoreBoardExtrasThreeInputs"><input id="chkCorners" type="checkbox" class="chkSbTools chkInlineRight" checked="checked"><span class="iconCorner iconFbEventPage"></span></span><span class="footballScoreBoardExtrasThreeInputs"><input id="chkYellowCards" type="checkbox" class="chkSbTools chkInlineRight" checked="checked"><span class="iconYellowCard iconFbEventPage"></span></span><span class="footballScoreBoardExtrasThreeInputs"><input id="chkRedCards" type="checkbox" class="chkSbTools chkInlineRight" checked="checked"><span class="iconRedCard iconFbEventPage"></span></span></div><hr class="hRule"><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Video Asst Referee</span><input id="chkVar" type="checkbox" class="chkInlineRight chkSbTools"><span>Displayed as \'VAR\'</span></div><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Aggregate Score</span><input id="chkAggScore" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Displayed as \'AGG\' at some places</span></div><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Stoppage Time</span><input id="chkStoppageTime" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Due to Injuries etc.</span></div><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Expected Goals</span><input id="chkExpectedGoals" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Displayed as \'xGoals\'</span></div><hr class="hRule"><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Doughnut Charts</span><span class="displayFlex"><input id="chkPossession" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span class="width90px">Possession</span></span><span class="displayFlex"><input id="chkTotalShots" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Total Shots</span></span></div><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey"></span><span class="displayFlex"><input id="chkShotsOnTarget" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span class="width90px">Shots on Target</span></span><span class="displayFlex"><input id="chkDangerousAttacks" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Dang. Attacks</span></span></div></div><div id="iceHockeyScoreBoardExtrasSection"><div class="radioRowToLeft"><span id="ppKeyLabelTop" class="scoreBoardExtrasKey">Power Play Home</span><input id="radioPPHome" type="radio" checked="checked" name="powerPlay" class="radioSbTools"><span>PP</span><input id="radioPP2Home" type="radio" name="powerPlay" class="marginLeft15px radioSbTools"><span>PP2</span></div><div class="radioRowToLeft"><span id="ppKeyLabelBottom" class="scoreBoardExtrasKey">Power Play Away</span><input id="radioPPAway" type="radio" name="powerPlay" class="radioSbTools"><span>PP</span><input id="radioPP2Away" type="radio" name="powerPlay" class="marginLeft15px radioSbTools"><span>PP2</span></div><div class="radioRowToLeft"><span class="scoreBoardExtrasKey">No Power Play</span><input id="radioPPNone" type="radio" name="powerPlay" class="radioSbTools"></div></div><div id="dartsScoreBoardExtrasSection"><div class="checkBoxRowToLeft"><input id="chkSetPoints" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Set Points</span><input id="chk180s" type="checkbox" checked="checked" class="marginLeft30px chkInlineRight chkSbTools"><span>180s</span></div></div><div id="tennisScoreBoardExtrasSection"><div class="radioRowToLeft"><span class="scoreBoardExtrasKey">Number of Sets</span><input id="radio3setTennis" type="radio" checked="checked" name="tennisNumberOfSets" class="radioSbTools"><span>3</span><input id="radio5setTennis" type="radio" name="tennisNumberOfSets" class="marginLeft15px radioSbTools"><span>5</span></div></div></div></details></div><div id="scoreBoardNotSupportedSection" class="inactivated checkBoxRowToLeft"><input type="checkbox" class="chkInlineRight chkSbTools"><span id="scoreBoardNotSupportedMessage"></span></div><div id="eventStartingInOneHourSection"><hr class="hRule"><div class="itemsJustifiedVertCenter"><span><span class="iconStartingSoon iconSvgSmall marginRight5px"></span><span>Starting in 1 Hour</span></span><button class="btSimple btSubmit" id="btSetStartingTimeInOneHour" onclick="setStartingTimeInOneHour()">Set</button></div></div></div></div><div><button onclick=\'toggleSection("eventPropertiesSection")\' class="moreLess">Event Properties</button><div id="eventPropertiesSection" class="marginTopBottom10px hide"><div class="marginBottom5px">Has effect on icons and event panel tabs</div><div id="hasBetBuilderSection" class="iconMocksRow"><span class="width95Percent"><span id="betBuilderIcon" class="iconBetBuilder iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Bet Builder / SGP</span></span><input type="checkbox" onclick=\'toggleEventProperty("betBuilderLink")\' id="chkHasBetBuilder" class="chkSbTools"></div><div id="hasPriceBoostSection" class="iconMocksRow"><span class="width95Percent"><span class="iconPriceBoost iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Price Boost (Single)</span></span><input type="checkbox" onclick=\'toggleEventProperty("priceBoost")\' id="chkHasPriceBoost" class="chkSbTools"></div><div id="hasSuperBoostSection" class="iconMocksRow"><span class="width95Percent"><span class="iconSuperBoost iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Super Boost (Single)</span></span><input type="checkbox" onclick=\'toggleEventProperty("superBoost")\' id="chkHasSuperBoost" class="chkSbTools"></div><div id="hasFastMarketsSection" class="iconMocksRow"><span class="width95Percent"><span class="iconFastMarket iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Fast Markets</span></span><input type="checkbox" onclick=\'toggleEventProperty("fastMarkets")\' id="chkHasFastMarkets" class="chkSbTools"></div><div id="hasLiveVisualSection" class="iconMocksRow"><span class="width95Percent"><span class="iconVisual iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Live Visual</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveVisual")\' id="chkHasLiveVisual" class="chkSbTools"></div><div id="hasLiveStreamingSection" class="iconMocksRow"><span class="width95Percent"><span class="iconLiveStreaming iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Live Streaming</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStreaming")\' id="chkHasLiveStreaming" class="chkSbTools"></div><div id="hasScore24StatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="iconStatistics iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Prematch Statistics (Score24)</span></span><input type="checkbox" onclick=\'toggleEventProperty("score24Stats")\' id="chkHasScore24Statistics" class="chkSbTools"></div><div id="hasExternalStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="iconStatistics iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Prematch Statistics (External)</span></span><input type="checkbox" onclick=\'toggleEventProperty("externalStats")\' id="chkHasExternalStatistics" class="chkSbTools"></div><div id="hasLiveStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="iconStatistics iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Live Statistics</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStatistics")\' id="chkHasLiveStatistics" class="chkSbTools"></div><div title="Live event with scoreboard required" id="hasVarSection" class="iconMocksRow"><span class="width95Percent"><span id="varIcon" class="iconVar iconMockIconColumn vertMiddle iconSvgSmall"></span><span id="varLabel" class="iconMockLabelColumn">Video Assistant Referee</span></span><input type="checkbox" onclick=\'toggleEventProperty("var")\' id="chkHasVar" class="chkSbTools"></div></div></div><div><button onclick=\'toggleSection("createMarketSection")\' class="moreLess">Create Fast/Player Props Market</button><div id="createMarketSection" class="hide marginTopBottom10px"><div id="createMarketErrorSection" class="displayInRed">Open an Event Panel.</div><div id="createMarketFeatures"><div id="createPlayerPropsSection" class="marginTopBottom10px">Player Props<div class="infoMessage">Football, Basketball, Baseball, Ice Hockey, American Football, Handball</div><div class="createMarketLayout"><button class="btSimple playerProps" id="btCreatePlayerPropsMarket" onclick=\'createMarket("playerProps")\'>4 selections</button><div class="buttonLabelToRight" id="playerPropsMessage"></div><button class="btSimple playerProps" id="btCreatePlayerPropsDummyMarket" onclick=\'createMarket("playerPropsDummy")\'>15 dummy selections</button></div></div><hr class="hRule"><div id="createFastMarketSection" class="marginTopBottom10px">Fast Market<div class="infoMessage">Football, Tennis, Table Tennis, Ice Hockey</div><div class="createMarketLayout"><button class="btSimple" id="btCreateFastMarket" onclick=\'createMarket("fast")\'><span class="iconFastMarket iconOnBtSimple iconSvgSmall"></span><span class="labelOnBtSimple">Create</span></button><div class="buttonLabelToRight" id="fastMarketMessage"></div></div></div></div></div></div><div><button onclick=\'toggleSection("footballScoreBoardSection")\' class="moreLess">Football Scoreboard (RealTime Test)</button><div id="footballScoreBoardSection" class="marginTopBottom10px hide"><div id="notFootballScoreBoardMessage" class="hide displayInRed">No Football Scoreboard found for this event.</div><div id="scoreBoardFeatures" class="hide"><div id="scoreBoardScores" class="scoreLayout"><div id="homeScoreLabel" class="alignItemsCenter"><span class="iconScore iconSvgSmall marginRight2px"></span><span>Home Score</span></div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="homeScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("home")\'>Set</button><div id="awayScoreLabel" class="alignItemsCenter"><span class="iconScore iconSvgSmall marginRight2px"></span><span>Away Score</span></div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="awayScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("away")\'>Set</button></div><div id="scoreBoardDetails"><div class="scoreBoardLayout"><div class="iconCorner iconFbScoreBoard"></div><div class="iconSubstitution iconFbScoreBoard"></div><div class="iconYellowCard iconFbScoreBoard"></div><div class="iconRedCard iconFbScoreBoard"></div><div class="iconPenalty iconFbScoreBoard"></div><input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeSubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homePenalties" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awaySubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayPenalties" min="0" oninput=\'validity.valid||(value="")\'></div><button id="submitScoreBoard" class="btSubmit btSimple" onclick="submitScoreBoard()">Set</button></div></div></div></div><div id="sbToolsEventInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Event detection order:<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol></div></div></div></div><div id="sbToolsMarket" class="accordion closed"><button id="marketAccordion" class="accHeading" onclick="initSbToolsMarket()"><span class="accordionTitle">Market</span><span class="accordionHint">Set Status, Add to Carousel/Cards, Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsMarket">Detected market:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsMarketInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="labelRowForSbToolsMarket"><div class="hide" id="messageForSbToolsMarket"></div><div id="labelsForDetectedMarketAndEvent"><div id="eventLabelForDetectedMarket"></div><div class="marginLeft5px fontBold" id="marketLabelForDetectedMarket"></div></div></div><div id="lockMarketSection" class="lockSection hide">Lock <input type="checkbox" id="chkLockMarket" class="chkLock chkSbTools" onclick="lockMarket()"></div></div><div id="addToCarouselSection"><hr class="hRule"><div id="carouselButtonsDiv"><div class="itemsJustifiedVertCenter"><span>Add market to Carousel or Cards</span><button class="btSimple btCarousel" id="btAddToCarousel" onclick="addMarketToCarouselOrCards()"><span id="addToCarouselButtonLabel" class="labelOnBtSimple">Add</span></button></div></div><div id="addToCarouselErrorMessage" class="marginBottom10px displayInRed"></div></div><div id="marketFeatures" class="hide"><button onclick=\'toggleSection("marketDetailsSection")\' class="moreLess">Market Details</button><div id="marketDetailsSection" class="marginTopBottom10px hide"><div class="itemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="marketIdForSbToolsMarket" class="labelRow displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketId")\'><img class="iconCopy"></button></div><hr class="hRule"><div class="itemsJustified"><span class="width95Percent displayFlex"><span class="width48percent">Template ID:</span><span id="marketTemplateIdForSbToolsMarket" class="labelRow width100percent displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketTemplateId")\'><img class="iconCopy"></button></div><div class="itemsJustified"><span class="width95Percent displayFlex"><span class="width48percent noWrap">Template Tags:</span><span id="marketTemplateTagsForSbToolsMarket" class="labelRow width100percent displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketTemplateTags")\'><img class="iconCopy"></button></div><hr class="hRule"><details><summary class="sbtSummary">External Tools</summary><div class="detailsExpanded"><div id="openMappingForTemplateTagSection" class="itemsJustified"><span class="width95Percent">Mapping for the Template Tags</span><button class="btIcon btOpenInNewWindow" onclick=\'openStaticPageInNewWindow("MarketTemplateTag.cs")\'><img class="iconOpenInNewWindow"></button></div><div id="sbMarketIdForOddsManagerSection" class="itemsJustified"><span class="width95Percent itemsJustified paddingRight8px"><span>Legacy Market ID</span><span class="displayInLightGrey">for ISA/Redis/SB Admin Client</span></span><button class="btIcon btOpenInNewWindow" onclick="getLegacyMarketId()"><img class="iconOpenInNewWindow"></button></div><div class="itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("market")\'><img class="iconOpenInNewWindow"></button></div></div></details></div><button onclick=\'toggleSection("marketStatusSection")\' class="moreLess">Market State</button><div id="marketStatusSection" class="hide"><div id="setMarketStateButtonsSection" class="setMarketStateLayout marginTopBottom10px"><button class="btSimple btSetMarketState" id="btSetMarketStateOpen" onclick=\'setMarketState("Open")\'>Open</button><button class="btSimple btSetMarketState" id="btSetMarketStateSuspended" onclick=\'setMarketState("Suspended")\'>Suspd.</button><button class="btSimple btSetMarketState" id="btSetMarketStateVoid" onclick=\'setMarketState("Void")\'>Void</button><button class="btSimple btSetMarketState" id="btSetMarketStateSettled" onclick=\'setMarketState("Settled")\'>Settled</button><button class="btSimple btSetMarketState" id="btSetMarketStateHold" onclick=\'setMarketState("Hold")\'>Hold</button></div></div><button onclick=\'toggleSection("marketPropertiesSection")\' class="moreLess">Cashout, BB, Bet Distribution, Help Text</button><div id="marketPropertiesSection" class="marginTopBottom10px hide"><div id="marketCheckboxesSection"><div id="isCashoutAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="iconCashOut iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Cash Out</span></span><input type="checkbox" onclick=\'toggleMarketProperty("cashoutAvailable")\' id="chkIsCashoutAvailable" class="chkSbTools"></div><div id="isBetBuilderAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="iconBetBuilder iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Bet Builder / SGP</span></span><input type="checkbox" onclick=\'toggleMarketProperty("betBuilderAvailable")\' id="chkIsBetBuilderAvailable" class="chkSbTools"></div><div id="isBetDistributionAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="iconBetTrends iconMockIconColumn vertMiddle iconSvgSmall"></span><span class="iconMockLabelColumn">Bet Distribution</span></span><input type="checkbox" onclick=\'toggleMarketProperty("betDistributionAvailable")\' id="chkIsBetDistributionAvailable" class="chkSbTools"></div></div><hr class="hRule"><div class="marginTop10px">Bet Group Description:<span class="accordionHint">displayed in event page</span></div><div class="itemsJustified"><span contenteditable="true" id="fdBetGroupDescription" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setBetGroupDescription()"><img class="width16px iconSubmit"></button></div><div class="marginTop10px">Help Text:<span class="accordionHint">displayed in event tables & page</span></div><div class="itemsJustified"><span contenteditable="true" id="fdHelpText" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setHelpText()"><img class="width16px iconSubmit"></button></div></div></div><div id="sbToolsMarketInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Market detection: parent market of the last selection from betslip.</div></div></div><div id="sbToolsSelection" class="accordion closed"><button id="changeOddsAccordion" class="accHeading" onclick="initSbToolsSelection()"><span class="accordionTitle">Selection</span><span class="accordionHint">Change Odds/Status, Add Price Boost, Pop Bets</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsSelection">Detected selection:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsSelectionInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="labelForSbToolsSelection"><div class="hide" id="messageForSbToolsSelection"></div><div id="labelsForDetectedSelectionMarketAndEvent"><div id="eventLabelForDetectedSelection"></div><div id="marketLabelForDetectedSelection" class="marginLeft5px"></div><div class="marginLeft30px fontBold" id="selectionLabelForDetectedSelection"></div></div></div><div id="lockSelectionSection" class="hide lockSection">Lock <input type="checkbox" id="chkLockSelection" class="chkLock chkSbTools" onclick="lockSelection()"></div></div><div id="selectionFeatures" class="hide"><hr class="hRule"><div><div>Selection ID:</div><div class="itemsJustified marginBottom10px"><span id="selectionIdForSbToolsSelection" class="labelRow displayInGreen width95Percent"></span><button class="btCopy btIcon" onclick=\'copyToClipboard("selectionId")\'><img class="iconCopy"></button></div></div><button onclick=\'toggleSection("changeSelectionSection")\' class="moreLess">Change Odds/Status</button><div id="changeSelectionSection" class="hide"><div class="newOddsLayout"><span>Initial Odds:</span><span id="initialOddsSpan" class="displayInGreen"></span><button id="btResetOdds" class="btSimple btSubmit inactivated" onclick="resetOdds()">Reset</button><span>New Odds:</span><input class="fdSbTools" type="number" id="fdNewOdds" min="1" step="0.01" oninput=\'validity.valid||(value="")\'><button class="btSimple btSubmit" onclick="setOdds()">Set</button></div><hr class="hRule"><div id="selectionStatusSection"><div class="marginBottom5px">Selection Status:</div><div id="setSelectionStateButtonsSection" class="setSelectionStateLayout marginBottom10px"><button class="btSimple btSetSelectionState" id="btSetSelectionStateOpen" onclick=\'setSelectionState("Open")\'>Open</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateWon" onclick=\'setSelectionState("Won")\'>Won</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateLost" onclick=\'setSelectionState("Lost")\'>Lost</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateVoid" onclick=\'setSelectionState("Void")\'>Void</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateSuspended" onclick=\'setSelectionState("Suspended")\'>Suspd</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateSettled" onclick=\'setSelectionState("Settled")\'>Settled</button></div></div></div><button onclick=\'toggleSection("createPriceBoostSection")\' class="moreLess">Create Price Boost</button><div id="createPriceBoostSection" class="marginTopBottom10px hide"><div class="displayFlex"><span class="keyForCreatePb">Name:</span><input class="fdSbTools flex1" id="fdCreatePbName" value=""></div><div class="displayFlex"><span class="keyForCreatePb">Bet Type:</span><span class="radioForCreatePb"><input type="radio" name="radioPbBetType" id="radioPbSingle" class="vertMiddle radioSbTools" checked="checked" onclick=\'selectRadioForPbBetType("single")\'><label for="radioPbSingle">Single</label></span><span><input type="radio" name="radioPbBetType" id="radioPbCombi" class="vertMiddle radioSbTools" onclick=\'selectRadioForPbBetType("combi")\'><label for="radioPbCombi">Combination</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Event Phase:</span><span class="radioForCreatePb"><input type="radio" name="radioPbEventPhase" id="radioCreatePbEventPrematch" class="vertMiddle radioSbTools"><label for="radioCreatePbEventPrematch" class="vertMiddle">Prematch</label></span><span class="radioForCreatePb disabledIfCombi"><input type="radio" name="radioPbEventPhase" id="radioCreatePbEventLive" class="vertMiddle radioSbTools"><label for="radioCreatePbEventLive" class="vertMiddle">Live</label></span><span class="disabledIfCombi"><input type="radio" name="radioPbEventPhase" id="radioCreatePbEventBoth" class="vertMiddle radioSbTools" checked="checked"><label for="radioCreatePbEventBoth" class="vertMiddle">All</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Payout Mode:</span><span class="radioForCreatePb"><input type="radio" name="radioPbPayoutMode" id="radioCreatePbRealMoney" class="vertMiddle radioSbTools" checked="checked"><label for="radioCreatePbRealMoney" class="vertMiddle">Real Mon.</label></span><span><input type="radio" name="radioPbPayoutMode" id="radioCreatePbBonusMoney" class="vertMiddle radioSbTools"><label for="radioCreatePbBonusMoney">Bonus Money</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Visibility:</span><span class="radioForCreatePb"><input type="radio" name="radioPbVisibility" id="radioPbGlobal" class="vertMiddle radioSbTools" checked="checked"><label for="radioPbGlobal">Global</label></span><span><input type="radio" name="radioPbVisibility" id="radioPbPersonal" class="vertMiddle radioSbTools"><label for="radioPbPersonal">Personal</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Type:</span><span class="radioForCreatePb"><input type="radio" name="radioPbType" id="radioCreatePbPercentage" class="vertMiddle radioSbTools" onclick=\'selectRadioForPbType("percentage")\' checked="checked"><label for="radioCreatePbPercentage" class="vertMiddle">Percentage</label></span><span><input type="radio" name="radioPbType" id="radioCreatePbFixedOdds" class="vertMiddle radioSbTools" onclick=\'selectRadioForPbType("fixedOdds")\'><label for="radioCreatePbFixedOdds">Fixed Odds</label></span></div><div id="createPbPercentageValueSecion"><div class="displayFlex"><span class="keyForCreatePb">Percentage:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbPercentage" min="1" value="10" max="1000" step="1" oninput=\'validity.valid||(value="")\'></div></div><div id="createPbFixedOddsValueSecion" class="hide"><div class="displayFlex"><span class="keyForCreatePb">Fixed Odds:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbFixed" min="1" value="500" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'></div></div><div class="displayFlex"><span class="keyForCreatePb">Odds Range:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMinOdds" value="1.01" min="1.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'><span class="marginLeft5px marginRight5px">-</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMaxOdds" value="1000" min="1.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'></div><div class="displayFlex"><span class="keyForCreatePb">Stake Range:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMinStake" value="0.01" min="0.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'><span class="marginLeft5px marginRight5px">-</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMaxStake" value="1000" min="0.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'></div><div class="displayFlex"><span class="keyForCreatePb">Super Boost:</span><input type="checkbox" id="chkCreatePbIsSuperBoost" class="chkSbTools"></div><div class="displayFlex"><button class="btSimple btGreen flex1" id="btCreatePbFromSelections" onclick="createPbFromSelections()">Create Price Boost</button></div><div id="betTypeCombiHintSection" class="hide fontSizeSmaller displayInGray"><span class="ico-info lineHeight20px"></span><span>Combination Price Boost</span><ul><li>requires at least two prematch selections on the betslip</li><li>created from all prematch selections found on the betslip</li></ul></div></div></div><button onclick=\'toggleSection("popularBetsSection")\' class="moreLess">Popular Bets or Pre-Built Bets</button><div id="popularBetsSection" class="marginTopBottom10px hide"><div id="popularBetsControls"><div id="isPopularBetsEnabledSection" class="hide"><div id="popularBetsNotEnabledMessage" class="displayInRed hide">Popular Bets feature not enabled</div><div id="popularPreBuiltBetsNotEnabledMessage" class="displayInRed hide">Popular Pre-Built Bets feature not enabled</div><hr id="popularBetsHr" class="hRule"><div id="bothPopularBetsNotEnabledMessage" class="displayInRed hide">Neither Popular Bets nor Popular Pre-Built Bets feature enabled</div></div><div id="popularBetsButtons"><div class="">Add detected selection or full betslip content</div><div class="displayFlex"><button id="btAddDetectedToPopBets" onclick=\'setPopularBets("addDetected")\' class="btSimple btEqualWidth">Add Detected</button><button id="btAddAllToPopBets" onclick=\'setPopularBets("addAllFromSlip")\' class="btSimple btEqualWidth">Add Full Slip</button></div><div class="checkBoxRowToLeft"><input id="chkPrematchOnly" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Prematch only (as designed)</span></div><hr class="hRule"><div class="">Remove all normal or pre-built bets respectively</div><div class="displayFlex"><button id="btRemoveAllPopBets" onclick=\'setPopularBets("removeAllNormal")\' class="btSimple btEqualWidth">Remove Pop Normal</button><button id="btRemoveAllPerBuilt" onclick=\'setPopularBets("removeAllPreBuilt")\' class="btSimple btEqualWidth">Remove Pop Pre-Built</button></div></div></div><div id="popularBetsNotHomeMessage" class="displayInRed hide">Works only on Sportsbook Home</div><div id="popularBetsTooManySelectionsMessage" class="hide fontSizeSmaller displayInGray"><span class="ico-info lineHeight20px"></span><span>Pre-built cards can have maximum 3 swipeable bets</span></div></div></div><div id="sbToolsSelectionInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol"> Selection detection: Last selection from betslip</div></div><div id="sbToolsBonuses" class="accordion closed"><button id="bonusesAccordion" class="accHeading" onclick="initBonuses()"><span class="accordionTitle">Bonuses</span><span class="accordionHint">Price Boost, ACCA Insurance, Free Bet</span></button><div class="accContent"><button onclick=\'toggleSection("pbSection")\' class="moreLess">Price Boost</button><div id="pbSection" class="hide marginTopBottom10px"><div id="noPbFound" class="displayInRed">No Price Boost found</div><div id="pbDetailsLayout"><div><div class="marginBottom5px"><span id="pbNumberOfListed" class="displayInGreen fontBold marginRight3px"></span><span class="marginRight5px">PB(s) listed</span><span class="marginRight3px">&lpar;altogether</span><span id="pbNumberOf" class="displayInGreen fontBold marginRight3px"></span><span>returned by API&rpar;</span></div><div class="itemsJustified marginBottom2px"><div id="listPbByNameDiv"><input type="radio" name="radioPb" id="radioPbByName" class="radioSbTools vertMiddle" checked="checked" onclick=\'listPriceBoostsBy("pbName")\'><label for="radioPbByName" class="vertMiddle">by bonus name</label></div><div id="listPbByEventNameDiv"><input type="radio" name="radioPb" id="radioPbByEvent" class="radioSbTools vertMiddle" onclick=\'listPriceBoostsBy("eventName")\'><label for="radioPbByEvent" class="vertMiddle">by event name</label></div><div title="These boost are not applicable as the selections for them are not available in the system"><input type="radio" name="radioPb" id="radioPbGarbage" class="radioSbTools vertMiddle" onclick=\'listPriceBoostsBy("garbage")\'><label for="radioPbGarbage" class="vertMiddle">garbage</label></div></div></div><select id="pbSelector" onchange="selectPb(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="pbLegendCloseable"><div id="pbLegendSection"><div class="marginBottom2px">Icons in the above dropdown:</div><div id="pbLegendCriteriaNotMet">&#128683; PB criteria not met</div><div id="pbLegendPersonal">&#128151; Personal</div><div id="pbLegendCombi">&#x1F9E9; Combination</div><div id="pbLegendSuperBoost">&#128640; Super Boost</div><button id="btClosePbLegend" onclick="closePbLegend()">x</button></div></div><div id="pbSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="pbName" class="displayInGreen"></span></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="pbIdSpan" class="displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("priceBoostId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px"><div class="itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("priceBoost")\'><img class="iconOpenInNewWindow"></button></div><div id="goToEventPageRow" class="itemsJustified"><span class="width95Percent">Go to the event page</span><a id="goToEventPageLink" href=""><button class="btReload btIcon" onclick="goToEventPage()"><img class="iconReload"></button></a></div><div title="Enabled on SB Home and A-Z pages to which the related event belongs" id="addPbToCarouselRow" class="itemsJustified"><span id="addPbToCarouselLabel" class="width95Percent">Add to carousel or cards</span><button class="btIcon" onclick="addPbToCarouselOrCards()"><img class="iconPlus"></button></div></div><hr class="hRule"><details><summary class="sbtSummary">Boosted Selection</summary><div class="detailsExpanded">Path to the Competition:<div id="pbPathToCompetition" class="displayInGreen marginBottom10px marginLeft15px"></div><div id="boostedSelectionDiv">Selection:<div class="displayInGreen marginLeft15px"><div id="eventLabelForPbDiv"></div><div id="marketLabelForPbDiv" class="marginLeft5px"></div><div id="selectionLabelForPbDiv" class="marginLeft30px fontBold"></div></div></div></div></details><hr class="hRule"><details><summary class="sbtSummary">More Details</summary><div class="detailsExpanded"><div class="displayFlex"><span class="keyForPb">Visibility:</span><span id="pbVisibility" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Type:</span><span id="pbType" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Payout:</span><span id="pbPayoutMode" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Event Phases:</span><span id="pbEventPhases" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Odds Range:</span><span id="pbMinMaxOdds" class="displayInGreen"></span></div><div id="pbStakeRangeDiv"><div class="displayFlex"><span class="keyForPb">Stake Range:</span><span id="pbMinMaxStake" class="displayInGreen"></span></div></div><div id="pbExpiryDateDiv"><div class="displayFlex"><span class="keyForPb">Expiry Date:</span><span id="pbExpiryDate" class="displayInGreen"></span></div></div></div></details></div></div></div><button onclick=\'toggleSection("profitBoostSection")\' class="moreLess">Profit Boost</button><div id="profitBoostSection" class="hide marginTopBottom10px"><div id="profitBoostNotFound" class="displayInRed">No Profit Boost found</div><div id="profitBoostLogin" class="displayInRed">Login to see your Profit Boosts.</div><div id="profitBoostDetailsLayout"><div><span id="profitBoostNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>Profit Boosts found</span></div><select id="profitBoostSelector" onchange="selectProfitBoost(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="profitBoostSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="profitBoostName" class="displayInGreen"></span></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="profitBoostId" class="displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("profitBoostId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("profitBoost")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="profitBoostRestrictionsSection">Restriction path:<div id="profitBoostPathToCompetition" class="displayInGreen marginBottom10px"></div><div id="profitBoostFurtherRestricions" class="displayInOrange hide">Further restrictions are set on Event/Market level. See the details in Trading Tools.</div><hr class="hRule"></div><div><div class="displayFlex"><span class="keyForProfitBoost">Bet Types:</span><span id="profitBoostBetTypes" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Event Phases:</span><span id="profitBoostEventPhases" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Stake Range:</span><span id="profitBoostStake" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Odds Range:</span><span id="profitBoostMinMaxOdds" class="displayInGreen"></span></div><div id="profitBoostNoOfSelectionsDiv"><div class="displayFlex"><span class="keyForProfitBoost">No. of Selections:</span><span id="profitBoostNoOfSelections" class="displayInGreen"></span></div></div></div><hr class="hRule"><details><summary class="sbtSummary">More Details</summary><div class="detailsExpanded"><div class="displayFlex"><span class="keyForProfitBoost">Boost % / Payout:</span><span class="displayInGreen"><span id="profitBoostMultiplier"></span><span id="profitBoostPayoutMode"></span></span></div><div class="displayFlex"><span class="keyForProfitBoost">Max Winning:</span><span id="profitBoostMaxBoostedWinningsInEuro" class="displayInGreen"></span></div><div id="profitBoostExpiryDateDiv"><div class="displayFlex"><span class="keyForProfitBoost">Expiry Date:</span><span id="profitBoostExpiryDate" class="displayInGreen"></span></div></div></div></details></div></div></div><button onclick=\'toggleSection("accaSection")\' class="moreLess">ACCA Insurance</button><div id="accaSection" class="hide marginTopBottom10px"><div id="accaMessage" class="displayInRed"><div id="loginToSeeAccaIns">Login to see ACCA insurance.</div><div id="noAccaInsFound">No active ACCA insurance found.</div></div><div id="accaInsDetailsLayout" class="hide"><div class="itemsJustified"><div><span id="accaInsNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>ACCA Insurances found</span></div><div id="applySelectedAccaInsDiv" class="itemsJustifiedVertCenter"><input id="radioApplySelectedAccaIns" type="radio" class="radioSbTools" onclick="applySelectedAccaIns()"><span>Apply Selected &#9989;</span></div></div><select id="accaInsSelector" onchange="selectAccaIns(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">Name:</span><span id="accaInsNameField" class="accaValueColumn displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("accaInsName")\'><img class="iconCopy"></button></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="accaInsIdField" class="accaValueColumn displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("accaInsId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("acca")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="accaInsEventPhaseRow"><span class="keyForAccaIns">Event Phase:</span><span id="accaInsEventPhaseValue" class="displayInGreen"></span></div><div><span class="keyForAccaIns">Min Number of Selections:</span><span id="accaInsMinimumNumberOfSelectionsSpan" class="displayInGreen"></span></div><div><span class="keyForAccaIns">Min Selection Odds:</span><span id="accaInsSelectionOddsLimitMinSpan" class="displayInGreen"></span></div><div id="accaInsTotalOddsLimitMinRow"><span class="keyForAccaIns">Min Total Odds:</span><span id="accaInsTotalOddsLimitMinSpan" class="displayInGreen"></span></div><div id="accaMinMaxStakeRow"><span class="keyForAccaIns">Stake Range:</span><span id="accaInsMinMaxStakeSpan" class="displayInGreen"></span></div><hr class="hRule"><div id="accaInsRestrictionsSection"><details><summary class="sbtSummary">Restriction paths</summary><div class="detailsExpanded"><ul id="accaInsRestrictionPath" class="displayInGreen scrollableListBox"></ul></div></details><hr class="hRule"></div><details><summary class="sbtSummary">More Details</summary><div class="detailsExpanded"><div><span class="keyForAccaIns">Payout Mode:</span><span id="accaInsPayoutMode" class="displayInGreen"></span></div><div id="accaExpiryDateRow"><span class="keyForAccaIns">Max Losing Sel. Count:</span><span id="accaInsMaxLosingSelectionsCountSpan" class="displayInGreen"></span></div><div id="accaExpiryDateRow"><span class="keyForAccaIns">Max Payout Per Bet:</span><span id="accaInsMaxPayoutSpan" class="displayInGreen"></span></div><div id="accaExpiryDateRow"><span class="keyForAccaIns">Expiry Date:</span><span id="accaInsExpiryDateSpan" class="displayInGreen"></span></div></div></details></div></div><button onclick=\'toggleSection("accaBoostSection")\' class="moreLess">ACCA Boost</button><div id="accaBoostSection" class="hide marginTopBottom10px"><div id="accaBoostNotFound" class="displayInRed">No ACCA Boost found</div><div id="accaBoostLogin" class="displayInRed">Login to see your ACCA Boosts.</div><div id="accaBoostDetailsLayout"><div><span id="accaBoostNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>ACCA Boosts found</span></div><select id="accaBoostSelector" onchange="selectAccaBoost(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="accaBoostSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="accaBoostName" class="displayInGreen"></span></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="accaBoostId" class="displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("accaBoostId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("accaBoost")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="accaBoostEventPhaseRow"><span class="keyForAccaBoost">Event Phase:</span><span id="accaBoostEventPhaseValue" class="displayInGreen"></span></div><div id="accaBoostNoOfSelectionsRow"><span class="keyForAccaBoost">Number of Selections:</span><span id="accaBoostNoOfSelections" class="displayInGreen"></span></div><div id="accaBoostMinMaxSelectionOddsRow"><span class="keyForAccaBoost">Selection Odds Range:</span><span id="accaBoostMinMaxSelectionOdds" class="displayInGreen"></span></div><hr class="hRule"><div id="accaBoostRestrictionsSection"><details><summary class="sbtSummary">Restriction paths</summary><div class="detailsExpanded"><ul id="accaBoostRestrictionPath" class="displayInGreen scrollableListBox"></ul></div></details><hr class="hRule"></div><details><summary class="sbtSummary">More Details</summary><div class="detailsExpanded"><div><span class="keyForAccaBoost">Max Boosted Winning:</span><span class="displayInGreen"><span id="accaBoostMaxBoostedWinningsEur"></span><span id="accaBoostMaxBoostedWinningsOther"></span></span></div><div><span class="keyForAccaBoost">Boost Applied On:</span><span id="accaBoostAppliedOn" class="displayInGreen"></span></div><div><span class="keyForAccaBoost">Payout Mode:</span><span id="accaBoostPayout" class="displayInGreen"></span></div><div><span class="keyForAccaBoost">Expiry Date:</span><span id="accaBoostExpiryDate" class="displayInGreen"></span></div></div></details><div id="accaBoostLadderSection"><hr class="hRule"><details><summary class="sbtSummary">Acca Boost Ladder Steps</summary><div class="detailsExpanded"><ul id="accaBoostLadder" class="displayInGreen scrollableListBox"></ul></div></details></div></div></div></div><button onclick=\'toggleSection("freeBetSection")\' class="moreLess">Free or Risk Free Bet</button><div id="freeBetSection" class="hide marginTop10px"><div id="freeBetNotFound" class="displayInRed">No Free Bet found</div><div id="freeBetLogin" class="displayInRed">Login to see your Free Bets.</div><div id="freeBetDetailsLayout"><div><span id="freeBetNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>Free or Risk Free Bets found</span></div><select id="freeBetSelector" onchange="selectFreeBet(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="freeBetSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="freeBetName" class="displayInGreen"></span></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="freeBetIdSpan" class="displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("freeBetId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("freeBet")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="freeBetRestrictionsSection">Restriction path:<div id="freeBetPathToCompetition" class="displayInGreen marginBottom10px"></div><div id="freeBetFurtherRestricions" class="displayInOrange hide">Further restrictions are set on Event/Market level. See the details in Trading Tools.</div><hr class="hRule"></div><div class="displayFlex"><span class="keyForFreeBet">Type / Payout:</span><span class="displayInGreen"><span id="freeBetType"></span><span id="freeBetPayoutMode"></span></span></div><div class="displayFlex"><span class="keyForFreeBet">Stake:</span><span id="freeBetStake" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Bet Types:</span><span id="freeBetBetTypes" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Event Phases:</span><span id="freeBetEventPhases" class="displayInGreen"></span></div><div id="freeBetNoOfSelectionsDiv"><div class="displayFlex"><span class="keyForFreeBet">No. of Selections:</span><span id="freeBetNoOfSelections" class="displayInGreen"></span></div></div><div id="freeBetExpiryDateDiv"><div class="displayFlex"><span class="keyForFreeBet">Expiry Date:</span><span id="freeBetExpiryDate" class="displayInGreen"></span></div></div></div></div></div></div></div><div id="sbToolsBanners" class="accordion closed"><button id="bannersAccordion" class="accHeading" onclick="initBanners()"><span class="accordionTitle">Banners</span><span class="accordionHint">Carousel & Sportsbook Banners</span></button><div class="accContent"><div id="bannersMessage" class="displayInRed hide">Current page is not Sportsbook Home</div><div id="bannersFeatures" class="hide"><div class="bannersRow"><span class="keyColumnForBanners">Carousel Banners</span><span><button id="btCrlBannersMinus" class="btPlusMinus btIcon" onclick="removeCarouselBanner()"><img class="iconMinus"></button></span><span id="noOfCrlBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addCarouselBanner()"><img class="iconPlus"></button></span><span class="floatRight">Overlay<input type="checkbox" id="chkBannerOverlay" class="chkInline chkSbTools"></span></div><div class="bannersRow"><span class="keyColumnForBanners">Sportsbook Banners</span><span><button id="btSbBannersMinus" class="btPlusMinus btIcon" onclick="removeSportsbookBanner()"><img class="iconMinus"></button></span><span id="noOfSbBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addSportsbookBanner()"><img class="iconPlus"></button></span><span class="floatRight">Diff. Color<input type="checkbox" id="chkBannerDiffColor" class="chkInline chkSbTools"></span></div></div></div></div><div id="sbToolsNative" class="accordion closed"><button id="nativeAccordion" class="accHeading" onclick="initNativeApp()"><span class="accordionTitle">Native App</span><span class="accordionHint">Navigate by postMessages</span></button><div class="accContent"><div class="nativeDetectedEventLayout"><div><div>Detected event from the betslip:</div><div class="labelRow" id="eventLabelForNative"></div></div><button id="btNativeOpenEvent" class="btNative btSimple btNativeToggleable" onclick="openEventOnNative()"><div class="iconMmaximizeEvent iconSvgLarge"></div><div class="labelNativeBottomBarButton">OPEN</div></button></div><hr class="hRule"><div id="nativeErrorMessage" class="displayInRed extraCondensed hide"><hr class="hRule"></div><div class="marginTopBottom10px nativeBottomBarButtons"><button id="btNativeBack" class="btNative btSimple" onclick=\'nativeClick("back")\'><div class="iconBack iconSvgLarge"></div><div class="labelNativeBottomBarButton">Back</div></button><button id="btNativeHome" class="btNative btSimple btNativeToggleable" onclick=\'nativeClick("home")\'><div class="iconHomeBottomBar iconSvgLarge"></div><div class="labelNativeBottomBarButton">Home</div></button><button id="btNativeAz" class="btNative btSimple btNativeToggleable" onclick=\'nativeClick("az")\'><div class="iconAllSportSearch iconSvgLarge"></div><div class="labelNativeBottomBarButton">A-Z</div></button><button id="btNativeLive" class="btNative btSimple btNativeToggleable" onclick=\'nativeClick("live")\'><div class="iconLiveBetting iconSvgLarge"></div><div class="labelNativeBottomBarButton">Live</div></button><button id="btNativeMyBets" class="btNative btSimple loggedInOnly btNativeToggleable" onclick=\'nativeClick("myBets")\'><div class="iconMyBets iconSvgLarge"></div><div class="labelNativeBottomBarButton">My Bets</div></button><button id="btNativeBetslip" class="btNative btSimple btWithBadge" onclick=\'nativeClick("betSlip")\'><div id="iconNativeBetslip" class="iconBetslipBottom iconSvgLarge"></div><div class="labelNativeBottomBarButton">Betslip</div><div id="badgeNativeBetslip" class="badgeNative badgeNativeBetslip hide"></div></button></div><div id="nativeOtherSection" class="marginTopBottom10px nativeOtherButtons"><button id="btNativeBoost" class="btNative btNativeOthers btNativeToggleable" onclick=\'nativeClick("boost")\'><div class="iconPriceBoost iconSvgLarge"></div><div class="labelNativeOtherButton">Price Boost</div></button><button id="btNativeLiveSC" class="btNative btNativeOthers btNativeToggleable" onclick=\'nativeClick("lsc")\'><div class="iconLiveStreaming iconSvgLarge"></div><div class="labelNativeOtherButton">LS Calendar</div></button><button id="btNativeStartingSoon" class="btNative btNativeOthers btNativeToggleable" onclick=\'nativeClick("startingSoon")\'><div class="iconStartingSoon iconSvgLarge"></div><div class="labelNativeOtherButton">Starting Soon</div></button><button id="btNativeSettings" class="btNative btNativeOthers btNativeToggleable" onclick=\'nativeClick("settings")\'><div class="iconSettings iconSvgLarge"></div><div class="labelNativeOtherButton">Settings</div></button></div><div id="nativeQuickLinksSection" class="hide"><div class="displayFlex"><span class="width25percent">Quick Links</span><select id="quickLinkSelector" onchange="selectQuickLink(value)" class="comboSbTools height20px marginBottom10px width75percent"></select></div></div><div id="nativeAzSection" class="hide marginTopBottom10px"><div class="displayFlex"><span class="width25percent">Category</span><select id="categorySelector" onchange="selectCategory(value)" class="comboSbTools height20px marginBottom10px width75percent"></select></div><div class="displayFlex"><span class="width25percent">Region</span><select id="regionSelector" onchange="selectRegion(value)" class="comboSbTools height20px marginBottom10px width75percent inactivated"></select></div><div class="displayFlex"><span class="width25percent">Competition</span><select id="competitionSelector" onchange="selectCompetition(value)" class="comboSbTools height20px width75percent inactivated"></select></div></div></div></div><div id="sbToolsStreamMappingHelper" class="accordion closed"><button id="streamMappingHelperAccordion" class="accHeading" onclick="initStreamMappingHelper()">IDs for stream mapping (probably YAGNI)</button><div class="accContent">Get LIVE Provider Event IDs for mapping:<div class="streamIdsLayout"><button id="getTwitchProviderIds" class="btSimple" onclick="getTwitchProviderIds()">Twitch</button><button id="getPerformProviderIds" class="btSimple" onclick="getPerformProviderIds()">Perform</button><div id="twitchResults" class="extraCondensed"></div><div id="performResults" class="extraCondensed"></div></div></div></div></div><style>:root{--sbtColorGreen:#008d90}#sportsbookToolContent{line-height:18px}.itemsJustified{display:flex;justify-content:space-between;align-items:flex-start}.itemsJustifiedVertCenter{display:flex;justify-content:space-between;align-items:center}.checkBoxRowToRight{display:flex;align-items:center;justify-content:flex-end}.checkBoxRowToLeft,.radioRowToLeft{margin-left:2px;display:flex;align-items:center;justify-content:flex-start}#performResults,#twitchResults{margin-left:5px;margin-top:5px}.accordionHint{float:right;font-size:x-small;color:gray}.width100percent{width:100%}.width48percent{width:48%}.width75percent{width:75%}.width17percent{width:17%}.width80percent{width:80%}.width23percent{width:23%}.width92percent{width:92%}.width90px{width:90px}.iconFbScoreBoard{height:18px;margin-bottom:2px}.iconFbEventPage{height:16px}.alignItemsCenter{display:flex;align-items:center}.vertMiddle{vertical-align:middle}.keyColumnForBanners{width:130px;display:inline-block}.displayInGray{color:gray}.fontSizeSmaller{font-size:smaller}.landingOnPageList{color:var(--sbtColorGreen);line-height:13px;margin-left:15px}#betTypeCombiHintSection span{display:inline-block;vertical-align:middle;margin-right:3px}#popularBetsTooManySelectionsMessage span{vertical-align:middle;margin-right:3px}#betTypeCombiHintSection ul{margin:unset;line-height:15px;padding-left:20px}.lineHeight20px{line-height:20px}.lineHeight13px{line-height:13px}.keyForPb{width:30%}.keyForFreeBet{width:35%}.keyForCreatePb{width:27%}.radioForCreatePb{width:29%}#createPriceBoostSection{line-height:20px}.keyForProfitBoost{width:35%}.keyForAccaBoost{display:inline-block;width:45%}.keyForAccaIns{display:inline-block;width:52%}.bannersRow{line-height:25px}.paddingRight8px{padding-right:8px}.noOfBanners{width:20px;display:inline-block;text-align:center}.btSimple{border:1px solid #444;border-radius:3px;box-shadow:0 1px #666;margin:2px;cursor:pointer;line-height:1em;font-size:inherit;padding:2px;color:#444;height:fit-content}.btEqualWidth{flex:1}@media (hover:hover){.btSimple:hover{background-color:#fff}}.btSimple:active{box-shadow:0 0 #666;background-color:#fff;transform:translateY(1px)}.footballScoreBoardExtrasThreeInputs{display:flex;align-items:center;width:80px}.keyForContext{width:34%}.keyForEventDetails,.width25percent{width:25%}.keyForEventPageProviders{display:inline-block;width:95px}.valueForContext{width:68%;color:var(--sbtColorGreen)}.valueForEventDetails{width:75%}.truncatable{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#providersMessage{transform:scale(.9);transform-origin:left;width:max-content}.marginTop5px{margin-top:5px}.marginBottom2px{margin-bottom:2px}.marginBottom5px{margin-bottom:5px}.marginBottom10px{margin-bottom:10px}.marginTopBottom10px{margin-top:10px;margin-bottom:10px}.marginTopBottom5px{margin-top:5px;margin-bottom:5px}.marginTop10px{margin-top:10px}.marginRight2px{margin-right:2px}.marginRight5px{margin-right:5px}.marginRight3px{margin-right:3px}.marginRight10px{margin-right:10px}.marginLeft5px{margin-left:5px}.marginLeft15px{margin-left:15px}.marginLeft30px{margin-left:30px}.height20px{height:20px}.chkInline{vertical-align:middle;margin-left:3px}.chkInlineRight{vertical-align:middle;margin-right:3px}#initialOddsSpan{margin-left:4px}.scoreBoardExtrasKey{width:110px}.labelRow{word-break:break-word}.noWrap{white-space:nowrap}.lockSection{display:flex;justify-content:flex-end;align-self:start}.infoList{margin:3px;padding-inline-start:25px}.detectedEntitySection{display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto;margin-bottom:10px}.streamIdsLayout{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.align-right{text-align:right}.buttonLabelToRight{margin-left:8px}.scoreLayout{margin-bottom:10px;display:grid;grid-template-columns:33% 45px auto;grid-template-rows:1fr 1fr;align-items:center}#scoreBoardDetails{border:1px solid #ccc;margin-bottom:15px}.segmentChangeSectionHint{font-size:x-small;color:#a00000;font-weight:700;margin-bottom:5px;margin-top:5px;font-stretch:extra-condensed}.scoreBoardLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;grid-template-rows:auto auto auto;padding:10px;justify-items:center}.iconMocksRow{display:flex;justify-content:space-between}.iconOnBtSimple{margin-right:3px;vertical-align:middle}.labelOnBtSimple{vertical-align:middle}.iconMockIconColumn{display:inline-block;text-align:center;width:25px}.labelNativeOtherButton{margin-top:1px;font-size:x-small;font-stretch:condensed}.labelNativeBottomBarButton{font-stretch:condensed}#pbLegendSection{position:relative;margin-top:-10px;margin-bottom:10px;line-height:normal;font-size:x-small;border:1px solid #ccc;border-top:none;padding:5px}#btClosePbLegend{position:absolute;bottom:0;right:0;border-style:none;cursor:pointer}#btNativeOpenEvent{height:38px}.iconMockLabelColumn{display:inline-block}.monoSpaceFont{font-family:monospace}.resolveLimitationRow{display:grid;grid-template-columns:auto 100px;align-items:baseline}#iframeNotMatchingWarningMessage,#obgStateFrozenMessage{margin-bottom:8px;color:#a00000;font-weight:700;border:1px solid #a00000;padding:5px}.width48percent{width:48%}.keyColumnForExtras{width:120px;display:inline-block}#setEventPhaseButtonsLayout{display:grid;grid-template-columns:1fr 1fr 1fr;margin-bottom:5px}.setMarketStateLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr}.setSelectionStateLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr}.nativeBottomBarButtons{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr}.btNative{display:flex;flex-direction:column;align-items:center}.nativeOtherButtons{display:grid;grid-template-columns:1fr 1fr 1fr 1fr}.badgeNative{position:absolute;left:29px;top:-4px;min-height:16px;min-width:16px;line-height:16px;border-radius:8px;padding:0 3px;text-align:center;font-size:10px;color:#fff}.badgeNativeBetslip{background-color:#cc8936}.nativeDetectedEventLayout{display:grid;grid-template-columns:5fr 1fr}.createMarketLayout{display:grid;grid-template-columns:55% auto;align-items:center}.newOddsLayout{margin-top:10px;align-items:center;display:grid;grid-template-rows:auto auto;grid-template-columns:25% 20% auto}.newOddsKeys{width:50px}.btSubmit{margin-left:5px;width:45px}.vertical{writing-mode:tb-rl;transform:rotate(-180deg);margin-bottom:5px}#submitScoreBoard{margin-left:10px;margin-bottom:10px}.fdSbTools{border:1px solid #444;padding-left:3px;color:#0000a0;height:fit-content}.comboSbTools{border:1px solid #444;font-size:inherit;color:#444}.fdScoreBoardNumeric{width:45px;margin-bottom:1px}#sportsbookTool{background-color:#fff;color:#444;font-family:Arial;width:310px;height:auto;position:fixed;border:2px solid #d3d3d3;top:0;left:0;z-index:5000;box-shadow:0 0 35px 10px #000;font-size:12px;overflow:auto}#sportsbookToolNameLeft{font-weight:900;margin-right:2px;letter-spacing:-1px;color:#00b9bd}#sportsbookToolNameRight{color:#f9a133}.sbManagerSb{color:#00b9bd;font-weight:900;margin-left:4px;margin-right:2px}.sbManagerManager{color:#cc8936;margin-right:4px}#sportsbookToolHeader{padding:3px;padding-bottom:5px;cursor:move;z-index:5000;background:#1c3448;color:#ddd}#sportsbookToolHeaderTitle{display:inline-block;padding-top:3px;padding-left:4px}#sportsbookToolName{font-size:18px;margin-right:5px}#sportsbookToolAuthorName{font-size:8px;line-height:30%;font-weight:400}.extraCondensed{font-stretch:extra-condensed}.sportsbookToolHeaderButtons{color:#fff;width:25px;height:20px;margin:1px;padding:2px;border-color:#666;cursor:pointer}#btMinimizeAll,#btZoomInOut{background:#646464}@media (hover:hover){#btMinimizeAll:hover,#btZoomInOut:hover{background:#1e1e1e}}#btMinimizeClosed{background-color:#00b9bd}@media (hover:hover){#btMinimizeClosed:hover{background:var(--sbtColorGreen)}}#btMinimizeClosed:active{background:var(--sbtColorGreen)}.btWithBadge{position:relative}#btClose{background:#c86464}@media (hover:hover){#btClose:hover{background:#a00000}}#btClose:active{background:#a00000}.infoMessage{opacity:.5;font-size:x-small}.displayInRed{color:#a00000}.displayInGreen{color:var(--sbtColorGreen)}.displayInOrange{color:#cc8936}.displayInLightGrey{color:#ccc}.hide{display:none}.show{display:block}.accHeading{border-radius:none;background-color:#eee;color:#444;cursor:pointer;padding:8px;width:100%;text-align:left;border:none;outline:0;transition:.4s}@media (hover:hover){.accHeading:hover,.btNativeOthers:hover,.moreLess:hover{background-color:#ccc}}.open .accHeading{background-color:#ccc}.opacity20{opacity:20%}.accContent{margin:10px;background-color:#fff;overflow:hidden}.closed .accContent{display:none}.open .accContent{display:block}.hRule{border-top:1px solid #eee}.scaledTo70percent{transform:scale(.7);transform-origin:0 0}.floatRight{float:right}.carouselList{padding-left:15px}.visibilityHidden{visibility:hidden}.displayInGreenGlow{text-shadow:0 0 7px #fff,0 0 10px #fff,0 0 21px #fff,0 0 42px #008d90,0 0 82px #008d90,0 0 92px #008d90,0 0 102px #008d90,0 0 151px #008d90}#limitedFunctionsMessage{color:#a00000;font-weight:700;float:right;font-stretch:extra-condensed}.fontBold{font-weight:700}.chkLock{margin-left:5px;align-self:center}.chkSbTools{cursor:pointer;align-self:center;accent-color:var(--sbtColorGreen)}.scoreBoardExtrasDetails{transform:scale(.85);transform-origin:left;width:max-content}.radioSbTools{margin-right:5px;cursor:pointer;accent-color:var(--sbtColorGreen)}.btCopy{min-width:16px}.btIcon{opacity:60%;border:none;background:0 0;cursor:pointer;vertical-align:middle;padding:0}@media (hover:hover){.btIcon:hover{opacity:100%;transform:scale(1.1)}}.btIcon:active{opacity:20%}.btOpenInNewWindow{width:15px}.iconHeader{width:12px}.segmentKeyColumn{width:35px;display:inline-block}.width16px{width:16px}.iconSubmit{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z M219.429,367.932L108.606,257.108l38.789-38.789l72.033,72.035L355.463,154.32l38.789,38.789L219.429,367.932z"/></svg>\')}.iconCopy{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" style="enable-background:new 0 0 512 512" xml:space="preserve" viewBox="83.2 56 345.6 400" width="16px" height="14px"><path fill="black" d="M337.8,56H119.6c-20.1,0-36.4,16.3-36.4,36.4v254.5h36.4V92.4h218.2V56z M392.4,128.7h-200c-20.1,0-36.4,16.3-36.4,36.4v254.5c0,20.1,16.3,36.4,36.4,36.4h200c20.1,0,36.4-16.3,36.4-36.4V165.1C428.7,145,412.5,128.7,392.4,128.7z M392.4,419.6h-200V165.1h200V419.6z"></path></svg>\')}.iconClose{content:url(\'data:image/svg+xml;utf8,<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M954.304 190.336a15.552 15.552 0 0 1 0 21.952l-300.032 300.032 298.56 298.56a15.616 15.616 0 0 1 0 22.016l-120.96 120.896a15.552 15.552 0 0 1-21.952 0L511.36 655.232 214.272 952.32a15.552 15.552 0 0 1-21.952 0l-120.896-120.896a15.488 15.488 0 0 1 0-21.952l297.152-297.152L69.888 213.76a15.552 15.552 0 0 1 0-21.952l120.896-120.896a15.552 15.552 0 0 1 21.952 0L511.36 369.472l300.096-300.032a15.36 15.36 0 0 1 21.952 0l120.896 120.896z"/></svg>\')}.iconMaximize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <path fill="white" d="M1,9h14V7H1V9z M1,14h14v-2H1V14z M1,2v2h14V2H1z"/></svg>\')}.iconMinimize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <polygon fill="white" points="15,7 1,7 1,9 15,9"/></svg>\')}.iconZoomOut{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-1.5 2v1h3v-1h-3z"/></svg>\')}.iconZoomIn{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-.5 1v1h-1v1h1v1h1v-1h1v-1h-1v-1h-1z"/></svg>\')}.iconOpenInNewWindow{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 194.818 194.818" height="14px" style="enable-background:new 0 0 194.818 194.818;" xml:space="preserve"><g><path d="M185.818,2.161h-57.04c-4.971,0-9,4.029-9,9s4.029,9,9,9h35.312l-86.3,86.3c-3.515,3.515-3.515,9.213,0,12.728c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636l86.3-86.3v35.313c0,4.971,4.029,9,9,9s9-4.029,9-9v-57.04C194.818,6.19,190.789,2.161,185.818,2.161z"/><path d="M149,77.201c-4.971,0-9,4.029-9,9v88.456H18v-122h93.778c4.971,0,9-4.029,9-9s-4.029-9-9-9H9c-4.971,0-9,4.029-9,9v140c0,4.971,4.029,9,9,9h140c4.971,0,9-4.029,9-9V86.201C158,81.23,153.971,77.201,149,77.201z"/></g></svg>\')}.iconReload{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 492.883 492.883" style="enable-background:new 0 0 492.883 492.883;" xml:space="preserve" width="14px" height="12px"><g><path d="M122.941,374.241c-20.1-18.1-34.6-39.8-44.1-63.1c-25.2-61.8-13.4-135.3,35.8-186l45.4,45.4c2.5,2.5,7,0.7,7.6-3l24.8-162.3c0.4-2.7-1.9-5-4.6-4.6l-162.4,24.8c-3.7,0.6-5.5,5.1-3,7.6l45.5,45.5c-75.1,76.8-87.9,192-38.6,282c14.8,27.1,35.3,51.9,61.4,72.7c44.4,35.3,99,52.2,153.2,51.1l10.2-66.7C207.441,421.641,159.441,407.241,122.941,374.241z"/><path d="M424.941,414.341c75.1-76.8,87.9-192,38.6-282c-14.8-27.1-35.3-51.9-61.4-72.7c-44.4-35.3-99-52.2-153.2-51.1l-10.2,66.7c46.6-4,94.7,10.4,131.2,43.4c20.1,18.1,34.6,39.8,44.1,63.1c25.2,61.8,13.4,135.3-35.8,186l-45.4-45.4c-2.5-2.5-7-0.7-7.6,3l-24.8,162.3c-0.4,2.7,1.9,5,4.6,4.6l162.4-24.8c3.7-0.6,5.4-5.1,3-7.6L424.941,414.341z"/></g></svg>\')}.iconSuperBoost{content:url(\'data:image/svg+xml;utf8,<svg width="12" height="12" viewBox="0 0 20 20" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M10.8118 14.2656L11.6232 15.6709L10.2574 19.7075L14.2329 15.79L14.215 12.9712C13.2143 13.5031 12.0828 13.9357 10.8118 14.2656Z"/><path d="M5.52279 9.05388C5.85769 7.80146 6.29649 6.6865 6.83629 5.70033L3.9757 5.68279L0 9.60027L4.0966 8.25444L5.52279 9.05388Z"/><path d="M5.64473 11.0953L8.74012 14.1455C14.6938 13.1833 17.789 10.3345 19.1383 6.33286L13.5731 0.849203C9.51222 2.17868 6.62123 5.22854 5.64473 11.0953ZM11.8045 10.169C11.2179 10.7469 10.2668 10.7469 9.68042 10.169C9.09382 9.59103 9.09382 8.65373 9.68042 8.0758C10.2669 7.49788 11.2179 7.49788 11.8045 8.0758C12.3911 8.65373 12.3911 9.59103 11.8045 10.169ZM14.9756 4.95116C15.5621 5.52908 15.5621 6.46628 14.9756 7.04421C14.389 7.62213 13.4379 7.62213 12.8513 7.04421C12.2648 6.46628 12.2648 5.52908 12.8513 4.95116C13.4379 4.37313 14.389 4.37313 14.9756 4.95116Z"/><path d="M14.2771 0.638525L19.3521 5.63924C19.8289 3.93266 20.0183 2.03609 19.9986 0.00137625C17.9337 -0.0181343 16.0091 0.168596 14.2771 0.638525Z"/><path d="M7.53009 14.7416C7.20799 14.7 6.9051 14.6006 6.6293 14.4542C6.359 14.6351 5.3371 15.2693 5.3329 15.2751C5.2836 15.0012 5.428 14.5671 5.4114 14.2883C3.9789 15.0852 4.0172 15.4557 3.0942 16.7081C3.3275 15.2234 3.6626 14.7745 4.5346 13.5332C4.2439 13.5725 3.9303 13.5406 3.6414 13.5949C4.2787 12.9463 4.359 12.9278 5.1549 12.5413L5.1499 12.5244C5.1179 12.4291 5.0981 12.3341 5.0897 12.2399C5.0507 12.01 5.0359 11.7723 5.0465 11.5296C4.4132 11.6929 3.8381 11.9109 3.2357 12.2066C3.3905 12.3322 3.5416 12.4383 3.7068 12.5474C2.5178 13.3852 1.9063 14.1763 1.0209 15.3329C1.527 15.3371 1.9351 15.262 2.4268 15.1366C1.7015 17.129 1.9497 18.4691 0.283203 20C1.6875 19.6266 2.7802 18.8959 3.6329 17.6047C3.9813 17.076 4.152 16.8002 4.5932 16.3466C4.7849 16.9533 4.9669 17.4727 5.0903 18.1101C5.5463 17.0242 5.8785 16.2778 6.7674 15.5295C6.86169 15.8022 6.9575 16.0745 7.0483 16.3491C7.40619 15.628 7.82779 15.1143 8.43779 14.6986C8.14669 14.7649 7.84079 14.7815 7.53009 14.7416Z"/></svg>\')}.iconPriceBoost{content:url(\'data:image/svg+xml;utf8,<svg width="12" height="12" viewBox="0 0 24 24" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M8 1H23V16L19 12L15 16L8 9L12 5L8 1ZM10.9065 19.4375L8.46989 21.8742C7.99343 22.3506 7.21431 22.3506 6.73904 21.8742C6.26377 21.3977 6.26377 20.621 6.73904 20.1445L9.17688 17.7079C9.65216 17.2314 10.4301 17.2314 10.9065 17.7079C11.383 18.1831 11.383 18.9611 10.9065 19.4375ZM9.53038 14.4696C10.008 14.9473 10.008 15.7216 9.53038 16.1993C9.05275 16.6781 8.27836 16.6781 7.80072 16.1993C7.3219 15.7216 7.3219 14.9473 7.80072 14.4696C8.27836 13.992 9.05275 13.992 9.53038 14.4696ZM3.087 22.6427C2.61055 23.1191 1.83143 23.1191 1.35734 22.6427C0.880886 22.1662 0.880886 21.3871 1.35734 20.913L5.49174 16.7774C5.9682 16.301 6.74732 16.301 7.22259 16.7774C7.69786 17.2539 7.69786 18.033 7.22259 18.5071L3.087 22.6427ZM6.35717 11.2976L8.08683 13.0272L4.33903 16.7762C3.86257 17.2527 3.08346 17.2527 2.60818 16.7762C2.13291 16.2998 2.13173 15.523 2.60818 15.0466L6.35717 11.2976Z"/></svg>\')}.iconLiveStreaming{content:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="%23444"><path d="M0,1.66257441 C0,0.744359925 0.666946302,0 1.50130749,0 L22.4986926,0 C23.3278418,0 24,0.743852329 24,1.66257441 L24,13.3374256 C24,14.25564 23.3330538,15 22.4986926,15 L1.50130749,15 C0.672158268,15 0,14.2561477 0,13.3374256 L0,1.66257441 Z M9.63041758,4.50472078 L9.63041758,10.4952792 C9.63041758,11.0369212 9.97608346,11.2585019 10.3979733,10.987681 L15.0671227,7.99190929 C15.4890124,7.7210884 15.4890124,7.27792694 15.0671227,7.00710605 L10.3979733,4.01231913 C9.97608346,3.74149823 9.63041758,3.96307896 9.63041758,4.50472078 Z" transform="translate(0 4)"/></svg>\')}.iconLiveBetting{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="%23444"><path d="M12 2c-5.516 0-10 4.484-10 10s4.484 10 10 10c5.516 0 10-4.484 10-10s-4.484-10-10-10zM16.358 12.695l-6.063 3.789c-0.548 0.337-1.263-0.042-1.263-0.695v-7.579c0-0.653 0.715-1.053 1.263-0.695l6.063 3.789c0.506 0.316 0.506 1.074 0 1.39z"></path></svg>\')}.iconStartingSoon{content:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="%23444"><path d="M12.2357192,4.80252419 C17.3363035,4.80228425 21.4714383,9.10011558 21.4709766,14.4009022 C21.4709766,19.7026486 17.3363035,24 12.2352574,24 C7.13513476,24 3,19.7021687 3,14.4011422 C3.00046172,9.10011558 7.13513476,4.80252419 12.2357192,4.80252419 Z M12.2352574,21.6005855 C16.0548088,21.6005855 19.1623931,18.3707336 19.1623931,14.4009022 C19.1623931,12.4780114 18.4418841,10.6705325 17.1338408,9.31054424 C15.8253356,7.95079601 14.0862797,7.20193874 12.2361809,7.20193874 L12.2357192,7.20193874 C8.41616774,7.20193874 5.30904522,10.4315507 5.30858349,14.4013821 C5.30858349,18.3709735 8.41570602,21.6005855 12.2352574,21.6005855 Z M13.8508042,14.4001344 C13.8508042,13.7570913 13.502208,13.1980277 12.9897025,12.9172962 L12.4887399,8.40399743 C12.4748883,8.27442905 12.3594592,8.16645539 12.2299477,8.16645539 C12.1052842,8.16645539 11.9877773,8.27442905 11.9739258,8.40399743 L11.4704237,12.9196956 C10.9650748,13.2028266 10.6187872,13.7594907 10.6187872,14.4001344 C10.6187872,15.3287078 11.3436825,16.0797246 12.2347957,16.0797246 C13.1282175,16.0797246 13.8508042,15.3287078 13.8508042,14.4001344 Z M9.9338767,3.35918037 C9.67993252,3.35918037 9.47216,3.14323306 9.47216,2.87929745 L9.47216,0.479882914 C9.47216,0.215947313 9.67993252,0 9.9338767,0 L14.5510437,0 C14.8049878,0 15.0127603,0.215947313 15.0127603,0.479882914 L15.0127603,2.87929745 C15.0127603,3.14323306 14.8049878,3.35918037 14.5510437,3.35918037 L9.9338767,3.35918037 Z M21.8654673,5.41063181 C22.0448442,5.59706633 22.0448442,5.90275174 21.8654673,6.08918625 L20.8857045,7.10725784 C20.7063275,7.29393229 20.412214,7.29393229 20.232837,7.10725784 L19.253536,6.08918625 C19.0739281,5.90275174 19.0739281,5.59706633 19.253536,5.41063181 L20.232837,4.39256022 C20.412214,4.20588577 20.7063275,4.20588577 20.8857045,4.39256022 L21.8654673,5.41063181 Z"/></svg>\')}.iconEventEnded{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="%23444"><title>event-ended</title><path d="M10 17.6c0.6-0.7 0.8-1.7 0.7-2.6s-0.6-1.8-1.4-2.3c-0.7-0.6-1.7-0.8-2.6-0.7s-1.8 0.6-2.3 1.4c-0.6 0.7-0.8 1.7-0.7 2.6 0.2 1.8 1.8 3 3.5 3 0.2 0 0.3 0 0.5 0 0.9-0.2 1.7-0.7 2.3-1.4zM4.6 15.8c-0.1-0.7 0.1-1.4 0.5-1.9 0.4-0.6 1-0.9 1.7-1 0.1 0 0.2 0 0.4 0 0.6 0 1.1 0.2 1.6 0.5 0.6 0.4 0.9 1 1 1.7s-0.1 1.4-0.5 1.9c-0.4 0.6-1 0.9-1.7 1-1.5 0.2-2.8-0.8-3-2.2z"></path><path d="M13.4 19.1c0-0.1 0.1-0.1 0 0 0.1-0.2 0.2-0.4 0.3-0.5 0 0 0-0.1 0.1-0.1 0.1-0.1 0.1-0.3 0.2-0.4 0-0.1 0.1-0.1 0.1-0.2s0.1-0.2 0.1-0.3c0-0.1 0.1-0.2 0.1-0.3s0.1-0.2 0.1-0.3c0-0.1 0-0.2 0.1-0.3 0-0.1 0-0.2 0-0.3s0-0.1 0-0.2l9.6-6.6-1.2-3.4-16 2.2c0 0 0 0-0.1 0-0.2 0-0.4 0-0.6 0.1-1.9 0.3-3.6 1.3-4.7 2.8-1.2 1.5-1.6 3.4-1.4 5.3 0.5 3.6 3.6 6.2 7.1 6.2 0.3 0 0.7 0 1-0.1 0.2 0 0.4-0.1 0.6-0.1 0.1 0 0.3-0.1 0.4-0.1s0.1 0 0.2-0.1c0.2-0.1 0.3-0.1 0.5-0.2 0 0 0 0 0.1 0 1.3-0.5 2.4-1.4 3.2-2.6 0 0 0 0 0 0 0-0.2 0.1-0.4 0.2-0.5zM13.1 11.3c-0.8-1.2-2-2.1-3.3-2.6l1.8-0.2c0.3 0.7 0.9 1.1 1.6 1.1 0.1 0 0.2 0 0.2 0l0.9-0.1c0.5-0.1 0.9-0.3 1.2-0.7 0.2-0.3 0.3-0.6 0.3-0.9l6.2-0.8-8.9 4.2zM12.5 8.4l2.4-0.3c0 0.1-0.1 0.2-0.1 0.2-0.1 0.2-0.3 0.3-0.6 0.3l-0.9 0.1c-0.3 0.1-0.6-0.1-0.8-0.3zM1 16.3c-0.2-1.7 0.2-3.3 1.2-4.7 1-1.3 2.5-2.2 4.2-2.5 0.2 0 0.4 0 0.5-0.1 2.3-0.1 4.5 1 5.7 3 0 0 0 0 0 0s0 0 0 0 0 0 0.1 0.1c0 0 0.1 0 0.1 0s0.1 0 0.1 0c0 0 0 0 0.1 0 0 0 0 0 0 0s0 0 0 0 0.1 0 0.1 0l9.4-4.4 0.4 1.3-9 6.2c-0.3 0.2-0.4 0.5-0.5 0.8 0 0.1 0 0.2 0 0.3s0 0.2 0 0.3c0 0.1 0 0.2-0.1 0.3 0 0.1 0 0.1-0.1 0.2 0 0.1-0.1 0.2-0.1 0.4 0 0 0 0.1 0 0.1-0.7 2-2.4 3.5-4.5 4-0.2 0-0.4 0.1-0.5 0.1-3.5 0.5-6.7-1.9-7.1-5.4z"></path><path d="M11.8 6.1c0.1 0.1 0.2 0.1 0.3 0.1s0.2-0.1 0.3-0.2c0.1-0.2 0.1-0.5-0.1-0.6l-3.1-2.5c-0.2-0.1-0.5-0.1-0.6 0.1s-0.1 0.5 0.1 0.6l3.1 2.5z"></path><path d="M15.1 5.8c0 0 0.1 0 0.1 0 0.2 0 0.4-0.1 0.4-0.3l0.9-3.2c0.1-0.2-0.1-0.5-0.3-0.5-0.2-0.1-0.5 0.1-0.5 0.3l-0.9 3.2c0 0.2 0.1 0.4 0.3 0.5z"></path><path d="M13.3 5.8c0.1 0.2 0.2 0.3 0.4 0.3 0 0 0.1 0 0.1 0 0.2-0.1 0.3-0.3 0.3-0.5l-1.2-3.9c-0.1-0.2-0.3-0.3-0.5-0.3-0.2 0.1-0.3 0.3-0.3 0.5l1.2 3.9z"></path></svg>\')}.iconStatistics{content:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23444"><path d="M1,8 L7,8 L7,24 L1,24 L1,8 Z M9,0 L15,0 L15,24 L9,24 L9,0 Z M17,4 L23,4 L23,24 L17,24 L17,4 Z"></path></svg>\')}.iconVar{content:url(\'data:image/svg+xml;utf8,<svg width="12" height="12" viewBox="0 0 22 13" fill="%23444" xmlns="http://www.w3.org/2000/svg"><g><path d="M20 0.5H2C0.9 0.5 0 1.4 0 2.5V10.5C0 11.6 0.9 12.5 2 12.5H20C21.1 12.5 22 11.6 22 10.5V2.5C22 1.4 21.1 0.5 20 0.5Z"/><path d="M4.96999 8.60001L3.41999 3.19001H2.04999L4.21999 9.83001H5.70999L7.88999 3.19001H6.51999L4.96999 8.60001Z" fill="%23fff"/><path d="M10.05 3.17001L7.77999 9.83001H9.24999L9.71999 8.25001H12.06L12.53 9.83001H14L11.72 3.17001H10.05ZM10.05 7.07001L10.88 4.20001L11.72 7.07001H10.05Z" fill="%23fff"/><path d="M18.16 6.94001C18.54 6.77001 18.83 6.53001 19.04 6.23001C19.25 5.92001 19.35 5.58001 19.35 5.19001C19.35 4.52001 19.14 4.02001 18.72 3.70001C18.3 3.37001 17.66 3.21001 16.78 3.21001H14.91V9.85001H16.27V7.30001H16.99L18.52 9.85001H20.03C19.74 9.41001 19.11 8.45001 18.14 6.96001L18.16 6.94001ZM17.67 5.92001C17.46 6.07001 17.15 6.14001 16.72 6.14001H16.28V4.35001H16.69C17.13 4.35001 17.45 4.42001 17.66 4.55001C17.87 4.68001 17.98 4.91001 17.98 5.22001C17.98 5.53001 17.88 5.77001 17.67 5.92001Z" fill="%23fff"/></g></svg>\')}.iconVisual{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="%23444"><path d="M19.25,2.75 L2.75,2.75 C1.74166667,2.75 0.916666667,3.575 0.916666667,4.58333333 L0.916666667,15.5833333 C0.916666667,16.5916667 1.74166667,17.4166667 2.75,17.4166667 L7.33333333,17.4166667 L7.33333333,18.3333333 C7.33333333,18.8375 7.74583333,19.25 8.25,19.25 L13.75,19.25 C14.2541667,19.25 14.6666667,18.8375 14.6666667,18.3333333 L14.6666667,17.4166667 L19.25,17.4166667 C20.2583333,17.4166667 21.0833333,16.5916667 21.0833333,15.5833333 L21.0833333,4.58333333 C21.0833333,3.56583333 20.2583333,2.75 19.25,2.75 Z M18.3333333,15.5833333 L3.66666667,15.5833333 C3.1625,15.5833333 2.75,15.1708333 2.75,14.6666667 L2.75,5.5 C2.75,4.99583333 3.1625,4.58333333 3.66666667,4.58333333 L18.3333333,4.58333333 C18.8375,4.58333333 19.25,4.99583333 19.25,5.5 L19.25,14.6666667 C19.25,15.1708333 18.8375,15.5833333 18.3333333,15.5833333 Z"></path></svg>\')}.iconBetBuilder{content:url(\'data:image/svg+xml;utf8,<svg width="12" height="12" viewBox="0 0 24 24" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M9.18054344,4.91452224 C9.11598748,4.78517471 9.081494,4.6488119 9.0815408,4.50793916 L9.0815408,4.50738591 C9.08181743,3.67474414 10.2887054,2.99986171 11.7772531,3.00000002 C13.2657732,3.000166 14.4722462,3.67526973 14.4719696,4.50793916 L14.4719696,4.50849241 C14.4719519,4.56172446 14.4670025,4.6143117 14.4573631,4.66611899 L16.4493522,5.78040559 C16.613385,5.76296062 16.7826843,5.75383128 16.9557953,5.75383128 C18.4443154,5.75383128 19.6510097,6.42882436 19.6510097,7.2614938 C19.6510097,7.35832881 19.6346898,7.45303135 19.6035047,7.54478775 L21.590166,8.65609407 L12.040982,13.9977538 L2.49182573,8.65609407 L4.1784815,7.71260326 C4.09873905,7.57016594 4.05575934,7.41863514 4.05575934,7.26148826 C4.05575934,6.42881883 5.26245367,5.75382575 6.75097372,5.75382575 C7.03189932,5.75382575 7.30278677,5.77786786 7.55741894,5.82247458 L9.18054344,4.91452224 Z M9.2603682,5.04937795 C9.1449132,5.21726187 9.08160413,5.39962226 9.0815408,5.59025175 L9.0815408,5.590805 C9.08126418,6.42347443 10.2877372,7.09857817 11.7762573,7.09874414 C13.264805,7.09888246 14.4716929,6.42400002 14.4719696,5.59135825 L14.4719696,5.590805 C14.472033,5.39997355 14.4087135,5.21741802 14.2931422,5.04936622 C13.9043066,5.61477475 12.9240088,6.01598495 11.7762573,6.01587831 C10.6288767,6.01575037 9.64907807,5.61459941 9.2603682,5.04937795 Z M14.4395953,7.80292672 C14.3239636,7.97097057 14.2605809,8.15352406 14.2605809,8.34435963 C14.2605809,9.17702907 15.4672752,9.85202215 16.9557953,9.85202215 C18.4443154,9.85202215 19.6510097,9.17702907 19.6510097,8.34435963 C19.6510097,8.15352406 19.587627,7.97097057 19.4719953,7.80292672 C19.0830934,8.36810557 18.1031685,8.76915631 16.9557953,8.76915631 C15.8084221,8.76915631 14.8284972,8.36810557 14.4395953,7.80292672 Z M9.2603701,10.4296573 C9.14491389,10.597542 9.08160413,10.7799034 9.0815408,10.9705339 L9.0815408,10.9710872 C9.08126418,11.8037566 10.2877372,12.4788603 11.7762573,12.4790263 C13.264805,12.4791646 14.4716929,11.8042822 14.4719696,10.9716404 L14.4719696,10.9710872 C14.472033,10.7802547 14.4087128,10.5976982 14.2931403,10.4296456 C13.9043034,10.9950527 12.924007,11.3962616 11.7762573,11.3961549 C10.6288786,11.396027 9.64908126,10.9948773 9.2603701,10.4296573 Z M4.23477561,7.80292395 C4.11914273,7.97096857 4.05575934,8.15352301 4.05575934,8.34435963 C4.05575934,9.17702907 5.26245367,9.85202215 6.75097372,9.85202215 C8.23949378,9.85202215 9.44618811,9.17702907 9.44618811,8.34435963 C9.44618811,8.15352301 9.38280471,7.97096857 9.26717183,7.80292395 C8.8782686,8.36810135 7.89834502,8.76915078 6.75097372,8.76915078 C5.60360242,8.76915078 4.62367884,8.36810135 4.23477561,7.80292395 Z M12.3580664,14.6574717 L21.976296,9.27725037 L21.976296,14.6574993 L12.3580664,20.0377483 L12.3580664,14.6574717 Z M2,14.7166501 L2,9.33637347 L11.6182296,14.7165948 L11.6182296,20.0968714 L2,14.7166501 Z"/></svg>\')}.iconFastMarket{content:url(\'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M11.0267 24V14.61H6L13.2222 0V9.39H18.0611L11.0267 24Z"/></svg>\')}.iconBetTrends{content:url(\'data:image/svg+xml;utf8,<svg width="12" height="12" viewBox="0 0 24 24" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M12.8 4V6.424C15.512 6.816 17.6 9.136 17.6 11.96C17.6 12.68 17.456 13.36 17.216 13.992L19.296 15.216C19.744 14.224 20 13.12 20 11.96C20 7.816 16.84 4.4 12.8 4ZM12 17.56C8.904 17.56 6.4 15.056 6.4 11.96C6.4 9.136 8.488 6.816 11.2 6.424V4C7.152 4.4 4 7.808 4 11.96C4 16.376 7.576 19.96 11.992 19.96C14.64 19.96 16.984 18.672 18.44 16.688L16.36 15.464C15.336 16.744 13.768 17.56 12 17.56Z"/></svg>\')}.iconCashOut{content:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="%23444"><path d="M21.0909,2.0262H2.9091c-.5021,0-.9091.407-.9091.9091v9.0909c0,.5021.407.9091.9091.9091h1.8182v-7.2727c0-.5021.407-.9091.9091-.9091h12.7273c.5021,0,.9091.407.9091.9091v7.2727h1.8182c.5021,0,.9091-.407.9091-.9091V2.9353c0-.5021-.407-.9091-.9091-.9091Z"/><path d="M16.6461,6.5716H7.3538c-.461,0-.849.345-.9028.8028l-1.6043,13.6364c-.0636.5404.3587,1.0153.9028,1.0153h12.5008c.5442,0,.9665-.4749.9029-1.0153l-1.6042-13.6364c-.0539-.4578-.442-.8028-.9029-.8028ZM14.2086,16.8825c-.3649.3563-.8443.5897-1.4382.7l-.0128,1.3618c-.1782.0679-.3606.1018-.5473.1018-.1782,0-.3734-.0297-.5854-.0891,0-.3055-.0085-.7552-.0255-1.3491-.8145-.1018-1.4934-.3563-2.0364-.7636,0-.6025.0636-1.2048.1909-1.8073.4073-.0509.7042-.0763.8909-.0763l.42.0255.1528,1.3236c.3224.1188.6193.1782.8909.1782.28,0,.5133-.0721.7-.2163.1951-.1528.2927-.3309.2927-.5346s-.0679-.3734-.2036-.5091c-.1358-.1357-.2758-.2418-.42-.3182-.1443-.0848-1.1879-.5982-1.3746-.7-.1782-.1018-.3861-.2418-.6236-.42-.4497-.348-.6745-.7934-.6745-1.3364s.1527-.9884.4582-1.3363c.3055-.3564.7254-.5855,1.26-.6873l-.0127-1.4891c.229-.0763.4623-.1145.7-.1145s.4582.034.6618.1018c-.017.6618-.0255,1.1582-.0255,1.4891.56.0848,1.0987.2588,1.6164.5218.0169.1612.0255.4158.0255.7637,0,.3394-.0468.717-.14,1.1327-.0679.0255-.2545.0594-.56.1018-.3055.0425-.5261.0636-.6618.0636l-.4327-1.4127c-.1272-.0425-.297-.0636-.5091-.0636s-.3903.0721-.5345.2163c-.1443.1357-.2164.3097-.2164.5218,0,.2037.1018.3819.3055.5346.2121.1528.4878.3097.8273.4709.3394.1612,1.0478.543,1.26.6873.2121.1358.3775.2716.4964.4073.2884.3479.4327.717.4327,1.1072,0,.577-.1824,1.0479-.5473,1.4127Z"/></svg>\')}.iconGoTo{content:url(\'data:image/svg+xml;utf8,<svg viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_iconCarrier"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" height="14px"><g transform="translate(-360.000000, -933.000000)" fill="#000000"><path d="M388,933 L368,933 C365.791,933 364,934.791 364,937 L364,941 L366,941 L366,937 C366,935.896 366.896,935 368,935 L388,935 C389.104,935 390,935.896 390,937 L390,957 C390,958.104 389.104,959 388,959 L368,959 C366.896,959 366,958.104 366,957 L366,953 L364,953 L364,957 C364,959.209 365.791,961 368,961 L388,961 C390.209,961 392,959.209 392,957 L392,937 C392,934.791 390.209,933 388,933 L388,933 Z M377.343,953.243 C376.953,953.633 376.953,954.267 377.343,954.657 C377.733,955.048 378.367,955.048 378.758,954.657 L385.657,947.758 C385.865,947.549 385.954,947.272 385.94,947 C385.954,946.728 385.865,946.451 385.657,946.243 L378.758,939.344 C378.367,938.953 377.733,938.953 377.343,939.344 C376.953,939.733 376.953,940.367 377.343,940.758 L382.586,946 L361,946 C360.447,946 360,946.448 360,947 C360,947.553 360.447,948 361,948 L382.586,948 L377.343,953.243 L377.343,953.243 Z" id="arrow-right"></path></g></g></g></svg>\')}.btPlusMinus{width:16px}.iconSvgSmall{height:12px}.iconSvgSmaller{height:10px}.iconSvgLarge{height:18px}.iconPlus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve" height="14px"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941h-59.882V57.059c0-4.971-4.029-9-9-9s-9,4.029-9,9v59.882H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h59.882v59.882c0,4.971,4.029,9,9,9s9-4.029,9-9v-59.882h59.882c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconMinus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve" height="14px"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h137.764c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconInfoCircle,.iconInfoSymbol{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 202.978 202.978" style="enable-background:new 0 0 202.978 202.978" xml:space="preserve" height="14px"><g><path fill="black" d="M100.942,0.001C44.9,0.304-0.297,45.98,0.006,102.031c0.293,56.051,45.998,101.238,102.02,100.945c56.081-0.303,101.248-45.978,100.945-102.02C202.659,44.886,157.013-0.292,100.942,0.001z M101.948,186.436c-46.916,0.234-85.108-37.576-85.372-84.492c-0.244-46.907,37.537-85.157,84.453-85.411c46.926-0.254,85.167,37.596,85.421,84.483C186.695,147.951,148.855,186.182,101.948,186.436z M116.984,145.899l-0.42-75.865l-39.149,0.254l0.078,16.6l10.63-0.059l0.313,59.237l-11.275,0.039l0.088,15.857l49.134-0.264l-0.098-15.847L116.984,145.899z M102.065,58.837c9.575-0.039,15.349-6.448,15.3-14.323c-0.254-8.07-5.882-14.225-15.095-14.186c-9.184,0.059-15.173,6.292-15.134,14.362C87.185,52.555,93.028,58.906,102.065,58.837z"/></g></svg>\')}.iconHomeBottomBar{content:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="%23444"><path d="M10,19 L10,14 L14,14 L14,19 C14,19.55 14.45,20 15,20 L18,20 C18.55,20 19,19.55 19,19 L19,12 L20.7,12 C21.16,12 21.38,11.43 21.03,11.13 L12.67,3.6 C12.29,3.26 11.71,3.26 11.33,3.6 L2.97,11.13 C2.63,11.43 2.84,12 3.3,12 L5,12 L5,19 C5,19.55 5.45,20 6,20 L9,20 C9.55,20 10,19.55 10,19 Z"></path></svg>\')}.iconBack{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="%23444"><path d="M20.016 10.998h-12.174l5.611-5.611-1.453-1.403-8.016 8.016 8.016 8.016 1.403-1.403-5.561-5.611h12.174v-2.004z"></path></svg>\')}.iconAllSportSearch{content:url(\'data:image/svg+xml;utf8,<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="%23444"><path d="M2.94 5H4.03L5.99 10.28H4.93L4.48 9H2.46L2 10.28H1L2.94 5ZM4.13 8.04L3.47 6.17L2.8 8.04H4.14H4.13Z"/><path d="M1.49 17.42L4.09 13.99H1.57V13.03H5.41V13.92L2.79 17.35H5.41V18.31H1.49V17.42Z"/><path d="M21.9 19.99C21.76 19.99 21.63 19.96 21.5 19.91C21.37 19.86 21.25 19.77 21.17 19.66L18.17 16.66C17.18 17.4 16.01 17.86 14.79 18C14.52 18.03 14.25 18.05 13.98 18.05C12.94 18.05 11.89 17.81 10.95 17.37C9.75 16.79 8.75 15.9 8.03 14.78C7.32 13.66 6.94 12.36 6.94 11.03C6.94 9.91 7.2 8.82 7.72 7.8C8.23 6.8 8.99 5.94 9.9 5.29C10.81 4.65 11.88 4.22 12.99 4.07C13.31 4.02 13.64 4 13.96 4C14.76 4 15.54 4.14 16.29 4.4C17.36 4.78 18.32 5.41 19.07 6.22C19.82 7.01 20.39 8.01 20.71 9.11C21.02 10.2 21.06 11.35 20.83 12.43C20.63 13.43 20.2 14.39 19.58 15.22L22.59 18.23C22.68 18.32 22.76 18.43 22.82 18.54C22.88 18.68 22.91 18.81 22.91 18.95C22.91 19.07 22.89 19.19 22.84 19.33C22.77 19.49 22.7 19.6 22.61 19.69C22.52 19.78 22.41 19.85 22.28 19.91C22.16 19.96 22.03 19.99 21.88 19.99H21.9ZM13.96 6.04C12.65 6.04 11.36 6.57 10.43 7.5C9.49 8.44 8.97 9.7 8.97 11.03C8.97 12.36 9.49 13.61 10.43 14.56C11.37 15.5 12.63 16.02 13.96 16.02C15.29 16.02 16.55 15.5 17.49 14.56C18.43 13.62 18.95 12.36 18.95 11.03C18.95 9.7 18.43 8.44 17.49 7.5C16.55 6.56 15.29 6.04 13.96 6.04Z"/></svg>\')}.iconMyBets{content:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23444"><path d="M4,8 L8,8 L8,4 L4,4 L4,8 Z M10,20 L14,20 L14,16 L10,16 L10,20 Z M4,20 L8,20 L8,16 L4,16 L4,20 Z M4,14 L8,14 L8,10 L4,10 L4,14 Z M10,14 L14,14 L14,10 L10,10 L10,14 Z M16,4 L16,8 L20,8 L20,4 L16,4 Z M10,8 L14,8 L14,4 L10,4 L10,8 Z M16,14 L20,14 L20,10 L16,10 L16,14 Z M16,20 L20,20 L20,16 L16,16 L16,20 Z"/></svg>\')}.iconBetslipBottom{content:url(\'data:image/svg+xml;utf8,<svg width="18" height="18" viewBox="-5 -4 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="%23444"><path d="M12.8,0 C12.8,0.4416 12.4416,0.8 12,0.8 C11.5584,0.8 11.2,0.4416 11.2,0 L9.6,0 C9.6,0.4416 9.2416,0.8 8.8,0.8 C8.3584,0.8 8,0.4416 8,0 L6.4,0 C6.4,0.4416 6.0416,0.8 5.6,0.8 C5.1584,0.8 4.8,0.4416 4.8,0 L3.2,0 C3.2,0.4416 2.8416,0.8 2.4,0.8 C1.9584,0.8 1.6,0.4416 1.6,0 L0,0 L0,16 L14.4,16 L14.4,0 L12.8,0 Z M8.8,12.8 L2.4,12.8 L2.4,11.2 L8.8,11.2 L8.8,12.8 Z M8.8,9.6 L2.4,9.6 L2.4,8 L8.8,8 L8.8,9.6 Z M12,12.8 L10.4,12.8 L10.4,11.2 L12,11.2 L12,12.8 Z M12,9.6 L10.4,9.6 L10.4,8 L12,8 L12,9.6 Z M12,5.6 L2.4,5.6 L2.4,4 L12,4 L12,5.6 Z"></path></svg>\')}.iconBetslipBottomWhite{content:url(\'data:image/svg+xml;utf8,<svg width="18" height="18" viewBox="-5 -4 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="%23fff"><path d="M12.8,0 C12.8,0.4416 12.4416,0.8 12,0.8 C11.5584,0.8 11.2,0.4416 11.2,0 L9.6,0 C9.6,0.4416 9.2416,0.8 8.8,0.8 C8.3584,0.8 8,0.4416 8,0 L6.4,0 C6.4,0.4416 6.0416,0.8 5.6,0.8 C5.1584,0.8 4.8,0.4416 4.8,0 L3.2,0 C3.2,0.4416 2.8416,0.8 2.4,0.8 C1.9584,0.8 1.6,0.4416 1.6,0 L0,0 L0,16 L14.4,16 L14.4,0 L12.8,0 Z M8.8,12.8 L2.4,12.8 L2.4,11.2 L8.8,11.2 L8.8,12.8 Z M8.8,9.6 L2.4,9.6 L2.4,8 L8.8,8 L8.8,9.6 Z M12,12.8 L10.4,12.8 L10.4,11.2 L12,11.2 L12,12.8 Z M12,9.6 L10.4,9.6 L10.4,8 L12,8 L12,9.6 Z M12,5.6 L2.4,5.6 L2.4,4 L12,4 L12,5.6 Z"></path></svg>\')}.iconSettings{content:url(\'data:image/svg+xml;utf8,<svg width="18" height="18" viewBox="0 0 24 24" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M22 13.2499V10.7501L19.2987 10.2995C19.1106 9.48794 18.7908 8.7298 18.3622 8.04255L19.9552 5.81351L18.1879 4.04591L15.9575 5.63779C15.2702 5.21051 14.5122 4.88946 13.7004 4.70026L13.2501 2H10.7501L10.2996 4.70022C9.48911 4.88942 8.72981 5.21047 8.04257 5.63775L5.81228 4.04587L4.04472 5.81351L5.63776 8.04255C5.20924 8.72865 4.88942 9.48794 4.70138 10.2995L2 10.7501V13.2499L4.70138 13.7005C4.88942 14.5123 5.20924 15.2704 5.63776 15.9576L4.04472 18.1878L5.81224 19.9553L8.04368 18.3625C8.72981 18.7908 9.48907 19.1107 10.2996 19.2987L10.7501 22H13.2501L13.7004 19.2987C14.5109 19.1107 15.2702 18.7908 15.9576 18.3625L18.1879 19.9553L19.9552 18.1878L18.3622 15.9576C18.7908 15.2704 19.1106 14.5111 19.2987 13.7005L22 13.2499ZM12 16.9999C9.23879 16.9999 7.00005 14.7612 7.00005 12C7.00005 9.23877 9.23879 7.00004 12 7.00004C14.7613 7.00004 17 9.23877 17 12C17 14.7612 14.7614 16.9999 12 16.9999Z"></path></svg>\')}.iconMmaximizeEvent{content:url(\'data:image/svg+xml;utf8,<svg width="18" height="18" viewBox="0 0 24 24" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M10.1525 12.8402C10.4308 12.5621 10.8818 12.5621 11.1597 12.8401C11.438 13.1182 11.438 13.5692 11.1598 13.8473L6.43168 18.5756H9.46848C9.86193 18.5756 10.1807 18.8945 10.1807 19.2878C10.1807 19.6811 9.86183 20 9.46848 20H4.71224C4.3188 20 4 19.6811 4 19.2878V14.5317C4 14.1384 4.3188 13.8195 4.71224 13.8195C5.10568 13.8195 5.42448 14.1384 5.42448 14.5317V17.5683L10.1525 12.8402ZM19.2737 4C19.6748 4 19.9999 4.32503 20 4.72615V9.5755C20 9.97653 19.675 10.3017 19.2738 10.3017C18.8727 10.3017 18.5477 9.97653 18.5477 9.5755V6.47918L13.8714 11.1557C13.7295 11.2975 13.5436 11.3684 13.3578 11.3684C13.172 11.3684 12.9861 11.2975 12.8444 11.1558C12.5607 10.8722 12.5607 10.4124 12.8443 10.1288L17.5206 5.45231H14.4243C14.0232 5.45231 13.6981 5.12718 13.6981 4.72615C13.6981 4.32512 14.0232 4 14.4243 4L19.2737 4Z"></path></svg>\')}.iconRedCard{content:url(\'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.2705 2.24467L18.9638 4.57404C20.0308 4.85993 20.6639 5.9566 20.3781 7.02353L16.7546 20.5465C16.4687 21.6134 15.372 22.2466 14.3051 21.9607L5.61176 19.6313C4.54483 19.3455 3.91167 18.2488 4.19755 17.1818L7.82102 3.65888C8.1069 2.59195 9.20358 1.95879 10.2705 2.24467Z" fill="%23dd2727" stroke="%23444" stroke-width="1"/></svg>\')}.iconYellowCard{content:url(\'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.2705 2.24467L18.9638 4.57404C20.0308 4.85993 20.6639 5.9566 20.3781 7.02353L16.7546 20.5465C16.4687 21.6134 15.372 22.2466 14.3051 21.9607L5.61176 19.6313C4.54483 19.3455 3.91167 18.2488 4.19755 17.1818L7.82102 3.65888C8.1069 2.59195 9.20358 1.95879 10.2705 2.24467Z" fill="%23faa200" stroke="%23444" stroke-width="1"/></svg>\')}.iconPenalty{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23444"><path d="M 21,19.069834 C 21,20.689417 16.971719,22 12.00007,22 7.0282807,22 3,20.689417 3,19.069834 3,18.26262 3.9993869,17.530109 5.6225175,17 c 0.245586,0.306722 0.5217654,0.594619 0.825465,0.860452 0.055878,0.0506 0.111757,0.09856 0.1707089,0.143769 0.1117569,0.09592 0.2265872,0.183817 0.3444909,0.269071 0.00615,0.0054 0.00922,0.01067 0.015506,0.01331 0.1054706,0.07734 0.2109413,0.151922 0.3226982,0.221108 0.025425,0.01859 0.052386,0.03549 0.080744,0.0506 0.111757,0.07458 0.2265873,0.143888 0.3444909,0.210436 0.016903,0.01 0.034505,0.01883 0.052665,0.02662 0.093177,0.056 0.1862151,0.103959 0.2824658,0.151922 0.077531,0.04257 0.1582758,0.07986 0.2390203,0.117149 0.1085439,0.05336 0.2203009,0.101201 0.3351312,0.146526 0.089964,0.03993 0.1862151,0.07458 0.2792528,0.111873 0.1427696,0.05324 0.2886124,0.101202 0.434595,0.146527 0.080605,0.02398 0.1582759,0.04796 0.2388806,0.06931 0.111757,0.03189 0.223514,0.06127 0.3383443,0.08789 0.00657,0.0034 0.01397,0.0052 0.021653,0.0053 0.00251,0.002 0.00587,0.003 0.00936,0.0026 0.074458,0.01871 0.1519896,0.03465 0.2296606,0.04796 0.0053,0.0054 0.01383,0.0074 0.02165,0.0054 0.07753,0.01883 0.15632,0.03393 0.235947,0.04521 0.0292,0.0079 0.05937,0.01331 0.08996,0.01607 0.08382,0.01331 0.167636,0.02662 0.254527,0.03729 0.238321,0.03381 0.478739,0.05696 0.719994,0.06919 0.04652,0.0026 0.09304,0.0054 0.136483,0.0054 0.117904,0.0053 0.235808,0.0079 0.353851,0.0079 0.117904,0 0.235807,-0.0026 0.353711,-0.0079 0.04345,0 0.08996,-0.0028 0.136623,-0.0054 0.241255,-0.01223 0.481533,-0.03537 0.719994,-0.06919 0.08689,-0.01067 0.170709,-0.02398 0.254387,-0.03729 0.03059,-0.0028 0.06077,-0.0082 0.0901,-0.01607 0.07949,-0.01127 0.158276,-0.02638 0.235807,-0.04521 0.0078,0.002 0.01634,0 0.02179,-0.0054 0.07753,-0.01331 0.155063,-0.02926 0.229521,-0.04796 0.0035,3.59e-4 0.0068,-6e-4 0.0094,-0.0026 0.0077,-1.2e-4 0.01509,-0.0019 0.02179,-0.0053 0.11483,-0.02662 0.226448,-0.056 0.338205,-0.08789 0.08074,-0.02134 0.158276,-0.04532 0.23902,-0.06931 0.145843,-0.04532 0.291686,-0.09329 0.434455,-0.146527 0.09304,-0.03729 0.189289,-0.07194 0.279253,-0.111873 0.11483,-0.04533 0.226587,-0.09317 0.335271,-0.146526 0.08061,-0.03729 0.161349,-0.07458 0.238881,-0.117149 0.09625,-0.04796 0.189288,-0.09593 0.282465,-0.151922 0.01816,-0.0078 0.0359,-0.01667 0.0528,-0.02662 0.117904,-0.06655 0.232734,-0.135854 0.344352,-0.210436 0.02836,-0.01511 0.05532,-0.03202 0.08074,-0.0506 0.111757,-0.06919 0.217228,-0.143768 0.322698,-0.221108 0.0063,-0.0026 0.0094,-0.0079 0.01565,-0.01331 0.117904,-0.08525 0.232734,-0.173146 0.344352,-0.269071 0.05909,-0.04521 0.11483,-0.09317 0.170708,-0.143769 C 17.855717,17.594619 18.131896,17.306722 18.377622,17 20.000613,17.530109 21,18.26262 21,19.069834 Z M 19.998804,9.6993794 c 0.003,0.1012456 -6.93e-4,0.2022142 -6.93e-4,0.3040136 0,0.1018 -0.003,0.200276 -0.0061,0.301521 v 0.03421 c -0.0035,0.07078 -0.0065,0.141549 -0.01233,0.212325 -0.0061,0.106093 -0.01566,0.219665 -0.02896,0.333238 -0.01469,0.124514 -0.03076,0.235039 -0.04559,0.342795 -0.01469,0.107616 -0.03478,0.227006 -0.06152,0.343071 -0.04559,0.239887 -0.104335,0.477143 -0.176108,0.710659 l -0.0018,0.0065 c -0.02549,0.08241 -0.05113,0.165511 -0.08009,0.248889 -0.0514,0.166204 -0.111262,0.329499 -0.179433,0.489608 -0.02425,0.06025 -0.05196,0.122991 -0.07995,0.186702 l -0.02064,0.04612 c -0.03603,0.08158 -0.07177,0.159694 -0.110847,0.237948 -0.05473,0.118974 -0.119438,0.242103 -0.187747,0.365232 -0.0406,0.07355 -0.08494,0.151107 -0.129552,0.227284 -0.106552,0.180053 -0.206037,0.33393 -0.306076,0.471741 -0.252454,0.366755 -0.53636,0.711074 -0.848256,1.028938 -0.05335,0.05637 -0.110847,0.11288 -0.170566,0.167035 l -0.0025,0.0022 c -0.0036,0.0037 -0.0071,0.0076 -0.01108,0.01108 -0.102118,0.1 -0.216983,0.205538 -0.334896,0.30526 -0.0086,0.0086 -0.01815,0.0169 -0.02771,0.02521 -0.109877,0.09446 -0.221278,0.185871 -0.338499,0.270773 -0.02757,0.02202 -0.05625,0.04266 -0.08591,0.0615 -0.113064,0.08684 -0.228483,0.168004 -0.347505,0.246119 -0.01995,0.01357 -0.04046,0.02618 -0.06166,0.03754 -0.09367,0.06537 -0.190796,0.125899 -0.290835,0.1813 -0.06277,0.03933 -0.146872,0.08643 -0.230284,0.131716 -0.132046,0.06953 -0.24414,0.128254 -0.356096,0.181162 -0.08189,0.04127 -0.167794,0.08006 -0.258273,0.12119 -0.175138,0.07631 -0.326028,0.133933 -0.476503,0.188364 -0.0751,0.03047 -0.163083,0.05789 -0.251761,0.0849 -0.105858,0.03601 -0.220723,0.07202 -0.338637,0.102769 -0.01621,0.0065 -0.03298,0.0115 -0.05016,0.01482 -0.07455,0.02064 -0.147149,0.0385 -0.221694,0.05346 l -0.01067,0.0028 c -0.08508,0.02368 -0.170288,0.04127 -0.25855,0.05817 -0.03187,0.01011 -0.06457,0.0169 -0.09768,0.02036 -0.07939,0.0169 -0.161005,0.02922 -0.240122,0.04086 -0.250514,0.04169 -0.502967,0.07008 -0.75653,0.08532 -0.04683,0.0033 -0.100732,0.0068 -0.153938,0.0068 -0.104601,0.0061 -0.229858,0.0091 -0.35082,0.0091 -0.1211,0 -0.24414,-0.003 -0.367318,-0.0098 -0.0406,-0.0012 -0.09076,-0.0028 -0.14036,-0.0061 -0.249406,-0.01496 -0.49798,-0.0428 -0.744614,-0.08379 -0.08896,-0.01163 -0.171397,-0.02548 -0.250791,-0.04238 -0.04309,-0.0057 -0.08563,-0.01496 -0.127197,-0.0277 -0.07718,-0.01288 -0.153661,-0.02992 -0.229037,-0.05083 l -0.01067,-0.0028 C 10.051126,17.76095 9.9760302,17.74183 9.8971904,17.72009 9.8786234,17.71619 9.8603334,17.71109 9.8427364,17.7043 9.7303669,17.673548 9.620767,17.639754 9.5108901,17.60305 9.4299719,17.578535 9.3418486,17.551112 9.2569122,17.516902 9.1162753,17.46621 8.965385,17.408592 8.8176816,17.344604 8.6997682,17.291142 8.6138619,17.252361 8.5256001,17.20804 8.4200185,17.158179 8.3079245,17.099454 8.1958307,17.040036 8.092466,16.983388 8.0083609,16.937821 7.9281355,16.886159 c -0.09422,-0.0518 -0.1855299,-0.108586 -0.273376,-0.170497 -0.022308,-0.01191 -0.043785,-0.02507 -0.064707,-0.03933 -0.1163892,-0.07632 -0.2318085,-0.157478 -0.3447337,-0.244319 -0.027296,-0.01773 -0.053761,-0.03698 -0.079117,-0.05748 -0.1240099,-0.09238 -0.235411,-0.182547 -0.3462578,-0.277006 -0.00984,-0.008 -0.019398,-0.01676 -0.028266,-0.02576 C 6.6737648,15.973286 6.5591768,15.866501 6.4474986,15.757914 6.3926294,15.7093 6.3311094,15.647666 6.2695894,15.582846 5.9572784,15.26429 5.6732333,14.919279 5.420641,14.551692 5.324897,14.419976 5.225412,14.266237 5.1198304,14.087984 5.0742446,14.011115 5.0300444,13.933553 4.9884768,13.857238 4.9209988,13.735356 4.8564305,13.612088 4.7978202,13.485635 4.7624878,13.415414 4.7267397,13.337298 4.6907145,13.25572 L 4.6702075,13.2096 c -0.028127,-0.06371 -0.055839,-0.126453 -0.081888,-0.191134 -0.068586,-0.161771 -0.1289981,-0.326867 -0.1810961,-0.494732 -0.025495,-0.07382 -0.05099,-0.156924 -0.0769,-0.240303 v -0.0055 c -0.072466,-0.237436 -0.131769,-0.47857 -0.1776319,-0.722474 -0.024941,-0.106231 -0.044893,-0.225621 -0.06152,-0.341548 -0.016904,-0.09944 -0.029929,-0.209832 -0.04226,-0.318141 -0.014687,-0.129916 -0.024248,-0.243488 -0.03076,-0.356368 -0.00554,-0.06399 -0.00859,-0.134764 -0.011916,-0.205539 V 10.29979 C 4.0030483,10.198544 4,10.100068 4,9.9981302 4,9.8963305 4.0030483,9.7978549 4.0062351,9.6966093 v -0.033241 c 0.00305,-0.071052 0.00637,-0.1421041 0.011916,-0.2131561 C 4.0246634,9.3439808 4.034224,9.2305468 4.047387,9.1169744 4.0622128,8.9923217 4.078147,8.8819349 4.0929728,8.7741796 4.1077985,8.6664243 4.127751,8.5471733 4.1544928,8.4311078 4.2002171,8.1910822 4.258966,7.9538266 4.3306007,7.7203106 l 0.0018,-0.00637 C 4.3558184,7.6248821 4.3840844,7.5372097 4.417477,7.4514764 4.4672195,7.2898434 4.5254141,7.130842 4.5919222,6.9754417 4.6163085,6.9150544 4.6440202,6.8523125 4.6720091,6.7886012 l 0.020645,-0.046121 C 4.7286795,6.6609015 4.7642891,6.5827858 4.8033626,6.5046701 4.8582318,6.3855576 4.9228001,6.2624285 4.991248,6.1394379 5.0318457,6.0658928 5.0761844,5.9883311 5.1208003,5.912016 5.2115562,5.7636794 5.3014807,5.6190822 5.3977789,5.4812718 5.4599917,5.3905524 5.5240057,5.3009409 5.5914837,5.2114681 5.8009843,4.928922 6.0302987,4.6616113 6.2776258,4.411475 6.3360975,4.3528882 6.3926294,4.2954095 6.454288,4.2379308 6.5508633,4.1422252 6.6614331,4.04001 6.7955578,3.9268531 c 0.00873,-0.00873 0.018151,-0.017036 0.027712,-0.025346 0.1098769,-0.094459 0.2214165,-0.1857325 0.3386371,-0.2707733 0.027573,-0.022437 0.056393,-0.04349 0.086183,-0.063019 C 7.3607381,3.4810118 7.4761574,3.3997107 7.5953177,3.321595 7.6151317,3.30816 7.6357767,3.295695 7.6568377,3.284338 7.7509191,3.218826 7.8481872,3.1583002 7.9483651,3.1027605 8.0111321,3.0634257 8.0952372,3.0163347 8.1786494,2.9710442 8.3106958,2.9015157 8.422374,2.8427905 8.5344678,2.7898824 8.6166331,2.7486085 8.7022623,2.7098276 8.7924639,2.6689693 8.9681562,2.5923771 9.1190465,2.5347599 9.2695211,2.4803283 9.3446198,2.4498576 9.4327431,2.422434 9.521282,2.395426 9.6272793,2.3594152 9.7420058,2.3234044 9.8599192,2.2926567 c 0.016211,-0.00651 0.032977,-0.011357 0.050158,-0.01482 0.074545,-0.020637 0.1471498,-0.038365 0.2216938,-0.053462 l 0.01067,-0.00277 c 0.08507,-0.023684 0.170289,-0.041274 0.258689,-0.058171 0.03201,-0.010111 0.06498,-0.016897 0.09838,-0.02036 0.07953,-0.016897 0.161005,-0.029224 0.240121,-0.040858 0.25093,-0.041551 0.5038,-0.069805 0.757639,-0.084625 0.04669,-0.00346 0.100593,-0.00679 0.1538,-0.00679 0.05667,-0.00623 0.136064,-0.00623 0.218645,-0.00623 0.09519,-0.00609 0.190657,-0.00609 0.285847,0 0.06166,-2.77e-4 0.140359,-2.77e-4 0.222663,0.00651 0.0273,-5.54e-4 0.0812,0.00249 0.131077,0.00582 0.249959,0.01482 0.498811,0.042797 0.74586,0.083794 0.08896,0.011634 0.171397,0.025485 0.250791,0.042382 0.04309,0.00568 0.08563,0.014958 0.127197,0.0277 0.07676,0.013158 0.15283,0.030332 0.22779,0.051385 l 0.01164,0.00249 c 0.07912,0.015651 0.154216,0.034764 0.233056,0.056648 0.01857,0.00374 0.03672,0.009 0.05445,0.015651 0.112371,0.030748 0.221971,0.064681 0.331848,0.1012457 0.08092,0.024653 0.169042,0.051939 0.253978,0.086149 0.140637,0.050692 0.291527,0.1083094 0.439231,0.1722977 0.11819,0.053601 0.203819,0.092243 0.291804,0.1362869 0.106136,0.050138 0.217953,0.1090019 0.330047,0.1680041 0.103364,0.056648 0.187331,0.1022152 0.267695,0.1538768 0.09436,0.051939 0.185807,0.1088633 0.27393,0.1707741 0.02217,0.011773 0.04351,0.024792 0.06415,0.039058 0.11625,0.076315 0.23167,0.1574778 0.344456,0.2443192 0.02744,0.017728 0.05404,0.036842 0.07939,0.057479 0.12401,0.092382 0.235411,0.1825469 0.346258,0.2770059 0.0098,0.00831 0.01968,0.016897 0.02868,0.025762 0.117497,0.098476 0.232363,0.2052614 0.343764,0.3138477 0.05473,0.048614 0.116389,0.1102483 0.177909,0.1750677 0.246218,0.2494438 0.474424,0.516062 0.682678,0.7979155 0.06623,0.087672 0.130245,0.1778378 0.193982,0.2700808 0.09477,0.1357329 0.184699,0.28033 0.271852,0.4246501 0.04669,0.079085 0.09103,0.1566468 0.1326,0.232962 0.06748,0.1218826 0.132047,0.2451502 0.190518,0.3717419 0.03547,0.070082 0.07122,0.1481981 0.107106,0.2297764 l 0.02064,0.046121 c 0.02799,0.063711 0.0557,0.1264533 0.08189,0.1911342 0.06859,0.1617714 0.128998,0.3268669 0.181096,0.4947325 0.02549,0.073822 0.05099,0.1569239 0.0769,0.2403026 l 0.0015,0.00554 c 0.0726,0.2367016 0.132185,0.4772813 0.178186,0.7206309 0.02494,0.1062318 0.04503,0.2254829 0.06166,0.3415483 0.0169,0.099445 0.02979,0.209832 0.04212,0.3181413 0.01483,0.1299158 0.02425,0.2433497 0.03076,0.3563681 0.0055,0.064265 0.009,0.1353174 0.01206,0.2063695 z M 17.28943,4.8449892 C 17.26297,4.8170112 17.2383,4.7948512 17.21336,4.7701972 h -1.952429 l -0.769554,1.3846141 -0.598435,1.0768605 0.598712,1.076999 0.769554,1.384614 h 2.715471 L 19.04358,7.7736338 C 19.03222,7.7381768 19.02141,7.7021668 19.00949,7.6668481 18.96169,7.5135253 18.908758,7.3686512 18.844467,7.2147744 18.819247,7.1525864 18.794027,7.0966314 18.768677,7.0394297 L 18.747759,6.992339 C 18.716167,6.9200405 18.684438,6.850512 18.649659,6.7809836 18.592989,6.6593779 18.535349,6.5489911 18.473828,6.4384658 18.433785,6.3661672 18.392217,6.2948382 18.350788,6.2230936 18.273473,6.0948399 18.191307,5.9624311 18.10263,5.8357009 18.042357,5.7480285 17.982638,5.6652037 17.92098,5.5825174 17.728245,5.3219934 17.517081,5.0755967 17.28943,4.8449892 Z m -6.98072,-2.0308688 -0.0098,0.00277 c -0.0115,0.00388 -0.02314,0.00706 -0.03506,0.00928 -0.03076,0.00609 -0.06166,0.015097 -0.09242,0.022437 L 9.2757562,4.4624441 9.5244689,4.9098086 10.643883,6.9240571 h 2.71561 l 1.119553,-2.013833 0.248713,-0.44778 -0.894811,-1.6141135 c -0.03076,-0.00734 -0.06166,-0.016343 -0.09242,-0.022438 -0.01192,-0.00235 -0.02355,-0.0054 -0.03505,-0.00928 l -0.0098,-0.00249 c -0.069,-0.019391 -0.137589,-0.032548 -0.209362,-0.046399 -0.02023,-0.00609 -0.04074,-0.010942 -0.06152,-0.014404 -0.01247,-0.00125 -0.02494,-0.00319 -0.03727,-0.00596 -0.07011,-0.015651 -0.142854,-0.026039 -0.212965,-0.036288 -0.233887,-0.039058 -0.469575,-0.065789 -0.706094,-0.079916 -0.03796,-0.00277 -0.07676,-0.00554 -0.115835,-0.00554 -0.09076,-0.00623 -0.154493,-0.00623 -0.218507,-0.00623 -0.05792,-0.00305 -0.09755,-0.00305 -0.132323,-0.00305 -0.03478,0 -0.07427,0 -0.11057,0.00222 -0.08771,8.31e-4 -0.150752,0.00457 -0.215459,0.00582 -0.06471,0.00125 -0.103364,0.00402 -0.139805,0.00637 -0.229038,0.013573 -0.457244,0.039196 -0.683648,0.076731 -0.09408,0.01385 -0.166825,0.024238 -0.236935,0.039889 -0.01233,0.00277 -0.0248,0.00471 -0.03727,0.00596 -0.01039,0.00152 -0.02078,0.00388 -0.03076,0.00706 -0.101009,0.021191 -0.169596,0.034349 -0.238598,0.053739 z M 4.9976217,7.6575688 c -0.015934,0.041274 -0.028266,0.077839 -0.039628,0.1128799 L 6.0266962,9.6932852 H 8.7425828 L 9.5121371,8.3086712 10.110433,7.2316722 9.5117214,6.1548117 8.7423057,4.7701976 H 6.7900154 c -0.025218,0.02493 -0.052929,0.051385 -0.077177,0.075623 C 6.4860179,5.0757352 6.275686,5.3213009 6.0833667,5.5805784 6.020184,5.6652037 5.961158,5.7480285 5.9022706,5.8339003 5.8122076,5.9624311 5.7299038,6.0948399 5.6502326,6.2271102 5.6111591,6.2948382 5.5695915,6.3661672 5.5307951,6.4374962 5.4685823,6.5495451 5.4108034,6.6600705 5.3581511,6.7732274 5.3193547,6.851066 5.2866549,6.9205945 5.2558949,6.9928931 l -0.020922,0.047091 c -0.025218,0.05734 -0.050435,0.1132954 -0.073852,0.1710511 -0.066231,0.1585859 -0.1191603,0.303183 -0.1634992,0.4465336 z M 5.925687,14.198509 c 0.2347183,0.34238 0.4988109,0.663153 0.7889525,0.95941 0.025911,0.02701 0.050435,0.04917 0.075099,0.07382 H 8.7425828 L 9.5121371,13.847127 10.110433,12.770128 9.5117214,11.693268 8.7423057,10.308654 H 6.0266962 l -1.066901,1.918404 c 0.011362,0.03546 0.022169,0.07147 0.034224,0.106786 0.047664,0.153323 0.1005935,0.298197 0.1648847,0.452074 0.025356,0.06205 0.050574,0.118143 0.075791,0.175345 l 0.020922,0.04709 c 0.03173,0.0723 0.06346,0.141826 0.098238,0.211355 0.056532,0.121606 0.1141722,0.231992 0.1756923,0.342518 0.040043,0.07285 0.081611,0.14432 0.1231785,0.215372 0.094774,0.160248 0.1842829,0.297781 0.2729604,0.42091 z m 7.768979,2.989171 0.0098,-0.0028 c 0.0115,-0.0039 0.02328,-0.0069 0.03519,-0.0091 0.03076,-0.0062 0.06152,-0.0151 0.09228,-0.02244 l 0.895781,-1.613974 -0.248713,-0.447365 -1.119553,-2.01411 h -2.71561 l -1.1194141,2.013833 -0.2487127,0.447642 0.8953658,1.614528 c 0.03076,0.0073 0.06152,0.01634 0.09228,0.02244 0.01192,0.0024 0.02369,0.0054 0.03519,0.0093 l 0.0098,0.0025 c 0.06886,0.01939 0.137589,0.03255 0.209224,0.0464 0.02023,0.0061 0.04087,0.01094 0.06166,0.0144 0.01247,0.0012 0.02494,0.0032 0.03727,0.006 0.07011,0.01565 0.142715,0.02604 0.212964,0.03629 0.233748,0.03906 0.469437,0.06579 0.706095,0.07992 0.03783,0.0028 0.07662,0.0055 0.115834,0.0055 0.228206,0.01246 0.456967,0.01246 0.685173,0 0.0557,-2.77e-4 0.0945,-0.003 0.130799,-0.0055 0.229037,-0.01357 0.457243,-0.03906 0.683648,-0.07659 0.09422,-0.01385 0.166824,-0.02424 0.237074,-0.04003 0.01219,-0.0026 0.02466,-0.0046 0.03713,-0.0058 0.01053,-0.0015 0.02078,-0.0039 0.0309,-0.0071 0.100871,-0.02119 0.169596,-0.03449 0.238459,-0.05388 z m 5.311366,-4.84331 c 0.01386,-0.04224 0.02494,-0.07825 0.03672,-0.116896 l -1.066347,-1.91882 h -2.715471 l -0.769554,1.384614 -0.598435,1.07686 0.598712,1.076999 0.769554,1.384614 h 1.956725 c 0.02342,-0.02341 0.04614,-0.04654 0.06831,-0.0698 0.290142,-0.295565 0.554096,-0.615646 0.788952,-0.95664 0.09242,-0.128669 0.181096,-0.266757 0.277118,-0.428667 0.04032,-0.06953 0.08189,-0.140857 0.120546,-0.212325 0.06221,-0.11191 0.12013,-0.222435 0.172782,-0.335592 0.0388,-0.07798 0.07136,-0.147506 0.102118,-0.219805 l 0.02092,-0.04709 c 0.02536,-0.0572 0.05057,-0.113156 0.07399,-0.171051 0.06609,-0.158447 0.119022,-0.303044 0.163361,-0.446395 z"/></svg>\')}.iconScore{content:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23444"><path d="M21.9985051,11.6242242 C22.0023155,11.7507812 21.9976392,11.876992 21.9976392,12.0042416 C21.9976392,12.1314913 21.9938288,12.2545858 21.9900184,12.3811428 L21.9900184,12.4239056 C21.9856885,12.5123744 21.9818781,12.6008432 21.9746038,12.6893119 C21.9669831,12.8219285 21.9550324,12.963894 21.9384054,13.1058595 C21.9200464,13.2615023 21.8999554,13.3996589 21.8814231,13.5343531 C21.8630642,13.6688741 21.8379504,13.818111 21.8045231,13.9631928 C21.7475409,14.2630517 21.6741049,14.5596212 21.5843882,14.8515162 L21.5821366,14.8596533 C21.5502682,14.9626648 21.5182265,15.066542 21.4820281,15.1707655 C21.4177715,15.3785199 21.3429499,15.5826387 21.2577364,15.7827754 C21.2274267,15.8580864 21.192787,15.9365137 21.157801,16.0161529 L21.1319945,16.0738048 C21.0869629,16.1757776 21.0422778,16.2734222 20.9934359,16.3712399 C20.9250226,16.5199574 20.844139,16.6738688 20.7587523,16.8277803 C20.7080053,16.9197116 20.6525818,17.0166636 20.596812,17.1118844 C20.4636226,17.3369517 20.3392662,17.5292977 20.2142171,17.7015608 C19.89865,18.1600055 19.5437668,18.5904035 19.1538976,18.9877338 C19.0872163,19.0581972 19.0153391,19.1288337 18.9406906,19.196527 L18.9375731,19.1992971 C18.93307,19.2039716 18.92874,19.2088192 18.9237172,19.2131474 C18.7960702,19.3381463 18.6524888,19.4700704 18.5050971,19.594723 C18.4943588,19.605457 18.4824082,19.6158448 18.4704575,19.6262324 C18.3331113,19.7443062 18.1938599,19.8585712 18.0473343,19.9646991 C18.0128678,19.9922265 17.9770158,20.0180227 17.9399514,20.0415682 C17.7986216,20.1501199 17.6543475,20.2515733 17.5055702,20.3492179 C17.4806297,20.3661845 17.4549964,20.3819392 17.428497,20.3961358 C17.311415,20.4778525 17.1900031,20.5535098 17.064954,20.6227613 C16.9864952,20.6719298 16.8813639,20.7307936 16.7770986,20.7874066 C16.6120406,20.8743172 16.4719233,20.9477238 16.3319791,21.013859 C16.229619,21.0654513 16.1222361,21.1139274 16.0091377,21.1653466 C15.7902151,21.2607405 15.6016023,21.332762 15.413509,21.4008016 C15.3196356,21.4388899 15.2096547,21.4731694 15.0988078,21.5069295 C14.9664844,21.5519429 14.8229031,21.5969564 14.6755114,21.635391 C14.6552472,21.643528 14.6342902,21.6497606 14.6128137,21.6539157 C14.519633,21.6797119 14.4288771,21.7020455 14.3356965,21.7207434 L14.3223602,21.724206 C14.2160165,21.753811 14.1094996,21.7757983 13.9991724,21.7969201 C13.9593368,21.8095584 13.918462,21.8180418 13.8770676,21.82237 C13.777825,21.8434917 13.6758113,21.8589001 13.5769151,21.873443 C13.2637727,21.9255547 12.9482056,21.9610461 12.6312528,21.9800902 C12.5727119,21.9842453 12.5053378,21.9885735 12.4388297,21.9885735 C12.308065,21.9961912 12.1514938,22 12.0002917,22 C11.8489165,22 11.6951165,21.9961912 11.5411433,21.9877079 C11.4903962,21.9861497 11.4276985,21.9842453 11.3656935,21.9800902 C11.0539367,21.9613923 10.7432191,21.9265934 10.4349263,21.8753473 C10.323733,21.8608045 10.2206801,21.8434917 10.1214375,21.82237 C10.0675729,21.8152717 10.014401,21.8036721 9.96244155,21.7877442 C9.86597016,21.7716432 9.77036474,21.7503484 9.67614491,21.724206 L9.66280862,21.7207434 C9.56391247,21.7011799 9.47003901,21.6772881 9.37148924,21.6501069 C9.34828066,21.6452593 9.32541854,21.6388536 9.30342235,21.6303702 C9.16295859,21.5919357 9.02595879,21.5496923 8.88861262,21.5038132 C8.78746486,21.4731694 8.67731079,21.4388899 8.5711403,21.3961271 C8.3953441,21.332762 8.20673125,21.2607405 8.02210193,21.180755 C7.87471028,21.1139274 7.76732735,21.0654513 7.65700009,21.0100501 C7.52502308,20.9477238 7.38490569,20.8743172 7.24478834,20.800045 C7.11558249,20.7292354 7.01045117,20.672276 6.91016939,20.6076991 C6.7923946,20.5429489 6.67825697,20.4719662 6.56844932,20.3945776 C6.54056442,20.3796885 6.51371868,20.3632413 6.48756574,20.3454091 C6.34207924,20.2500151 6.19780514,20.1485618 6.05664858,20.0400101 C6.02252854,20.0178496 5.98944767,19.9937847 5.95775239,19.9681616 C5.80274002,19.8526848 5.66348866,19.739978 5.52493008,19.6219042 C5.512633,19.6118628 5.50068233,19.6009557 5.48959765,19.5897023 C5.34220595,19.4666078 5.19897102,19.3331256 5.05937328,19.1973927 C4.99078679,19.1366245 4.91388678,19.0595822 4.83698677,18.978558 C4.44659797,18.580362 4.09154165,18.1490985 3.77580129,17.6896149 C3.65612131,17.5249695 3.53176502,17.3327967 3.39978796,17.10998 C3.34280575,17.0138936 3.28755551,16.9169415 3.23559605,16.8215476 C3.15124855,16.6691943 3.07053816,16.5151098 2.9972753,16.3570433 C2.95310979,16.2692671 2.90842463,16.1716225 2.86339309,16.0696497 L2.83775976,16.0119978 C2.80260051,15.9323586 2.76796087,15.8539313 2.7353996,15.7730802 C2.64966652,15.5708659 2.57415205,15.3644965 2.50902952,15.1546646 C2.47716105,15.0623869 2.44529258,14.9585097 2.41290455,14.8542863 L2.41290455,14.8473611 C2.32232187,14.5506185 2.24819303,14.2492015 2.19086441,13.9443218 C2.15968873,13.8115321 2.13474819,13.6622952 2.1139644,13.5173864 C2.09283424,13.3930801 2.07655359,13.2550965 2.06113896,13.1197098 C2.04277997,12.9573151 2.03082926,12.8153496 2.02268893,12.6742497 C2.015761,12.5942642 2.01195067,12.5057955 2.00779391,12.4173267 L2.00779391,12.3747371 C2.00381034,12.24818 2,12.1250855 2,11.9976628 C2,11.8704132 2.00381034,11.7473187 2.00779391,11.6207616 L2.00779391,11.5792107 C2.01160425,11.4903957 2.015761,11.4015807 2.02268893,11.3127657 C2.03082926,11.1799759 2.04277997,11.0381835 2.05923377,10.896218 C2.07776599,10.7404022 2.09768379,10.6024186 2.11621601,10.4677245 C2.13474819,10.3330304 2.15968873,10.1839666 2.19311598,10.0388847 C2.25027141,9.73885268 2.32370745,9.44228324 2.41325092,9.15038824 L2.41550253,9.14242434 C2.44477302,9.03110258 2.48010545,8.92151212 2.52184621,8.81434545 C2.58402438,8.61230425 2.65676763,8.41355251 2.73990278,8.21930214 C2.77038566,8.14381802 2.80502531,8.06539069 2.84001132,7.98575154 L2.86581789,7.92809965 C2.91084938,7.82612686 2.95536136,7.72848227 3.00420323,7.63083769 C3.07278972,7.48194701 3.15350012,7.32803561 3.23906001,7.17429733 C3.28980712,7.08236598 3.34523055,6.98541391 3.40100035,6.89001999 C3.5144452,6.70459919 3.62685083,6.52385279 3.7472236,6.35158977 C3.82498959,6.23819046 3.90500718,6.12617619 3.98935468,6.01433507 C4.25123038,5.66115253 4.53787344,5.32701413 4.84703224,5.01434373 C4.92012191,4.94111028 4.99078679,4.86926186 5.06785998,4.79741348 C5.18857913,4.67778155 5.32679132,4.55001255 5.4944472,4.40856641 C5.5053587,4.39765929 5.51713613,4.38727157 5.52908684,4.37688385 C5.66643301,4.2588101 5.80585757,4.14471828 5.95238328,4.03841728 C5.98684969,4.01037041 6.02287492,3.98405485 6.06011255,3.95964372 C6.20092273,3.85126513 6.34519683,3.74963858 6.4941473,3.65199404 C6.51891461,3.63520052 6.54472118,3.61961896 6.5710473,3.60542238 C6.6886489,3.52353252 6.81023403,3.44787529 6.93545635,3.37845065 C7.01391513,3.32928215 7.11904646,3.27041835 7.22331176,3.2138053 C7.38836969,3.12689467 7.52796743,3.0534881 7.66808478,2.98735296 C7.77079135,2.93576059 7.87782783,2.88728456 7.99057988,2.83621162 C8.21019522,2.74047142 8.39880806,2.66844989 8.58690135,2.60041032 C8.68077476,2.56232201 8.79092882,2.5280425 8.90160249,2.49428244 C9.03409912,2.44926898 9.17750724,2.40425552 9.32489893,2.36582093 C9.34516311,2.35768387 9.36612008,2.3516244 9.38759666,2.34729619 C9.48077733,2.32149998 9.57153319,2.29933951 9.66471381,2.28046849 L9.67805006,2.27700592 C9.78439379,2.2474009 9.8909107,2.22541359 10.0014111,2.20429186 C10.0414199,2.19165348 10.0826411,2.18317014 10.1243819,2.17884194 C10.2237976,2.15772026 10.3256382,2.14231181 10.4245344,2.12776896 C10.7381964,2.0758304 11.0542831,2.0405121 11.3715822,2.02198736 C11.42995,2.01765915 11.4973241,2.01350406 11.5638322,2.01350406 C11.6346703,2.00571324 11.7339129,2.00571324 11.837139,2.00571324 C11.9561262,1.99809559 12.0754598,1.99809559 12.194447,2.00571324 C12.2715202,2.00536701 12.3698967,2.00536701 12.4727765,2.0138503 C12.5068965,2.01315779 12.5742706,2.01696659 12.636622,2.02112168 C12.9490716,2.03964646 13.2601356,2.07461848 13.568948,2.12586458 C13.6801412,2.14040739 13.7831942,2.15772026 13.8824368,2.17884194 C13.9363014,2.1859402 13.9894733,2.19753983 14.0414327,2.21346767 C14.1373845,2.22991491 14.2324703,2.25138287 14.3261706,2.27769843 L14.3407193,2.28081477 C14.4396154,2.3003783 14.5334889,2.32427004 14.6320386,2.3516244 C14.6552472,2.35629884 14.6779362,2.36287775 14.7001056,2.37118793 C14.8405693,2.40962252 14.9775691,2.45203904 15.1149153,2.49774501 C15.216063,2.5285619 15.3262171,2.56266824 15.4323876,2.60543104 C15.6081838,2.66879617 15.7967966,2.7408177 15.9814259,2.82080314 C16.129164,2.88780395 16.2362005,2.93610687 16.3461814,2.99116177 C16.4788512,3.05383438 16.6186222,3.12741407 16.7587395,3.20116687 C16.8879454,3.27197654 16.9929035,3.32893587 17.0933585,3.39351286 C17.2113065,3.45843613 17.3256173,3.52959204 17.4357713,3.60698053 C17.4634831,3.6216965 17.4901556,3.63797058 17.5159621,3.65580285 C17.6612754,3.75119677 17.8055495,3.85265016 17.9465329,3.96120186 C17.9808261,3.98336234 18.0140802,4.00725408 18.0457755,4.03305028 C18.2007879,4.14852709 18.3400393,4.26123388 18.4785978,4.37930767 C18.4908949,4.3896954 18.503192,4.40042935 18.5144498,4.41150959 C18.6613219,4.5346041 18.8049032,4.66808634 18.9441546,4.80381924 C19.0125679,4.86458737 19.0896411,4.94162968 19.1665411,5.02265391 C19.4743144,5.33445868 19.7595718,5.6677314 20.0198887,6.02004831 C20.1026775,6.12963876 20.182695,6.24234555 20.2623662,6.35764924 C20.3808338,6.52731541 20.4932395,6.70806172 20.6021811,6.88846184 C20.6605489,6.98731834 20.7159724,7.08427041 20.7679318,7.17966433 C20.8522794,7.33201758 20.9329897,7.4861021 21.0060794,7.64434171 C21.0504181,7.73194485 21.0951032,7.82958943 21.1399616,7.93156222 L21.1657681,7.98921407 C21.2007542,8.06885331 21.2353938,8.1472806 21.2681283,8.22813171 C21.3538614,8.43034603 21.4293758,8.63671543 21.4944983,8.84654737 C21.5263668,8.93882499 21.5582353,9.04270221 21.5906234,9.14692566 L21.5925285,9.15385081 C21.6832844,9.44972778 21.7577596,9.75045232 21.8152614,10.0546394 C21.8464371,10.1874291 21.8715509,10.3364929 21.8923346,10.4815748 C21.9134648,10.6058812 21.9295723,10.7438647 21.9449869,10.8792514 C21.9635191,11.0416461 21.9752966,11.1834385 21.9834369,11.3247115 C21.9903648,11.4050432 21.9946948,11.4938583 21.9985051,11.5826733 L21.9985051,11.6242242 Z M18.6117872,5.55623652 C18.5787064,5.52126455 18.5478771,5.49356396 18.5167014,5.46274703 L16.0761654,5.46274703 L15.1142225,7.19351463 L14.3661794,8.5395902 L15.1145689,9.88583893 L16.0765117,11.6166065 L19.4708504,11.6166065 L20.8044767,9.21704282 C20.7902744,9.17272187 20.7767649,9.12770837 20.7618699,9.08356058 C20.7021165,8.89190711 20.6359548,8.71081447 20.5555908,8.51846852 C20.5240687,8.4407337 20.4925466,8.37078976 20.4608514,8.29928757 L20.4346985,8.24042381 C20.3952093,8.15005066 20.3555469,8.06314003 20.3120741,7.97622945 C20.2412361,7.82422243 20.1691856,7.68623887 20.0922856,7.5480822 C20.0422313,7.45770899 19.9902719,7.36854771 19.9384856,7.27886706 C19.841841,7.11854987 19.7391344,6.95303884 19.6282876,6.79462611 C19.5529463,6.68503562 19.4782979,6.58150468 19.4012247,6.47814681 C19.160306,6.15249175 18.8963519,5.84449583 18.6117872,5.55623652 Z M9.88588792,3.0176505 L9.87359088,3.02111303 C9.85921542,3.02596067 9.84466677,3.0299426 9.82977174,3.03271266 C9.79132172,3.04033032 9.7526985,3.05158368 9.71424852,3.06075953 L8.59469526,5.07805509 L8.90558606,5.63726075 L10.3048544,8.15507138 L13.6993663,8.15507138 L15.0988078,5.63778015 L15.4096986,5.07805509 L14.2911845,3.06041325 C14.2527346,3.05123744 14.2141113,3.03998409 14.1756613,3.03236643 C14.1607663,3.0294232 14.1462176,3.0256144 14.1318422,3.02076679 L14.1195451,3.0176505 C14.0332924,2.99341244 13.9475593,2.97696524 13.8578426,2.95965237 C13.8325557,2.95203471 13.8069223,2.9459752 13.7809426,2.94164699 C13.7653548,2.94008884 13.7497669,2.93766502 13.7343523,2.93420244 C13.646714,2.91463891 13.5557849,2.90165425 13.4681466,2.88884275 C13.175788,2.84002043 12.8811779,2.80660661 12.5855285,2.78894746 C12.5380722,2.78548488 12.4895767,2.78202231 12.4407348,2.78202231 C12.32729,2.77423153 12.2476188,2.77423153 12.1676012,2.77423153 C12.0952044,2.77042268 12.0456697,2.77042268 12.0021969,2.77042268 C11.9587242,2.77042268 11.9093627,2.77042268 11.8639848,2.77319274 C11.7543503,2.77423153 11.6755451,2.77890602 11.5946615,2.78046416 C11.513778,2.78202231 11.4654556,2.78548488 11.4199045,2.78842806 C11.1336079,2.80539469 10.8483504,2.83742349 10.5653445,2.88434138 C10.447743,2.90165425 10.3568139,2.91463891 10.2691756,2.93420244 C10.253761,2.93766502 10.2381731,2.94008884 10.2225852,2.94164699 C10.2095954,2.94355137 10.1966055,2.94649459 10.1841353,2.95047652 C10.0578738,2.97696524 9.97214065,2.99341244 9.88588792,3.0176505 Z M3.24702715,9.07196095 C3.22710935,9.12355328 3.21169472,9.16925925 3.19749244,9.21306085 L4.53337027,11.6166065 L7.92822852,11.6166065 L8.89017139,9.88583893 L9.63804131,8.5395902 L8.88965178,7.19351463 L7.9278821,5.46274703 L5.48751927,5.46274703 C5.45599717,5.49391019 5.42135753,5.52697778 5.39104783,5.55727532 C5.10752236,5.84466895 4.84460749,6.15162612 4.60420837,6.47572303 C4.52522998,6.58150468 4.45144752,6.68503562 4.37783829,6.79237541 C4.26525947,6.95303884 4.16237971,7.11854987 4.06279072,7.28388778 C4.01394885,7.36854771 3.96198939,7.45770899 3.91349389,7.54687028 C3.8357279,7.68693139 3.76350421,7.82508811 3.69768889,7.96653424 C3.64919339,8.06383255 3.60831861,8.15074317 3.56986863,8.24111633 L3.54371568,8.29998009 C3.51219359,8.37165539 3.48067153,8.44159938 3.45140105,8.51379404 C3.36861228,8.71202638 3.30245058,8.89277274 3.24702715,9.07196095 Z M4.40710878,17.2481367 C4.70050658,17.6761108 5.03062235,18.0770769 5.39329944,18.4473992 C5.42568747,18.4811593 5.45634359,18.5088599 5.48717285,18.5396768 L7.92822852,18.5396768 L8.89017139,16.8089092 L9.63804131,15.4626605 L8.88965178,14.1165848 L7.9278821,12.3858173 L4.53337027,12.3858173 L3.19974405,14.7838229 C3.21394628,14.8281438 3.22745576,14.8731573 3.24252398,14.9173051 C3.30210416,15.1089586 3.3682659,15.2900512 3.44862987,15.4823972 C3.48032512,15.5599588 3.51184721,15.6300759 3.54336931,15.7015781 L3.56952221,15.7604418 C3.60918459,15.850815 3.64884701,15.9377256 3.69231973,16.0246362 C3.7629846,16.1766432 3.83503506,16.3146268 3.91193511,16.4527835 C3.96198939,16.5438492 4.01394885,16.6331836 4.06590832,16.7219986 C4.18437589,16.9223085 4.29626192,17.0942253 4.40710878,17.2481367 Z M14.1183327,20.9846002 L14.1306298,20.9811376 C14.1450052,20.97629 14.1597271,20.9724812 14.1746222,20.9697111 C14.2130721,20.9619203 14.2515222,20.9508401 14.2899722,20.9416643 L15.4096986,18.9241956 L15.0988078,18.3649899 L13.6993663,15.8473524 L10.3048544,15.8473524 L8.90558606,18.3646437 L8.59469526,18.9241956 L9.7139021,20.9423568 C9.75235213,20.9515326 9.79080211,20.962786 9.82925214,20.9704037 C9.84414716,20.9733469 9.85886904,20.9771557 9.87324446,20.9820033 L9.88554154,20.9851196 C9.97162105,21.0093576 10.0575274,21.0258049 10.1470709,21.0431177 C10.1723578,21.0507354 10.1981643,21.0567949 10.2241441,21.0611231 C10.2397319,21.0626813 10.2553197,21.065105 10.2707344,21.0685676 C10.3583727,21.0881312 10.4491286,21.1011158 10.53694,21.1139274 C10.8291254,21.1627496 11.1237356,21.1961635 11.4195581,21.2138226 C11.4668412,21.2172852 11.5153367,21.2207478 11.5643518,21.2207478 C11.8496093,21.2363294 12.1355596,21.2363294 12.420817,21.2207478 C12.4904427,21.2204015 12.5389382,21.2169389 12.5843162,21.2138226 C12.8706128,21.196856 13.1558702,21.1650003 13.4388761,21.1180824 C13.5566509,21.1007696 13.6474068,21.0877849 13.7352183,21.0680482 C13.7504597,21.0647588 13.7660476,21.062335 13.7816354,21.0607768 C13.7947985,21.0588724 13.8076151,21.0559292 13.8202586,21.0519473 C13.9463469,21.0254586 14.0322532,21.0088382 14.1183327,20.9846002 Z M20.7575399,14.9304629 C20.7748598,14.8776586 20.7887156,14.8326451 20.8034374,14.7843423 L19.470504,12.3858173 L16.0761654,12.3858173 L15.1142225,14.1165848 L14.3661794,15.4626605 L15.1145689,16.8089092 L16.0765117,18.5396768 L18.522417,18.5396768 C18.5516875,18.510418 18.580092,18.4815056 18.6078037,18.4524199 C18.9704808,18.0829633 19.3004234,17.6828629 19.5939943,17.25662 C19.7095175,17.0957834 19.8203644,16.9231741 19.9403908,16.7207867 C19.9907914,16.6338761 20.0427509,16.5447148 20.0910732,16.4553804 C20.1688392,16.3154924 20.2412361,16.1773357 20.3070514,16.0358896 C20.3555469,15.9384181 20.3962485,15.8515075 20.4346985,15.7611343 L20.4608514,15.7022706 C20.4925466,15.6307684 20.5240687,15.5608244 20.5533392,15.4884567 C20.6359548,15.2903974 20.7021165,15.109651 20.7575399,14.9304629 Z"></path></svg>\')}.iconSubstitution{content:url(\'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="%23444" xmlns="http://www.w3.org/2000/svg"><path d="M11.2338 15.9636C11.9171 15.9636 12.2511 16.8237 11.7804 17.3174L7.54426 21.7611C7.24059 22.0796 6.76991 22.0796 6.46624 21.7611L2.23008 17.3174C1.74421 16.8237 2.07825 15.9636 2.7615 15.9636H5.47932V9.59272C5.47932 8.71672 6.16257 8 6.99766 8C7.83274 8 8.516 8.71672 8.516 9.59272V15.9636H11.2338ZM12.7662 8.0364C12.0829 8.0364 11.7489 7.17634 12.2196 6.68259L16.4557 2.23891C16.7594 1.92036 17.2301 1.92036 17.5338 2.23891L21.7699 6.68259C22.2558 7.17634 21.9218 8.0364 21.2385 8.0364H18.5207V14.4073C18.5207 15.2833 17.8374 16 17.0023 16C16.1673 16 15.484 15.2833 15.484 14.4073V8.0364H12.7662Z"/></svg>\')}.iconCorner{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23444"><path d="M 12.968113,18.923077 C 12.664546,13.993395 10.186702,11.744052 5.2432432,11.916506 v 7.006571 z m 7.493425,0 C 21.311207,18.923077 22,19.61187 22,20.461538 22,21.311207 21.311207,22 20.461538,22 H 4 C 2.8954305,22 2,21.104569 2,20 V 3.6216216 C 2,2.7260247 2.7260247,2 3.6216216,2 4.5172185,2 5.2432432,2.7260247 5.2432432,3.6216216 V 9.9172511 C 11.281817,9.7450722 14.625279,12.836748 14.970285,18.923077 Z"/></svg>\')}#accaBoostRestrictionPath li{margin-bottom:5px;line-height:14px}.btInfo{justify-self:end}.iconInfoSymbol{opacity:60%;width:12px;margin-right:5px}.btCarousel{width:32%;margin-bottom:5px;margin-right:5px}.btGreen{background-color:var(--sbtColorGreen);color:#fff}@media (hover:hover){.btGreen:hover{background-color:#00b9bd}}.btGreen:active{background-color:#00b9bd}#btMinimizeAll:active,#btZoomInOut:active{background:#1e1e1e}.accHeading:active,.btNativeOthers:active,.moreLess:active{background-color:#ccc}.btOrange{background-color:#cc8936;color:#fff}@media (hover:hover){.btOrange:hover{background-color:#f9a133}}.btOrange:active{background-color:#f9a133}.moreLess{width:100%;border:none;cursor:pointer;padding:4px;margin-top:2px;margin-bottom:2px;color:#444}.btNativeOthers{border:none;cursor:pointer;padding:6px 2px 6px 2px;margin:2px}.width95Percent{width:95%}.displayFlex{display:flex}.flex1{flex:1}.inactivated{pointer-events:none;opacity:40%}.sbtSummary{display:list-item;cursor:pointer;user-select:none}.detailsExpanded{margin-top:5px}.scrollableListBox{margin-block:0;max-height:100px;overflow-y:auto;padding-left:25px;padding-bottom:10px;padding-right:5px}.accaBoostSelCount{width:135px;display:inline-block}</style>';

        sportsbookTool.innerHTML = htmlContent;
    }

    // function isUnsecureHTTP() {
    //     if (location.protocol === "http:") {
    //         return true
    //     } else {
    //         return false
    //     };
    // }

    // function checkIfObgStateIsFrozen() {
    //     const obgStateFrozenMessage = getElementById("obgStateFrozenMessage");
    //     if (Object.isFrozen(getState().sportsbook)) {
    //         show(obgStateFrozenMessage);
    //     } else { hide(obgStateFrozenMessage) };
    // }

    function getIsItSportsbookPage() {
        if (IS_OBGNAVIGATIONSUPPORTED_EXPOSED
            || IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED
            || IS_OBGSTARTUP_EXPOSED) {
            return true;
        }
        if (IS_SPORTSBOOK_IN_IFRAME) {
            isSportsbookInIframeWithoutObgTools = true;
            return true;
        }
        return false;
    }

    function removeExistingSportsbookTool() {
        const sbt = getElementById("sportsbookTool");
        if (sbt !== null) {
            sbt.remove();
        }
    }

    function checkEnabledFeatures() {
        const sportsbookToolScript = getElementById("sportsbookToolScript");
        if (sportsbookToolScript == undefined) {
            return;
        }
        const sportsbookToolFeatures = sportsbookToolScript.getAttribute("data-features");
        if (sportsbookToolFeatures === null) {
            removeFeature("sbToolsStreamMappingHelper");
        }
    }

    function getIsB2BIframeOnly() {
        try {
            return obgClientEnvironmentConfig.startupContext.config.core.experiment["isSBB2BEnabled"];
        } catch {
            try {
                return !!obgClientEnvironmentConfig.startupContext.contextId;
            } catch {
                try {
                    return getState().b2b !== undefined;
                } catch { return false; }
            }
        }
    }

    function isDefined(entityNameAsString) {
        const parts = entityNameAsString.split('.');
        let current = window;
        for (const part of parts) {
            if (typeof current[part] === "undefined") {
                return false;
            }
            current = current[part];
        }
        return true;
    }

    function getIsSportsbookInIframe() {
        if (!!getIframe()) {
            iframeURL = getIframe().src;
            return true;
        }
        return false;
    }

    function getIframe() {
        let iframes = document.body.getElementsByTagName("iframe");
        for (let iframe of iframes) {
            if (iframe.src.includes("playground") && iframe.src.includes("/stc-")) {
                return iframe;
            }
        }
    }

    function getIframeEnv(url) {
        if (url.includes(".alpha.")) {
            return "alpha";
        }
        if (url.includes(".test.")) {
            return "test";
        }
        if (url.includes(".qa.")) {
            return "qa";
        }
        return "prod";
    }

    function getB2X() {
        if (IS_MFE) {
            return "mFE";
        }
        if (IS_B2B_IFRAME_ONLY || IS_SPORTSBOOK_IN_IFRAME) {
            return "B2B";
        }
        return "B2C";
    }

    function getStaticContextId() {
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            return getState().b2b.userContext.staticContextId;
        } return obgClientEnvironmentConfig.startupContext.contextId.staticContextId;
    }

    function getUserContextId() {
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            return getState().b2b.userContext.userContextId;
        } return obgClientEnvironmentConfig.startupContext.contextId.userContextId;
    }

    function getSbVersion() {
        if (IS_SPORTSBOOK_IN_IFRAME) {
            return "Open SB iframe to get it";
        }
        versionNumber = getSbVersionNumber();
        if (versionNumber == null) {
            if (IS_MFE) {
                return "Expose xSbState to get it";
            }
            return "Data not available";
        }
        if (IS_B2B_IFRAME_ONLY) {
            return "SBB2B-FE-" + versionNumber;
        }
        return "OBGA-" + versionNumber;
    }

    function getSbVersionNumber() {
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            return getState().appContext.version;
        }
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.appContext.version;
        }
        if (!IS_MFE && IS_NODECONTEXT_EXPOSED) {
            return nodeContext.version;
        }
        return null;
    }

    function getDeviceType() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) { return obgClientEnvironmentConfig.startupContext.device.deviceType; }
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) { return getState().appContext.device.deviceType; }
        if (IS_NODECONTEXT_EXPOSED) { return nodeContext.deviceType; }
        return "couldn't get";
    }

    function getIsAnyEssentialObjectExposed() {
        return IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED || IS_OBGSTATE_OR_XSBSTATE_EXPOSED || IS_OBGSTARTUP_EXPOSED;
    }

    function getDeviceExperience() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) { return obgClientEnvironmentConfig.startupContext.device.deviceExperience; }
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) { return getState().appContext.device.deviceExperience; }
        if (IS_NODECONTEXT_EXPOSED) { return nodeContext.deviceExperience; }
        return null;
    }

    function getEnvironmentToDisplay() {
        let environmentToDisplay;
        try {
            environmentToDisplay = SB_ENVIRONMENT.toUpperCase();
        } catch {
            environmentToDisplay = "DEV";
        }
        if (environmentToDisplay == "DEV") {
            if (window.location.port == '') {
                environmentToDisplay = "DEMO"
            }
        }


        if (getIsBleSource()) {
            return environmentToDisplay + ", using ALPHA API";
        }
        return environmentToDisplay;
    }

    function getSbEnvironment() {
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            return getState().appContext.environment;
        }

        if (IS_MFE) {
            return getIframeEnv(document.getElementsByTagName("sb-xp-sportsbook")[0]["sb-api-base-url"]);
        }

        if (IS_B2B_IFRAME_ONLY) {
            return obgClientEnvironmentConfig.startupContext.appContext.environment;
        }

        if (IS_B2B_WITH_HOST_PAGE) {
            return getIframeEnv(iframeURL);
        }

        //B2C
        if (IS_OBGSTARTUP_EXPOSED) {
            return obgStartup.config.appSettings.environment;
        }

        return undefined;
    }

    function getHostPageEnvironment() {
        // if (IS_B2B_WITH_HOST_PAGE) {
        //     return obgClientEnvironmentConfig.startupContext.appContext.environment;
        // }
        // if (IS_MFE) {
        //     return obgStartup.config.appSettings.environment;
        // }
        return obgStartup.config.appSettings.environment;
    }

    function getCurrentRouteName() {
        return getState().route.current.name;
    }

    function getIsBleSource() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.activeExperiments.includes("bleSource");
        }
        return false;
    }

    function getIsSGPUsed() {
        let config;
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            config = obgClientEnvironmentConfig.startupContext.config;
        } else if (IS_OBGSTARTUP_EXPOSED) {
            config = obgStartup.config;
        } else {
            return false;
        }
        let marketsUsingSingleGameParlay = config.sportsbookUi.betBuilder.marketsUsingSingleGameParlay;
        let languageCode = config.core.market.languageCode;
        for (let market of marketsUsingSingleGameParlay) {
            if (market == languageCode) {
                return true;
            }
        }
        return false;
    }

    function getCulture() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.appContext.device.culture;
        }
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            return getState().appContext.device.culture;
        }
        if (IS_OBGSTARTUP_EXPOSED) {
            return obgStartup.config.core.culture.defaultCultureCode;
        }
        return null;
    }

    function getLanguageCode() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.config.core.market.languageCode;
        }
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) { return getState().market.currentMarket.languageCode; }
        if (IS_NODECONTEXT_EXPOSED) { return nodeContext.detectedMarket.code; }
        if (IS_OBGSTARTUP_EXPOSED) {
            return obgStartup.config.core.market.languageCode;
        }
        return null;
    }

    function getAreAllSelectionsInObgState(marketSelectionIds) {
        for (let id of marketSelectionIds) {
            if (!getState().sportsbook.selection.selections[id]) {
                return false;
            }
        }
        return true;
    }

    function isBonusSystemUs() {
        return (BRAND_NAME == "firestormus" || BRAND_NAME == "betsafeco");
    }

    function getBrandFriendlyName(brandName) {
        let brands = {
            arcticbet: "Arcticbet",
            b10: "B10",
            bets10: "Bets10",
            betsafe: "Betsafe COM",
            betsafeco: "Betsafe CO",
            betsafeestonia: "Betsafe EE",
            betsafelatvia: "Betsafe LV",
            betsafeon: "Betsafe ON",
            betsafepe: "Betsafe PE",
            betsson: "Betsson COM",
            btsarbacity: "Betsson ArBaCity",
            betssonarbacity: "Betsson ArBaCity",
            btsarba: "Betsson ArBa (Province)",
            betssonarba: "Betsson ArBa (Province)",
            betssonarcb: "Betsson ArCb",
            betssonco: "Betsson CO",
            betssoncz: "Betsson CZ",
            betssondk: "Betsson DK",
            betssones: "Betsson ES",
            betssongr: "Betsson GR",
            betssonmx: "Betsson MX",
            betssonnl: "Betsson NL",
            betssonnlb2b: "Betsson NL",
            betssonpe: "Betsson PE",
            bethard: "Bethard",
            betsmith: "Betsmith",
            betsolid: "Betsolid",
            firestorm: "Firestorm",
            firestormus: "Firestorm US",
            guts: "Guts",
            hommerson: "Hommerson",
            hovarda: "Hovarda",
            ibet: "Ibet",
            inkabet: "Inkabet",
            jetbahis: "Jetbahis",
            krooncasino: "KroonCasino",
            localhost: "Localhost",
            mobilbahis: "Mobilbahis",
            nordicbet: "Nordicbet",
            nordicbetdk: "Nordicbet DK",
            oranjecasino: "OranjeCasino",
            rexbet: "Rexbet",
            rizk: "Rizk",
            sandbox: "Sandbox",
            spelklubben: "Spelklubben"
        }
        if (brands[brandName] == undefined) {
            return brandName;
        }
        return brands[brandName];
    }

    function getBrandName() {
        let brandName = "localhost";
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            brandName = obgClientEnvironmentConfig.startupContext.brandName.toLowerCase();
        }
        else if (IS_OBGSTARTUP_EXPOSED) {
            brandName = obgStartup.config.appSettings.brandName.toLowerCase();
        }
        if (brandName === "nordicbet" && IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            if (getState()?.sportsbook?.features?.arcticbet) {
                brandName = "arcticbet";
            }
        }
        return brandName;
    }


    function log(content) {
        console.log("SPORTSBOOKTOOL SAYS: " + content);
    }

    function getBrowserVersion() {
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = "Unknown";
        var fullVersion = '' + parseFloat(nVer);
        var verOffset, ix;

        // In Chrome, the true version is after "Chrome" 
        if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset + 7).replace(".0.0.0", "");
        }
        // In Safari, the true version is after "Safari" or after "Version" 
        else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
            browserName = "Safari";
            fullVersion = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf("Version")) != -1)
                fullVersion = nAgt.substring(verOffset + 8);
        }
        // In Firefox, the true version is after "Firefox" 
        else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
            browserName = "Firefox";
            fullVersion = nAgt.substring(verOffset + 8);
        }

        // trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(";")) != -1)
            fullVersion = fullVersion.substring(0, ix);
        if ((ix = fullVersion.indexOf(" ")) != -1)
            fullVersion = fullVersion.substring(0, ix);

        return (browserName + " " + fullVersion);
    }

    function initHeader() {
        const btMinimizeClosed = getElementById("btMinimizeClosed");
        if (!IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            hide(btMinimizeClosed);
        }
        getElementById("sportsbookToolVersion").innerText = SB_TOOL_VERSION;
    }

    function removeFeature(...features) {
        for (var feature of features) {
            try {
                getElementById(feature).remove();
            } catch { }
        }
    }

    function initAccordions() {
        for (var accHead of accHeadCollection) {
            accHead.addEventListener("click", toggleAccordion, false);
        }

        if (IS_SPORTSBOOK_IN_IFRAME) {
            limitFeatures("iframe");
        } else if (!IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            if (IS_MFE || IS_B2B_IFRAME_ONLY) {
                limitFeatures("xSbState");
            } else {
                limitFeatures("obgState");
            }
        }
        else if (!IS_OBGRT_EXPOSED) {
            limitFeatures("obgRt");
        } else if (Object.isSealed(getState().sportsbook)) {
            limitFeatures("sealStore");
        }

        if (DEVICE_EXPERIENCE != "Native") {
            removeFeature("sbToolsNative");
        }

        var limitedFunctionsMessageText;

        function limitFeatures(limitationCause) {
            switch (limitationCause) {
                case "obgState":
                    limitedFunctionsMessageText = "obgState not exposed";
                    removeStateFeatures();
                    break;
                case "xSbState":
                    limitedFunctionsMessageText = "xSbState not exposed";
                    removeStateFeatures();
                    break;
                case "iframe":
                    limitedFunctionsMessageText = "Sportsbook is in iframe";
                    removeStateFeatures();
                    break;
                case "obgRt":
                    limitedFunctionsMessageText = "obgRt not exposed";
                    removeObgRtFeatures()
                    break;
                case "sealStore":
                    limitedFunctionsMessageText = "sealStore is enabled";
                    removeStateFeatures();
                    break;
            }

            function removeStateFeatures() {
                removeFeature(
                    "sbToolsEvent",
                    "sbToolsMarket",
                    "sbToolsCreateMarket",
                    "sbToolsSelection",
                    "sbToolsBonuses",
                    "sbToolsBanners",
                    "sbToolsSegments",
                    "sbToolsNative"
                );
            }

            function removeObgRtFeatures() {
                removeFeature(
                    "sbToolsEvent",
                    "sbToolsBonuses",
                    "sbToolsMarket",
                    "sbToolsCreateMarket",
                    "sbToolsSelection",
                    "sbToolsBanners"
                );
            }

            const limitedFunctionsMessage = getElementById("limitedFunctionsMessage");

            limitedFunctionsMessage.innerText = "Features limited as " + limitedFunctionsMessageText;
        }

        // if (IS_B2B || ENVIRONMENT === "TEST (Local)") {
        //     const noB2Belements = getElementsByClassName("noB2B");
        //     for (elem of noB2Belements) {
        //         elem.classList.add("visibilityHidden");
        //     }
        // }

        function toggleAccordion() {
            var accClass = this.parentNode.className;
            for (let i = 0; i < accCollection.length; i++) {
                if (accCollection[i] !== this.parentNode) {
                    accCollection[i].className = "accordion closed";
                }
            }
            if (accClass == "accordion closed") {
                this.parentNode.className = "accordion open";
            }
        }
    }

    function initBrands() {
        if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            brands = getBrands();
        }
    }

    window.initContext = () => {
        initContext();
    }

    function initContext() {
        stopPolling();
        const obgStateAndRtSection = getElementById("obgStateAndRtSection");
        const disableSealStoreSection = getElementById("disableSealStoreSection");
        const openIframeSection = getElementById("openIframeSection");
        const notMatchingIframeSection = getElementById("notMatchingIframeSection");
        const openIframeRow = getElementById("openIframeRow");
        // const btOpenNotMatchingIframe = getElementById("btOpenNotMatchingIframe");
        const btOpenMatchingIframe = getElementById("btOpenMatchingIframe");
        const btOpenFullPageWithMatchingIframe = getElementById("btOpenFullPageWithMatchingIframe");
        const notMatchingIframeEnvSpan = getElementById("notMatchingIframeEnvSpan");
        const iframeUrlValue = getElementById("iframeUrlValue");
        const postMessageRow = getElementById("postMessageRow");


        if (IS_B2B_IFRAME_ONLY) {
            show(postMessageRow);
        } else {
            hide(postMessageRow);
        }

        if (IS_SPORTSBOOK_IN_IFRAME) {
            previousIframeURL = undefined;
            show(openIframeSection);
            hide(obgStateAndRtSection);
            intervalIdForPolling = setInterval(listenerForIframeURL, POLLING_INTERVAL);
            intervalIdsForPolling.push(intervalIdForPolling);
        } else if (!IS_OBGSTATE_OR_XSBSTATE_EXPOSED || !IS_OBGRT_EXPOSED) {
            show(obgStateAndRtSection);
            hide(openIframeSection);
        } else {
            if (Object.isSealed(getState().sportsbook)) {
                show(disableSealStoreSection);
            } else {
                hide(disableSealStoreSection);
            }
            hide(openIframeSection);
        }

        var deviceType = getElementById("deviceType");
        if (DEVICE_TYPE === "Desktop" || DEVICE_EXPERIENCE === null) {
            deviceType.innerText = DEVICE_TYPE;
        } else {
            deviceType.innerText = DEVICE_TYPE + " " + DEVICE_EXPERIENCE;
        }

        getElementById("environment").innerText = ENVIRONMENT_TO_DISPLAY;
        getElementById("brandName").innerText = BRAND_NAME_WITH_LANGUAGECODE;
        document.getElementById("B2BorB2C").innerText = B2X === "B2C" ? ` (B2C - ${nodeContext.appHash})` : ` (${B2X})`;
        getElementById("browserVersion").innerText = BROWSER_VERSION;
        getElementById("obgVersion").innerText = SB_VERSION;

        function listenerForIframeURL() {
            iframeURL = getIframe().src;
            if (iframeURL == previousIframeURL) {
                return;
            } else {
                handleIfIframeEnvNotMatching();
                iframeUrlValue.setAttribute("href", iframeURL);
                iframeUrlValue.innerText = iframeURL;
                previousIframeURL = iframeURL;
            }
        }

        function handleIfIframeEnvNotMatching() {
            let hostEnv = getHostPageEnvironment();

            // let iframeEnv = getIframeEnv(iframeURL);
            if (SB_ENVIRONMENT != hostEnv) {
                hide(openIframeRow);
                show(notMatchingIframeSection);
                btOpenMatchingIframe.innerText = hostEnv.toUpperCase() + " iframe";
                btOpenFullPageWithMatchingIframe.innerText = hostEnv.toUpperCase() + " full";
                notMatchingIframeEnvSpan.innerText = " " + SB_ENVIRONMENT.toUpperCase() + " ";
            } else {
                show(openIframeRow);
                hide(notMatchingIframeSection);
            }
        };

        // window.replaceIframeSrc = () => {
        //     url = new URL(replaceEnvInIframeURL(iframeURL));
        //     // params.push(ENABLE_OBGSTATE, ENABLE_OBGRT);
        //     getIframe().src = url;
        // }

        // window.replaceIframeSrc = () => {
        //     IS_BLE ? reloadPageWithSearchParams([new URLParam("sbIframeAlpha", 1)]) : reloadPageWithSearchParams([new URLParam("sbIframeTest", 1)]);
        // }

        const loginState = getElementById("loginState");
        intervalIdForPolling = setInterval(listenerForLoginState, POLLING_INTERVAL);
        intervalIdsForPolling.push(listenerForLoginState);
        var isUserLoggedIn, previousIsUserLoggedIn;
        function listenerForLoginState() {
            isUserLoggedIn = getIsUserLoggedIn();
            if (isUserLoggedIn == previousIsUserLoggedIn) {
                return;
            }
            previousIsUserLoggedIn = isUserLoggedIn;
            if (isUserLoggedIn) {
                loginState.innerText = " / Logged In";
            } else {
                loginState.innerText = " / Logged Out";
            }
        }
    }

    window.toggleInfo = (infoDiv) => {
        var info = getElementById(infoDiv);
        if (info.classList.contains("hide")) {
            show(info);
        } else {
            hide(info);
        };
    }


    window.reloadPageWithFeature = (feature) => {
        reloadPageWithFeature(feature);
    }
    function reloadPageWithFeature(feature) {
        let params = [];
        let messageRowId;
        switch (feature) {
            case "disableCache":
                params.push(new URLParam("forceNonCacheQueryString", generateGuid()));
                messageRowId = "disableCacheRow";
                break;
            case "disableSSR":
                params.push(new URLParam("ssr", 0));
                messageRowId = "disableSSRRow";
                break;
            case "exposeObgStateAndRt":
                params.push(EXPOSE_OBGSTATE, EXPOSE_OBGRT);
                disableSealStoreIfNeeded();
                messageRowId = "obgStateAndRtRow";
                break;
            case "disableSealStore":
                params.push(TURN_SEALSTORE_OFF);
                messageRowId = "disableSealStoreRow";
                break;
            case "openMatchingIframe":
                url = new URL(replaceEnvInIframeURL(getCleanIframeURL(iframeURL)) + getPathAndParamsFromSportsbookURL(window.location.href));
                params.push(EXPOSE_OBGSTATE, EXPOSE_OBGRT);
                disableSealStoreIfNeeded();
                messageRowId = "openMatchingIframeRow";
                break;
            case "openIframe":
                url = new URL(getCleanIframeURL(iframeURL) + getPathAndParamsFromSportsbookURL(window.location.href));
                params.push(EXPOSE_OBGSTATE, EXPOSE_OBGRT);
                disableSealStoreIfNeeded();
                messageRowId = "openIframeRow";
                break;
            case "hostPageWithMatchingIframe":
                IS_BLE ? params.push(new URLParam("sbIframeAlpha", 1)) : params.push(new URLParam("sbIframeTest", 1));
                params.push(EXPOSE_OBGSTATE, EXPOSE_OBGRT);
                messageRowId = "replaceIframeSrcRow";
                break;
            case "disableGeoFencing":
                // https://edgebravo.corpsson.com/pages/viewpage.action?spaceKey=ACOBA&title=HTML5+geofencing%2C+geofencing+bypass
                let paramValue;
                IS_BLE ? paramValue = "b1ccAR1gW0f8" : paramValue = "gfo";
                params.push(new URLParam("experiments", paramValue));
                messageRowId = "disableGeoFencingRow";
                break;
        }
        function disableSealStoreIfNeeded() {
            if (SB_ENVIRONMENT == "test") {
                params.push(TURN_SEALSTORE_OFF);
            };
        }
        reloadAnimation(messageRowId);
        reloadPageWithSearchParams(params);
    }

    // function getIframeUrlHasPathOrParams(iframeURL) {
    //     return (iframeURL.includes("?") || iframeURL.split('/').length - 1 >= 5);
    // }

    // function getFullIframeUrlWithPathAndParams(iframeURL) {
    //     if (getIframeUrlHasPathOrParams(iframeURL)) {
    //         return iframeURL;
    //     } else {
    //         return iframeURL + window.location.pathname + window.location.search;
    //     }
    // }

    function getCleanIframeURL(iframeURL) {
        let fifthSlashIndex = iframeURL.indexOf('/', iframeURL.indexOf('/', iframeURL.indexOf('/', iframeURL.indexOf('/', iframeURL.indexOf('/') + 1) + 1) + 1) + 1);
        let questionMarkIndex = iframeURL.indexOf('?');

        if (fifthSlashIndex !== -1) {
            return iframeURL.substring(0, fifthSlashIndex);
        } else if (questionMarkIndex !== -1) {
            return iframeURL.substring(0, questionMarkIndex);
        }
        return iframeURL; // Return the whole string if neither condition is met
    }

    function getPathAndParamsFromSportsbookURL(url) {
        let parts = url.split('/');
        if (parts.length >= 6) {
            return '/' + parts.slice(5).join('/');
        } else {
            let queryIndex = url.indexOf('?');
            if (queryIndex !== -1) {
                return url.substring(queryIndex);
            } else {
                return "";
            }
        }
    }

    function reloadAnimation(messageRowId) {
        let row = getElementById(messageRowId);
        displayInGreen(row);
        row.innerHTML = "Reloading...";
    }

    function getSlugByEventId(eventId) {
        return getState().sportsbook.event.events[eventId].slug;
    }

    function getSlugByRoute(route) {
        routes = getRoutes();
        return routes[route].slug;
    }

    function getRoutes() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.routes;
        }
        return obgStartup.routes;
    }

    function replaceEnvInIframeURL(iframeURL) {
        let iframeEnv = getIframeEnv(iframeURL);
        if (iframeEnv == "prod") {
            return iframeURL.replace("-cf.", "-cf.alpha.");
        }
        if (iframeEnv == "qa") {
            return iframeURL.replace("-cf.qa.", "-cf.test.");
        }
        return iframeEnv;
    }

    function reloadPageWithSearchParams(urlParams) {
        if (url == undefined) {
            url = new URL(window.location.href);
        }
        for (let param of urlParams) {
            url.searchParams.delete(param.key);
            url.searchParams.append(param.key, param.value);
        }
        log("opening: " + url);
        window.open(url, "_self");
    }

    function getBetSlipReducer() {
        return JSON.parse(localStorage.getItem("betslipReducer"));
    }

    var closedAccordionsVisible = true;
    window.toggleClosedAccordionsVisibility = () => {
        const icon = getElementById("iconMinimizeClosed");
        if (closedAccordionsVisible) {
            closedAccordionsVisible = false;
            icon.classList.replace("iconMinimize", "iconMaximize");
        } else {
            closedAccordionsVisible = true;
            icon.classList.replace("iconMaximize", "iconMinimize");
        }

        for (i = 0; i < accHeadCollection.length; i++) {
            accHead = accHeadCollection[i];
            accHead.parentNode.classList.contains("closed") && !accHead.classList.contains("hide") ?
                hide(accHead) :
                show(accHead);
        }
    }

    window.closePopup = () => {
        stopPolling();
        sportsbookTool.remove();
        var sportsbookToolScript = getElementById("sportsbookToolScript");
        if (sportsbookToolScript !== null) {
            sportsbookToolScript.remove();
        }
    }

    var isAppWindowSmall = false;
    window.zoomInOut = () => {
        const icon = getElementById("iconZoomInOut");
        if (!isAppWindowSmall) {
            sportsbookTool.classList.add("scaledTo70percent");
            icon.classList.replace("iconZoomOut", "iconZoomIn");
            isAppWindowSmall = true;
        } else {
            sportsbookTool.classList.remove("scaledTo70percent");
            icon.classList.replace("iconZoomIn", "iconZoomOut");
            isAppWindowSmall = false;
        }
    }

    function getFriendlyDateFromIsoDate(isoDate) {
        let dateObj = new Date(isoDate);
        let day = dateObj.getDate();
        let month = (dateObj.toLocaleString('default', { month: 'short' })).toUpperCase();
        let year = dateObj.getFullYear();
        let hours = ("0" + dateObj.getHours()).slice(-2);
        let minutes = ("0" + dateObj.getMinutes()).slice(-2);
        return day + " " + month + " " + year + ", " + hours + ":" + minutes;
    }

    function initTouchDependent() {
        const isTouchBrowser = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);

        if (isTouchBrowser || (IS_B2B_IFRAME_ONLY && !IS_SPORTSBOOK_IN_IFRAME && !(DEVICE_TYPE == "Desktop"))) {
            if (!(/Mobi|Android|iPad|X11|Macintosh/i.test(navigator.userAgent))) {
                windowMoverForMouse();
            } else {
                windowMoverForTouch();
            }
        } else {
            windowMoverForMouse();
        }
    }

    // function initTouchDependent() {
    //     const sportsbookToolContent = getElementById("sportsbookToolContent");

    //     if (('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) ||
    //         (IS_B2B && !IS_SPORTSBOOK_IN_IFRAME && DEVICE_TYPE !== "Desktop" && !navigator.userAgentData.mobile)) {
    //         sportsbookToolContent.classList.add("mobileUi");
    //         windowMoverForTouch();
    //     } else {
    //         windowMoverForMouse();
    //     }
    // }

    function windowMoverForTouch() {
        var box = getElementById("sportsbookTool");
        var diffX;
        var diffY;

        box.addEventListener("touchstart", function (e) {
            let touchLocation = e.targetTouches[0];
            let boxStartLocationX = parseInt(box.style.left) || 0;
            let boxStartLocationY = parseInt(box.style.top) || 0;
            let touchStartLocationX = touchLocation.pageX || 0;
            let touchStartLocationY = touchLocation.pageY || 0;
            diffX = touchStartLocationX - boxStartLocationX;
            diffY = touchStartLocationY - boxStartLocationY;
        });

        box.addEventListener("touchmove", function (e) {
            // grab the location of touch
            var touchLocation = e.targetTouches[0];
            e.stopPropagation();
            e.preventDefault();

            // assign box new coordinates based on the touch.
            box.style.left = touchLocation.pageX - diffX + 'px';
            box.style.top = touchLocation.pageY - diffY + 'px';
        })
    }

    function windowMoverForMouse() {
        dragElement(sportsbookTool);

        function dragElement(elmnt) {
            var pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0;
            if (getElementById(elmnt.id + "Header")) {
                /* if present, the header is where you move the DIV from:*/
                getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
            } else {
                /* otherwise, move the DIV from anywhere inside the DIV:*/
                elmnt.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                /* stop moving when mouse button is released:*/
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }

    function getUrlParam(param) {
        var params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
        if (params.hasOwnProperty(param)) {
            return params[param];
        } return undefined;
    }

    function getJiraTemplate() {
        var template =
            "## Test Results\n" +
            "| |**Desktop**|**Mobile**|\n" +
            "|---|---|---|\n" +
            "|**Test**|**Passed**|**Passed**|" + "\n" +
            "|**Env**|" + ENVIRONMENT_TO_DISPLAY + "|" + ENVIRONMENT_TO_DISPLAY + "|\n" +
            "|**Brand(s)**|" + BRAND_NAME_WITH_LANGUAGECODE + "|" + BRAND_NAME_WITH_LANGUAGECODE + "|\n" +
            "|**Browser(s)**|" + BROWSER_VERSION + "|" + BROWSER_VERSION + "|\n" +
            "|**Version**|" + SB_VERSION + "|" + SB_VERSION + "|\n" +
            "|**Proof**| | |";
        return (template);
    }

    function generateGuid() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    function getDeepLink() {
        var deepLink = new URL(window.location.href);
        deepLink.searchParams.delete("exposeObgState");
        deepLink.searchParams.delete("exposeObgRt");

        var betSlipReducer = getBetSlipReducer();
        if (betSlipReducer === null) {
            return deepLink;
        }

        var selections = Object.values(betSlipReducer.selections);
        if (selections === null || selections.length === 0) {
            return deepLink;
        }

        var numberOfSelections = selections.length;
        for (var i = 0; i < numberOfSelections; i++) {
            appendDeepLinkParam("betslip_eventId_" + (i + 1), selections[i].eventId);
            appendDeepLinkParam("betslip_marketId_" + (i + 1), selections[i].marketId);
            appendDeepLinkParam("betslip_selectionId_" + (i + 1), selections[i].selectionId);
        }

        var couponType = betSlipReducer.couponType.toLowerCase();
        appendDeepLinkParam("type", couponType);
        if (couponType === "single") {
            for (var i = 0; i < numberOfSelections; i++) {
                appendDeepLinkParam("stake_" + (i + 1), Object.values(betSlipReducer.stakes.single)[i]);
            }
        } else if (couponType === "combi") {
            appendDeepLinkParam("stake_1", betSlipReducer.stakes.combi);
        }
        return deepLink;

        function appendDeepLinkParam(name, value) {
            if (value !== undefined) {
                deepLink.searchParams.delete(name);
                deepLink.searchParams.append(name, String(value));
            }
        }
    }

    function getRouteKey() {
        return getState().sportsbook.sportCatalog.routeKey;
    }

    function getPostMessage() {
        let href = window.location.href;
        let origin = window.location.origin;
        // var staticContextId = obgClientEnvironmentConfig.startupContext.contextId.staticContextId;
        let staticContextId = getStaticContextId();
        // var userContextId = obgClientEnvironmentConfig.startupContext.contextId.userContextId;
        let userContextId = getUserContextId();
        let externalUrl = href.replace(origin + "/", "").replace(staticContextId + "/", "").replace(userContextId, "");
        return `postMessage(
    {
        type: "routeChangeIn",
        payload: {
            externalUrl: "${externalUrl}"
        }
    });`
    }

    window.copyToClipboard = (param) => {
        let text;
        switch (param) {
            case "brand":
                text = BRAND_NAME_WITH_LANGUAGECODE;
                break;
            case "obgVersion":
                text = SB_VERSION;
                break;
            case "browserVersion":
                text = BROWSER_VERSION;
                break;
            case "jiraTemplate":
                text = getJiraTemplate();
                break;
            case "postMessage":
                text = getPostMessage();
                break;
            case "deepLink":
                text = getDeepLink();
                break;
            case "eventId":
                text = eventId;
                break;
            case "accaInsName":
                text = accaInsName;
                break;
            case "accaInsId":
                text = accaInsId;
                break;
            case "profitBoostId":
                text = profitBoostId;
                break;
            case "freeBetId":
                text = freeBetId;
                break;
            case "priceBoostId":
                text = priceBoostId;
                break;
            case "marketTemplateId":
                text = marketTemplateId;
                break;
            case "marketId":
                text = marketId;
                break;
            case "selectionId":
                text = selectionId;
                break;
            case "segmentGuid":
                text = segmentGuid;
                break;
            case "segmentName":
                text = segmentName;
                break;
            case "iframeURL":
                text = iframeURL;
                break;
            case "marketTemplateTags":
                text = marketTemplateTagsToDisplay;
                break;
            case "participantId":
                text = selectedParticipantId;
                break;
        }
        navigator.clipboard.writeText(text);
    }

    function inactivateAllAccordions() {
        for (var accHead of accHeadCollection) {
            inactivate(accHead);
        }
    }

    function activateAllAccordions() {
        for (var accHead of accHeadCollection) {
            activate(accHead);
        }
    }

    // window.lockEvent = () => {
    //     var checkBox = getElementById("chkLockEventForSbToolsEvent");
    //     var detectedOrLockedRow = getElementById("detectedOrLockedRowForSbToolsEvent");
    //     labelRow = getElementById("eventLabelForSbToolsEvent");

    //     if (checkBox.checked) {
    //         lockedEventId = eventId;
    //         detectedOrLockedRow.innerHTML = "&#128274; Locked event:"
    //         labelRow.classList.add("displayInGreenGlow");
    //         stopPolling();
    //         initSbToolsEvent("eventLocked");
    //         inactivateAllAccordions();
    //     } else {
    //         lockedEventId = undefined;
    //         detectedOrLockedRow.innerText = "Detected event:";
    //         labelRow.classList.remove("displayInGreenGlow");
    //         initSbToolsEvent();
    //         activateAllAccordions();
    //     }
    // }

    function getEventIdByMarketId(marketId) {
        return getState().sportsbook.eventMarket.markets[marketId].eventId;
    }

    function getEventIdBySelectionId(selectionId) {
        return getEventIdByMarketId(getMarketIdBySelectionId(selectionId));
    }

    function getSelectionsByMarketId(marketId) {
        return getState().sportsbook.selection.marketMap[marketId];
    }

    function getEventHasBetBuilder(eventId) {
        return !!getState().sportsbook.event.events[eventId]?.tags?.bc_bb_available;
    }

    function getMarketIdBySelectionId(selectionId) {
        let id = getState().sportsbook.selection.selections[selectionId].marketId;
        if (id != "") {
            return id;
        }
        let marketMap = getState().sportsbook.selection.marketMap;
        for (let key in marketMap) {
            if (key !== "" && marketMap[key].includes(selectionId)) {
                return key;
            }
        }
    }

    function getMarketIdByEventIdAndMarketTemplateId(eventId, marketTemplateId) {
        try {
            return getState().sportsbook.eventMarket.marketMap[eventId][marketTemplateId][0];
        } catch { return undefined; }
    }

    // function getMarketLabelByCategoryIdAndMarketTemplateId(categoryId, marketTemplateId){

    // }



    window.initSbToolsMarket = () => {
        initSbToolsMarket();
    }

    // hack
    // var savedEventId;
    // end of hack

    function initSbToolsMarket(scope) {
        stopPolling();
        previousMarketId = undefined;
        const marketStateButtons = getElementsByClassName("btSetMarketState");
        const marketStateButtonsSection = getElementById("setMarketStateButtonsSection");
        labelRow = getElementById("labelRowForSbToolsMarket");
        const lockMarketSection = getElementById("lockMarketSection");
        const marketIdField = getElementById("marketIdForSbToolsMarket");
        const marketTemplateIdField = getElementById("marketTemplateIdForSbToolsMarket");
        const marketTemplateTagsField = getElementById("marketTemplateTagsForSbToolsMarket");
        const marketFeatures = getElementById("marketFeatures");
        var marketTemplateTags;
        const carouselButtonsDiv = getElementById("carouselButtonsDiv");
        const addToCarouselSection = getElementById("addToCarouselSection");
        const addToCarouselErrorMessage = getElementById("addToCarouselErrorMessage");

        const isCashoutAvailableSection = getElementById("isCashoutAvailableSection");
        const chkIsCashoutAvailable = getElementById("chkIsCashoutAvailable");
        const isBetBuilderAvailableSection = getElementById("isBetBuilderAvailableSection");
        const chkIsBetBuilderAvailable = getElementById("chkIsBetBuilderAvailable");
        const isBetDistributionAvailableSection = getElementById("isBetDistributionAvailableSection");
        const chkIsBetDistributionAvailable = getElementById("chkIsBetDistributionAvailable");

        const fdHelpText = getElementById("fdHelpText");
        const fdBetGroupDescription = getElementById("fdBetGroupDescription");

        scope === "marketLocked" ?
            intervalIdForPolling = setInterval(listenerForMarketIfMarketLocked, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForMarket, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        const eventLabelForDetectedMarket = getElementById("eventLabelForDetectedMarket");
        const marketLabelForDetectedMarket = getElementById("marketLabelForDetectedMarket");
        const messageForSbToolsMarket = getElementById("messageForSbToolsMarket");
        const labelsForDetectedMarketAndEvent = getElementById("labelsForDetectedMarketAndEvent");
        const MAIN_LINE_MARKET_TEMPLATE_TAGS = ["118", "119", "120"];


        function listenerForMarket() {
            marketId = getLastMarketIdFromBetslip();
            if (marketId === previousMarketId) {
                if (marketId !== null) {
                    listenerForMarketIfMarketLocked();
                }
                return;
            } else {
                previousMarketId = marketId;
                clearAddToCarouselErrorMessage();
            }

            if (marketId === null) {
                displayInRed(labelRow);
                show(messageForSbToolsMarket);
                hide(marketFeatures, lockMarketSection, labelsForDetectedMarketAndEvent, addToCarouselSection);
                messageForSbToolsMarket.innerText = NOT_FOUND;
            } else {
                show(marketFeatures, lockMarketSection, labelsForDetectedMarketAndEvent, addToCarouselSection);
                hide(messageForSbToolsMarket);
                previousMarketId = marketId;
                eventLabelForDetectedMarket.innerText = getEventDisplayLabel(getLastEventIdFromBetslip());
                marketLabelForDetectedMarket.innerHTML = "&boxur;&HorizontalLine; " + getMarketLabel(marketId);
                displayInGreen(labelRow);
                initAddHelpTextAndDescriptionSection();
                eventId = getEventIdByMarketId(marketId);

                if (IS_OBGRT_EXPOSED) {
                    show(lockMarketSection, marketStateButtonsSection);
                    listenerForMarketIfMarketLocked();
                } else {
                    hide(lockMarketSection, marketStateButtonsSection);
                }

                initMarketPropertyCheckboxes();
                marketIdField.innerText = marketId;
                marketTemplateId = getMarketTemplateId(marketId);
                marketTemplateIdField.innerText = marketTemplateId;
                marketTemplateTags = getMarketTemplateTags(marketId);
                if (marketTemplateTags.length > 0) {
                    marketTemplateTagsToDisplay = getArrayAsAlphaBeticalCommaSeparatedString(marketTemplateTags);
                } else { marketTemplateTagsToDisplay = "---"; }

                for (let mlTag of MAIN_LINE_MARKET_TEMPLATE_TAGS) {
                    if (marketTemplateTagsToDisplay.includes(mlTag)) {
                        marketTemplateTagsToDisplay = marketTemplateTagsToDisplay.replaceAll(mlTag, mlTag + " [Main Line]");
                    }
                }

                marketTemplateTagsField.innerText = marketTemplateTagsToDisplay;
            }
        }

        function initAddHelpTextAndDescriptionSection() {
            populateHelpText();
            populateBetGroupDescription();
        }

        function populateHelpText() {
            fdHelpText.innerText = getState().sportsbook.eventMarket.markets[marketId].helpText;
            fdHelpText.addEventListener("input", () => {
                trimString(fdHelpText, 255)
            }, false);
        }

        function populateBetGroupDescription() {
            fdBetGroupDescription.innerText = getState().sportsbook.eventMarket.markets[marketId].betGroupDescription;
            fdBetGroupDescription.addEventListener("input", () => {
                trimString(fdBetGroupDescription, 255)
            }, false);
        }

        window.setHelpText = () => {
            getState().sportsbook.eventMarket.markets[marketId].helpText = fdHelpText.textContent;
            triggerMarketChangeDetection();
        }

        window.setBetGroupDescription = () => {
            getState().sportsbook.eventMarket.markets[marketId].betGroupDescription = fdBetGroupDescription.textContent;
            triggerMarketChangeDetection();
        }

        function clearAddToCarouselErrorMessage() {
            addToCarouselErrorMessage.innerText = "";
        }

        function initMarketPropertyCheckboxes() {
            chkIsCashoutAvailable.checked = !!getState().sportsbook.eventMarket.markets[marketId].isCashoutAvailable;
            chkIsBetBuilderAvailable.checked = getState().sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state === 1;
            chkIsBetDistributionAvailable.checked = isBetDistributionAvailable(marketId);

            switch (getEventPhase(eventId)) {
                case "Live":
                    inactivate(isBetDistributionAvailableSection);
                    activate(isCashoutAvailableSection, isBetBuilderAvailableSection);
                    break;
                case "Prematch":
                    [2, 3].includes(getColumnLayout(marketId)) ?
                        activate(isBetDistributionAvailableSection) :
                        inactivate(isBetDistributionAvailableSection);

                    activate(isCashoutAvailableSection, isBetBuilderAvailableSection);
                    break;
                case "Over":
                    inactivate(isCashoutAvailableSection, isBetDistributionAvailableSection, isBetBuilderAvailableSection);
                    break;
            }
            // }

            function isBetDistributionAvailable(marketId) {
                let selections = getSelectionsByMarketId(marketId);
                for (selection of selections) {
                    if (getState().sportsbook.betDistribution.statistics.selections.hasOwnProperty(selection)) {
                        return true;
                    }
                } return false;
            }
        }

        function checkIfPageIsValidToAddToCarousel() {
            isPageValidForCarousel = getIsPageValidForCarousel();

            if (isPageValidForCarousel == previousIsPageValidForCarousel) {
                return;
            } else {
                previousIsPageValidForCarousel = isPageValidForCarousel;
            }
            if (isPageValidForCarousel) {
                activate(carouselButtonsDiv);
                clearAddToCarouselErrorMessage();
            } else {
                inactivate(carouselButtonsDiv);
                addToCarouselErrorMessage.innerText = "Not supported on this page";
            }
        }


        // const marketPropertiesSection = getElementById("marketPropertiesSection");

        let previousMarketStatus = null;
        function listenerForMarketIfMarketLocked() {
            checkIfPageIsValidToAddToCarousel();
            let marketStatus = getState().sportsbook.eventMarket.markets[marketId].status;
            if (marketStatus == previousMarketStatus) {
                return;
            } else {
                previousMarketStatus = marketStatus;
            }
            for (let button of marketStateButtons) {
                if (marketStatus === button.id.replace("btSetMarketState", "")) {
                    inactivate(button);
                } else {
                    activate(button);
                }
            }
        }

        window.toggleMarketProperty = (property) => {
            switch (property) {
                case "cashoutAvailable":
                    toggleIsCashoutAvailable();
                    break;
                case "betBuilderAvailable":
                    toggleIsBetBuilderAvailable();
                    break;
                case "betDistributionAvailable":
                    toggleIsBetDistributionAvailable();
                    break;
            }
            // if (isCategoryInUsFormat(getCategoryIdByEventId(eventId))) {
            //     triggerMarketChangeDetection();
            // } else {
            //     triggerChangeDetection(eventId, 0)
            // }
            triggerMarketChangeDetection();
        }

        function toggleIsCashoutAvailable() {
            getState().sportsbook.eventMarket.markets[marketId].isCashoutAvailable = chkIsCashoutAvailable.checked ? true : false;
        }

        function toggleIsBetBuilderAvailable() {
            if (chkIsBetBuilderAvailable.checked) {
                getState().sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state = 1
                getState().sportsbook.eventMarket.markets[marketId].marketTemplateTags.push(133);
                if (!getEventHasBetBuilder(eventId)) {
                    obgRt.setFixtureUpserted(eventId,
                        {
                            bc_bb_available:
                                { name: "bc_bb_available" }
                        }
                    )
                }
            } else {
                getState().sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state = 0
                let index = getState().sportsbook.eventMarket.markets[marketId].marketTemplateTags.indexOf(133);
                if (index !== -1) {
                    getState().sportsbook.eventMarket.markets[marketId].marketTemplateTags.splice(index, 1);
                }
            }

            // getState().sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state = chkIsBetBuilderAvailable.checked ? 1 : 0;
        }

        function toggleIsBetDistributionAvailable() {
            if (!getState().sportsbook.betDistribution) {
                getState().sportsbook.betDistribution = {
                    accordionKeys: {},
                    statistics: { selections: {} }
                };
            }

            let selections = getSelectionsByMarketId(marketId);
            let percentages = generatePercentages(selections.length);
            if (chkIsBetDistributionAvailable.checked) {
                getState().sportsbook.betDistribution.accordionKeys[getAccordionKey(marketId)] = 1;
                for (let i = 0; i < selections.length; i++) {
                    getState().sportsbook.betDistribution.statistics.selections[selections[i]] = {
                        id: selections[i],
                        betcountDistribution: getRandomInt(1, 100),
                        stakeDistribution: percentages[i]
                    }
                }
            } else {
                delete getState().sportsbook.betDistribution.accordionKeys[marketTemplateId];
                for (let selection of selections) {
                    delete getState().sportsbook.betDistribution.statistics.selections[selection];
                }
            }

            function generatePercentages(count) {
                let numbers = [];
                let remaining = 1;
                let randomNumber;
                for (let i = 0; i < count - 1; i++) {
                    randomNumber = Math.random() * remaining;
                    randomNumber = parseFloat(randomNumber.toFixed(2));
                    numbers.push(randomNumber);
                    remaining -= randomNumber;
                }
                remaining = parseFloat(remaining.toFixed(2));
                numbers.push(remaining);
                return numbers;
            }
        }

        window.addMarketToCarouselOrCards = () => {

            createEmptyCarouselIfDoesntExist();

            const addToCarouselButtonLabel = getElementById("addToCarouselButtonLabel")
            const THREE_COLUMN_DATA_MISSING =
                "Could not get data for 3-column layout.\nPlease remove the detected market from the betslip, then add again.";
            const MARKET_NOT_PART_OF_THREE_COLUMN =
                "Only 3-column cards allowed here, while the selected market cannot be part of that.\nDisplaying the default 3-column markets of the event.";

            var pageCardCapable = isPageCardCapable();

            if (lockedMarketId !== undefined) {
                marketId = lockedMarketId;
            }

            let cardBackGround;
            if (pageCardCapable) {
                cardBackGround = getCardBackGround();
            }

            // let item = getState().sportsbook.carousel.item;
            let item = getDeepCopyOfObject(getState().sportsbook.carousel.item);

            if (item.marketToDisplay.hasOwnProperty(eventId)) {
                delete item.marketToDisplay[eventId];
                if (item.skeleton.backgrounds) {
                    delete item.skeleton.backgrounds[eventId];
                }
                const index = item.skeleton.eventIds.indexOf(eventId);
                if (index !== -1) {
                    item.skeleton.eventIds.splice(index, 1);
                }

                for (let i = 0; i < item.skeleton.carouselOrder.length; i++) {
                    if (item.skeleton.carouselOrder[i].id === eventId) {
                        item.skeleton.carouselOrder.splice(i, 1);
                    }
                }

                for (let i = 0; i < item.skeleton.carouselOrder.length; i++) {
                    item.skeleton.carouselOrder[i].sortOrder = i;
                }
            }


            item.skeleton.eventIds.unshift(eventId);

            item.marketToDisplay[eventId] = marketTemplateId;

            if (pageCardCapable) {
                item.skeleton.backgrounds[eventId] = cardBackGround;
            }

            if (!item.skeleton.marketTemplateIds.includes(marketTemplateId)) {
                item.skeleton.marketTemplateIds.push(marketTemplateId);
            }

            // for 3-column markets
            categoryId = getCategoryIdByEventId(eventId);
            if (isCategoryInUsFormat(categoryId) && !isEventTypeOutright(eventId)) {
                threeColumnLayouts = getThreeColumnLayouts();
                if (threeColumnLayouts == undefined) {
                    addToCarouselErrorMessage.innerText = THREE_COLUMN_DATA_MISSING;
                    if (!carouselOrCardsDefined) {
                        delete (getState().sportsbook.carousel.item);
                    }
                    return;
                } else if (!getIsMarketTemplateIdPartOfThreeColumn(marketTemplateId)) {
                    addToCarouselErrorMessage.innerText = MARKET_NOT_PART_OF_THREE_COLUMN;
                } else {
                    clearAddToCarouselErrorMessage();
                }
                item.skeleton.threeColumnLayouts = threeColumnLayouts;
            }
            // end of for 3-column markets

            var carouselOrder = item.skeleton.carouselOrder;
            for (let element of carouselOrder) {
                element.sortOrder++;
            }
            let carouselOrderElement = {
                id: eventId,
                sortOrder: 0,
                type: "Event"
            }
            item.skeleton.carouselOrder.unshift(carouselOrderElement);

            // new due to alex
            getState().sportsbook.carousel.item = item;

            addToCarouselButtonLabel.innerText = "Added"
            triggerChangeDetection(eventId, 300);


            setTimeout(function () {
                addToCarouselButtonLabel.innerText = "Add";
            }, 200);

        }

        function handleThreeColumnIfNeeded() {
            // for 3-column markets
            categoryId = getCategoryIdByEventId(eventId);
            if (isCategoryInUsFormat(categoryId) && !isEventTypeOutright(eventId)) {
                threeColumnLayouts = getThreeColumnLayouts();
                if (threeColumnLayouts == undefined) {
                    addToCarouselErrorMessage.innerText = THREE_COLUMN_DATA_MISSING;
                    if (!carouselOrCardsDefined) {
                        delete (getState().sportsbook.carousel.item);
                    }
                    return;
                } else if (!getIsMarketTemplateIdPartOfThreeColumn(marketTemplateId)) {
                    addToCarouselErrorMessage.innerText = MARKET_NOT_PART_OF_THREE_COLUMN;
                } else {
                    clearAddToCarouselErrorMessage();
                }
                item.skeleton.threeColumnLayouts = threeColumnLayouts;
            }
        }
    }

    function createEmptyCarouselIfDoesntExist() {
        carouselOrCardsDefined = getIsCarouselOrCardsDefined();
        if (!carouselOrCardsDefined) {
            getState().sportsbook.carousel.item = {
                "skeleton": {
                    "backgrounds": {},
                    "carouselOrder": [],
                    "eventIds": [],
                    "marketTemplateIds": [],
                    "marketGroups": {}
                },
                "marketToDisplay": {}
            }
        }
    }

    function getCardBackGround() {
        var bgImageWidth, bgImageHeight, bgImageUrl;
        try {
            bgImageUrl = Object.values(getState().sportsbook.carousel.item.skeleton.backgrounds)[0].url;
        } catch {
            bgImageUrl = getGoodEnoughImageUrl();
            if (bgImageUrl == undefined) {
                if (DEVICE_TYPE === "Desktop") {
                    bgImageUrl = "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/backgounds/bg.desktop.1200x214.jpg"
                } else {
                    bgImageUrl = "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/backgounds/bg.mobile.750x436.jpg"
                }
            }
        }
        if (DEVICE_TYPE === "Desktop") {
            bgImageWidth = 1000;
            bgImageHeight = 214;
        } else {
            bgImageWidth = 750;
            bgImageHeight = 436;
        }
        return {
            "url": bgImageUrl,
            "width": bgImageWidth,
            "height": bgImageHeight
        };
    }

    function getIsPageValidForCarousel() {
        return isPageCardCapable() || getIsPageHomePage();
    }

    function getGoodEnoughImageUrl() {
        let categoryName = getCategoryTrackingLabel();
        let platformName;
        DEVICE_TYPE === "Desktop" ? platformName = "desktop" : platformName = "mobile";
        let imageUrl, lowerCaseImageUrl, goodEnoughImageUrl;
        for (let image of Object.values(getState().image.images.sportsbook.images)) {
            if (image.url) {
                imageUrl = image.url;
                lowerCaseImageUrl = image.url.toLowerCase();
                if (lowerCaseImageUrl.includes(categoryName) && !lowerCaseImageUrl.includes("american-" + categoryName) && !lowerCaseImageUrl.includes("ncaa-" + categoryName)) {
                    goodEnoughImageUrl = imageUrl;
                    if (lowerCaseImageUrl.includes("card")) {
                        goodEnoughImageUrl = imageUrl;
                        if (lowerCaseImageUrl.includes("platform")) {
                            goodEnoughImageUrl = imageUrl;
                        }
                    }
                }
                if (goodEnoughImageUrl == undefined) {
                    if (platformName == "desktop") {
                        if (lowerCaseImageUrl.includes("backgrounds.generic-desktop")) {
                            goodEnoughImageUrl = imageUrl;
                        }
                    } else {
                        if (lowerCaseImageUrl.includes("backgrounds.generic-mobile")) {
                            goodEnoughImageUrl = imageUrl;
                        }
                    }
                }
            }
        }
        return goodEnoughImageUrl;
    }

    function getThreeColumnLayouts() {
        let tcl = getState().sportsbook.carousel.item.skeleton.threeColumnLayouts ?? {};

        threeColumnLayouts = getThreeColumnLayoutsFromEventPage();
        if (threeColumnLayouts == undefined) {
            threeColumnLayouts = getThreeColumnLayoutsFromEventTables();
        }
        if (threeColumnLayouts == undefined) {
            return undefined;
        }
        let key = Object.keys(threeColumnLayouts)[0];
        tcl[key] = threeColumnLayouts[key];
        return tcl;
    }

    function getThreeColumnLayoutsFromEventTables() {
        var eventTables = getState().sportsbook.eventTable.eventTables;
        var eventIds;
        var marketTimeFrames;
        var timeFrame;

        for (var table of Object.values(eventTables)) {
            try {
                eventIds = table.item.skeleton.eventIds;
            } catch { }
            for (var id of Object.values(eventIds)) {
                if (id === eventId) {
                    try {
                        marketTimeFrames = table.item.skeleton.marketTimeFrames;
                        timeFrame = Object.values(marketTimeFrames)[0];
                    } catch { }
                    if (timeFrame !== undefined) {
                        threeColumnLayouts = {
                            [categoryId]: {
                                columns: [],
                                key: "key",
                                label: "label"
                            }
                        };
                        for (var indexOfMarkets = 0; indexOfMarkets < Object.values(timeFrame).length; indexOfMarkets++) {
                            threeColumnLayouts[categoryId].columns.push(
                                {
                                    columnIndex: indexOfMarkets,
                                    label: Object.values(timeFrame)[indexOfMarkets].label,
                                    marketTemplateIds: Object.values(timeFrame)[indexOfMarkets].marketTemplateIds
                                }
                            )
                        }
                    }
                }
            }
        }
        return threeColumnLayouts;
    }

    function getMarketTemplateIdsOfThreeColumnLayout() {
        let columns;
        let ids = [];
        for (let i = 0; i < Object.values(threeColumnLayouts).length; i++) {
            columns = Object.values(threeColumnLayouts)[i].columns;
            ids = ids.concat(columns[0].marketTemplateIds, columns[1].marketTemplateIds, columns[2].marketTemplateIds);
        }
        return ids;
    }

    function getIsMarketTemplateIdPartOfThreeColumn(marketTemplateId) {
        return getMarketTemplateIdsOfThreeColumnLayout().includes(marketTemplateId);
    }

    function getThreeColumnLayoutsFromEventPage() {
        try {
            return getState().sportsbook.marketListWidget.items[eventId].item.skeleton.threeColumnLayouts;
        } catch { return undefined };
    }

    function getIsCarouselOrCardsDefined() {
        return getState().sportsbook.carousel.item !== undefined;
    }

    function triggerMarketChangeDetection() {
        let state = getState().sportsbook.eventMarket.markets[marketId].status;
        if (state == "Hold") {
            setMarketState("Open");
        } else {
            setMarketState("Hold");
        }
        setMarketState(state);
    }

    window.lockMarket = () => {
        const checkBox = getElementById("chkLockMarket");
        const detectedOrLockedRow = getElementById("detectedOrLockedRowForSbToolsMarket");
        if (checkBox.checked) {
            lockedMarketId = marketId;
            detectedOrLockedRow.innerHTML = "&#128274; Locked market:";
            labelRow.classList.add("displayInGreenGlow");
            stopPolling();
            initSbToolsMarket("marketLocked");
            inactivateAllAccordions();
        } else {
            lockedMarketId = undefined;
            detectedOrLockedRow.innerText = "Detected market:";
            labelRow.classList.remove("displayInGreenGlow");
            activateAllAccordions();
            initSbToolsMarket();
        }
    }

    function getEventIdFromEventPage() {
        var items = Object.values(getState().sportsbook.eventWidget.items);
        for (var targetItem of items) {
            if (targetItem.isActive === true) {
                return targetItem.item.skeleton.eventId;
            }
        }
    }

    function getCategoryTrackingLabel() {
        return getCategories()[getCategoryIdByEventId(eventId)].trackingLabel;
    }

    function getIsBLE() {
        return ENVIRONMENT_TO_DISPLAY == "PROD" || ENVIRONMENT_TO_DISPLAY == "ALPHA";
    }

    function getEventPageActiveTabId(eventId) {
        return getState().sportsbook.marketListWidget.items[eventId].marketTemplateGroupingId;
    }


    function stopPolling() {
        if (!!intervalIdForPolling) {
            for (var id of intervalIdsForPolling) {
                clearInterval(id);
            }
            intervalIdForPolling = undefined;
            intervalIdsForPolling = [];
        }
    }

    function isCategoryInUsFormat(categoryId) {

        let category = getCategories()[categoryId];


        if (category.tags?.categoryStyle != undefined) {
            return category.tags.categoryStyle == "2";
        }

        if (category.metaData != undefined) {
            return category.metaData.style == "2";
        }

        let usCategoryIds = ["2", "4", "10", "19"];
        let usCultures = ["en-US", "es-MX", "en-CA"];
        if (usCultures.includes(CULTURE) && usCategoryIds.includes(categoryId)) {
            return true;
        }
        return false;
    }


    function getSymbolBetweenParticipants(categoryId) {
        return isCategoryInUsFormat(categoryId) ? " @ " : " - ";
    }


    function activate(...elements) {
        for (var element of elements) {
            element.classList.remove("inactivated");
        }
    }

    function inactivate(...elements) {
        for (var element of elements) {
            element.classList.add("inactivated");
        }
    }

    window.initSbToolsSelection = () => {
        initSbToolsSelection();
    }


    var pbCriteriaEntityDetailsArray = [];
    function initSbToolsSelection(scope) {
        stopPolling();
        previousSelectionId = undefined;

        labelRow = getElementById("labelForSbToolsSelection");
        const selectionIdForSbToolsSelection = getElementById("selectionIdForSbToolsSelection");
        const selectionFeatures = getElementById("selectionFeatures");
        const eventLabelForDetectedSelection = getElementById("eventLabelForDetectedSelection");
        const marketLabelForDetectedSelection = getElementById("marketLabelForDetectedSelection");
        const selectionLabelForDetectedSelection = getElementById("selectionLabelForDetectedSelection");
        const messageForSbToolsSelection = getElementById("messageForSbToolsSelection");
        const labelsForDetectedSelectionMarketAndEvent = getElementById("labelsForDetectedSelectionMarketAndEvent");
        const btResetOdds = getElementById("btResetOdds");
        const initialOddsSpan = getElementById("initialOddsSpan");
        const fdNewOdds = getElementById("fdNewOdds");
        const selectionStateButtons = getElementsByClassName("btSetSelectionState");
        const btCreatePbFromSelections = getElementById("btCreatePbFromSelections");
        const btAddDetectedToPopBets = getElementById("btAddDetectedToPopBets");
        const btAddAllToPopBets = getElementById("btAddAllToPopBets");
        const btRemoveAllPopBets = getElementById("btRemoveAllPopBets");
        const btRemoveAllPerBuilt = getElementById("btRemoveAllPerBuilt");
        const popularBetsControls = getElementById("popularBetsControls");
        const popularBetsButtons = getElementById("popularBetsButtons");
        const popularBetsHr = getElementById("popularBetsHr");
        const popularBetsNotHomeMessage = getElementById("popularBetsNotHomeMessage");
        const popularBetsTooManySelectionsMessage = getElementById("popularBetsTooManySelectionsMessage");
        const chkPrematchOnly = getElementById("chkPrematchOnly");
        const isPopularBetsEnabledSection = getElementById("isPopularBetsEnabledSection");
        const popularBetsNotEnabledMessage = getElementById("popularBetsNotEnabledMessage");
        const popularPreBuiltBetsNotEnabledMessage = getElementById("popularPreBuiltBetsNotEnabledMessage");
        const bothPopularBetsNotEnabledMessage = getElementById("bothPopularBetsNotEnabledMessage");


        scope === "selectionLocked" ?
            intervalIdForPolling = setInterval(listenerForSelectionEvenIfLocked, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForSelection, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        checkPopularBetsFeatures();

        let betslip, previousBetslip;
        let isHomePage, previousIsHomePage;
        let isPopularBetsMoreThanZero, previousIsPopularBetsMoreThanZero;
        let isPopularPreBuiltBetsMoreThanZero, previousIsPopularPreBuiltBetsMoreThanZero;
        function listenerForSelection() {
            isHomePage = getIsPageHomePage();
            if (isHomePage != previousIsHomePage) {
                previousIsHomePage = isHomePage;
                if (isHomePage) {
                    show(popularBetsControls);
                    hide(popularBetsNotHomeMessage);
                } else {
                    hide(popularBetsControls);
                    show(popularBetsNotHomeMessage);
                }
            }

            isPopularBetsMoreThanZero = getIsPopularBetsMoreThanZero();
            if (isPopularBetsMoreThanZero != previousIsPopularBetsMoreThanZero) {
                previousIsPopularBetsMoreThanZero = isPopularBetsMoreThanZero;
                if (isPopularBetsMoreThanZero) {
                    activate(btRemoveAllPopBets);
                } else {
                    inactivate(btRemoveAllPopBets);
                }
            }

            isPopularPreBuiltBetsMoreThanZero = getIsPopularPreBuiltBetsMoreThanZero();
            if (isPopularPreBuiltBetsMoreThanZero != previousIsPopularPreBuiltBetsMoreThanZero) {
                previousIsPopularPreBuiltBetsMoreThanZero = isPopularPreBuiltBetsMoreThanZero;
                if (isPopularPreBuiltBetsMoreThanZero) {
                    activate(btRemoveAllPerBuilt);
                } else {
                    inactivate(btRemoveAllPerBuilt);
                }
            }

            betslip = JSON.stringify(getState().sportsbook.betslip);
            if (betslip === previousBetslip) {
                return;
            } else {
                setCreatePbButtonState();
                previousBetslip = betslip;
            }



            selectionId = getLastSelectionIdFromBetslip();

            if (selectionId === previousSelectionId) {
                if (selectionId !== null) {
                    activate(btAddDetectedToPopBets, btAddAllToPopBets);
                    listenerForSelectionEvenIfLocked();
                } else {
                    inactivate(btAddDetectedToPopBets, btAddAllToPopBets);
                }
                return;
            } else {
                previousSelectionId = selectionId;
            }

            hide(popularBetsTooManySelectionsMessage);

            if (selectionId == null) {
                displayInRed(labelRow);
                show(messageForSbToolsSelection);
                messageForSbToolsSelection.innerText = NOT_FOUND;
                hide(selectionFeatures, lockSelectionSection, labelsForDetectedSelectionMarketAndEvent);
                inactivate(btAddDetectedToPopBets, btAddAllToPopBets);
            } else {
                activate(btAddDetectedToPopBets, btAddAllToPopBets);
                selectionLabel = getSelectionLabel(selectionId);
                eventLabel = getEventDisplayLabel(getLastEventIdFromBetslip());
                marketLabel = getMarketLabel(getLastMarketIdFromBetslip());
                initialOdds = getInitialOddsFromBetslip(selectionId);

                fdNewOdds.value = initialOdds.toFixed(2);
                displayInGreen(labelRow);
                show(selectionFeatures, lockSelectionSection, labelsForDetectedSelectionMarketAndEvent);
                hide(messageForSbToolsSelection);
                eventLabelForDetectedSelection.innerText = eventLabel;
                marketLabelForDetectedSelection.innerHTML = "&boxur;&HorizontalLine; " + marketLabel;
                selectionLabelForDetectedSelection.innerHTML = "&boxur;&HorizontalLine; " + selectionLabel;
                selectionIdForSbToolsSelection.innerHTML = selectionId;
                initialOddsSpan.innerText = initialOdds.toFixed(2);

                setPbName(eventLabel, marketLabel, selectionLabel);
                listenerForSelectionEvenIfLocked();
            }
        }

        function setCreatePbButtonState() {
            if (radioPbCombi.checked) {
                let prematchSelectionCount = 0;
                for (let selId of getAllSelectionIdsFromBetslip()) {
                    if (isSelectionPrematch(selId)) {
                        prematchSelectionCount++;
                    }
                }
                if (prematchSelectionCount < 2) {
                    inactivate(btCreatePbFromSelections);
                } else {
                    activate(btCreatePbFromSelections);
                }
            } else {
                activate(btCreatePbFromSelections);
            }
        }

        let previousSelectionStatus = null;
        function listenerForSelectionEvenIfLocked() {
            let selectionStatus = getState().sportsbook.selection.selections[selectionId].status;
            if (selectionStatus == previousSelectionStatus) {
                return;
            } else {
                previousSelectionStatus = selectionStatus;
            }
            for (let button of selectionStateButtons) {
                if (selectionStatus === button.id.replace("btSetSelectionState", "")) {
                    inactivate(button);
                } else {
                    activate(button);
                }
            }
        }

        function checkPopularBetsFeatures() {
            let isPopBetsEnabled = getIsFeatureEnabled("popularBets");
            let isPopPreBuiltBetsEnabled = getIsFeatureEnabled("popularPreBuiltBets");

            if (!isPopBetsEnabled && !isPopPreBuiltBetsEnabled) {
                show(isPopularBetsEnabledSection, bothPopularBetsNotEnabledMessage);
                hide(popularBetsButtons, popularBetsHr);
            } else if (!isPopBetsEnabled) {
                show(isPopularBetsEnabledSection, popularBetsNotEnabledMessage);
            } else if (!isPopPreBuiltBetsEnabled) {
                show(isPopularBetsEnabledSection, popularPreBuiltBetsNotEnabledMessage);
            }
        }

        window.setSelectionState = (state) => {
            setSelectionState(state);
        }

        function setSelectionState(state) {
            if (lockedSelectionId !== undefined) {
                selectionId = lockedSelectionId;
            }

            marketId = getMarketIdBySelectionId(selectionId);
            eventId = getEventIdBySelectionId(selectionId);
            marketVersion = getMarketVersion(marketId);
            marketTemplateId = getMarketTemplateId(marketId);

            let params = [selectionId, marketId, eventId, marketTemplateId, marketVersion];
            // if (!getIsAndreasChangeOnSelectionsStatusesDeployed()) {
            //     params.splice(3, 1);
            // }

            switch (state) {
                case "Suspended":
                    obgRt.setSelectionStatusSuspended(...params);
                    break;
                case "Open":
                    obgRt.setSelectionStatusOpen(...params);
                    break;
                case "Lost":
                    obgRt.setSelectionStatusLost(...params);
                    break;
                case "Won":
                    obgRt.setSelectionStatusWon(...params);
                    break;
                case "Settled":
                    obgRt.setSelectionStatusSettled(...params);
                    break;
                case "Void":
                    obgRt.setSelectionStatusVoid(...params);
                    break;
            }
            getState().sportsbook.selection.selections[selectionId].status = state;
            listenerForSelectionEvenIfLocked();
        }

        window.setOdds = () => {
            let newOdds = fdNewOdds.value;
            if (newOdds != initialOdds) {
                activate(btResetOdds);
            } else {
                inactivate(btResetOdds);
            }
            if (lockedSelectionId != undefined) {
                selectionId = lockedSelectionId;
            }
            if (lockedInitialOdds != undefined) {
                initialOdds = lockedInitialOdds;
            }
            if (newOdds == "" || newOdds == null) {
                newOdds = initialOdds;
                fdNewOdds.value = initialOdds.toFixed(2);
            }
            setSelectionOdds(selectionId, newOdds);
        }

        window.resetOdds = () => {
            inactivate(btResetOdds);
            if (lockedSelectionId != undefined) {
                selectionId = lockedSelectionId;
            }
            if (lockedInitialOdds != undefined) {
                initialOdds = lockedInitialOdds;
            }
            setSelectionOdds(selectionId, initialOdds);
            fdNewOdds.value = initialOdds.toFixed(2);
        }

        const fdCreatePbName = getElementById("fdCreatePbName");
        const radioPbCombi = getElementById("radioPbCombi");
        const disabledIfCombi = getElementsByClassName("disabledIfCombi");
        const betTypeCombiHintSection = getElementById("betTypeCombiHintSection");
        const radioCreatePbRealMoney = getElementById("radioCreatePbRealMoney");

        const radioCreatePbEventPrematch = getElementById("radioCreatePbEventPrematch");
        const radioCreatePbEventLive = getElementById("radioCreatePbEventLive");
        const radioPbGlobal = getElementById("radioPbGlobal");
        const radioCreatePbPercentage = getElementById("radioCreatePbPercentage");


        const createPbPercentageValueSecion = getElementById("createPbPercentageValueSecion");
        const createPbFixedOddsValueSecion = getElementById("createPbFixedOddsValueSecion");
        const fdCreatePbPercentage = getElementById("fdCreatePbPercentage");
        const fdCreatePbFixed = getElementById("fdCreatePbFixed");
        const fdCreatePbMinOdds = getElementById("fdCreatePbMinOdds");
        const fdCreatePbMaxOdds = getElementById("fdCreatePbMaxOdds");
        const fdCreatePbMinStake = getElementById("fdCreatePbMinStake");
        const fdCreatePbMaxStake = getElementById("fdCreatePbMaxStake");
        const chkCreatePbIsSuperBoost = getElementById("chkCreatePbIsSuperBoost");

        let createPbName,
            createPbEventPhases,
            createPbIsPersonal,
            createPbPayoutMode,
            createPbType,
            createPbBoostedOdds,
            createPbPriceBoostedFormats,
            createPbMinOdds,
            createPbMaxOdds,
            createPbMinimumStake,
            createPbMaximumStake,
            createPbIsSuperBoost;

        window.selectRadioForPbBetType = (value) => {
            if (value == "combi") {
                radioCreatePbEventPrematch.checked = true;
                for (let elem of disabledIfCombi) {
                    inactivate(elem);
                }
                show(betTypeCombiHintSection);
            } else {
                for (let elem of disabledIfCombi) {
                    activate(elem);
                }
                hide(betTypeCombiHintSection);
            }
            setCreatePbButtonState();
        }

        window.selectRadioForPbType = (value) => {
            if (value == "fixedOdds") {
                hide(createPbPercentageValueSecion);
                show(createPbFixedOddsValueSecion);
            } else {
                hide(createPbFixedOddsValueSecion);
                show(createPbPercentageValueSecion);
            }
        }

        window.createPbFromSelections = () => {
            initCreatePbVariables();
            let isCombi = radioPbCombi.checked;
            addSelectionToPriceBoost(isCombi);

            let priceBoostObj = {
                id: "SBTOOL-" + generateGuid(),
                name: createPbName,
                type: "PriceBoost",
                expiryDate: "2050-12-30T23:00:00Z",
                // createdDate: "2023-08-02T09:10:28.027Z",
                criteria: {
                    eventPhases: createPbEventPhases,
                    marketTemplateIds: [],
                    criteriaEntityDetails: pbCriteriaEntityDetailsArray
                },
                conditions: {
                    betTypes: [isCombi ? "Combination" : "Single"],
                    minimumStake: createPbMinimumStake,
                    maximumStake: createPbMaximumStake,
                    maximumNumberOfSelections: selectionIdArray.length,
                    oddsLimit: {
                        maxOdds: createPbMaxOdds,
                        minOdds: createPbMinOdds
                    },
                    allSelectionsEligible: isCombi ? true : false
                },
                bonusData: {
                    type: createPbType,
                    boostedOdds: createPbBoostedOdds,
                    isOptedInByDefault: false,
                    priceBoostedFormats: createPbPriceBoostedFormats,
                    isSuperBoost: createPbIsSuperBoost,
                    winPayoutMode: createPbPayoutMode
                },
                isPersonal: createPbIsPersonal
            }

            updatePriceBoost(priceBoostObj);

            for (let eId of eventIdArray) {
                triggerChangeDetection(eId);
                // log("Added to PB: " + getEventLabel(eId) + " (" + getCategoryNameByEventId(eId) + ")");
            }

            function initCreatePbVariables() {
                createPbName = fdCreatePbName.value;

                if (radioCreatePbEventPrematch.checked) {
                    createPbEventPhases = ["Prematch"];
                } else if (radioCreatePbEventLive.checked) {
                    createPbEventPhases = ["Live"];
                } else {
                    createPbEventPhases = ["Prematch", "Live"];
                }

                createPbIsPersonal = !radioPbGlobal.checked;
                createPbPayoutMode = radioCreatePbRealMoney.checked ? "RealMoney" : "BonusMoney";

                if (radioCreatePbPercentage.checked) {
                    createPbType = "Multiplier"
                    createPbBoostedOdds = Number(fdCreatePbPercentage.value);
                    createPbPriceBoostedFormats = {
                        1: createPbBoostedOdds.toFixed(2).toString()
                    };
                } else {
                    createPbType = "FixedOdds"
                    createPbBoostedOdds = Number(fdCreatePbFixed.value);
                    createPbPriceBoostedFormats = {
                        1: createPbBoostedOdds.toFixed(2).toString(),
                        2: getAmericanOdds(createPbBoostedOdds),
                        3: getFractionalOdds(createPbBoostedOdds)
                    };
                }

                createPbMinOdds = Number(fdCreatePbMinOdds.value);
                createPbMaxOdds = Number(fdCreatePbMaxOdds.value);
                createPbMinimumStake = Number(fdCreatePbMinStake.value);
                createPbMaximumStake = Number(fdCreatePbMaxStake.value);
                createPbIsSuperBoost = !!chkCreatePbIsSuperBoost.checked;
            }

            cleanUpSelectionsFromPriceBoost();
        }

        function addSelectionToPriceBoost(isCombi) {
            selectionIdArray = [];
            if (isCombi) {
                for (let selId of getAllSelectionIdsFromBetslip()) {
                    if (isSelectionPrematch(selId)) {
                        selectionIdArray.push(selId);
                    }
                }
            } else {
                selectionIdArray.push(selectionId);
            }

            for (let marketSelectionId of selectionIdArray) {
                eventId = getEventIdBySelectionId(marketSelectionId);
                eventIdArray.push(eventId);
                marketId = getMarketIdBySelectionId(marketSelectionId);
                categoryId = getCategoryIdByEventId(eventId);
                competitionId = getCompetitionIdByEventId(eventId);

                let criteriaEntityDetail = {
                    categoryId: categoryId,
                    competitionId: competitionId,
                    eventId: eventId,
                    marketId: marketId,
                    marketSelectionId: marketSelectionId
                }
                pbCriteriaEntityDetailsArray.push(criteriaEntityDetail);
                setPbEventMap(eventId, createPbEventPhases);
                setPbMarketMap(marketId, createPbEventPhases);
            }
        }

        function cleanUpSelectionsFromPriceBoost() {
            pbCriteriaEntityDetailsArray = [];
            eventIdArray = [];
        }

        function setPbName(eventLabel, marketLabel, selectionLabel) {
            fdCreatePbName.value = "SBTOOL - " + eventLabel + " - " + marketLabel + " - " + selectionLabel;
        }

        window.setPopularBets = (param) => {
            switch (param) {
                case "addDetected":
                    // addDetectedSelectionToPopularBets();
                    addSelectionToPopularBets(selectionId);
                    break;
                case "addAllFromSlip":
                    addAllSelectionsFromBetslipToPopularBets();
                    break;
                case "removeAllNormal":
                    removeAllSelectionsFromPopularBets();
                    break;
                case "removeAllPreBuilt":
                    removeAllSelectionsFromPopularPreBuiltBets();
                    break;
            }
        }

        function removeAllSelectionsFromPopularBets() {
            if (getIsPopularBetsMoreThanZero()) {
                let eid = getFirstEventIdFromPopularBets();
                getState().sportsbook.popularBets = getEmptyPopularBets();
                triggerChangeDetection(eid);
            }
        }

        function removeAllSelectionsFromPopularPreBuiltBets() {
            if (getIsPopularPreBuiltBetsMoreThanZero()) {
                let eid = getFirstEventIdFromPopularPreBuiltBets();
                getState().sportsbook.popularPreBuiltBets = getEmptyPopularPreBuiltBets();
                triggerChangeDetection(eid);
            }
        }

        function getFirstEventIdFromPopularBets() {
            return Object.values(getState().sportsbook.popularBets.item.selectionsById)[0].eventId;
        }

        function getFirstEventIdFromPopularPreBuiltBets() {
            return getState().sportsbook.popularPreBuiltBets.events[0].id;
        }

        function getIsPopularBetsMoreThanZero() {
            return (
                getState().sportsbook?.popularBets?.item?.selectionsById &&
                Object.keys(getState().sportsbook.popularBets.item.selectionsById).length > 0
            ) ?? false;
        }

        function getIsPopularPreBuiltBetsMoreThanZero() {
            return (
                getState().sportsbook?.popularPreBuiltBets?.events &&
                getState().sportsbook.popularPreBuiltBets.events.length > 0
            ) ?? false;
        }

        function addAllSelectionsFromBetslipToPopularBets() {
            selectionIdArray = getAllSelectionIdsFromBetslip();
            for (let selectionId of selectionIdArray) {
                addSelectionToPopularBets(selectionId);
            }
        }

        function addSelectionToPopularBets(selectionId) {
            if (!isSelectionPrematch(selectionId) && chkPrematchOnly.checked) {
                return;
            }
            eventId = getEventIdBySelectionId(selectionId);
            marketId = getMarketIdBySelectionId(selectionId);
            if (isMarketPreBuilt(marketId)) {
                addSelectionToPopularPreBuiltBets(eventId, selectionId);
            } else {
                addSelectionToPopularNormalBets(eventId, marketId, selectionId);
            }
            triggerChangeDetection(eventId);
        }

        function addSelectionToPopularNormalBets(eventId, marketId, selectionId) {
            let popularBets;
            if (!getState().sportsbook.popularBets.item) {
                popularBets = getEmptyPopularBets();
            } else {
                popularBets = getDeepCopyOfObject(getPopularBets());
            }
            popularBets.item.selectionsById[selectionId] = {
                selectionId: selectionId,
                eventId: eventId,
                marketId: marketId,
                isSelected: true
            }
            getState().sportsbook.popularBets = popularBets;
        }

        function addSelectionToPopularPreBuiltBets(eventId, selectionId) {

            let popularPreBuiltBets;
            if (!getState().sportsbook.popularPreBuiltBets.events) {
                popularPreBuiltBets = getEmptyPopularPreBuiltBets();
            } else {
                popularPreBuiltBets = getDeepCopyOfObject(getPopularPreBuiltBets());
            }

            let eventObject = getState().sportsbook.event.events[eventId];
            let i = getIndexOfEventInPopularPreBuiltBets();

            if (i >= 0) {
                let ev = popularPreBuiltBets.events[i];
                if (!ev.selectionIds) {
                    ev.selectionIds = [];
                }
                if (ev.selectionIds.length < 3) {
                    hide(popularBetsTooManySelectionsMessage);
                    if (!ev.selectionIds.includes(selectionId)) {
                        ev.selectionIds.push(selectionId);
                    }
                } else {
                    show(popularBetsTooManySelectionsMessage);
                }
            } else {
                eventObject.selectionIds = [selectionId];
                popularPreBuiltBets.events.push(eventObject);
            }
            getState().sportsbook.popularPreBuiltBets = popularPreBuiltBets;

            function getIndexOfEventInPopularPreBuiltBets() {
                return popularPreBuiltBets.events.findIndex(event => event.id === eventId);
            }
        }

        // function addSelectionToPopularPreBuiltBets(eventId, selectionId) {
        //     let popularPreBuiltBets = getState().sportsbook.popularPreBuiltBets || getEmptyPopularPreBuiltBets();
        //     if (!popularPreBuiltBets) {
        //         popularPreBuiltBets = getDeepCopyOfObject(getPopularPreBuiltBets());
        //     }
        //     let eventObject = getState().sportsbook.event.events[eventId];
        //     let i = getIndexOfEventInPopularPreBuiltBets();

        //     if (i >= 0) {
        //         let event = popularPreBuiltBets.events[i];
        //         if (!event.selectionIds) event.selectionIds = [];
        //         if (event.selectionIds.length < 3 && !event.selectionIds.includes(selectionId)) {
        //             event.selectionIds.push(selectionId);
        //         }
        //     } else {
        //         popularPreBuiltBets.events.push({ ...eventObject, selectionIds: [selectionId] });
        //     }

        //     getState().sportsbook.popularPreBuiltBets = popularPreBuiltBets;

        //     function getIndexOfEventInPopularPreBuiltBets() {
        //         return popularPreBuiltBets.events.findIndex(event => event.id === eventId);
        //     }

        //     // function getDeepCopyOfObject(obj) {
        //     //     return JSON.parse(JSON.stringify(obj));
        //     // }
        // }




        function getPopularBets() {
            return getState().sportsbook.popularBets;
        }

        function getEmptyPopularBets() {
            return {
                isBusy: false,
                hasError: false,
                isExpanded: false,
                item: {
                    skeleton: {
                        isExpandable: true
                    },
                    selectionsById: {}
                }
            }
        }

        function getEmptyPopularPreBuiltBets() {
            return {
                events: [],
                skeleton: { isRefreshEnabled: true },
                status: "loaded"
            }
        }

        function getPopularPreBuiltBets() {
            return getState().sportsbook.popularPreBuiltBets;
        }
    }

    function getDeepCopyOfObject(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj; // Return the original value if it's not an object
        }
        const copiedObject = Array.isArray(obj) ? [] : {}; // Determine whether obj is an array or object
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copiedObject[key] = getDeepCopyOfObject(obj[key]); // Recursively copy nested properties
            }
        }
        return copiedObject;
    }

    function setPbEventMap(eventId, eventPhasesArr) {
        getState().sportsbook.priceBoost.eventMap[eventId] = eventPhasesArr;
    }

    function isSelectionPrematch(selectionId) {
        return getState().sportsbook.event.events[getEventIdBySelectionId(selectionId)].phase == "Prematch";
    }

    function setPbMarketMap(marketId, eventPhasesArr) {
        getState().sportsbook.priceBoost.marketMap[marketId] = eventPhasesArr;
    }

    function getAmericanOdds(decimalOdds) {
        if (decimalOdds < 2) {
            return (-(100 / (decimalOdds - 1))).toFixed(2);
        } else {
            return ((decimalOdds - 1) * 100).toFixed(0);
        }
    }

    function getFractionalOdds(decimalOdds) {
        let numerator = decimalOdds - 1;
        let denominator = 1;
        if (Number.isInteger(numerator) && numerator > 1) {
            return `${numerator}/1`;
        }
        while (Math.abs(numerator - Math.round(numerator)) > 0.0001) {
            numerator *= 10;
            denominator *= 10;
        }
        let gcd = 1;
        while (denominator !== 0) {
            gcd = denominator;
            denominator = numerator % denominator;
            numerator = gcd;
        }
        numerator /= gcd;
        denominator /= gcd;
        return `${numerator}/${denominator}`;
    }

    function getAllSelectionIdsFromBetslip() {
        let arr = [];
        for (let selection of Object.values(getState().sportsbook.betslip.selections)) {
            arr.push(selection.selectionId);
        }
        for (let bbSelection of Object.values(getState().sportsbook.betslip.betBuilderSelections)) {
            for (let leg of bbSelection.selectionLegs) {
                arr.push(leg.id);
            }
        }
        return arr;
    }

    window.lockSelection = () => {
        const checkBox = getElementById("chkLockSelection");
        const detectedOrLockedRow = getElementById("detectedOrLockedRowForSbToolsSelection");
        // labelRow = getElementById("selectionLabelForSbToolsSelection");

        if (checkBox.checked) {
            lockedSelectionId = getLastSelectionIdFromBetslip();
            lockedInitialOdds = getInitialOddsFromBetslip(selectionId);
            detectedOrLockedRow.innerHTML = "&#128274; Locked selection:";
            labelRow.classList.add("displayInGreenGlow");
            stopPolling();
            initSbToolsSelection("selectionLocked");
            inactivateAllAccordions();
        } else {
            lockedSelectionId = undefined;
            lockedInitialOdds = undefined;
            detectedOrLockedRow.innerText = "Detected selection:";
            labelRow.classList.remove("displayInGreenGlow");
            initSbToolsSelection();
            activateAllAccordions();
        }
    }

    function getLastSelectionIdFromBetslip() {
        let betslip = getBetSlipByObgState();
        try {
            if (betslip.orderedSelections.length == 0) {
                return null;
            }
            let orderedSelections = betslip.orderedSelections;
            let lastOrderedSelection = orderedSelections[orderedSelections.length - 1];
            if (!!lastOrderedSelection.selection) {
                return checkSelectionInObgState(lastOrderedSelection.selection.selectionId);
            } else {
                let bbEventId = lastOrderedSelection.bbEventId;
                let betBuilderSelections = betslip.betBuilderSelections;
                let lastBetBuilderSelection = betBuilderSelections[bbEventId];
                let selectionLegs = lastBetBuilderSelection.selectionLegs;
                return checkSelectionInObgState(selectionLegs[selectionLegs.length - 1].id);
            }
        } catch {
            return null;
        }

        function checkSelectionInObgState(selectionId) {
            return getState().sportsbook.selection.selections.hasOwnProperty(selectionId) ? selectionId : null;
        }
    }

    function getInitialOddsFromBetslip(selectionId) {
        return getBetSlipByObgState().initialOdds[selectionId];
    }

    function getSelectionLabel(selectionId) {
        if (selectionId === null) {
            return null;
        } else return getState().sportsbook.selection.selections[selectionId].label;
    }


    function isBetslipVisible() {
        return getState().sportsbook.betslip.isVisible;
    }


    function isBetBuilderBetslipVisible() {
        return getState().route.current.queryParams.betbuilderbetslip == 1;
    }

    function getMarketTemplateTags(marketId) {
        return getState().sportsbook.eventMarket.markets[marketId].marketTemplateTags;
    }

    window.initNativeApp = () => {
        stopPolling();
        previousEventId = undefined;
        // var menu = getState().sportsbook.sportCatalog.menu.items;
        // let categoriesObj = getState().sportsbook.sportCatalog.offering.categories;
        let quickLinks;
        // let orderedCategories, orderedRegions, orderedCompetitions;
        // orderedCategories = getArrayOrderedByProperty(Object.values(categoriesObj), "sortOrder");
        const categorySelector = getElementById("categorySelector");
        const regionSelector = getElementById("regionSelector");
        const competitionSelector = getElementById("competitionSelector");
        let menuOption;
        labelRow = getElementById("eventLabelForNative");

        const btNativeOpenEvent = getElementById("btNativeOpenEvent");
        const btNativeBack = getElementById("btNativeBack");
        const btNativeHome = getElementById("btNativeHome");
        const btNativeAz = getElementById("btNativeAz");
        const btNativeLive = getElementById("btNativeLive");
        const btNativeBetslip = getElementById("btNativeBetslip");
        const iconNativeBetslip = getElementById("iconNativeBetslip");
        const btNativeMyBets = getElementById("btNativeMyBets");
        // const btNativeBetBuilder = getElementById("btNativeBetBuilder");
        const btNativeBoost = getElementById("btNativeBoost");
        const btNativeLiveSC = getElementById("btNativeLiveSC");
        const btNativeStartingSoon = getElementById("btNativeStartingSoon");
        const btNativeSettings = getElementById("btNativeSettings");

        const loggedInOnly = getElementsByClassName("loggedInOnly");
        const badgeNativeBetslip = getElementById("badgeNativeBetslip");
        // const badgeNativeBbBetslip = getElementById("badgeNativeBbBetslip");
        const nativeAzSection = getElementById("nativeAzSection");
        // const iconBtNativeBetBuilder = getElementById("iconBtNativeBetBuilder");
        // const labelBtNativeBetBuilder = getElementById("labelBtNativeBetBuilder");
        // const nativeBetBuilderEventLabel = getElementById("nativeBetBuilderEventLabel");
        // const nativeBetBuilderSection = getElementById("nativeBetBuilderSection");
        // const nativeBetBuilderEventSelector = getElementById("nativeBetBuilderEventSelector");
        // const nativeBetBuilderEventsError = getElementById("nativeBetBuilderEventsError");
        const nativeQuickLinksSection = getElementById("nativeQuickLinksSection");

        const quickLinkSelector = getElementById("quickLinkSelector");
        const nativeErrorMessage = getElementById("nativeErrorMessage");
        const btNativeToggleableCollection = getElementsByClassName("btNativeToggleable");
        var nativeRouteHistory = [];

        var betSlipVisibleState;
        var previousBetSlipVisibleState = undefined;
        var currentRoute;
        var previousRoute = undefined;


        // if (obgClientEnvironmentConfig.startupContext.config.sportsbook.betBuilder.seamlessBetBuilderEnabled !== false) {
        //     hide(btNativeBetBuilder);
        // }

        try { quickLinks = getQuickLinks() } catch {
        }

        initNativeButtonsState();
        // changeNativeBetBuilderToSGPifNeeded();

        function getQuickLinks() {
            return Object.values((getState().quicklink.quicklinks)["sportsbook.quicklink-menu"]);
        }

        // function changeNativeBetBuilderToSGPifNeeded() {
        //     if (IS_SGP_USED) {
        //         iconBtNativeBetBuilder.classList.replace("ico-bet-builder", "ico-single-game-parlay");
        //         labelBtNativeBetBuilder.innerText = "SG Parlay";
        //         nativeBetBuilderEventLabel.innerText = "SGP Event";
        //         nativeBetBuilderEventsError.innerText = "Open an SGP accordion on the page.";
        //     }
        // }


        if (!getIsUserLoggedIn()) {
            for (var element of loggedInOnly) {
                element.classList.add("visibilityHidden");
            }
        }


        intervalIdForPolling = setInterval(listenerForNative, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function initNativeButtonsState() {
            inactivate(btNativeBack);
            setNativeButtonsState(getCurrentRouteName());
        }

        function setNativeButtonsState(routeName) {
            switch (routeName) {
                case "sportsbook":
                    initNativeHomeSection();
                    toggleButtons("home");
                    break;
                case "sportsbook.live-category":
                    inactivate(btNativeLive);
                    toggleButtons("live");
                    break;
                case "sportsbook.bet-history":
                    inactivate(btNativeMyBets);
                    toggleButtons("myBets");
                    break;
                // case "sportsbook.bet-builder":
                // case "sportsbook.bet-builder-category":
                // case "sportsbook.bet-builder-event":
                //     initNativeBetBuilderSection();
                //     toggleButtons("betBuilder");
                //     break;
                case "sportsbook.price-boost":
                case "sportsbook.price-boost-category":
                    inactivate(btNativeBoost);
                    toggleButtons("boost");
                    break;
                case "sportsbook.settings":
                    inactivate(btNativeBoost);
                    toggleButtons("settings");
                    break;
                case "sportsbook.live-stream-calendar":
                    inactivate(btNativeLiveSC);
                    toggleButtons("lsc");
                    break;
                case "sportsbook.starting-soon":
                case "sportsbook.starting-soon-tab":
                    inactivate(btNativeStartingSoon);
                    toggleButtons("startingSoon");
                    break;
            }
        }

        function listenerForNative() {
            setNativeBetslipButtonState();
            setBtNativeOpenEventState();
            setBadgeNativeBetslip();
            // setBadgeNativeBbBetslip();
            eventId = getLastEventIdFromBetslip();
            if (eventId === previousEventId) {
                return;
            } else {
                previousEventId = eventId;
            }

            if (eventId == null) {
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                inactivate(btNativeOpenEvent);
            } else {
                displayInGreen(labelRow);
                if (getCurrentRouteName() == "sportsbook.event") {
                    inactivate(btNativeOpenEvent);
                } else {
                    activate(btNativeOpenEvent);
                }
                detectionResultText = getEventDisplayLabel(eventId);
            }
            eventLabelForNative.innerText = detectionResultText;
        }

        let slipSelectionCount, previousSlipSelectionCount = 0;
        function setBadgeNativeBetslip() {
            // if (getCurrentRouteName() == "sportsbook.bet-builder-event") {
            //     hide(badgeNativeBetslip);
            // } else {
            //     if (slipSelectionCount == 0 || slipSelectionCount == undefined) {
            //         hide(badgeNativeBetslip);
            //     } else {
            //         show(badgeNativeBetslip)
            //     }
            // }
            if (slipSelectionCount == 0 || slipSelectionCount == undefined) {
                hide(badgeNativeBetslip);
            } else {
                show(badgeNativeBetslip)
            }

            slipSelectionCount = Object.values(getState().sportsbook.betslip.selections).length + getBetBuilderSelectionCount();
            if (slipSelectionCount == previousSlipSelectionCount) {
                return;
            } else {
                badgeNativeBetslip.innerText = slipSelectionCount;
                previousSlipSelectionCount = slipSelectionCount;
            }
        }

        function getBetBuilderSelectionCount() {
            let betBuilderSelectionLegs = 0;
            let betBuilderSelections = Object.values(getState().sportsbook.betslip.betBuilderSelections);
            for (let elem of betBuilderSelections) {
                betBuilderSelectionLegs += elem.selectionLegs.length;
            }
            return betBuilderSelectionLegs;
        }

        // var bBslipSelectionCount, previousBbSlipSelectionCount = 0;
        // function setBadgeNativeBbBetslip() {
        //     if (getCurrentRouteName() != "sportsbook.bet-builder-event") {
        //         hide(badgeNativeBbBetslip);
        //     } else {
        //         if (bBslipSelectionCount == 0 || bBslipSelectionCount == undefined) {
        //             hide(badgeNativeBbBetslip);
        //         } else {
        //             show(badgeNativeBbBetslip);
        //         }
        //     }
        //     bBslipSelectionCount = getState().betBuilder.betslip.selectionIds.length;
        //     if (bBslipSelectionCount == previousBbSlipSelectionCount) {
        //         return;
        //     } else {
        //         badgeNativeBbBetslip.innerText = bBslipSelectionCount;
        //         previousBbSlipSelectionCount = bBslipSelectionCount;
        //     }
        // };

        function setNativeBetslipButtonState() {
            betSlipVisibleState = isBetslipVisible() || isBetBuilderBetslipVisible();
            if (betSlipVisibleState == previousBetSlipVisibleState) {
                return;
            }
            previousBetSlipVisibleState = betSlipVisibleState;
            if (betSlipVisibleState) {
                btNativeBetslip.classList.add("btGreen");
                iconNativeBetslip.classList.replace("iconBetslipBottom", "iconBetslipBottomWhite");
            } else {
                btNativeBetslip.classList.remove("btGreen");
                iconNativeBetslip.classList.replace("iconBetslipBottomWhite", "iconBetslipBottom");
            }
        }

        function setBtNativeOpenEventState() {
            currentRoute = getCurrentRouteName();
            if (currentRoute == previousRoute) {
                return;
            }
            previousRoute = currentRoute;
            if (currentRoute == "sportsbook.event" || eventId == null) {
                inactivate(btNativeOpenEvent);
            } else {
                activate(btNativeOpenEvent);
            }
        }

        window.nativeClick = (value) => {
            nativeClick(value);
        }

        function nativeClick(value) {
            routes = getRoutes();
            if (Object.values(routes).length == 0) {
                show(nativeErrorMessage);
                nativeErrorMessage.innerText = "'obgClientEnvironmentConfig.startupContext.routes' is not defined. Please refresh the page.";
            }

            switch (value) {
                case "back":
                    nativeNavigateBack();
                    break;
                case "home":
                    routeChangeInWithPushToHistory("");
                    initNativeHomeSection();
                    break;
                case "az":
                    initNativeAzSection();
                    break;
                case "betSlip":
                    toggleAction("betslip");
                    break;
                case "myBets":
                    routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.bet-history"));
                    hideAllNativeSections();
                    break;
                case "live":
                    routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.live"));
                    hideAllNativeSections();
                    break;
                // case "betBuilder":
                //     routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.bet-builder"));
                //     initNativeBetBuilderSection();
                //     break;
                case "boost":
                    routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.price-boost"));
                    hideAllNativeSections();
                    break;
                case "lsc":
                    routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.live-stream-calendar"));
                    hideAllNativeSections();
                    break;
                case "startingSoon":
                    routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.starting-soon"));
                    hideAllNativeSections();
                    break;
                case "settings":
                    routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.settings"));
                    hideAllNativeSections();
                    break;
            }
            if (value != "back") {
                toggleButtons(value);
            }
        }

        // function hideAllNativeSections() {
        //     hide(nativeAzSection, nativeBetBuilderSection, nativeQuickLinksSection);
        // }
        function hideAllNativeSections() {
            hide(nativeAzSection, nativeQuickLinksSection);
        }

        function nativeNavigateBack() {
            let targetRoute = nativeRouteHistory.pop();
            let extUrl = targetRoute.extUrl;
            let routeName = targetRoute.route;
            routeChangeIn(extUrl);
            setNativeButtonsState(routeName);
        }

        function toggleButtons(value) {
            var clickedBt = getNativeButton(value);
            for (let bt of btNativeToggleableCollection) {
                if (bt == clickedBt) {
                    inactivate(bt);
                } else {
                    activate(bt);
                }
            }
        }

        function getNativeButton(key) {
            let nativeButtonsMap = {
                "back": btNativeBack,
                "home": btNativeHome,
                "betSlip": btNativeBetslip,
                "myBets": btNativeMyBets,
                "live": btNativeLive,
                // "betBuilder": btNativeBetBuilder,
                "boost": btNativeBoost,
                "lsc": btNativeLiveSC,
                "startingSoon": btNativeStartingSoon,
                "settings": btNativeSettings,
                "az": btNativeAz
            }
            return nativeButtonsMap[key];
        }


        // function initNativeBetBuilderSection() {
        //     show(nativeBetBuilderSection);
        //     hide(nativeQuickLinksSection, nativeAzSection);
        //     inactivate(btNativeBetBuilder);
        //     populateBetBuilderEvents();
        //     intervalIdForPolling = setInterval(listenerForNativeBetBuilderEvents, POLLING_INTERVAL);
        //     intervalIdsForPolling.push(intervalIdForPolling);

        //     function populateBetBuilderEvents() {
        //         clearSelector(nativeBetBuilderEventSelector);
        //         createHeaderOptionFor(nativeBetBuilderEventSelector);
        //         betBuilderEvents = Object.values(getState().betBuilder.event.events).sort((a, b) => (a.participants[0].label > b.participants[0].label) ? 1 : -1);
        //         for (var event of betBuilderEvents) {
        //             menuOption = document.createElement("option");
        //             menuOption.text = event.participants[0].label + getSymbolBetweenParticipants(event.categoryId) + event.participants[1].label;
        //             menuOption.value = event.id;
        //             nativeBetBuilderEventSelector.appendChild(menuOption);
        //         }
        //     }

        //     function listenerForNativeBetBuilderEvents() {
        //         betBuilderEvents = Object.values(getState().betBuilder.event.events);
        //         if (betBuilderEvents.length == 0) {
        //             show(nativeBetBuilderEventsError);
        //         } else {
        //             hide(nativeBetBuilderEventsError);
        //         }
        //         if (betBuilderEvents.length == previousBetBuilderEvents.length) {
        //             return;
        //         } else {
        //             previousBetBuilderEvents = betBuilderEvents;
        //             populateBetBuilderEvents();
        //         }
        //     }
        // }

        // window.selectBetuilderEvent = (value) => {
        //     for (var event of betBuilderEvents) {
        //         if (value == event.id) {
        //             routeChangeIn(routes["sportsbook.bet-builder"].slug + "/" + event.slug + "?eventId=" + value);
        //         }
        //     }
        //     activate(btNativeBetBuilder);
        // }


        window.openEventOnNative = () => {
            routeChangeInWithPushToHistory(getState().sportsbook.event.events[eventId].slug + "?eventId=" + eventId);
            for (var bt of btNativeToggleableCollection) {
                activate(bt);
            }
        }


        function initNativeAzSection() {
            show(nativeAzSection);
            // hide(nativeQuickLinksSection, nativeBetBuilderSection);
            hide(nativeQuickLinksSection);
            resetAzNavigation();
            // categories = getArrayOrderedByProperty(Object.values(categoriesObj), "sortOrder");
            orderedCategories = getArrayOrderedByProperty(Object.values(getState().sportsbook.sportCatalog.offering.categories), "sortOrder");
            populateSelector(categorySelector, orderedCategories);
        }

        function resetAzNavigation() {
            clearSelector(categorySelector, regionSelector, competitionSelector);
            inactivate(regionSelector, competitionSelector);
        }



        window.selectCategory = (value) => {
            clearSelector(regionSelector, competitionSelector);
            activate(regionSelector);
            inactivate(competitionSelector);
            for (var category of orderedCategories) {
                if (value == category.id) {
                    orderedRegions = getArrayOrderedByProperty(Object.values(category.regions), "sortOrder");
                    populateSelector(regionSelector, orderedRegions);
                }
            }
        }

        window.selectRegion = (value) => {
            clearSelector(competitionSelector);
            for (var region of orderedRegions) {
                if (value == region.id) {
                    if (Object.keys(region.competitions).length != 0) {
                        orderedCompetitions = getArrayOrderedByProperty(Object.values(region.competitions), "sortOrder");
                        populateSelector(competitionSelector, orderedCompetitions);
                        activate(competitionSelector);
                    } else {
                        inactivate(competitionSelector);
                        routeChangeIn(region.slug);
                    }
                }
            }
        }

        window.selectCompetition = (value) => {
            for (var competition of orderedCompetitions) {
                if (value == competition.id) {
                    routeChangeIn(competition.slug);
                }
            }
        }

        window.selectQuickLink = (value) => {
            var quickLinkUrl;
            for (var quickLink of quickLinks) {
                if (value == quickLink.documentKey) {
                    quickLinkUrl = quickLink.link.url;
                    if (quickLinkUrl == "") {
                        quickLinkUrl = getSlugByRoute(quickLink.route);
                    }
                    routeChangeIn(quickLinkUrl);
                    activate(btNativeHome);
                }
            }
        }

        function populateSelector(selector, options) {
            createHeaderOptionFor(selector);
            for (var option of options) {
                menuOption = document.createElement("option");
                menuOption.text = option.label;
                menuOption.value = option.id;
                selector.appendChild(menuOption);
            }
        }

        function initNativeHomeSection() {
            inactivate(btNativeHome);
            show(nativeQuickLinksSection);
            // hide(nativeBetBuilderSection, nativeAzSection);
            hide(nativeAzSection);
            clearSelector(quickLinkSelector);
            if (quickLinks == undefined) {
                try {
                    hide(nativeErrorMessage);
                    quickLinks = getQuickLinks();
                }
                catch {
                    nativeErrorMessage.innerText = "Couldn't fetch Quick Links.\nPlease click on 'A-Z' then on 'Home' again";
                    activate(btNativeHome);
                    show(nativeErrorMessage);
                    return;
                }
            }
            createHeaderOptionFor(quickLinkSelector);
            for (var link of quickLinks) {
                menuOption = document.createElement("option");
                menuOption.text = link.label.text;
                menuOption.value = link.documentKey;
                quickLinkSelector.appendChild(menuOption);
            }
        }

        function createHeaderOptionFor(selector) {
            var headerOption = document.createElement("option");
            headerOption.text = "Select...";
            selector.appendChild(headerOption);
        }

        function routeChangeInWithPushToHistory(extUrl) {
            nativeRouteHistory.push(getCurrentRouteObject());
            routeChangeIn(extUrl);
        }

        function routeChangeIn(extUrl) {
            setNativeBtBackState();
            if (!extUrl.startsWith("/")) {
                extUrl = "/" + extUrl;
            }
            postMessage(
                {
                    type: "routeChangeIn",
                    payload: {
                        externalUrl: extUrl
                    }
                });
        }

        function getCurrentRouteObject() {
            return {
                route: getCurrentRouteName(),
                extUrl: getState().route.current.externalUrl
            }
        }

        function setNativeBtBackState() {
            if (nativeRouteHistory.length == 0) {
                inactivate(btNativeBack);
            } else {
                activate(btNativeBack);
            }
        }

        function toggleAction(action) {
            postMessage(
                {
                    "type": "toggleAction",
                    "payload": {
                        "action": action
                    }
                }
            )
        }
    }

    function clearSelector(...selectors) {
        for (var selector of selectors) {
            selector.innerHTML = "";
        }
    }

    window.initStreamMappingHelper = () => {
        stopPolling();
    }


    function getDetectedEventId() {
        eventId = getUrlParam("eventId");
        if (eventId == undefined || !eventId.startsWith("f-")) {
            eventId = getLastEventIdFromBetslip();
        }
        return eventId;
    }


    function getLastEventIdFromBetslip() {
        let lastSelectionId = getLastSelectionIdFromBetslip();
        if (lastSelectionId == null) { return null };
        let lastEventId = getEventIdBySelectionId(lastSelectionId);

        if (lastEventId != "") {
            return lastEventId;
        }
        let lastMarketId = getMarketIdBySelectionId(lastSelectionId);
        let eventMap = getState().sportsbook.eventMarket.eventMap;
        for (let key in eventMap) {
            if (key !== "" && eventMap[key].includes(lastMarketId)) {
                return key;
            }
        }
    }

    function getEventDisplayLabel(eventId) {
        if (eventId === undefined || eventId === null || eventId.length != 24) {
            return null;
        }
        if (isEventTypeOutright(eventId)) {
            return getEventLabel(eventId);
        } else {
            participants = getParticipants(eventId);
            let label = "";
            let symbol = getSymbolBetweenParticipants(getCategoryIdByEventId(eventId))
            for (let i = 0; i < participants.length; i++) {
                label = label + participants[i].label + symbol;
            }
            return label.slice(0, -3);
        }
    }

    function getCurrentPathName() {
        return getState().route.current.pathName;
    }

    function getIsEventPageVisible(eventId) {
        return eventId === getUrlParam("eventId");
    }

    function getEventLabel(eventId) {
        if (eventId === null || eventId === undefined) {
            return null;
        }
        return getState().sportsbook.event.events[eventId].label;
    }

    function getEventPhase(eventId) {
        return getState().sportsbook.event.events[eventId].phase;
    }

    function getParticipants(eventId) {
        return getState().sportsbook.event.events[eventId].participants;
    }

    function getCategoryNameByEventId(eventId) {
        if (isEventInState(eventId)) {
            return getState().sportsbook.event.events[eventId].categoryName;
        }
    }

    function getRegionNameByEventId(eventId) {
        if (isEventInState(eventId)) {
            return getState().sportsbook.event.events[eventId].regionName;
        }
    }

    function getCompetitionNameByEventId(eventId) {
        if (isEventInState(eventId)) {
            return getState().sportsbook.event.events[eventId].competitionName;
        }
    }

    function getCategoryIdByEventId(eventId) {
        if (isEventInState(eventId)) {
            return getState().sportsbook.event.events[eventId].categoryId;
        }
    }

    function getRegionIdByEventId(eventId) {
        if (isEventInState(eventId)) {
            return getState().sportsbook.event.events[eventId].regionId;
        }
    }

    function getCompetitionIdByEventId(eventId) {
        if (isEventInState(eventId)) {
            return getState().sportsbook.event.events[eventId].competitionId;
        }
    }

    function isEventInState(eventId) {
        return getState().sportsbook.event.events[eventId] !== undefined;
    }

    window.toggleSection = (section) => {
        getElementById(section).classList.toggle("hide");
    }

    function isEventTypeOutright(eventId) {
        return getState().sportsbook.event.events[eventId].eventType === "Outright";
    }

    function getEventHasScoreBoard(eventId) {
        return !!getState().sportsbook.scoreboard[eventId];
    }


    window.initSbToolsEvent = () => {
        initSbToolsEvent();
    }
    function initSbToolsEvent(scope) {
        stopPolling();
        previousEventId = undefined;
        labelRow = getElementById("eventLabelForSbToolsEvent");
        const lockEventSection = getElementById("lockEventSectionForSbToolsEvent");
        const eventPhaseButtons = getElementsByClassName("btSetEventPhase");
        var eventPhase;
        const chkLockEventForSbToolsEvent = getElementById("chkLockEventForSbToolsEvent");
        const detectedOrLockedRow = getElementById("detectedOrLockedRowForSbToolsEvent");

        // const sbEventIdForOddsManagerSection = getElementById("sbEventIdForOddsManagerSection");
        const eventIdValue = getElementById("eventIdForEventDetails");
        const startDateValue = getElementById("startDateForEventDetails");
        const categoryForEventDetails = getElementById("categoryForEventDetails");
        const regionForEventDetails = getElementById("regionForEventDetails");
        const competitionForEventDetails = getElementById("competitionForEventDetails");
        const categoryIdForEventDetails = getElementById("categoryIdForEventDetails");
        const regionIdForEventDetails = getElementById("regionIdForEventDetails");
        const competitionIdForEventDetails = getElementById("competitionIdForEventDetails");

        const chkSuspendAllMarkets = getElementById("chkSuspendAllMarkets");
        const chkLiveAddsScoreBoard = getElementById("chkLiveAddsScoreBoard");
        const liveAddsScoreBoardSection = getElementById("liveAddsScoreBoardSection");
        const scoreBoardSupportedMessage = getElementById("scoreBoardSupportedMessage");
        const scoreBoardNotSupportedSection = getElementById("scoreBoardNotSupportedSection");
        const scoreBoardNotSupportedMessage = getElementById("scoreBoardNotSupportedMessage");
        const setEventPhaseLiveBtLabel = getElementById("setEventPhaseLiveBtLabel");

        const scoreBoardExtrasSection = getElementById("scoreBoardExtrasSection");

        const footballScoreBoardExtrasSection = getElementById("footballScoreBoardExtrasSection");
        const chkAggScore = getElementById("chkAggScore");
        // const chkRedCardsHome = getElementById("chkRedCardsHome");
        // const chkRedCardsAway = getElementById("chkRedCardsAway");
        const chkCorners = getElementById("chkCorners");
        const chkYellowCards = getElementById("chkYellowCards");
        const chkRedCards = getElementById("chkRedCards");

        const radioExtraTime = getElementById("radioExtraTime");
        const radioHalfTime = getElementById("radioHalfTime");
        const chkStoppageTime = getElementById("chkStoppageTime");
        const chkExpectedGoals = getElementById("chkExpectedGoals");
        const chkPossession = getElementById("chkPossession");
        const chkTotalShots = getElementById("chkTotalShots");
        const chkShotsOnTarget = getElementById("chkShotsOnTarget");
        const chkDangerousAttacks = getElementById("chkDangerousAttacks");
        const chkVar = getElementById("chkVar");

        const iceHockeyScoreBoardExtrasSection = getElementById("iceHockeyScoreBoardExtrasSection");
        const radioPPHome = getElementById("radioPPHome");
        const radioPP2Home = getElementById("radioPP2Home");
        const radioPPAway = getElementById("radioPPAway");
        const radioPP2Away = getElementById("radioPP2Away");
        const radioPPNone = getElementById("radioPPNone");
        const ppKeyLabelTop = getElementById("ppKeyLabelTop");
        const ppKeyLabelBottom = getElementById("ppKeyLabelBottom");

        const dartsScoreBoardExtrasSection = getElementById("dartsScoreBoardExtrasSection");
        const chk180s = getElementById("chk180s");
        const chkSetPoints = getElementById("chkSetPoints");

        const tennisScoreBoardExtrasSection = getElementById("tennisScoreBoardExtrasSection");
        const radio5setTennis = getElementById("radio5setTennis");

        // const isServerScoreBoardExtrasSection = getElementById("isServerScoreBoardExtrasSection");
        // const radioServerHome = getElementById("radioServerHome");
        // const radioServerAway = getElementById("radioServerAway");

        const eventStartingInOneHourSection = getElementById("eventStartingInOneHourSection");

        const hasBetBuilderSection = getElementById("hasBetBuilderSection");
        const chkHasBetBuilder = getElementById("chkHasBetBuilder");

        const hasPriceBoostSection = getElementById("hasPriceBoostSection");
        const chkHasPriceBoost = getElementById("chkHasPriceBoost");

        const hasSuperBoostSection = getElementById("hasSuperBoostSection");
        const chkHasSuperBoost = getElementById("chkHasSuperBoost");

        const hasLiveVisualSection = getElementById("hasLiveVisualSection");
        const chkHasLiveVisual = getElementById("chkHasLiveVisual");

        const hasLiveStreamingSection = getElementById("hasLiveStreamingSection");
        const chkHasLiveStreaming = getElementById("chkHasLiveStreaming");

        const hasFastMarketsSection = getElementById("hasFastMarketsSection");
        const chkHasFastMarkets = getElementById("chkHasFastMarkets");

        const hasScore24StatisticsSection = getElementById("hasScore24StatisticsSection");
        const chkHasScore24Statistics = getElementById("chkHasScore24Statistics");

        const hasExternalStatisticsSection = getElementById("hasExternalStatisticsSection");
        const chkHasExternalStatistics = getElementById("chkHasExternalStatistics");

        const hasLiveStatisticsSection = getElementById("hasLiveStatisticsSection");
        const chkHasLiveStatistics = getElementById("chkHasLiveStatistics");

        const hasVarSection = getElementById("hasVarSection");
        const chkHasVar = getElementById("chkHasVar");

        // rename event
        const fdRenameEventLabel = getElementById("fdRenameEventLabel");
        // const renameParticipantLabelSection = getElementById("renameParticipantLabelSection");
        const fdRenameParticipantLabel = getElementById("fdRenameParticipantLabel");
        const renameParticipantLabelRow = getElementById("renameParticipantLabelRow");
        const participantSelector = getElementById("participantSelector");
        const selectedParticipantIdSpan = getElementById("selectedParticipantIdSpan");

        // carousel
        const eventFeaturesSection = getElementById("eventFeaturesSection");

        //scoreboard
        const notFootballScoreBoardMessage = getElementById("notFootballScoreBoardMessage");
        var itHasFootballScoreBoard;
        const scoreBoardFeatures = getElementById("scoreBoardFeatures");

        //create markets
        const createMarketErrorSection = getElementById("createMarketErrorSection");
        const createMarketFeatures = getElementById("createMarketFeatures");
        const fastMarketMessage = getElementById("fastMarketMessage");
        const playerPropsMessage = getElementById("playerPropsMessage");
        const btCreateFastMarket = getElementById("btCreateFastMarket");
        const btCreatePlayerPropsMarket = getElementById("btCreatePlayerPropsMarket");
        const btCreatePlayerPropsDummyMarket = getElementById("btCreatePlayerPropsDummyMarket");

        //providers
        const providersMessage = getElementById("providersMessage");
        // const providersSection = getElementById("providersSection");
        const streamingProvider = getElementById("streamingProvider");
        const visualProvider = getElementById("visualProvider");
        const statisticsProvider = getElementById("statisticsProvider");
        const liveStatisticsProvider = getElementById("liveStatisticsProvider");


        scope === "eventLocked" ?
            intervalIdForPolling = setInterval(listenerForEventIfEventLocked, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForEvent, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForProviders, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        initUSRelatedUIChanges();


        window.lockEvent = () => {
            // const checkBox = getElementById("chkLockEventForSbToolsEvent");
            // const detectedOrLockedRow = getElementById("detectedOrLockedRowForSbToolsEvent");
            labelRow = getElementById("eventLabelForSbToolsEvent");

            if (chkLockEventForSbToolsEvent.checked) {
                lockedEventId = eventId;
                detectedOrLockedRow.innerHTML = "&#128274; Locked event:"
                labelRow.classList.add("displayInGreenGlow");
                stopPolling();
                initSbToolsEvent("eventLocked");
                inactivateAllAccordions();
            } else {
                lockedEventId = undefined;
                detectedOrLockedRow.innerText = "Detected event:";
                labelRow.classList.remove("displayInGreenGlow");
                initSbToolsEvent();
                activateAllAccordions();
            }
        }





        var previousIsEventVisible = undefined;
        var isEventVisible;
        function listenerForEvent() {
            eventId = getDetectedEventId();
            isEventVisible = getIsEventPageVisible(eventId);

            if (eventId == previousEventId && isEventVisible == previousIsEventVisible) {
                if (eventId !== null) {
                    listenerForEventIfEventLocked();
                }
                return;
            } else {
                previousEventId = eventId;
                previousIsEventVisible = isEventVisible;
            }

            if (eventId === null) {
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                if (lockedEventId === undefined) {
                    hide(eventFeaturesSection, lockEventSection);
                }
            } else {
                show(eventFeaturesSection, lockEventSection);
                detectionResultText = getEventDisplayLabel(eventId);
                eventIdValue.innerText = eventId;
                startDateValue.innerText = getFriendlyDateFromIsoDate(getState().sportsbook.event.events[eventId].startDate);
                categoryForEventDetails.innerHTML = getCategoryNameByEventId(eventId);
                regionForEventDetails.innerHTML = getRegionNameByEventId(eventId);
                competitionForEventDetails.innerHTML = getCompetitionNameByEventId(eventId);
                categoryIdForEventDetails.innerHTML = "[" + getCategoryIdByEventId(eventId) + "]";
                regionIdForEventDetails.innerHTML = "[" + getRegionIdByEventId(eventId) + "]";
                competitionIdForEventDetails.innerHTML = "[" + getCompetitionIdByEventId(eventId) + "]";
                initEventPropertyCheckboxes();
                displayInGreen(labelRow);
                initRenameEventSection();
                initSetEventPhaseSection();
                listenerForEventIfEventLocked();
                initFootballScoreboard();
                initCreateMarkets();
            }

            labelRow.innerText = detectionResultText;
            // savedEventLabel = eventLabel;
        }


        function initCreateMarkets() {
            eventId = getUrlParam("eventId");
            if (eventId == undefined || !eventId.startsWith("f-")) {
                show(createMarketErrorSection);
                hide(createMarketFeatures);
            } else {
                show(createMarketFeatures);
                hide(createMarketErrorSection);
                detectionResultText = getEventLabel(eventId);
                categoryId = getCategoryIdByEventId(eventId);
                initCreateFastMarketSection(categoryId);
                initCreatePlayerPropsMarketSection(categoryId);
            }
        }

        window.setStartingTimeInOneHour = () => {
            let now = new Date();
            now.setHours(now.getHours() + 1);
            getState().sportsbook.event.events[eventId].startDate = now.toISOString().slice(0, -5) + 'Z';
            triggerChangeDetection(eventId, 200);
        }

        let streams, previousStreams;
        let prematchStatisticsProviders = [];
        let previousPrematchStatisticsProviders = [];
        // let eventIdFromEventPage;

        function listenerForProviders() {
            if (!chkLockEventForSbToolsEvent.checked) {
                eventId = getDetectedEventId();
            }
            if (eventId == null) return;
            // let eventId = getUrlParam("eventId");

            // if (!eventIdFromEventPage?.startsWith("f-")) {
            //     show(providersErrorMessage);
            //     hide(providersSection);
            //     return;
            // }


            // show(providersSection);
            // hide(providersErrorMessage);

            streams = getState().sportsbook?.stream?.streams[eventId];
            if (!streams) {
                show(providersMessage);
            } else {
                hide(providersMessage);
            }
            prematchStatisticsProviders = getState().sportsbook.event.events[eventId]?.prematchStatisticsProviders;
            if (JSON.stringify(streams) !== JSON.stringify(previousStreams) || !areArraysEqual(prematchStatisticsProviders, previousPrematchStatisticsProviders)) {
                previousStreams = streams;
                previousPrematchStatisticsProviders = [...prematchStatisticsProviders];

                // Update UI with provider information
                // streamingProvider.innerText = streams?.video?.provider || "-";
                streamingProvider.innerText = getStreamingProvider();
                visualProvider.innerText = streams?.visual?.provider || "-";
                statisticsProvider.innerText = getStatisticsProviders();
                liveStatisticsProvider.innerText = streams?.liveStatistics?.provider || "-";
            }

            function getStatisticsProviders() {
                let prematchStatisticsProviders = getState().sportsbook.event.events[eventId]?.prematchStatisticsProviders || [];
                let prematchStatisticsProvidersFromStreams = streams?.statistics?.provider;

                if (prematchStatisticsProvidersFromStreams && !prematchStatisticsProviders.includes(prematchStatisticsProvidersFromStreams)) {
                    prematchStatisticsProviders.push(prematchStatisticsProvidersFromStreams);
                }
                return prematchStatisticsProviders.length ? getArrayAsCommaSeparatedString(prematchStatisticsProviders) : "-";
            }

            function getStreamingProvider() {
                let streamProvider = streams?.video?.provider || "-";

                if (streamProvider !== "-") {
                    const source = streams.video.source;
                    if (source?.includes("youtube")) streamProvider += " [source: Youtube]";
                    if (source?.includes("twitch")) streamProvider += " [source: Twitch]";
                    // const errorCode = streams.video.errorCode;
                    // if (errorCode) streamProvider += " [error: ]" + errorCode;

                }

                return streamProvider;
            }
        }



        function initCreateFastMarketSection(categoryId) {
            let categoryIdsForFastMarket = ["1", "11", "138", "2"];
            if (categoryIdsForFastMarket.includes(categoryId)) {
                activate(btCreateFastMarket);
                fastMarketMessage.innerText = null;
            } else {
                marketTemplateTagsArrayForFastMarket = undefined;
                displayInRed(fastMarketMessage);
                fastMarketMessage.innerText = "Not for this category"
                inactivate(btCreateFastMarket);
            }
        }

        function initSetEventPhaseSection() {
            categoryId = getCategoryIdByEventId(eventId);
            // let categoryIdsForScoreBoard = ["1", "2", "3", "4", "7", "8", "9", "10", "11", "17", "19", "26", "34", "39", "58", "60", "72", "104", "119", "138"];
            // let categoryIdsForNoScoreBoard = ["30", "43", "53", "116"];

            // if (categoryIdsForScoreBoard.includes(categoryId)) {
            if (isCategorySupportingScoreBoard(categoryId)) {
                scoreBoardSupportedMessage.innerText = "'Live' adds scoreboard";
                show(liveAddsScoreBoardSection);
                hide(scoreBoardNotSupportedSection);
            } else {
                hide(liveAddsScoreBoardSection);
                show(scoreBoardNotSupportedSection);
                // if (categoryIdsForNoScoreBoard.includes(categoryId)) {
                //     scoreBoardNotSupportedMessage.innerText = "Scoreboard not supported by SB as of 04/2024";
                // } else {
                //     scoreBoardNotSupportedMessage.innerText = "Scoreboard not yet supported by SportsbookTool";
                // }
                scoreBoardNotSupportedMessage.innerText = "Scoreboard not yet supported by SportsbookTool";
            }
            initScoreBoardExtras(categoryId);
        }

        function isCategorySupportingScoreBoard(categoryId) {
            const categoryIdsForScoreBoard = ["1", "2", "3", "4", "7", "8", "9", "10", "11", "17", "19", "26", "34", "39", "58", "60", "72", "104", "119", "138"];
            return categoryIdsForScoreBoard.includes(categoryId);
        }

        function initUSRelatedUIChanges() {
            if (isCategoryInState("2")) {
                swapPPHomeWithAway();
            }
        }

        function swapPPHomeWithAway() {
            if (isCategoryInUsFormat("2")) {
                ppKeyLabelTop.innerText = "Power Play Away";
                ppKeyLabelBottom.innerText = "Power Play Home";
            }
        }

        function initCreatePlayerPropsMarketSection(categoryId) {
            let categoryIdsPlayerPropsMarket = ["1", "2", "3", "4", "10", "19"];
            if (categoryIdsPlayerPropsMarket.includes(categoryId)) {
                activate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket);
                playerPropsMessage.innerText = null;
            } else {
                marketTemplateTagsArray = undefined;
                displayInRed(playerPropsMessage);
                playerPropsMessage.innerText = "Not for this category"
                inactivate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket);
            }
        }

        function initFootballScoreboard() {
            let scoreBoard = getState().sportsbook.scoreboard;
            itHasFootballScoreBoard = false;
            if (eventId === null) {
                hide(notFootballScoreBoardMessage, lockEventSection);
            } else {
                for (let event in scoreBoard) {
                    if (eventId == scoreBoard[event].eventId && getCategoryIdByEventId(eventId) === "1") {
                        itHasFootballScoreBoard = true;
                        hide(notFootballScoreBoardMessage);
                        break;
                    }
                }
                if (itHasFootballScoreBoard) {
                    hide(notFootballScoreBoardMessage);
                    show(scoreBoardFeatures);
                } else {
                    hide(scoreBoardFeatures);
                    show(notFootballScoreBoardMessage);
                }
            }
        }

        // function initRenameEventSection() {
        //     eventLabel = getEventLabel(eventId);
        //     if (!isEventTypeOutright(eventId)) {
        //         show(renameParticipantLabelSection);
        //         participants = getParticipants(eventId);
        //         populateParticipantSelector();
        //         populateParticipantLabel();
        //         populateParticipantId();
        //         fdRenameParticipantLabel.focus();
        //     } else {
        //         hide(renameParticipantLabelSection);
        //     }
        //     populateEventLabel();
        // }

        function initRenameEventSection() {
            eventLabel = getEventLabel(eventId);
            isEventTypeOutright(eventId) ? hide(renameParticipantLabelRow) : show(renameParticipantLabelRow);
            // show(renameParticipantLabelSection);
            participants = getParticipants(eventId);
            populateParticipantSelector();
            populateParticipantLabel();
            populateParticipantId();
            fdRenameParticipantLabel.focus();
            populateEventLabel();
        }

        function populateParticipantId() {
            if (selectedParticipantId == undefined) {
                selectedParticipantId = participants[0].id;
            }
            selectedParticipantIdSpan.innerText = selectedParticipantId;
        }

        function populateParticipantSelector() {
            participantSelector.innerHTML = "";
            var option;
            for (var participant of participants) {
                option = document.createElement("option");
                option.text = participant.label;
                option.value = participant.id;
                participantSelector.appendChild(option);
            }
        }

        function populateEventLabel() {
            fdRenameEventLabel.innerText = eventLabel;
            fdRenameEventLabel.addEventListener("input", () => {
                trimString(fdRenameEventLabel, 255)
            }, false);
        }

        function populateParticipantLabel() {
            fdRenameParticipantLabel.innerText = participants[0].label;
            selectedParticipantId = participants[0].id;
            fdRenameParticipantLabel.addEventListener("input", () => {
                trimString(fdRenameParticipantLabel, 50)
            }, false);
        }

        window.selectParticipant = (value) => {
            for (var participant of participants) {
                if (value == participant.id) {
                    fdRenameParticipantLabel.innerText = participant.label;
                    selectedParticipantId = participant.id;
                    populateParticipantId();
                }
            }
        }

        window.setEventLabel = () => {
            getState().sportsbook.event.events[eventId].label = fdRenameEventLabel.textContent;
            triggerChangeDetection(eventId, 100);
        }

        window.setParticipantLabel = () => {
            var index;
            for (var participant of participants) {
                if (participant.id == selectedParticipantId) {
                    index = participants.indexOf(participant);
                }
            }
            getState().sportsbook.event.events[eventId].participants[index].label = fdRenameParticipantLabel.textContent;
            triggerChangeDetection(eventId, 500);
            populateParticipantSelector();
        }


        window.setEventPhase = (phase) => { setEventPhase(phase); }

        function setEventPhase(phase) {
            mockedEventPhase = phase;
            if (lockedEventId !== undefined) {
                eventId = lockedEventId;
            }
            switch (phase) {
                case "Prematch":
                    deleteScoreBoardIfExists(eventId);
                    obgRt.setEventPhasePrematch(eventId);
                    break;
                case "Live":
                    if (getEventPhase(eventId) == "Live") {
                        setEventPhase("Prematch");
                    }
                    setTimeout(function () {
                        if (chkLiveAddsScoreBoard.checked && !isEventTypeOutright(eventId)) {
                            getState().sportsbook.scoreboard[eventId] = createScoreBoard(eventId, getScoreBoardExtras(categoryId));
                        }
                        obgRt.setEventPhaseLive(eventId);
                    }, 100);
                    setTimeout(function () {
                        if (categoryId == "1") initFootballScoreboard();
                    }, 200);
                    break;
                case "Over":
                    chkSuspendAllMarkets.checked ?
                        obgRt.setEventPhaseOver(eventId, true) :
                        obgRt.setEventPhaseOver(eventId);
                    break;
            }

            function deleteScoreBoardIfExists() {
                if (!!getState().sportsbook.scoreboard[eventId]) {
                    delete getState().sportsbook.scoreboard[eventId];
                }
            }
        }


        window.toggleScoreBoardExtras = () => {
            initScoreBoardExtras(categoryId);
        }

        function initScoreBoardExtras(categoryId) {

            if (chkLiveAddsScoreBoard.checked) {
                switch (categoryId) {
                    case "1":
                        showAndHide(footballScoreBoardExtrasSection);
                        break;
                    case "2":
                        swapPPHomeWithAway();
                        showAndHide(iceHockeyScoreBoardExtrasSection);
                        break;
                    case "11":
                        showAndHide(tennisScoreBoardExtrasSection);
                        break;
                    case "34":
                        showAndHide(dartsScoreBoardExtrasSection);
                        break;
                    default:
                        hide(scoreBoardExtrasSection);
                }
            } else {
                hide(scoreBoardExtrasSection);
            }

            function showAndHide(sectionToShow) {
                show(scoreBoardExtrasSection, sectionToShow);
                hideExcept(sectionToShow);
            }

            function hideExcept(sectionToKeep) {
                const sectionsToHide = [footballScoreBoardExtrasSection, iceHockeyScoreBoardExtrasSection, tennisScoreBoardExtrasSection, dartsScoreBoardExtrasSection].filter(section => section !== sectionToKeep);
                sectionsToHide.forEach(section => hide(section));
            }
        }

        function getScoreBoardExtras(categoryId) {
            switch (categoryId) {
                case "1": {
                    return {
                        isAggActive: chkAggScore.checked,
                        // isHomeRedCardsActive: chkRedCardsHome.checked,
                        // isAwayRedCardsActive: chkRedCardsAway.checked,
                        isCornersActive: chkCorners.checked,
                        isYellowCardsActive: chkYellowCards.checked,
                        isRedCardsActive: chkRedCards.checked,
                        isExtraTimeActive: radioExtraTime.checked,
                        isHalfTimeActive: radioHalfTime.checked,
                        isVarStateActive: chkVar.checked,
                        isStoppageTimeActive: chkStoppageTime.checked,
                        isExpectedGoalsActive: chkExpectedGoals.checked,
                        isPossessionActive: chkPossession.checked,
                        isTotalShotsActive: chkTotalShots.checked,
                        isShotsOnTargetActive: chkShotsOnTarget.checked,
                        isDangerousAttacksActive: chkDangerousAttacks.checked
                    }
                }
                case "2": {
                    return {
                        isPPHomeActive: radioPPHome.checked,
                        isPP2HomeActive: radioPP2Home.checked,
                        isPPAwayActive: radioPPAway.checked,
                        isPP2AwayActive: radioPP2Away.checked,
                        isPPNoneActive: radioPPNone.checked
                    }
                }
                case "11": {
                    return {
                        isFiveSetMatch: radio5setTennis.checked
                    }
                }
                case "34": {
                    return {
                        is180sActive: chk180s.checked,
                        isSetPointsActive: chkSetPoints.checked
                    }
                }
                default: return {}
            }
        }

        window.toggleEventProperty = (property) => {
            let delay = 0;
            switch (property) {
                case "betBuilderLink":
                    toggleHasBetBuilder();
                    break;
                case "priceBoost":
                    toggleHasPriceBoost();
                    break;
                case "superBoost":
                    toggleHasSuperBoost();
                    break;
                case "liveVisual":
                    delay = 500;
                    toggleHasLiveVisual();
                    break;
                case "liveStreaming":
                    delay = 500;
                    toggleHasLiveStreaming();
                    break;
                case "fastMarkets":
                    toggleHasFastMarkets();
                    break;
                case "score24Stats":
                    delay = 500;
                    toggleHasPrematchStatistics("Score24", chkHasScore24Statistics);
                    break;
                case "externalStats":
                    delay = 500;
                    toggleHasPrematchStatistics("BetRadar", chkHasExternalStatistics);
                    break;
                case "liveStatistics":
                    delay = 500;
                    toggleHasLiveStatistics();
                    break;
                case "var":
                    toggleVarState();
                    break;
            }
            triggerChangeDetection(eventId, delay);
        }

        function toggleHasBetBuilder() {
            if (chkHasBetBuilder.checked) {

                getState().sportsbook.event.events[eventId].hasBetBuilderLink = true; // legacy bb for us brands

                obgRt.setFixtureUpserted(eventId,
                    {
                        bc_bb_available:
                            { name: "bc_bb_available" }
                    }
                )
            } else {
                getState().sportsbook.event.events[eventId].hasBetBuilderLink = false; // legacy bb for us brands

                delete getState().sportsbook.event.events[eventId].tags.bc_bb_available;
            }
        }

        function toggleHasPriceBoost() {
            if (chkHasPriceBoost.checked) {
                createPriceBoostForEvent(false);
            } else {
                deletePriceBoost(false);
            }
        }

        function toggleHasSuperBoost() {
            if (chkHasSuperBoost.checked) {
                createPriceBoostForEvent(true);
            } else {
                deletePriceBoost(true);
            }
        }

        function createPriceBoostForEvent(isSuperBoost) {
            let eventPhases = ["Prematch", "Live"];
            selectionId = getLastSelectionIdFromBetslip();
            if (selectionId == null) {
                marketId = getFirstMarketIdOfEvent(eventId);
                selectionId = getFirstSelectionIdOfMarket(marketId);
            } else {
                marketId = getMarketIdBySelectionId(selectionId);
            }
            categoryId = getCategoryIdByEventId(eventId);
            competitionId = getCompetitionIdByEventId(eventId);
            let priceBoostObj = {
                id: "SBTOOL-" + generateGuid(),
                name: isSuperBoost ? "Super Boost" : "Price Boost" + " generated by SB Tool, can't lookup in TT",
                type: "PriceBoost",
                expiryDate: "2050-12-30T23:00:00Z",
                createdDate: "2023-08-02T09:10:28.027Z",
                criteria: {
                    eventPhases: eventPhases,
                    marketTemplateIds: [],
                    criteriaEntityDetails: [
                        {
                            categoryId: categoryId,
                            competitionId: competitionId,
                            eventId: eventId,
                            marketId: marketId,
                            marketSelectionId: selectionId
                        }
                    ]
                },
                conditions: {
                    betTypes: ["Single"],
                    minimumStake: 0.11,
                    maximumStake: isSuperBoost ? 1200 : 120,
                    oddsLimit: {
                        maxOdds: isSuperBoost ? 5000 : 50,
                        minOdds: 1.1
                    },
                    allSelectionsEligible: false
                },
                bonusData: {
                    type: "Multiplier",
                    boostedOdds: isSuperBoost ? 1000 : 10,
                    isOptedInByDefault: false,
                    isSuperBoost: isSuperBoost,
                    priceBoostedFormats: {
                        1: isSuperBoost ? "1000.00" : "10.00"
                    },
                    winPayoutMode: "RealMoney"
                },
                isPersonal: false
            }
            updatePriceBoost(priceBoostObj);
            setPbEventMap(eventId, eventPhases);
            setPbMarketMap(marketId, eventPhases);
        }



        function deletePriceBoost(isSuperBoost) {
            delete getState().sportsbook.priceBoost.eventMap[eventId];
            delete getState().sportsbook.priceBoost.marketMap[marketId];
            let boosts = Object.keys(getState().sportsbook.priceBoost.priceBoost);
            let criteriaEntityDetails;
            for (let b of boosts) {
                criteriaEntityDetails = getState().sportsbook.priceBoost.priceBoost[b].criteria.criteriaEntityDetails;
                for (let detail of criteriaEntityDetails) {
                    if (detail.eventId == eventId) {
                        if (isSuperBoost) {
                            if (getState().sportsbook.priceBoost.priceBoost[b].bonusData.isSuperBoost) {
                                delete getState().sportsbook.priceBoost.priceBoost[b];
                            }
                        } else {
                            if (!getState().sportsbook.priceBoost.priceBoost[b].bonusData.isSuperBoost) {
                                delete getState().sportsbook.priceBoost.priceBoost[b];
                            }
                        }
                    }
                }
            }
            getState().sportsbook.priceBoost.priceBoost = {
                ...getState().sportsbook.priceBoost.priceBoost
            }
        }

        function toggleHasLiveVisual() {
            if (chkHasLiveVisual.checked) {
                getState().sportsbook.event.events[eventId].hasLiveVisual = true;
            } else {
                getState().sportsbook.event.events[eventId].hasLiveVisual = false;
            }
        }

        function toggleHasLiveStreaming() {
            if (chkHasLiveStreaming.checked) {
                getState().sportsbook.event.events[eventId].hasLiveStreaming = true;
                addLiveStreamVideo();
            } else {
                getState().sportsbook.event.events[eventId].hasLiveStreaming = false;
                removeLiveStreamVideo();
            }

            function addLiveStreamVideo() {
                const state = getState();

                // Helper function to ensure nested objects exist
                function ensureNestedObject(obj, keys) {
                    keys.reduce((o, key) => {
                        if (!o[key]) o[key] = {};
                        return o[key];
                    }, obj);
                }

                // Ensure that all nested properties are created
                ensureNestedObject(state, ["sportsbook", "stream", "streams", eventId]);

                // Now it's safe to set the 'video' property
                state.sportsbook.stream.streams[eventId].video = {
                    type: "Video",
                    source: "https://player.twitch.tv/?channel=lordkevun",
                    requiresClientCall: false,
                    provider: "OddinGG"
                };
            }

            function removeLiveStreamVideo() {
                delete getState().sportsbook.stream.streams[eventId].video;
            }
        }

        function toggleHasFastMarkets() {
            if (chkHasFastMarkets.checked) {
                getState().sportsbook.event.events[eventId].hasFastMarkets = true;
            } else {
                getState().sportsbook.event.events[eventId].hasFastMarkets = false;
            }
        }

        function toggleHasPrematchStatistics(providerName, checkBox) {
            let providers = getState().sportsbook.event.events[eventId].prematchStatisticsProviders;
            let isChecked = checkBox.checked;
            let isScore24 = providerName == "Score24";

            if (isChecked && !providers.includes(providerName)) {
                providers.push(providerName);
                if (isScore24) {
                    createScore24Statistics(eventId);
                }
            } else if (!isChecked) {
                getState().sportsbook.event.events[eventId].prematchStatisticsProviders = providers.filter(item => item !== providerName);
                if (isScore24) {
                    delete getState().sportsbook.statistics[eventId];
                }
            }
        }


        function toggleHasLiveStatistics() {
            if (chkHasLiveStatistics.checked) {
                getState().sportsbook.event.events[eventId].hasLiveStatistics = true;
            } else {
                getState().sportsbook.event.events[eventId].hasLiveStatistics = false;
            }
        }

        function toggleVarState() {
            if (chkHasVar.checked) {
                getState().sportsbook.scoreboard[eventId].varState = 2;
            } else {
                getState().sportsbook.scoreboard[eventId].varState = 0;
            }
        }

        function initEventPropertyCheckboxes() {

            chkHasLiveVisual.checked = getState().sportsbook.event.events[eventId].hasLiveVisual ?? false;

            chkHasLiveStreaming.checked = getState().sportsbook.event.events[eventId].hasLiveStreaming ?? false;

            chkHasFastMarkets.checked = getState().sportsbook.event.events[eventId].hasFastMarkets ?? false;

            chkHasPriceBoost.checked = getEventHasSingleBoost(eventId, false);

            chkHasSuperBoost.checked = getEventHasSingleBoost(eventId, true);

            chkHasLiveStatistics.checked = getState().sportsbook.event.events[eventId].hasLiveStatistics ?? false;

            // chkHasBetBuilder.checked = !!getState().sportsbook.event.events[eventId]?.tags?.bc_bb_available;

            chkHasBetBuilder.checked = getEventHasBetBuilder(eventId);

            chkHasScore24Statistics.checked = getState().sportsbook.event.events[eventId].prematchStatisticsProviders.includes("Score24");

            chkHasExternalStatistics.checked = getState().sportsbook.event.events[eventId].prematchStatisticsProviders.includes("BetRadar");

            chkHasVar.checked = !!getState().sportsbook.scoreboard[eventId] && getState().sportsbook.scoreboard[eventId].varState === 2;

        }

        function getEventHasSingleBoost(eventId, isSuperBoost) {
            for (const pb of Object.values(getState().sportsbook.priceBoost.priceBoost)) {
                if (pb.criteria.criteriaEntityDetails.length === 1
                    && pb.criteria.criteriaEntityDetails[0].eventId === eventId
                    && pb.bonusData.isSuperBoost === isSuperBoost) {
                    return true;
                }
            }
            return false;
        }

        // const eventPropertiesSection = getElementById("eventPropertiesSection");

        let previousEventPhase = null;
        function listenerForEventIfEventLocked() {
            eventPhase = getEventPhase(eventId);
            if (eventPhase == previousEventPhase) {
                return;
            } else {
                previousEventPhase = eventPhase;
            }
            // initEventPropertyCheckboxes();

            // if (mockedEventPhase == undefined) {
            //     mockedEventPhase = getEventPhase(eventId);
            // }

            // eventLabel !== savedEventLabel ?
            //     eventPhase = getEventPhase(eventId) :
            //     eventPhase = mockedEventPhase;

            for (let button of eventPhaseButtons) {
                if (eventPhase === button.id.replace("btSetEventPhase", "")) {
                    if (eventPhase == "Live" && isCategorySupportingScoreBoard(categoryId)) {
                        setEventPhaseLiveBtLabel.innerText = "New Live";
                    } else {
                        setEventPhaseLiveBtLabel.innerText = "Live";
                        inactivate(button);
                    }
                } else {
                    activate(button);
                }
            }

            switch (getEventPhase(eventId)) {
                case "Live":
                    if (getEventHasScoreBoard(eventId)) {
                        activate(hasVarSection);
                    } else {
                        inactivate(hasVarSection);
                    }
                    activate(
                        hasBetBuilderSection,
                        hasLiveStreamingSection,
                        hasLiveStatisticsSection,
                        hasPriceBoostSection,
                        hasSuperBoostSection,
                        hasFastMarketsSection,
                        hasLiveVisualSection);
                    inactivate(
                        hasScore24StatisticsSection,
                        hasExternalStatisticsSection);
                    hide(eventStartingInOneHourSection);
                    break;
                case "Prematch":
                    activate(hasBetBuilderSection,
                        hasScore24StatisticsSection,
                        hasExternalStatisticsSection,
                        hasLiveStreamingSection,
                        hasPriceBoostSection,
                        hasSuperBoostSection);
                    inactivate(hasLiveStatisticsSection,
                        hasFastMarketsSection,
                        hasLiveVisualSection,
                        hasVarSection);
                    show(eventStartingInOneHourSection);
                    break;
                case "Over":
                    inactivate(hasBetBuilderSection,
                        hasLiveStreamingSection,
                        hasScore24StatisticsSection,
                        hasExternalStatisticsSection,
                        hasLiveStatisticsSection,
                        hasPriceBoostSection,
                        hasSuperBoostSection,
                        hasFastMarketsSection,
                        hasLiveVisualSection,
                        hasVarSection);
                    hide(eventStartingInOneHourSection);
                    break;
            }
        }
    }

    //by Tamas Czerjak
    function updatePriceBoost(priceBoostObj) {

        // debugger;
        for (let detail of priceBoostObj.criteria.criteriaEntityDetails) {
            updateCategoryAndCompetitionForPbLobby(detail.categoryId, detail.competitionId);
        }

        getState().sportsbook.priceBoost.priceBoost = {
            ...getState().sportsbook.priceBoost.priceBoost, [priceBoostObj.id]: priceBoostObj
        }
    }


    //by Tamas Czerjak
    function updateCategoryAndCompetitionForPbLobby(categoryId, competitionId) {

        let categoryObj = getState().sportsbook.eventMarketWidget.skeleton.categories.find(cat => cat.id === categoryId);

        if (!categoryObj) {
            let categories = getCategories();
            let label = categories[categoryId].label;
            let slug = categories[categoryId].slug;
            categoryObj = {
                id: categoryId,
                label,
                slug,
                competitions: []
            };
        }

        let competitionObj = categoryObj.competitions.find(comp => comp.id === competitionId);

        if (!competitionObj) {
            // const { label } = getState().sportsbook.sportCatalog.competitions[competitionId];
            let label = getCompetitionLabelByCompetitionId(competitionId);
            competitionObj = {
                id: competitionId,
                label
            };
            categoryObj.competitions = [...categoryObj.competitions, competitionObj];
        }

        const actualCategoryIndex = getState().sportsbook.eventMarketWidget.skeleton.categories.findIndex(el => el.id === categoryObj.id);

        if (actualCategoryIndex >= 0) {
            getState().sportsbook.eventMarketWidget.skeleton.categories.splice(actualCategoryIndex, 1, categoryObj);
        } else {
            getState().sportsbook.eventMarketWidget.skeleton.categories = [
                ...getState().sportsbook.eventMarketWidget.skeleton.categories,
                categoryObj
            ]
        }

        getState().sportsbook.eventMarketWidget = {
            ...getState().sportsbook.eventMarketWidget,
            skeleton: {
                ...getState().sportsbook.eventMarketWidget.skeleton
            }
        };

        // getState().sportsbook.eventMarketWidget = {
        //     ...getState().sportsbook.eventMarketWidget,
        //     skeleton: {
        //         ...getState().sportsbook.eventMarketWidget.skeleton,
        //         categories: [
        //             ...getState().sportsbook.eventMarketWidget.skeleton.categories,
        //         ]
        //     }
        // };
    }


    function trimString(element, maxChars) {
        if (element.textContent.length > maxChars) {
            element.innerText = element.textContent.substring(0, maxChars);
            var range = document.createRange();
            var sel = document.getSelection();
            const textNode = element.childNodes[0];
            range.setStart(textNode, 50);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    function getCategories() {
        return getState().sportsbook.sportCatalog.offering.categories;
    }

    window.getLegacyEventId = () => {
        IS_BLE ?
            window.open("http://sbpk8mappingmainapi.sportsbook-prod.euc1.betsson.tech/mapping/fixture/new/" + eventId) :
            window.open("http://sbqk8mappingmainapi.sportsbook-qa-qa.euc1.betsson.tech/mapping/fixture/new/" + eventId);
    }

    window.getWholeIsaResponse = () => {
        if (segmentLegacyId == undefined) {
            segmentLegacyId = getSegmentLegacyId();
        }
        IS_BLE || getIsBleSource() ?
            // window.open("http://sbpisaobg.sportsbook-prod.use1.betsson.tech/v2/" + segmentLegacyId + "/" + LANGUAGECODE + "/event?fixturetags=" + eventId) :
            window.open("http://sbpisaobgk8rob.sportsbook-prod.euc1.betsson.tech/isa/v2/" + segmentLegacyId + "/" + LANGUAGECODE + "/event?fixturetags=" + eventId) :
            window.open("http://sbqk8isaobg.sportsbook-qa-qa.euc1.betsson.tech/isa/v2/" + segmentLegacyId + "/" + LANGUAGECODE + "/event?fixturetags=" + eventId);
    }

    window.getLegacyMarketId = () => {
        IS_BLE ?
            window.open("http://sbpk8mappingmainapi.sportsbook-prod.euc1.betsson.tech/mapping/market/new/" + marketId) :
            window.open("http://sbqk8mappingmainapi.sportsbook-qa-qa.euc1.betsson.tech/mapping/market/new/" + marketId);

    }

    window.openStaticPageInNewWindow = (page) => {
        let url;
        switch (page) {
            case "MarketTemplateTag.cs":
                url = "https://github.com/BetssonGroup/obg-sportsbook/blob/master/Obg.Sportsbook.Contracts/Markets/Models/MarketTemplateTag.cs#LC98";
                break;
        }
        window.open(url);
    }

    function displayInGreen(...elements) {
        for (let element of elements) {
            element.classList.add("displayInGreen");
            // element.classList.remove("displayInRed");
            // element.classList.remove("displayInOrange");
            element.classList.remove("displayInRed", "displayInOrange");
        }
    }

    function displayInRed(...elements) {
        for (let element of elements) {
            element.classList.add("displayInRed");
            element.classList.remove("displayInGreen", "displayInOrange");
            // element.classList.remove("displayInOrange");
        }
    }

    function displayInOrange(...elements) {
        for (let element of elements) {
            element.classList.add("displayInOrange");
            element.classList.remove("displayInGreen", "displayInRed");
            // element.classList.remove("displayInRed");
        }
    }

    function hide(...elements) {
        for (let element of elements) {
            if (!element.classList.contains("hide")) {
                element.classList.add("hide");
            }
        }
    }

    function show(...elements) {
        for (let element of elements) {
            if (element.classList.contains("hide")) {
                element.classList.remove("hide");
            }
        }
    }

    function getMarketLabel(marketId) {
        if (marketId == null) {
            return NOT_FOUND;
        }
        marketLabel = getState().sportsbook.eventMarket.markets[marketId].label;
        if (marketLabel === undefined) {
            marketLabel = getState().sportsbook.eventMarket.markets[marketId].marketFriendlyName;
        }
        return marketLabel;
    }

    function getMarketTemplateId(marketId) {
        return getState().sportsbook.eventMarket.markets[marketId].marketTemplateId;
    }

    function getAccordionKey(marketId) {
        let accordionSummaries = getState().sportsbook.eventWidget.items[getEventIdByMarketId(marketId)].item.accordionSummaries;
        for (let key in accordionSummaries) {
            if (accordionSummaries[key].marketIds.includes(marketId)) {
                return key;
            }
        }
    }

    // function getIsMarketGroupableByMarketTemplate(marketId) {
    //     return getState().sportsbook.eventMarket.markets[marketId].isGroupableByMarketTemplate;
    // }

    // function getIsMarketHaveSiblingsWithSameTemplate(marketId) {
    //     return getState().sportsbook.eventWidget.items[getEventIdByMarketId(marketId)].item.accordionSummaries[getMarketTemplateId(marketId)].marketIds.length > 1;
    // }

    function isCategoryInState(categoryId) {
        return getCategories()[categoryId] !== undefined;
    }


    function getColumnLayout(marketId) {
        return getState().sportsbook.eventMarket.markets[marketId].columnLayout;
    }

    function getIsUserLoggedIn() {
        let authReducer = localStorage.authReducer;
        if (!authReducer) {
            if (IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
                return getState().auth.isAuthenticated;
            }
            if (IS_B2B_IFRAME_ONLY) {
                if (IS_SPORTSBOOK_IN_IFRAME) {
                    return iframeURL.includes("/ctx");
                }
                if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
                    return obgClientEnvironmentConfig.startupContext.contextId.userContextId.includes("ctx");
                }
                return window.location.href.includes("/ctx");
            }
            return false;
        }
        return !!JSON.parse(authReducer).token;
    }

    function getLastMarketIdFromBetslip() {
        try {
            return getMarketIdBySelectionId(getLastSelectionIdFromBetslip());

        } catch {
            return null;
        }
    }

    function getFirstMarketIdOfEvent(eventId) {
        return getState().sportsbook.eventMarket.eventMap[eventId][0];
    }

    function getFirstSelectionIdOfMarket(marketId) {
        let selections = getState().sportsbook.selection.marketMap[marketId];
        for (let sel of selections) {
            if (getState().sportsbook.selection.selections[sel].isEnabled != false) {
                return sel;
            }
        }
        // return getState().sportsbook.selection.marketMap[marketId][0];
    }

    window.setMarketState = (state) => {
        setMarketState(state);
    }

    function isMarketPreBuilt(marketId) {
        const preBuiltMarketTemplateIds = ["PCB2", "PCB3", "PCB4", "PCB5"];
        const preBuiltMarketTemplateTags = [110, 111, 112, 113, 114, 115, 116, 117];

        return (preBuiltMarketTemplateIds.includes(getMarketTemplateId(marketId)) || hasCommonElement(getMarketTemplateTags(marketId), preBuiltMarketTemplateTags));

        function hasCommonElement(marketTemplateTags, preBuiltMarketTemplateTags) {
            return marketTemplateTags.some(element => preBuiltMarketTemplateTags.includes(element));
        }
    }

    function setMarketState(state) {
        if (lockedMarketId !== undefined) {
            marketId = lockedMarketId;
        }
        eventId = getEventIdByMarketId(marketId);
        marketTemplateId = getMarketTemplateId(marketId);
        marketVersion = getMarketVersion(marketId);

        let params = [marketId, eventId, marketTemplateId, marketVersion];
        // if (!getIsAndreasChangeOnMarketStatesDeployed()) {
        //     params.splice(2, 1);
        // }

        switch (state) {
            case "Suspended":
                obgRt.setMarketStateSuspended(...params);
                break;
            case "Open":
                obgRt.setMarketStateOpen(...params);
                break;
            case "Void":
                obgRt.setMarketStateVoid(...params);
                break;
            case "Settled":
                obgRt.setMarketStateSettled(...params);
                break;
            case "Hold":
                obgRt.setMarketStateHold(...params);
                break;
        }
    }


    // function getIsAndreasChangeOnMarketStatesDeployed() {
    //     return (obgRt.setMarketStateOpen.length > 3)
    // }

    function getMarketVersion(marketId) {
        return getState().sportsbook.eventMarket.markets[marketId].marketVersion;
    }

    function setSelectionOdds(selectionId, odds) {
        eventId = getEventIdBySelectionId(selectionId);
        marketId = getMarketIdBySelectionId(selectionId);
        marketVersion = getMarketVersion(marketId);
        marketTemplateId = getMarketTemplateId(marketId);

        let params = {
            msi: selectionId,
            o: Number(odds),
            ei: eventId,
            mv: marketVersion,
            mti: marketTemplateId
        }
        obgRt.setSelectionOdds([params], marketId);
    }

    // function getIsAndreasChangeOnSelectionsStatusesDeployed() {
    //     return (obgRt.setSelectionStatusSuspended.length > 4)
    // }

    window.createMarket = (marketType) => {
        let marketTemplateTagsArrayForPlayerPropsMarket = [14, 35, 41, 47, 53, 101, 104, 106];
        let marketTemplateTagsForFastMarket = [84, 6, 82, 85];
        if (getIsEventPageVisible(eventId)) {
            show(createMarketFeatures);
            hide(createMarketErrorSection);
        } else {
            show(createMarketErrorSection)
            hide(createMarketFeatures);
            return;
        }

        let initialTabLabelsArr = getMarketTabLabelsOnEventPanel();

        switch (marketType) {
            case "playerProps":
                createPlayerPropsMarket();
                break;
            case "playerPropsDummy":
                createPlayerPropsDummyMarket();
                break;
            case "fast":
                createFastmarket();
                setHasFastMarketsFlag(true);
                break;
        }

        setTimeout(function () {
            let updatedMarketTabsOnEventPanel = getMarketTabsOnEventPanel();
            for (let tab of updatedMarketTabsOnEventPanel) {
                if (!initialTabLabelsArr.includes(tab.innerText)) {
                    tab.click();
                }
            }
        }, 500);


        function getMarketTabsOnEventPanel() {
            let pinningTab = document.querySelector("[test-id='event.market.tab.pinning']"); // gen2
            if (pinningTab == null) {
                pinningTab = document.querySelector("[test-id='pinning']");
            }
            return pinningTab.parentElement.getElementsByClassName("obg-tab-label"); // gen1
        }

        function getMarketTabLabelsOnEventPanel() {
            let tabLabelsArray = [];
            let tabArray = getMarketTabsOnEventPanel();
            for (let tab of tabArray) {
                tabLabelsArray.push(tab.innerText);
            }
            return tabLabelsArray;
        }


        function createPlayerPropsMarket() {
            var playerPropsMarketName = "(Player Props Test)  Player Total Shots On Target";
            var players = [
                "Christiano Ronaldo - Juventus",
                "Douglas Costa - Juventus",
                "Aaron Ramsdale - Arsenal F.C.",
                "Bukayo Saka - Arsenal F.C."
            ];
            var marketId;
            var selectionId;
            var selectionLabel;


            for (var i = 0; i < players.length; i++) {
                marketId = "m-" + eventId + "-test" + String(i + 1);
                obgRt.createMarket(eventId, marketId, "PLYPROP1WTSHOTON", marketTemplateTagsArrayForPlayerPropsMarket, playerPropsMarketName + " | " + players[i], "", 2, 88, [{
                    group: "test",
                    sort: 1,
                    groupLevel: "0",
                    groupType: 0
                }, {
                    group: "test",
                    sort: 1,
                    groupLevel: "1",
                    groupType: 2
                }, {
                    group: "test-" + String(i + 1),
                    sort: 1,
                    groupLevel: "2",
                    groupType: 3
                }], [playerPropsMarketName, players[i]]);

                for (var j = 1; j < 5; j++) {
                    for (var k = 1; k < 3; k++) {
                        selectionId = "s-" + marketId + "-sel-" + String(j) + String(k);
                        k == 1 ? selectionLabel = "Over " + String(j) + ".5" : selectionLabel = "Under " + String(j) + ".5";
                        obgRt.createSelection(eventId, marketId, selectionId, selectionLabel, "2");
                        setSelectionOdds(selectionId, getRandomOdds());
                    }
                }
            }
        }

        function createPlayerPropsDummyMarket() {
            var playerPropsMarketName = "(Player Props Test)  Player Total Shots On Target";
            for (var i = 5; i < 20; i++) {
                obgRt.createMarketWithDummySelection(eventId, "m-" + eventId + "-test-" + String(i), "PLYPROP1WTSHOTON", marketTemplateTagsArrayForPlayerPropsMarket, playerPropsMarketName + " | Dummy Player - Arsenal F.C.", "", 2, 88, [{
                    group: "test",
                    sort: 1,
                    groupLevel: "0",
                    groupType: 0
                }, {
                    group: "test",
                    sort: 1,
                    groupLevel: "1",
                    groupType: 2
                }, {
                    group: "test-" + i,
                    sort: 1,
                    groupLevel: "2",
                    groupType: 3
                }], [playerPropsMarketName, "Dummy Player - Arsenal F.C. -" + String(i - 4)]);
            }
        }

        function createFastmarket() {
            var fastMarketTemplateId = "N5MTTI";
            obgRt.createMarketWithDummySelection(eventId, "m-" + eventId + "-" + fastMarketTemplateId, fastMarketTemplateId, marketTemplateTagsForFastMarket, "Test Fast Market Next 1 minute (0:00 - 0:59) | A stray dog interrupted the match", 0, 2, 69, [{
                "group": "01",
                sort: 1,
                "groupLevel": "0",
                groupType: 0
            }, {
                "group": "00",
                sort: 1,
                "groupLevel": "1",
                groupType: 2
            }, {
                "group": fastMarketTemplateId,
                sort: 6,
                "groupLevel": "2",
                groupType: 1
            }], ["Test Fast Market Next 1 minute (0:00 - 0:59)", "A stray dog interrupted the match"]);
        }

        function getRandomOdds() {
            var min = 1.01;
            var max = 10;
            var value = (Math.random() * (max - min + 1)) + min;
            return Number(Number.parseFloat(value).toFixed(2));
        }
    }

    function setHasFastMarketsFlag(value) {
        getState().sportsbook.event.events[eventId].hasFastMarkets = value;
        triggerChangeDetection(eventId, 100);
    }

    function getBetSlipByObgState() {
        return getState().sportsbook.betslip;
    }

    function getUsersCurrency() {
        return getState().customer.customer.basicInformation.currencyCode;
    }

    window.submitScore = (participant) => {
        var scoreBoard = getState().sportsbook.scoreboard[eventId];
        var participantId;
        var score;
        if (participant === "home") {
            participantId = scoreBoard.participants[0].id;
            score = getElementById("homeScoreInputField").value;
            setValues(participantId, Number(score));
        } else {
            participantId = scoreBoard.participants[1].id;
            score = getElementById("awayScoreInputField").value;
            setValues(participantId, score);
        }

        function setValues(participantId, score) {
            if (score !== "") {
                obgRt.setFootballParticipantScore(eventId, participantId, Number(score));
            }
        }
    }

    function triggerChangeDetection(eventId = Object.values(getState().sportsbook.event.events)[0].id, delay = 0) {
        let currentEventPhase = getState().sportsbook.event.events[eventId].phase;
        let setEventPhase = {
            "Live": "setEventPhaseOver",
            "Prematch": "setEventPhaseOver",
            "Over": "setEventPhasePrematch"
        };
        obgRt[setEventPhase[currentEventPhase]](eventId);
        setTimeout(function () { obgRt["setEventPhase" + currentEventPhase](eventId); }, delay);
    }

    window.submitScoreBoard = () => {
        if (lockedEventId !== undefined) {
            eventId = lockedEventId;
        }
        var scoreBoard = getState().sportsbook.scoreboard[eventId];
        var homeId = scoreBoard.participants[0].id;
        var awayId = scoreBoard.participants[1].id;

        setValues("corners", homeId, getElementById("homeCorners").value);
        setValues("corners", awayId, getElementById("awayCorners").value);
        setValues("substitutions", homeId, getElementById("homeSubstitutions").value);
        setValues("substitutions", awayId, getElementById("awaySubstitutions").value);
        setValues("yellowCards", homeId, getElementById("homeYellowCards").value);
        setValues("yellowCards", awayId, getElementById("awayYellowCards").value);
        setValues("redCards", homeId, getElementById("homeRedCards").value);
        setValues("redCards", awayId, getElementById("awayRedCards").value);
        setValues("penalties", homeId, getElementById("homePenalties").value);
        setValues("penalties", awayId, getElementById("awayPenalties").value);

        function setValues(scoreBoardItem, participantId, value) {
            let params = [eventId, participantId, Number(value)];
            if (value !== "") {
                switch (scoreBoardItem) {
                    case "corners":
                        obgRt.setFootballParticipantCorners(...params);
                        break;
                    case "substitutions":
                        obgRt.setFootballParticipantSubstitutions(...params);
                        break;
                    case "yellowCards":
                        obgRt.setFootballParticipantYellowCards(...params);
                        break;
                    case "redCards":
                        obgRt.setFootballParticipantRedCards(...params);
                        break;
                    case "penalties":
                        obgRt.setFootballParticipantPenalties(...params);
                        break;
                }
            }
        }
    }

    window.getTwitchProviderIds = () => {
        var twitchResultSection = getElementById("twitchResults");
        twitchResultSection.innerHTML = null;
        displayInGreen(twitchResultSection);

        var url = "https://gql.twitch.tv/gql";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Client-Id", "kimne78kx3ncx6brgo4mv6wki5h1ko");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                processResponse(xhr.responseText);
            }
        };
        var numberOfResults = 8;
        var data = {
            "operationName": "FeaturedContentCarouselStreams",
            "variables": {
                "language": "en",
                "first": numberOfResults,
                "acceptedMature": true
            },
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": "ab19fb72d5e43c8edc59d41300a129548cb1a67feca04f921bf705a74bb70a24"
                }
            }
        };
        xhr.send(JSON.stringify(data));

        function processResponse(response) {
            var obj = JSON.parse(response);
            var twitchId;
            for (i = 0; i < numberOfResults; i++) {
                twitchId = obj.data.featuredStreams[i].stream.broadcaster.login;
                twitchResultSection.innerHTML += twitchId + ", ";
            }
            twitchResultSection.innerHTML = (twitchResultSection.innerHTML.slice(0, -2));
        }
    }

    window.getPerformProviderIds = () => {
        const performResultSection = getElementById("performResults");
        performResultSection.innerHTML = null;
        displayInGreen(performResultSection);

        var performUrl = "https://secure.betsson.performgroup.com/streaming/eventList";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", performUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                processResponse(xhr.responseXML);
            }
        }

        xhr.onerror = function () {
            displayInRed(performResultSection);
            performResultSection.innerHTML = "Sorry, this requires a browser extension, such as<br><a href='https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en-US') target='_blank' rel='noopener noreferrer'><b><u>Allow CORS</u></b></a>.<br>(Maybe you can live without this feature, otherwise turn the extension off after used.)";
        };

        xhr.send();

        function processResponse(response) {
            try {
                var events = response.getElementsByTagName("event");
            } catch {
                displayInRed(performResultSection);
                performResultSection.innerHTML = "Provider XML error.<br>Check if it returns an XML: <a href='https://secure.betsson.performgroup.com/streaming/eventList') target='_blank' rel='noopener noreferrer'><u>Perform Provider XML</u></a>";
            }
            var currentDate = new Date();
            var currentDateInBST = currentDate.setHours(currentDate.getHours() - 1);
            var inputDate, day, month, year;
            var time, hour, minutes;
            var startDate, endDate;

            for (i = 0; i < events.length; i++) {
                startDate = createDateObject("startDate", "startTime")
                endDate = createDateObject("endDate", "endTime")
                if (startDate < currentDateInBST && endDate > currentDateInBST) {
                    performResultSection.innerHTML += events[i].getAttribute("id") + ", ";
                }
            }
            performResultSection.innerHTML = (performResultSection.innerHTML.slice(0, -2));

            function createDateObject(dateAttribName, timeAttribName) {
                inputDate = events[i].getAttribute(dateAttribName);
                day = inputDate.slice(0, 2);
                month = inputDate.slice(3, 5) - 1; // js stores month 0-11
                year = inputDate.slice(6, 10);
                time = events[i].getAttribute(timeAttribName);
                hour = time.slice(0, 2);
                minutes = time.slice(3, 5);
                return new Date(year, month, day, hour, minutes);
            }
        }
    }

    window.initBonuses = () => {
        stopPolling();
        const SEPARATOR_ARROW = " &#10132 "
        const CHECKMARK_ICON = " \u2705"

        var priceBoosts, priceBoostsArray, validPbArray, garbagePbArray;
        previousPriceBoosts = null;
        previousSelectionId = undefined;

        const pbCombiIcon = "&#x1F9E9;";
        const pbPersonalIcon = "&#128151;";
        const pbCriteriaNotMetIcon = "&#128683;";
        const pbSuperBoostIcon = "&#128640;";

        const noPbFound = getElementById("noPbFound");
        const pbSelector = getElementById("pbSelector");
        const pbLegendSection = getElementById("pbLegendSection");
        const pbLegendCombi = getElementById("pbLegendCombi");
        const pbLegendPersonal = getElementById("pbLegendPersonal");
        const pbLegendSuperBoost = getElementById("pbLegendSuperBoost");
        const pbLegendCriteriaNotMet = getElementById("pbLegendCriteriaNotMet");
        const pbLegendCloseable = getElementById("pbLegendCloseable");


        const pbDetailsLayout = getElementById("pbDetailsLayout");
        const pbNumberOf = getElementById("pbNumberOf");
        const pbNumberOfListed = getElementById("pbNumberOfListed");
        const pbName = getElementById("pbName");
        const pbIdSpan = getElementById("pbIdSpan");
        const pbVisibility = getElementById("pbVisibility");
        const pbType = getElementById("pbType");
        const pbPayoutMode = getElementById("pbPayoutMode");
        const pbEventPhases = getElementById("pbEventPhases");
        const pbMinMaxStake = getElementById("pbMinMaxStake");
        const pbMinMaxOdds = getElementById("pbMinMaxOdds");
        const pbStakeRangeDiv = getElementById("pbStakeRangeDiv");
        const pbExpiryDate = getElementById("pbExpiryDate");
        const pbPathToCompetition = getElementById("pbPathToCompetition");
        const boostedSelectionDiv = getElementById("boostedSelectionDiv");
        const eventLabelForPbDiv = getElementById("eventLabelForPbDiv");
        const marketLabelForPbDiv = getElementById("marketLabelForPbDiv");
        const selectionLabelForPbDiv = getElementById("selectionLabelForPbDiv");
        const radioPbByName = getElementById("radioPbByName");
        const radioPbByEvent = getElementById("radioPbByEvent");
        const radioPbGarbage = getElementById("radioPbGarbage");
        const goToEventPageRow = getElementById("goToEventPageRow");
        const goToEventPageLink = getElementById("goToEventPageLink");
        const addPbToCarouselRow = getElementById("addPbToCarouselRow");
        const listPbByNameDiv = getElementById("listPbByNameDiv");
        const listPbByEventNameDiv = getElementById("listPbByEventNameDiv");

        var freeBets;
        previousFreeBets = null;
        const freeBetNotFound = getElementById("freeBetNotFound");
        const freeBetLogin = getElementById("freeBetLogin");
        const freeBetSelector = getElementById("freeBetSelector");
        const freeBetNumberOf = getElementById("freeBetNumberOf");
        const freeBetDetailsLayout = getElementById("freeBetDetailsLayout");
        const freeBetName = getElementById("freeBetName");
        const freeBetIdSpan = getElementById("freeBetIdSpan");
        const freeBetRestrictionsSection = getElementById("freeBetRestrictionsSection");
        const freeBetPathToCompetition = getElementById("freeBetPathToCompetition");
        const freeBetFurtherRestricions = getElementById("freeBetFurtherRestricions");
        const freeBetType = getElementById("freeBetType");
        const freeBetPayoutMode = getElementById("freeBetPayoutMode");
        const freeBetStake = getElementById("freeBetStake");
        const freeBetBetTypes = getElementById("freeBetBetTypes");
        const freeBetEventPhases = getElementById("freeBetEventPhases");
        const freeBetNoOfSelectionsDiv = getElementById("freeBetNoOfSelectionsDiv");
        const freeBetNoOfSelections = getElementById("freeBetNoOfSelections");
        const freeBetExpiryDate = getElementById("freeBetExpiryDate");

        const listeners = [
            listenerForAccaInsDetails,
            listenerForPriceBoostDetails,
            listenerForProfitBoostDetails,
            listenerForFreeBetDetails,
            listenerForSelectedPriceBoost,
            listenerForAddPbToCarouselOrCards,
            listenerForAccaBoostDetails,
            listenerForActiveAccaBoostIndex
        ];

        listeners.forEach(listener => {
            const intervalId = setInterval(listener, POLLING_INTERVAL);
            intervalIdsForPolling.push(intervalId);
        });


        // intervalIdForPolling = setInterval(listenerForAccaInsDetails, POLLING_INTERVAL);
        // intervalIdsForPolling.push(intervalIdForPolling);

        // intervalIdForPolling = setInterval(listenerForPriceBoostDetails, POLLING_INTERVAL);
        // intervalIdsForPolling.push(intervalIdForPolling);

        // intervalIdForPolling = setInterval(listenerForProfitBoostDetails, POLLING_INTERVAL);
        // intervalIdsForPolling.push(intervalIdForPolling);

        // intervalIdForPolling = setInterval(listenerForFreeBetDetails, POLLING_INTERVAL);
        // intervalIdsForPolling.push(intervalIdForPolling);

        // intervalIdForPolling = setInterval(listenerForSelectedPriceBoost, POLLING_INTERVAL);
        // intervalIdsForPolling.push(intervalIdForPolling);

        // intervalIdForPolling = setInterval(listenerForAddPbToCarouselOrCards, POLLING_INTERVAL); //
        // intervalIdsForPolling.push(intervalIdForPolling);

        // intervalIdForPolling = setInterval(listenerForAccaBoostDetails, POLLING_INTERVAL);
        // intervalIdsForPolling.push(intervalIdForPolling);

        // intervalIdForPolling = setInterval(listenerForActiveAccaBoostIndex, POLLING_INTERVAL);
        // intervalIdsForPolling.push(intervalIdForPolling);

        window.closePbLegend = () => {
            hide(pbLegendCloseable);
        }


        //////// ACCA Insurance /////////

        let accaInsurances, stringBetInsurance, previousStringBetInsurance;
        let selectedAccaIns;

        const loginToSeeAccaIns = getElementById("loginToSeeAccaIns");
        const noAccaInsFound = getElementById("noAccaInsFound");
        const accaInsSelector = getElementById("accaInsSelector");
        const accaInsNumberOf = getElementById("accaInsNumberOf");
        const accaInsDetailsLayout = getElementById("accaInsDetailsLayout");
        const accaInsRestrictionsSection = getElementById("accaInsRestrictionsSection");
        const accaInsRestrictionPath = getElementById("accaInsRestrictionPath");
        const accaInsNameField = getElementById("accaInsNameField");
        const accaInsIdField = getElementById("accaInsIdField");
        const accaInsEventPhaseRow = getElementById("accaInsEventPhaseRow");
        const accaInsEventPhaseValue = getElementById("accaInsEventPhaseValue");
        const accaInsMinimumNumberOfSelectionsSpan = getElementById("accaInsMinimumNumberOfSelectionsSpan");
        const accaInsSelectionOddsLimitMinSpan = getElementById("accaInsSelectionOddsLimitMinSpan");
        const accaInsTotalOddsLimitMinRow = getElementById("accaInsTotalOddsLimitMinRow");
        const accaInsTotalOddsLimitMinSpan = getElementById("accaInsTotalOddsLimitMinSpan");
        const accaInsMinMaxStakeSpan = getElementById("accaInsMinMaxStakeSpan");
        const accaInsExpiryDateSpan = getElementById("accaInsExpiryDateSpan");
        const accaInsPayoutMode = getElementById("accaInsPayoutMode");
        const accaInsMaxPayoutSpan = getElementById("accaInsMaxPayoutSpan");
        const accaInsMaxLosingSelectionsCountSpan = getElementById("accaInsMaxLosingSelectionsCountSpan");
        const radioApplySelectedAccaIns = getElementById("radioApplySelectedAccaIns");
        const applySelectedAccaInsDiv = getElementById("applySelectedAccaInsDiv");


        function listenerForAccaInsDetails() {

            if (!getIsUserLoggedIn()) {
                show(loginToSeeAccaIns);
                hide(noAccaInsFound, accaInsDetailsLayout);
                return;
            } else {
                hide(loginToSeeAccaIns);
            }

            // betInsurance = getState().sportsbook.betInsurance;
            stringBetInsurance = JSON.stringify(getState().sportsbook.betInsurance);

            if (stringBetInsurance == previousStringBetInsurance) {
                return;
            } else {
                previousStringBetInsurance = stringBetInsurance;
            }

            accaInsurances = getState().sportsbook.betInsurance.betInsurances;
            if (accaInsurances.length == 0) {
                show(noAccaInsFound);
                hide(accaInsDetailsLayout);
                return;
            } else {
                show(accaInsDetailsLayout);
                hide(noAccaInsFound);
            }
            populateAccaInsSelector();
        }

        function populateAccaInsSelector() {
            accaInsNumberOf.innerText = accaInsurances.length;
            accaInsSelector.innerHTML = "";
            let option;

            accaInsurances.length == 1 ? hide(applySelectedAccaInsDiv) : show(applySelectedAccaInsDiv);

            accaInsurances = accaInsurances.sort((a, b) => a.name > b.name ? 1 : -1);

            for (let ins of accaInsurances) {
                option = document.createElement("option");
                option.innerHTML = ins.name;

                // if (accaInsurances.length > 1 && getIsSelectedAccaInsApplied(ins.id)) { option.innerHTML += " " + "&#129351;"; }
                if (accaInsurances.length > 1 && getIsSelectedAccaInsApplied(ins.id)) { option.innerHTML += CHECKMARK_ICON; }
                // getIsSelectedAccaInsApplied
                option.value = ins.id;
                accaInsSelector.appendChild(option);
            }
            selectAccaIns(accaInsurances[getIndexOfAccaInsuranceSelectedBySystem()].id);
        }

        function getIndexOfAccaInsuranceSelectedBySystem() {
            return accaInsurances.findIndex(obj => obj.id === getState().sportsbook.betInsurance.selectedBetInsurance.id);
        }

        window.applySelectedAccaIns = () => {
            getState().sportsbook.betInsurance.selectedBetInsurance = selectedAccaIns;
            selectAccaIns(selectedAccaIns.id);
            // triggerChangeDetection(getEventIdBySelectionId(getLastSelectionIdFromBetslip()));
            triggerChangeDetection();
        }

        function getIsSelectedAccaInsApplied(bonusId) {
            return bonusId == getState().sportsbook.betInsurance.selectedBetInsurance.id
        }


        window.selectAccaIns = (bonusId) => {
            selectAccaIns(bonusId);
        }
        function selectAccaIns(bonusId) {
            accaInsRestrictionPath.innerHTML = "";
            setOptionInBonusSelector(accaInsSelector, bonusId);
            let usersCurrency = getUsersCurrency();
            for (let ins of accaInsurances) {
                if (bonusId == ins.id) {
                    selectedAccaIns = ins;
                }
            }
            accaInsId = selectedAccaIns.id;
            accaInsIdField.innerText = accaInsId;
            accaInsNameField.innerText = selectedAccaIns.name;

            handleRestrictionsSection(selectedAccaIns, accaInsRestrictionsSection, accaInsRestrictionPath);
            handleEventPhases(selectedAccaIns, accaInsEventPhaseRow, accaInsEventPhaseValue);

            accaInsMinimumNumberOfSelectionsSpan.innerText = selectedAccaIns.conditions.minimumNumberOfSelections;

            let accaInsSelectionOddsLimitMin = selectedAccaIns.conditions.selectionOddsLimit.minOdds;
            let accaInsTotalOddsLimitMin = selectedAccaIns.conditions.oddsLimit.minOdds;
            if (accaInsTotalOddsLimitMin <= accaInsSelectionOddsLimitMin) {
                hide(accaInsTotalOddsLimitMinRow);
            } else {
                show(accaInsTotalOddsLimitMinRow);
                accaInsTotalOddsLimitMinSpan.innerText = accaInsTotalOddsLimitMin.toFixed(2);
            }
            accaInsSelectionOddsLimitMinSpan.innerText = accaInsSelectionOddsLimitMin.toFixed(2);
            accaInsMinMaxStakeSpan.innerText =
                getDotsIfZero(selectedAccaIns.conditions.minimumStake) +
                " - "
                + getDotsIfZero(selectedAccaIns.conditions.maximumStake)
                + " " + usersCurrency;

            accaInsExpiryDateSpan.innerText = getFriendlyDateFromIsoDate(selectedAccaIns.expiryDate);
            accaInsPayoutMode.innerText = getBoostPayoutMode(selectedAccaIns);
            accaInsMaxPayoutSpan.innerText = selectedAccaIns.bonusData.maximumPayout + " " + usersCurrency;
            accaInsMaxLosingSelectionsCountSpan.innerText = selectedAccaIns.bonusData.maximumLosingSelectionsCount;

            getIsSelectedAccaInsApplied(selectedAccaIns.id) ? radioApplySelectedAccaIns.checked = true : radioApplySelectedAccaIns.checked = false;

        }

        //////// End of ACCA Insurance /////////

        function handleEventPhases(bonus, eventPhaseRow, eventPhaseValue) {
            let eventPhases = bonus.criteria.eventPhases;
            if (eventPhases.length > 1) {
                hide(eventPhaseRow);
            } else {
                show(eventPhaseRow);
                eventPhaseValue.innerText = eventPhases;
            }
        }

        function handleRestrictionsSection(bonus, restrictionSection, restrictionPath) {
            let criteriaEntityDetails = bonus.criteria.criteriaEntityDetails;
            if (criteriaEntityDetails.length == 0) {
                hide(restrictionSection);
            } else {
                show(restrictionSection);
                populateRestrictionsPaths(restrictionPath, criteriaEntityDetails);
            }
        }

        ////////////////////////////////// PROFITBOOST ///////////////////////////////////////////

        let profitBoostsArray;
        previousProfitBoosts = null;
        const profitBoostNotFound = getElementById("profitBoostNotFound");
        const profitBoostLogin = getElementById("profitBoostLogin");
        const profitBoostSelector = getElementById("profitBoostSelector");
        const profitBoostNumberOf = getElementById("profitBoostNumberOf");
        const profitBoostDetailsLayout = getElementById("profitBoostDetailsLayout");
        const profitBoostName = getElementById("profitBoostName");
        const profitBoostIdSpan = getElementById("profitBoostId");
        const profitBoostRestrictionsSection = getElementById("profitBoostRestrictionsSection");
        const profitBoostPathToCompetition = getElementById("profitBoostPathToCompetition");
        const profitBoostMultiplier = getElementById("profitBoostMultiplier");
        const profitBoostPayoutMode = getElementById("profitBoostPayoutMode");
        const profitBoostMaxBoostedWinningsInEuro = getElementById("profitBoostMaxBoostedWinningsInEuro");
        const profitBoostStake = getElementById("profitBoostStake");
        const profitBoostMinMaxOdds = getElementById("profitBoostMinMaxOdds");
        const profitBoostBetTypes = getElementById("profitBoostBetTypes");
        const profitBoostEventPhases = getElementById("profitBoostEventPhases");
        const profitBoostNoOfSelectionsDiv = getElementById("profitBoostNoOfSelectionsDiv");
        const profitBoostNoOfSelections = getElementById("profitBoostNoOfSelections");
        const profitBoostExpiryDate = getElementById("profitBoostExpiryDate");

        function listenerForProfitBoostDetails() {
            if (!getIsUserLoggedIn()) {
                hide(profitBoostNotFound, profitBoostDetailsLayout);
                show(profitBoostLogin);
                return;
            } else {
                hide(profitBoostLogin);
            }

            profitBoosts = getState().sportsbook.profitBoost.profitBoost;
            profitBoostsArray = Object.values(profitBoosts);

            if (profitBoosts == previousProfitBoosts) {
                return;
            } else {
                previousProfitBoosts = profitBoosts;
            }
            if (profitBoostsArray.length == 0) {
                show(profitBoostNotFound);
                hide(profitBoostDetailsLayout);
                return;
            } else {
                show(profitBoostDetailsLayout);
                hide(profitBoostNotFound);
            }
            populateProfitBoostSelector();

        }

        function populateProfitBoostSelector() {
            profitBoostNumberOf.innerText = profitBoostsArray.length;
            profitBoostSelector.innerHTML = "";
            let option;
            profitBoostsArray = profitBoostsArray.sort((a, b) => a.name > b.name ? 1 : -1);
            for (let boost of profitBoostsArray) {
                option = document.createElement("option");
                option.text = boost.name;
                option.value = boost.id;
                profitBoostSelector.appendChild(option);
            }
            selectProfitBoost(profitBoostsArray[0].id);
        }

        window.selectProfitBoost = (value) => {
            selectProfitBoost(value);
        }

        function selectProfitBoost(value) {
            let selectedProfitBoost;
            for (let boost of profitBoostsArray) {
                if (value == boost.id) {
                    selectedProfitBoost = boost;
                }
            }
            profitBoostId = selectedProfitBoost.id;
            profitBoostIdSpan.innerText = profitBoostId;
            profitBoostName.innerText = selectedProfitBoost.name;

            if (selectedProfitBoost.criteria.criteriaEntityDetails.length > 0) {
                show(profitBoostRestrictionsSection);
                profitBoostPathToCompetition.innerHTML = getProfitBoostPathToCompetition();
            } else {
                hide(profitBoostRestrictionsSection);
            }

            profitBoostMultiplier.innerText = selectedProfitBoost.bonusData.profitBoostMultiplier + "%";
            // profitBoostPayoutMode.innerText = " " + getProfitBoostPayoutMode();
            profitBoostPayoutMode.innerText = " " + getBoostPayoutMode(selectedProfitBoost);
            profitBoostMaxBoostedWinningsInEuro.innerText = selectedProfitBoost.bonusData.maxBoostedWinningsInEuro + " EUR";
            profitBoostStake.innerText = selectedProfitBoost.conditions.minimumStake + " - " + selectedProfitBoost.conditions.maximumStake + " " + getCurrencyForBonuses();
            profitBoostMinMaxOdds.innerText = selectedProfitBoost.conditions.oddsLimit.minOdds + " - " + selectedProfitBoost.conditions.oddsLimit.maxOdds;
            profitBoostBetTypes.innerText = getArrayAsCommaSeparatedString(selectedProfitBoost.conditions.betTypes);
            profitBoostEventPhases.innerText = getArrayAsCommaSeparatedString(selectedProfitBoost.criteria.eventPhases);
            profitBoostExpiryDate.innerText = getFriendlyDateFromIsoDate(selectedProfitBoost.expiryDate);
            let noOfSelection = getNumberOfSelections();
            if (noOfSelection != undefined) {
                show(freeBetNoOfSelectionsDiv);
                profitBoostNoOfSelections.innerText = noOfSelection;
            } else {
                hide(profitBoostNoOfSelectionsDiv);
            }

            function getNumberOfSelections() {
                let min = getDotsIfZero(selectedProfitBoost.conditions.minimumNumberOfSelections);
                let max = getDotsIfZero(selectedProfitBoost.conditions.maximumNumberOfSelections);
                if (min == "..." && max == "...") {
                    return undefined;
                }
                if (min == max) {
                    return min;
                }
                return min + " - " + max;
            }

            function getProfitBoostPathToCompetition() {
                let pathToCompetition, categoryName, competitionId, eventId, marketTemplateId;
                categoryName = getCategoryLabelByCategoryId(selectedProfitBoost.criteria.criteriaEntityDetails[0].categoryId);
                pathToCompetition = categoryName;
                competitionId = selectedProfitBoost.criteria.criteriaEntityDetails[0].competitionId;
                if (competitionId != undefined) {
                    pathToCompetition
                        += SEPARATOR_ARROW
                        + getRegionNameByCompetitionId(competitionId)
                        + SEPARATOR_ARROW + getCompetitionLabelByCompetitionId(competitionId);

                    eventId = selectedProfitBoost.criteria.criteriaEntityDetails[0].eventId;
                    if (eventId != undefined) {
                        if (!isEventInState(eventId)) {
                            return pathToCompetition += SEPARATOR_ARROW + "[EVENT DATA NOT YET IN OBGSTATE]";
                        }
                        pathToCompetition
                            += SEPARATOR_ARROW
                            + getEventDisplayLabel(eventId);
                        marketTemplateId = selectedProfitBoost.criteria.marketTemplateIds[0];
                        if (marketTemplateId != undefined) {
                            marketId = getMarketIdByEventIdAndMarketTemplateId(eventId, marketTemplateId);
                            if (marketId == undefined) {
                                return pathToCompetition += SEPARATOR_ARROW + "[MARKET DATA NOT YET IN OBGSTATE]";
                            }
                            pathToCompetition
                                += SEPARATOR_ARROW
                                + getMarketLabel(marketId)
                                + " (" + marketTemplateId + ")";
                        }
                    }
                    return pathToCompetition;
                } else {
                    // hide(profitBoostFurtherRestricions);
                    return categoryName;
                }
            }
        }
        ////////////////////////////////// END PROFITBOOST ///////////////////////////////////////////

        /////////////////ACCA BOOST /////////////////////

        let accaBoost, accaBoosts;
        // let activeBoostIndex, previousActiveBoostIndex;
        let accaBoostIdsArray = [], previousAccaBoostIdsArray = [""];
        const accaBoostNotFound = getElementById("accaBoostNotFound");
        const accaBoostLogin = getElementById("accaBoostLogin");
        const accaBoostSelector = getElementById("accaBoostSelector");
        const accaBoostNumberOf = getElementById("accaBoostNumberOf");
        const accaBoostDetailsLayout = getElementById("accaBoostDetailsLayout");
        const accaBoostName = getElementById("accaBoostName");
        const accaBoostIdSpan = getElementById("accaBoostId");
        const accaBoostRestrictionsSection = getElementById("accaBoostRestrictionsSection");
        const accaBoostRestrictionPath = getElementById("accaBoostRestrictionPath");
        const accaBoostLadder = getElementById("accaBoostLadder");
        const accaBoostEventPhaseValue = getElementById("accaBoostEventPhaseValue");
        const accaBoostEventPhaseRow = getElementById("accaBoostEventPhaseRow");
        const accaBoostMinMaxSelectionOdds = getElementById("accaBoostMinMaxSelectionOdds");
        const accaBoostMinMaxSelectionOddsRow = getElementById("accaBoostMinMaxSelectionOddsRow");
        const accaBoostNoOfSelections = getElementById("accaBoostNoOfSelections");
        const accaBoostNoOfSelectionsRow = getElementById("accaBoostNoOfSelectionsRow");
        const accaBoostExpiryDate = getElementById("accaBoostExpiryDate");
        const accaBoostPayout = getElementById("accaBoostPayout");
        const accaBoostAppliedOn = getElementById("accaBoostAppliedOn");
        const accaBoostMaxBoostedWinningsEur = getElementById("accaBoostMaxBoostedWinningsEur");
        const accaBoostMaxBoostedWinningsOther = getElementById("accaBoostMaxBoostedWinningsOther");

        function listenerForAccaBoostDetails() {
            if (!getIsUserLoggedIn()) {
                hide(accaBoostNotFound, accaBoostDetailsLayout);
                show(accaBoostLogin);
                return;
            } else {
                hide(accaBoostLogin);
            }

            accaBoost = getState().sportsbook.accaBoost;
            accaBoosts = accaBoost.accaBoosts;

            accaBoostIdsArray = [];
            if (accaBoosts.length > 0) {
                for (let boost of accaBoosts) {
                    accaBoostIdsArray.push(boost.id);
                }
            }

            if (areArraysEqual(accaBoostIdsArray, previousAccaBoostIdsArray)) {
                return;
            }
            previousAccaBoostIdsArray = accaBoostIdsArray;

            if (accaBoosts.length == 0) {
                show(accaBoostNotFound);
                hide(accaBoostDetailsLayout);
                return;
            } else {
                show(accaBoostDetailsLayout);
                hide(accaBoostNotFound);
            }
            populateAccaBoostSelector();
        }

        let activeBoostIndex, previousActiveBoostIndex;
        function listenerForActiveAccaBoostIndex() {
            if (getState().sportsbook?.accaBoost?.accaBoosts.length == 0) { return; }
            activeBoostIndex = accaBoost.activeBoostIndex;
            if (activeBoostIndex != previousActiveBoostIndex) {
                addRemoveActiveAccaBoostIcon(activeBoostIndex);
                previousActiveBoostIndex = activeBoostIndex;
            }
        }

        function addRemoveActiveAccaBoostIcon(activeBoostIndex) {
            let selectorOptions = accaBoostSelector.getElementsByTagName("option");
            for (option of selectorOptions) {
                if (option.value == accaBoosts[activeBoostIndex]?.id) {
                    if (!option.innerHTML.includes("\u2705")) {
                        option.innerHTML += " \u2705";
                    }
                } else {
                    option.innerHTML = option.innerHTML.replace("\u2705", "");
                }
            }
        }

        function populateAccaBoostSelector() {
            accaBoostNumberOf.innerText = accaBoosts.length;
            accaBoostSelector.innerHTML = "";
            let option;
            accaBoosts = accaBoosts.sort((a, b) => a.name > b.name ? 1 : -1);
            for (let boost of accaBoosts) {
                option = document.createElement("option");
                option.text = boost.name;
                option.value = boost.id;
                accaBoostSelector.appendChild(option);
            }
            addRemoveActiveAccaBoostIcon(accaBoost.activeBoostIndex);
            selectAccaBoost(accaBoosts[0].id);
        }

        window.selectAccaBoost = (value) => {
            selectAccaBoost(value);
        }

        function selectAccaBoost(value) {
            accaBoostRestrictionPath.innerHTML = "";
            accaBoostLadder.innerHTML = "";
            let selectedAccaBoost;
            for (let boost of accaBoosts) {
                if (value == boost.id) {
                    selectedAccaBoost = boost;
                }
            }
            accaBoostId = selectedAccaBoost.id;
            accaBoostIdSpan.innerText = accaBoostId;
            accaBoostName.innerText = selectedAccaBoost.name;

            handleRestrictionsSection(selectedAccaBoost, accaBoostRestrictionsSection, accaBoostRestrictionPath);

            let selectionBoosts = selectedAccaBoost.bonusData.selectionBoosts;

            for (let s of selectionBoosts) {

                let li = document.createElement("li");

                let span1 = document.createElement("span");
                span1.classList.add("accaBoostSelCount");
                let span2 = document.createElement("span");
                li.append(span1, span2);

                let selectionCount;
                s.selectionsRangeFrom == s.selectionsRangeTo ?
                    selectionCount = s.selectionsRangeFrom :
                    selectionCount = s.selectionsRangeFrom + " - " + s.selectionsRangeTo;

                span1.innerText = "Selection Count: " + selectionCount;
                span2.innerText =
                    " Multiplier: "
                    + s.boostMultiplier
                    + "%";

                accaBoostLadder.appendChild(li);
            }

            handleEventPhases(selectedAccaBoost, accaBoostEventPhaseRow, accaBoostEventPhaseValue);

            let minSelectionOdds = selectedAccaBoost.conditions?.selectionOddsLimit?.minOdds;
            let maxSelectionOdds = selectedAccaBoost.conditions?.selectionOddsLimit?.maxOdds;
            if ((minSelectionOdds == 0 || minSelectionOdds == undefined) && (maxSelectionOdds == 0) || maxSelectionOdds == undefined) {
                hide(accaBoostMinMaxSelectionOddsRow);
            } else {
                show(accaBoostMinMaxSelectionOddsRow);
                accaBoostMinMaxSelectionOdds.innerText = getDotsIfZero(minSelectionOdds) + " - " + getDotsIfZero(maxSelectionOdds);
            }

            let minimumNumberOfSelections = selectedAccaBoost.conditions.minimumNumberOfSelections;
            let maximumNumberOfSelections = selectedAccaBoost.conditions.maximumNumberOfSelections;
            if (minimumNumberOfSelections == 0 && maximumNumberOfSelections == 0) {
                hide(accaBoostNoOfSelectionsRow);
            } else {
                show(accaBoostNoOfSelectionsRow);
                accaBoostNoOfSelections.innerText = getDotsIfZero(minimumNumberOfSelections) + " - " + getDotsIfZero(maximumNumberOfSelections);
            }


            accaBoostExpiryDate.innerText = getFriendlyDateFromIsoDate(selectedAccaBoost.expiryDate);

            let maxBoostedWinningsInOtherCurrencies = selectedAccaBoost.bonusData.maxBoostedWinningsInOtherCurrencies;
            if (Object.keys(maxBoostedWinningsInOtherCurrencies).length > 0) {
                accaBoostMaxBoostedWinningsOther.innerText = " / "
                    + Object.values(maxBoostedWinningsInOtherCurrencies)[0]
                    + " "
                    + Object.keys(maxBoostedWinningsInOtherCurrencies)[0].toUpperCase();
            }

            accaBoostMaxBoostedWinningsEur.innerText = selectedAccaBoost.bonusData.maxBoostedWinningsInEuro + " EUR";
            accaBoostPayout.innerText = getBoostPayoutMode(selectedAccaBoost);

            selectedAccaBoost.bonusData.boostBasedOn == "TotalWinAmount" ? accaBoostAppliedOn.innerText = "Total Win Amount" : accaBoostAppliedOn.innerText = "Net Win Amount";
        }

        function populateRestrictionsPaths(restrictionPath, criteriaEntityDetails) {
            let restrictionPathArray = [];
            for (let i = criteriaEntityDetails.length - 1; i >= 0; i--) {
                let detail = criteriaEntityDetails[i];
                let li = document.createElement("li");
                li.innerHTML = getBoostRestrictionPath(detail);
                if (li.innerHTML.includes("not offered")) {
                    li.classList.add("displayInLightGrey");
                    restrictionPathArray.push(li); // Append to the end if "not offered"
                } else {
                    restrictionPathArray.unshift(li); // Insert at the start otherwise
                }
            }
            for (let li of restrictionPathArray) {
                restrictionPath.appendChild(li);
            }
        }

        function getBoostRestrictionPath(criteriaEntityDetail) {
            let restrictionPath, categoryName, categoryId, competitionId, marketTemplateIds;
            categoryId = criteriaEntityDetail.categoryId;
            categoryName = getCategoryLabelByCategoryId(categoryId);
            if (categoryName == undefined) {
                return "[Category \"" + categoryId + "\" not offered]"
            }

            restrictionPath = categoryName;
            competitionId = criteriaEntityDetail.competitionId;

            if (competitionId != undefined) {
                let competitionLabel = getCompetitionLabelByCompetitionId(competitionId);
                if (competitionLabel != undefined) {
                    restrictionPath
                        += SEPARATOR_ARROW
                        + getRegionNameByCompetitionId(competitionId)
                        + SEPARATOR_ARROW + competitionLabel;
                } else {
                    return restrictionPath
                        += SEPARATOR_ARROW
                        + " [Competition \"" + competitionId + "\" not offered]"
                }
                // return restrictionPath;
            }

            marketTemplateIds = criteriaEntityDetail.marketTemplateIds;
            if (marketTemplateIds != undefined) {
                restrictionPath
                    += SEPARATOR_ARROW
                    + " [" + getArrayAsAlphaBeticalCommaSeparatedString(marketTemplateIds) + "]";
            }
            return restrictionPath;

        }




        ////////////////END OF ACCABOOST ///////////////////

        function listenerForPriceBoostDetails() {
            priceBoosts = getPriceBoosts();
            if (priceBoosts === previousPriceBoosts) {
                return;
            } else {
                previousPriceBoosts = priceBoosts;
            }

            priceBoostsArray = Object.values(priceBoosts);
            validPbArray = getValidPriceBoostsArray(priceBoostsArray);
            garbagePbArray = getGarbagePriceboostsArray(priceBoostsArray);

            if (JSON.stringify(priceBoosts) == "{}") {
                show(noPbFound);
                hide(pbDetailsLayout);
                return;
            } else {
                show(pbDetailsLayout);
                hide(noPbFound);
            }

            if (getAreAllPriceBoostsGarbage(priceBoostsArray)) {
                radioPbGarbage.checked = true;
                inactivate(listPbByNameDiv, listPbByEventNameDiv);
            } else {
                if (!getIsThereAnyGarbagePriceBoost(priceBoostsArray)) {
                    inactivate(radioPbGarbage);
                }
                else {
                    activate(radioPbGarbage);
                }
                activate(listPbByNameDiv, listPbByEventNameDiv);
            }

            if (radioPbByName.checked) {
                listPriceBoostsBy("pbName");
            } else if (radioPbByEvent.checked) {
                listPriceBoostsBy("eventName");
            } else if (radioPbGarbage.checked) {
                listPriceBoostsBy("garbage");
            }
        }

        function listenerForSelectedPriceBoost() {
            selectionId = getLastSelectionIdFromBetslip();
            if (selectionId == previousSelectionId) {
                return;
            } else {
                previousSelectionId = selectionId;
            }

            let id = getBonusIdBySelectionId(selectionId);
            if (id == null) {
                return;
            }

            priceBoostId = id;
            selectPb(priceBoostId);
            if (radioPbGarbage.checked) {
                radioPbByName.checked = true;
                listPriceBoostsBy("pbName");
            }
            setOptionInBonusSelector(pbSelector, priceBoostId);
        }

        let currentPathName, previousCurrentPathName;
        function listenerForAddPbToCarouselOrCards() {
            currentPathName = getCurrentPathName();
            if (currentPathName == previousCurrentPathName) {
                return;
            } else {
                previousCurrentPathName = currentPathName;
            }
            setAddPbToCarouselRowState();
        }

        function setAddPbToCarouselRowState() {
            if (getIsPageValidForCarousel()) {
                if (getCurrentRouteName() == "sportsbook") {
                    activate(addPbToCarouselRow);
                    return;
                }
                if (getIsCurrentRouteParentOrSameAsBoostedEventRoute()) {
                    activate(addPbToCarouselRow);
                    return;
                }
            }
            inactivate(addPbToCarouselRow);
        }

        function getAreAllPriceBoostsGarbage(priceBoostsArray) {
            // priceBoostsArray = Object.values(priceBoosts);
            return priceBoostsArray.length == getGarbagePriceboostsArray(priceBoostsArray).length;
        }

        function getIsThereAnyGarbagePriceBoost(priceBoostsArray) {
            return getGarbagePriceboostsArray(priceBoostsArray).length > 0;
        }

        function getIsCurrentRouteParentOrSameAsBoostedEventRoute() {
            let currentRoute = getRouteAsObject(getRouteKey());
            let competitionId = getCompetitionIdByEventId(eventId);
            let regionId = getRegionIdByEventId(eventId);
            let categoryId = getCategoryIdByEventId(eventId);

            if (currentRoute.competitionId == competitionId) {
                return true;
            }
            if (currentRoute.competitionId == undefined) {
                if (currentRoute.regionId == regionId) {
                    return true;
                }
                if (currentRoute.regionId == undefined) {
                    if (currentRoute.categoryId == categoryId) {
                        return true;
                    }
                }
            }
            return false;
        }

        function getRouteAsObject(routeKey) {
            const numbers = routeKey.split('.').map(Number);
            const obj = {
                categoryId: numbers[0] || undefined,
                regionId: numbers[1] || undefined,
                competitionId: numbers[2] || undefined,
            };
            return obj;
        }

        window.addPbToCarouselOrCards = () => { addPbToCarouselOrCards() }
        function addPbToCarouselOrCards() {
            createEmptyCarouselIfDoesntExist();
            let item = getState().sportsbook.carousel.item;
            let carouselOrder = item.skeleton.carouselOrder;
            for (let element of carouselOrder) {
                element.sortOrder++;
            }
            let carouselOrderElement = {
                id: priceBoostId,
                sortOrder: 0,
                type: "Boost"
            }
            item.skeleton.carouselOrder.unshift(carouselOrderElement);
            delete getState().sportsbook.priceBoost.priceBoost[priceBoostId];

            triggerChangeDetection();
        }

        function getBonusIdBySelectionId(selectionId) {
            for (let pb in priceBoosts) {
                for (let criteriaEntityDetail of priceBoosts[pb].criteria.criteriaEntityDetails) {
                    if (criteriaEntityDetail.marketSelectionId == selectionId) {
                        return priceBoosts[pb].id;
                    }
                }
            }
            return null;
        }

        function getPriceBoosts() {
            return getState().sportsbook.priceBoost.priceBoost;
        }

        // function setOptionInBonusSelector(bonusId) {
        //     for (let i = 0; i < pbSelector.options.length; i++) {
        //         if (pbSelector.options[i].value == bonusId) {
        //             pbSelector.options[i].selected = true;
        //             return;
        //         }
        //     }
        // }

        function setOptionInBonusSelector(selector, optionValue) {
            for (let i = 0; i < selector.options.length; i++) {
                if (selector.options[i].value == optionValue) {
                    selector.options[i].selected = true;
                    return;
                }
            }
        }


        function getIsCombinationPriceBoost(pbId) {
            return getState().sportsbook.priceBoost.priceBoost[pbId].criteria.criteriaEntityDetails.length > 1;
        }

        function getIsOddsOutOfRange(pbId) {
            let minOdds = getState().sportsbook.priceBoost.priceBoost[pbId].conditions.oddsLimit.minOdds;
            let maxOdds = getState().sportsbook.priceBoost.priceBoost[pbId].conditions.oddsLimit.maxOdds;
            let computedPriceBoostOdds = getComputedActualOddsOfBoostedSelections(pbId);
            if (computedPriceBoostOdds < minOdds || computedPriceBoostOdds > maxOdds) {
                return true;
            }
            return false;
        }

        function getComputedActualOddsOfBoostedSelections(pbId) {
            let computedOdds = 1;
            let criteriaEntityDetails = getState().sportsbook.priceBoost.priceBoost[pbId].criteria.criteriaEntityDetails;
            for (let detail of criteriaEntityDetails) {
                computedOdds *= getState().sportsbook.selection.selections[detail.marketSelectionId].odds;
            }
            return computedOdds;
        }

        function getIsEventPhaseNotMatching(pbId) {
            let eventPhasesOfPb = getState().sportsbook.priceBoost.priceBoost[pbId].criteria.eventPhases;
            let criteriaEntityDetails = getState().sportsbook.priceBoost.priceBoost[pbId].criteria.criteriaEntityDetails;
            for (let detail of criteriaEntityDetails) {
                if (!eventPhasesOfPb.includes(getEventPhase(detail.eventId))) {
                    return true;
                }
            }
            return false;
        }

        function populatePbSelectorBy(entityName) {
            pbSelector.innerHTML = "";
            var sortedPbArray;
            if (entityName == "garbage") {
                sortedPbArray = garbagePbArray;
                sortedPbArray = sortedPbArray.sort((a, b) =>
                    a.name > b.name
                        ? 1 : -1);
            } else {
                sortedPbArray = validPbArray;
                if (entityName == "pbName") {
                    sortedPbArray = sortedPbArray.sort((a, b) =>
                        a.name > b.name
                            ? 1 : -1);
                } else {
                    sortedPbArray = sortedPbArray.sort((a, b) =>
                        getEventDisplayLabel(a.criteria.criteriaEntityDetails[0].eventId) > getEventDisplayLabel(b.criteria.criteriaEntityDetails[0].eventId)
                            ? 1 : -1);
                }
            }

            pbNumberOf.innerText = priceBoostsArray.length;
            pbNumberOfListed.innerText = sortedPbArray.length;

            let option;
            let isCombi, isPersonal, isSuperBoost, isOddsOutOfRange, isEventPhaseNotMatching;
            const ARROW = " &#9658;"
            let areThereCombis, areTherePersonals, areThereSuperBoosts, areThereOddsOutOfRanges, areThereEventPhaseNotMatchings;
            let optionInnerHTML;

            for (var pb of sortedPbArray) {
                isCombi = getIsCombinationPriceBoost(pb.id);
                if (isCombi) { areThereCombis = true }
                isPersonal = pb.isPersonal;
                if (isPersonal) { areTherePersonals = true }

                isSuperBoost = pb.bonusData.isSuperBoost;
                if (isSuperBoost) { areThereSuperBoosts = true }

                if (entityName != "garbage") {
                    isOddsOutOfRange = getIsOddsOutOfRange(pb.id);
                    if (isOddsOutOfRange) {
                        areThereOddsOutOfRanges = true;
                    }
                    if (isCombi) {
                        isEventPhaseNotMatching = getIsEventPhaseNotMatching(pb.id);
                        if (isEventPhaseNotMatching) {
                            areThereEventPhaseNotMatchings = true;
                        }
                    }
                }

                option = document.createElement("option");
                if (entityName == "eventName") {
                    optionInnerHTML = getEventDisplayLabel(pb.criteria.criteriaEntityDetails[0].eventId);
                } else {
                    optionInnerHTML = pb.name;
                }
                if (!isCombi && entityName != "garbage") {
                    optionInnerHTML += ARROW + " " + getMarketTemplateId(pb.criteria.criteriaEntityDetails[0].marketId);
                }


                if (isOddsOutOfRange || isEventPhaseNotMatching) {
                    optionInnerHTML += " " + pbCriteriaNotMetIcon;
                }
                if (isPersonal) {
                    optionInnerHTML += " " + pbPersonalIcon;
                }
                if (isCombi) {
                    optionInnerHTML += " " + pbCombiIcon;
                }
                if (isSuperBoost) {
                    optionInnerHTML += " " + pbSuperBoostIcon;
                }
                option.innerHTML = optionInnerHTML;
                option.value = pb.id;
                pbSelector.appendChild(option);
            }


            if (areThereCombis || areTherePersonals || areThereOddsOutOfRanges || areThereEventPhaseNotMatchings || areThereSuperBoosts) {
                show(pbLegendSection);
                if (areThereCombis) {
                    show(pbLegendCombi);
                } else {
                    hide(pbLegendCombi);
                }

                if (areTherePersonals) {
                    show(pbLegendPersonal);
                } else {
                    hide(pbLegendPersonal);
                }

                if (areThereSuperBoosts) {
                    show(pbLegendSuperBoost);
                } else {
                    hide(pbLegendSuperBoost);
                }

                if (areThereOddsOutOfRanges || areThereEventPhaseNotMatchings) {
                    show(pbLegendCriteriaNotMet);
                } else {
                    hide(pbLegendCriteriaNotMet);
                }
            } else {
                hide(pbLegendSection);
            }

            priceBoostId = sortedPbArray[0].id;
            selectPb(priceBoostId);
        }

        window.listPriceBoostsBy = (value) => {
            listPriceBoostsBy(value);
        }
        function listPriceBoostsBy(value) {
            if (value == "eventName") {
                show(goToEventPageRow, addPbToCarouselRow);
                populatePbSelectorBy("eventName");
            } else if (value == "pbName") {
                show(goToEventPageRow, addPbToCarouselRow);
                populatePbSelectorBy("pbName");
            } else if (value == "garbage") {
                hide(goToEventPageRow, addPbToCarouselRow);
                populatePbSelectorBy("garbage");
            }
        }


        function getValidPriceBoostsArray(priceBoostsArray) {
            let arr = [];
            let marketSelectionIds = [];
            for (let pb of priceBoostsArray) {
                for (let detail of pb.criteria.criteriaEntityDetails) {
                    marketSelectionIds.push(detail.marketSelectionId);
                }
                if (getAreAllSelectionsInObgState(marketSelectionIds)) {
                    arr.push(pb);
                }
                marketSelectionIds = [];
            }
            return arr;
        }

        function getGarbagePriceboostsArray(priceBoostsArray) {
            // let arr = validPriceBoostsArray;
            return priceBoostsArray.filter((element) => !validPbArray.includes(element));
        }

        window.goToEventPage = () => {
            if (DEVICE_EXPERIENCE == "Native") {
                postMessage(
                    {
                        type: "routeChangeIn",
                        payload: {
                            externalUrl: getRelativeLinkForGoToEventPage()
                        }
                    });
            }
        }

        function updateGoToEventPageLink() {
            goToEventPageLink.href = getRelativeLinkForGoToEventPage();
        }

        function getRelativeLinkForGoToEventPage() {
            eventId = getEventIdByPriceBoostId(priceBoostId);
            let origin = window.location.origin;
            let slug = getSlugByEventId(eventId);
            let urlString;

            if (IS_B2B_IFRAME_ONLY) {
                urlString = origin + "/"
                    + getStaticContextId() + "/"
                    + getUserContextId() + "/"
                    + slug
            } else {
                urlString = origin + "/"
                    + LANGUAGECODE + "/"
                    + getSlugByRoute("sportsbook") + "/"
                    + slug
            }

            let isOutright = isEventTypeOutright(eventId);
            if (DEVICE_TYPE == "Desktop" && !isOutright) {
                urlString = urlString.substring(0, urlString.lastIndexOf("/"));
            }

            let url = new URL(urlString);
            if (isOutright) {
                url.searchParams.append("tab", "outrights");
            } else {
                url.searchParams.append("eventId", eventId);
            }

            return url.toString().replace(origin, "");
        }

        function getEventIdByPriceBoostId(priceBoostId) {
            return getState().sportsbook.priceBoost.priceBoost[priceBoostId].criteria.criteriaEntityDetails[0].eventId;
        }

        // function getCompetitionIdByPriceBoostId(priceBoostId) {
        //     return getState().sportsbook.priceBoost.priceBoost[priceBoostId].criteria.criteriaEntityDetails[0].competitionId;
        // }

        window.selectPb = (key) => {
            selectPb(key);
        }
        function selectPb(key) {
            let selectedPriceBoost = priceBoosts[key];
            priceBoostId = selectedPriceBoost.id;
            pbIdSpan.innerText = priceBoostId;
            pbName.innerText = selectedPriceBoost.name;
            pbVisibility.innerHTML = getPbVisibility();
            pbType.innerHTML = getPbType();
            // pbPayoutMode.innerText = getPbPayoutMode();
            pbPayoutMode.innerText = getBoostPayoutMode(selectedPriceBoost);
            pbEventPhases.innerText = getArrayAsCommaSeparatedString(selectedPriceBoost.criteria.eventPhases);
            pbExpiryDate.innerText = getFriendlyDateFromIsoDate(selectedPriceBoost.expiryDate);

            let minMaxStake = getPbMinMaxStake();
            if (minMaxStake != "0") {
                show(pbStakeRangeDiv);
                pbMinMaxStake.innerText = minMaxStake + " " + getCurrencyForBonuses();
            } else {
                hide(pbStakeRangeDiv);
            }

            pbMinMaxOdds.innerText = selectedPriceBoost.conditions.oddsLimit.minOdds + " - " + selectedPriceBoost.conditions.oddsLimit.maxOdds;
            if (!radioPbGarbage.checked) {
                if (getIsOddsOutOfRange(selectedPriceBoost.id)) {
                    let computedPriceBoostOdds = getComputedActualOddsOfBoostedSelections(selectedPriceBoost.id);
                    pbMinMaxOdds.innerHTML += " " + pbCriteriaNotMetIcon + " (Out of Range: " + computedPriceBoostOdds.toFixed(2) + ")";
                }
            }

            let pbEvent = selectedPriceBoost.criteria.criteriaEntityDetails[0];

            if (radioPbGarbage.checked) {
                displayInRed(pbPathToCompetition);
                hide(boostedSelectionDiv);
                pbPathToCompetition.innerHTML = "Boosted selection cannot be found. Probably not open anymore.";
            } else {
                if (getIsCombinationPriceBoost(selectedPriceBoost.id)) {
                    pbPathToCompetition.innerHTML = pbCombiIcon + " This is a combination boost having multipe selections that don't fit here. Use Trading Tools to get their details.";
                    displayInOrange(pbPathToCompetition);
                    hide(boostedSelectionDiv, goToEventPageRow, addPbToCarouselRow);
                } else {
                    eventId = pbEvent.eventId;
                    updateGoToEventPageLink();
                    pbPathToCompetition.innerHTML =
                        getCategoryNameByEventId(eventId) + SEPARATOR_ARROW
                        + getRegionNameByEventId(eventId) + SEPARATOR_ARROW
                        + getCompetitionNameByEventId(eventId);
                    eventLabelForPbDiv.innerHTML = getEventDisplayLabel(eventId);
                    marketLabelForPbDiv.innerHTML = "&boxur;&HorizontalLine; " + getMarketLabel(pbEvent.marketId);
                    selectionLabelForPbDiv.innerHTML = "&boxur;&HorizontalLine; " + getSelectionLabel(pbEvent.marketSelectionId);
                    displayInGreen(pbPathToCompetition, eventLabelForPbDiv);
                    show(boostedSelectionDiv, goToEventPageRow, addPbToCarouselRow);
                }
            }

            setAddPbToCarouselRowState();

            function getPbVisibility() {
                if (selectedPriceBoost.isPersonal) {
                    return "Personal " + pbPersonalIcon;
                }
                return "Global";
            }

            function getPbType() {
                let type;
                if (selectedPriceBoost.bonusData.type == "FixedOdds") {
                    let priceBoostedFormats = selectedPriceBoost.bonusData.priceBoostedFormats;
                    let priceBoostedOdds = priceBoostedFormats["1"];
                    let selectedPriceFormat = getSelectedOddsFormat();
                    if (selectedPriceFormat == "American") {
                        priceBoostedOdds = priceBoostedOdds + " (American: " + priceBoostedFormats["2"] + ")";
                    } else if (selectedPriceFormat == "Fractional") {
                        priceBoostedOdds = priceBoostedOdds + " (Fractional: " + priceBoostedFormats["3"] + ")";
                    }
                    type = "Fixed Odds: " + priceBoostedOdds;
                } else {
                    if (selectedPriceBoost.bonusData.type == "Multiplier") {
                        type = "Percentage: " + selectedPriceBoost.bonusData.boostedOdds + "%";
                    }
                }
                if (selectedPriceBoost.bonusData.isSuperBoost) {
                    type += " " + pbSuperBoostIcon;
                }
                return type;
            }

            // function getPbPayoutMode() {
            //     return selectedPriceBoost.bonusData.winPayoutMode === "BonusMoney" ? "Bonus Money" : "Cash Money";
            // }

            function getPbMinMaxStake() {
                const min = selectedPriceBoost.conditions.minimumStake;
                const max = selectedPriceBoost.conditions.maximumStake;
                if (min != max) {
                    return min + " - " + max;
                } return min;
            }
        }

        function listenerForFreeBetDetails() {
            if (!getIsUserLoggedIn()) {
                hide(freeBetNotFound, freeBetDetailsLayout);
                show(freeBetLogin);
                return;
            } else {
                hide(freeBetLogin);
            }
            freeBets = getState().sportsbook.bonusStake.bonusStakes;
            if (freeBets === previousFreeBets) {
                return;
            } else {
                previousFreeBets = freeBets;
            }

            if (freeBets.length == 0) {
                show(freeBetNotFound);
                hide(freeBetDetailsLayout);
                return;
            } else {
                show(freeBetDetailsLayout);
                hide(freeBetNotFound);
            }
            populateFreeBetSelector();
        }

        function populateFreeBetSelector() {
            freeBetNumberOf.innerText = freeBets.length;
            freeBetSelector.innerHTML = "";
            var option;
            let type;
            freeBets = freeBets.sort((a, b) => a.name > b.name ? 1 : -1);
            for (var fb of freeBets) {
                option = document.createElement("option");
                if (fb.type == "FreeBet") {
                    type = " [FB]";
                } else {
                    type = " [RFB]";
                }
                option.text = fb.name + type;
                option.value = fb.id;
                freeBetSelector.appendChild(option);
            }
            selectFreeBet(freeBets[0].id);
        }

        window.selectFreeBet = (value) => {
            selectFreeBet(value);
        }

        function selectFreeBet(value) {
            let selectedFreebet;
            for (let fb of freeBets) {
                if (value == fb.id) {
                    selectedFreebet = fb;
                }
            }
            freeBetId = selectedFreebet.id;
            freeBetIdSpan.innerText = freeBetId;
            freeBetName.innerText = selectedFreebet.name;

            if (selectedFreebet.criteria.criteriaEntityDetails.length > 0) {
                show(freeBetRestrictionsSection);
                freeBetPathToCompetition.innerHTML = getFreeBetPathToCompetition();
            } else {
                hide(freeBetRestrictionsSection);
            }

            freeBetType.innerText = getFreeBetType();
            // freeBetPayoutMode.innerText = " / " + getFreeBetPayoutMode();
            freeBetPayoutMode.innerText = " / " + getBoostPayoutMode(selectedFreebet);
            freeBetStake.innerText = selectedFreebet.conditions.minimumStake + " " + getCurrencyForBonuses();
            freeBetBetTypes.innerText = getArrayAsCommaSeparatedString(selectedFreebet.conditions.betTypes);
            freeBetEventPhases.innerText = getArrayAsCommaSeparatedString(selectedFreebet.criteria.eventPhases);
            freeBetExpiryDate.innerText = getFriendlyDateFromIsoDate(selectedFreebet.expiryDate);
            let noOfSelection = getNumberOfSelections();
            if (noOfSelection != undefined) {
                show(freeBetNoOfSelectionsDiv);
                freeBetNoOfSelections.innerText = noOfSelection;
            } else {
                hide(freeBetNoOfSelectionsDiv);
            }

            function getFreeBetPathToCompetition() {
                let categoryId, categoryName, regionName, competitionId, competitionName, eventId;

                categoryId = selectedFreebet.criteria.criteriaEntityDetails[0].categoryId;
                categoryName = getCategoryLabelByCategoryId(categoryId);
                competitionId = selectedFreebet.criteria.criteriaEntityDetails[0].competitionId;
                if (competitionId != undefined) {
                    competitionName = getCompetitionLabelByCompetitionId(competitionId);
                    regionName = getRegionNameByCompetitionId(competitionId);
                    eventId = selectedFreebet.criteria.criteriaEntityDetails[0].eventId;
                    if (eventId != undefined) {
                        show(freeBetFurtherRestricions);
                    } else {
                        hide(freeBetFurtherRestricions);
                    }
                    return categoryName + SEPARATOR_ARROW + regionName + SEPARATOR_ARROW + competitionName;
                } else {
                    hide(freeBetFurtherRestricions);
                    return categoryName;
                }
            }

            function getFreeBetType() {
                return selectedFreebet.type === "FreeBet" ? "Free Bet" : "Risk Free Bet";
            }

            // function getFreeBetPayoutMode() {
            //     return selectedFreebet.bonusData.winPayoutMode === "BonusMoney" ? "Bonus Money" : "Cash Money";
            // }

            function getNumberOfSelections() {
                let min = getDotsIfZero(selectedFreebet.conditions.minimumNumberOfSelections);
                let max = getDotsIfZero(selectedFreebet.conditions.maximumNumberOfSelections);
                if (min == "..." && max == "...") {
                    return undefined;
                }
                if (min == max) {
                    return min;
                }
                return min + " - " + max;
            }
        }
    }

    function areArraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    function getBoostPayoutMode(boostObj) {
        return boostObj.bonusData.winPayoutMode === "BonusMoney" ? "Bonus Money" : "Real Money";
    }

    function getIsFeatureEnabled(featureName) {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return !!obgClientEnvironmentConfig.startupContext?.features?.[featureName];
        } else {
            return !!getState().sportsbook.features?.[featureName];
        }
    }

    function getDotsIfZero(value) {
        return (value === undefined || value === 0) ? "..." : value;
    }

    function getCurrencyForBonuses() {
        if (getIsUserLoggedIn()) {
            return getUsersCurrency();
        } return "EUR"
    }

    function getSelectedOddsFormat() {
        return getState().sportsbook.userSettings.settings.oddsFormat;
    }

    function getArrayAsAlphaBeticalCommaSeparatedString(arr) {
        return [...arr].sort((a, b) => (a > b) ? 1 : -1).toString().replaceAll(",", ", ");
    }

    function getArrayAsCommaSeparatedString(arr) {
        return arr.toString().replaceAll(",", ", ");
    }

    function getArrayOrderedByProperty(array, propertyName) {
        return array.sort((a, b) => {
            let propA = typeof a[propertyName] === "string" ? a[propertyName].toUpperCase() : a[propertyName];
            let propB = typeof b[propertyName] === "string" ? b[propertyName].toUpperCase() : b[propertyName];

            if (propA < propB) {
                return -1;
            }
            if (propA > propB) {
                return 1;
            }
            return 0;
        });
    }

    function getCategoryLabelByCategoryId(categoryId) {
        for (let cat of Object.values(getCategories())) {
            if (cat.id == categoryId) {
                return cat.label;
            }
        }
    }


    function getRegionLabelByRegionId(regionId) {
        let regions;
        for (let cat of Object.values(getCategories())) {
            regions = Object.values(cat.regions);
            if (regions != undefined) {
                for (reg of regions) {
                    if (reg.id == regionId) {
                        return reg.label;
                    }
                }
            }
        }
    }

    function getRegionNameByCompetitionId(competitionId) {
        let regions, competitions;
        for (let cat of Object.values(getCategories())) {
            regions = Object.values(cat.regions);
            if (regions != undefined) {
                for (let reg of regions) {
                    competitions = Object.values(reg.competitions);
                    if (competitions != undefined) {
                        for (let comp of competitions) {
                            if (comp.id == competitionId) {
                                return reg.label;
                            }
                        }
                    }
                }
            }
        }
    }

    function getCompetitionLabelByCompetitionId(competitionId) {
        let categories = Object.values(getCategories());
        let regions, competitions;
        for (let cat of categories) {
            regions = Object.values(cat.regions);
            if (regions != undefined) {
                for (let reg of regions) {
                    competitions = Object.values(reg.competitions);
                    if (competitions != undefined) {
                        for (let comp of competitions) {
                            if (comp.id == competitionId) {
                                return comp.label;
                            }
                        }
                    }
                }
            }
        }
    }

    function getBrands() {
        let brandsUrl = "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/brands.json";
        let xhr = new XMLHttpRequest();
        xhr.open("GET", brandsUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                brands = JSON.parse(xhr.responseText);
                // setIntervalForSegments();
            }
        }
        xhr.send();
        return brands;
    }

    function getSegmentLegacyId() {
        if (segmentGuid == undefined) {
            segmentGuid = getSegmentGuid();
        }
        for (let brand of brands) {
            let segments = brand.segments;
            for (var segment of segments) {
                if (segment.id.toLowerCase() === segmentGuid) {
                    return segment.legacyId;
                }
            }
        }
    }



    window.landingFromLHSM = () => {

        const landingFromLhsmError = getElementById("landingFromLhsmError");
        const landingFromLhsmNoError = getElementById("landingFromLhsmNoError");
        const landingFromLhsmContent = getElementById("landingFromLhsmContent");
        const landingOnCategoryPageList = getElementById("landingOnCategoryPageList");
        const landingOnRegionPageList = getElementById("landingOnRegionPageList");
        const landingOnCompetitionPageList = getElementById("landingOnCompetitionPageList");

        landingFromLhsmContent.classList.toggle("hide");

        if (!IS_OBGSTATE_OR_XSBSTATE_EXPOSED) {
            show(landingFromLhsmError);
            hide(landingFromLhsmNoError);
            return;
        } else {
            show(landingFromLhsmNoError);
        }

        const landOnCatPage = [];
        const landOnRegPage = [];
        const landOnComPage = [];
        let shouldShowAllLeaguesTab, catLabel;

        Object.values(getCategories()).forEach(cat => {
            const regions = Object.values(cat.regions);
            shouldShowAllLeaguesTab = cat?.tags?.shouldShowAllLeaguesTab == "true";

            if (regions.length > 1 || shouldShowAllLeaguesTab) {
                catLabel = shouldShowAllLeaguesTab ? cat.label + "*" : cat.label;
                landOnCatPage.push(catLabel);
            } else {
                regions.forEach(reg => {
                    const competitions = Object.values(reg.competitions);
                    if (competitions.length > 1) {
                        landOnRegPage.push(cat.label);
                    } else {
                        landOnComPage.push(cat.label);
                    }
                });
            }
        });

        landingOnCategoryPageList.innerText = getArrayAsAlphaBeticalCommaSeparatedString(landOnCatPage);
        landingOnRegionPageList.innerText = getArrayAsAlphaBeticalCommaSeparatedString(landOnRegPage);
        landingOnCompetitionPageList.innerText = getArrayAsAlphaBeticalCommaSeparatedString(landOnComPage);
    }


    function getSegmentGuid() {
        return segmentGuid = getState().sportsbook.segment.segmentGuid.toLowerCase();
    }

    window.initSegments = () => {
        initSegments()
    }
    function initSegments() {
        if (brands == undefined) {
            brands = getBrands();
            setIntervalForSegments();
        } else {
            if (intervalIdForPolling != undefined) {
                setIntervalForSegments();
            }
        }

        previousSegmentGuid = null;
        const segmentGuidSpan = getElementById("segmentGuidSpan");
        const segmentNameSpan = getElementById("segmentNameSpan");
        const segmentLegacyIdSpan = getElementById("segmentLegacyIdSpan");

        function setIntervalForSegments() {
            stopPolling();
            intervalIdForPolling = setInterval(listenerForSegments, POLLING_INTERVAL);
        }

        function listenerForSegments() {
            segmentGuid = getSegmentGuid();
            if (previousSegmentGuid == segmentGuid) {
                return;
            } else {
                segmentGuidSpan.innerText = segmentGuid;
                fillSegmentName();
                fillSegmentLegacyId();
                previousSegmentGuid = segmentGuid;
                populateSegmentSelector();
            }
        }

        function fillSegmentName() {
            segmentName = getSegmentName();
            if (segmentName == undefined) {
                segmentName = NOT_FOUND;
                displayInRed(segmentNameSpan);
            } else {
                displayInGreen(segmentNameSpan);
            }
            segmentNameSpan.innerText = segmentName;
        }

        function fillSegmentLegacyId() {
            segmentLegacyId = getSegmentLegacyId();
            if (segmentLegacyId == undefined) {
                segmentLegacyId = NOT_FOUND;
                displayInRed(segmentLegacyIdSpan);
            } else {
                displayInGreen(segmentLegacyIdSpan);
            }
            segmentLegacyIdSpan.innerText = segmentLegacyId;
        }

        function populateSegmentSelector() {
            var segments = getSegments(getLegacyBrandId());
            var segmentSelector = getElementById("segmentSelector");
            segmentSelector.innerHTML = "";
            var option;
            for (var segment of segments) {
                option = document.createElement("option");
                option.text = segment.name;
                option.value = segment.id;
                if (segment.id === segmentGuid) {
                    option.setAttribute("selected", "true");
                }
                segmentSelector.appendChild(option);
            }
        }

        function getLegacyBrandId() {
            for (var brand of brands) {
                var segments = brand.segments;
                for (var segment of segments) {
                    if (segment.id.toLowerCase() === segmentGuid) {
                        return segment.legacyBrandId;
                    }
                }
            }
        }

        function getSegments(legacyBrandId) {
            var segmentArray = [];
            for (var brand of brands) {
                let segments = brand.segments;
                for (var segment of segments) {
                    if (legacyBrandId === segment.legacyBrandId) {
                        segmentArray.push(segment);
                    }
                }
            }
            return segmentArray.sort((segmentA, segmentB) => segmentA.name > segmentB.name ? 1 : -1);
        }

        function getSegmentName() {
            for (var brand of brands) {
                var segments = brand.segments;
                for (var segment of segments) {
                    if (segment.id.toLowerCase() === segmentGuid) {
                        return segment.name;
                    }
                }
            }
        }
    }

    window.changeSegmentGuid = () => {
        var fdSegmentGuid = getElementById("fdSegmentGuid");
        var newSegmentGuid = fdSegmentGuid.value;
        getState().sportsbook.segment.segmentGuid = newSegmentGuid;
        fdSegmentGuid.value = "";
    }

    window.setSegmentGuid = (guid) => {
        getState().sportsbook.segment.segmentGuid = guid;
        log("Segment in obgState changed to: " + guid);
    }

    function isPageCardCapable() {
        const pages = ["sportsbook.region", "sportsbook.competition", "sportsbook.category"];
        return pages.includes(getCurrentRouteName());
    }

    function getIsPageHomePage() {
        return getCurrentRouteName() === "sportsbook";
    }

    // var previousNoOfSbBanners, previousNoOfCrlBanners;
    function getIsCarouselItemDefined() {
        return !!getState().sportsbook.carousel.item;
    }

    window.initBanners = () => {
        stopPolling();
        const noOfSbBannersSpan = getElementById("noOfSbBanners");
        const noOfCrlBannersSpan = getElementById("noOfCrlBanners");
        const bannersMessage = getElementById("bannersMessage");
        const bannersFeatures = getElementById("bannersFeatures");
        const btCrlBannersMinus = getElementById("btCrlBannersMinus");
        const btSbBannersMinus = getElementById("btSbBannersMinus");
        var noOfSbBanners, noOfCrlBanners;
        var previousNoOfSbBanners, previousNoOfCrlBanners;

        intervalIdForPolling = setInterval(listenerForBanners, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForBanners() {
            if (!getIsPageHomePage() || !getIsCarouselItemDefined()) {
                show(bannersMessage);
                hide(bannersFeatures);
                return;
            } else {
                hide(bannersMessage);
                show(bannersFeatures);
            }

            noOfCrlBanners = getNoOfCrlBanners();
            noOfSbBanners = getState().sportsbook.sportsbookBanner.content.length;
            if (noOfSbBanners == previousNoOfSbBanners && noOfCrlBanners == previousNoOfCrlBanners) {
                return;
            }
            noOfCrlBanners < 1 ? inactivate(btCrlBannersMinus) : activate(btCrlBannersMinus);
            noOfSbBanners < 1 ? inactivate(btSbBannersMinus) : activate(btSbBannersMinus);
            noOfSbBannersSpan.innerText = noOfSbBanners;
            noOfCrlBannersSpan.innerText = noOfCrlBanners;
            previousNoOfSbBanners = noOfSbBanners;
            previousNoOfCrlBanners = noOfCrlBanners;
        }

        function getNoOfCrlBanners() {
            var i = 0;
            for (var page of getState().sportsbook.carousel.item.skeleton.carouselOrder) {
                if (page.type == "Banner") { i++ }
            }
            return i;
        }

        window.removeSportsbookBanner = () => {
            getState().sportsbook.sportsbookBanner.content.splice(0, 1);
            triggerChangeDetection();
        }

        var sbBannerCounter = 1;
        var sbBannerBgImageCounter = 1;
        var sbBannerBgFileName;
        var sbBannerBgWidth;
        window.addSportsbookBanner = () => {
            chkBannerOverlay.checked ? imageOverlay = true : imageOverlay = false;
            var banners = getState().sportsbook.sportsbookBanner.content;

            if (DEVICE_TYPE.includes("Mobile")) {
                sbBannerBgFileName = "sb.banner.mobile.1024x60-";
                sbBannerBgWidth = 1024;
            } else {
                sbBannerBgFileName = "sb.banner.desktop.1920x60-"
                sbBannerBgWidth = 1920;
            }
            if (chkBannerDiffColor.checked) {
                sbBannerBgImageCounter++;
            }
            if (sbBannerBgImageCounter > 4) {
                sbBannerBgImageCounter = 1;
            }


            var newBanner = {
                "key": "mocked.key." + sbBannerCounter,
                "image": {
                    "url": "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/banners/" + sbBannerBgFileName + sbBannerBgImageCounter + ".jpg",
                    "altText": "",
                    "width": sbBannerBgWidth,
                    "height": 60
                },
                "title": "SB Banner " + sbBannerCounter + " for " + DEVICE_TYPE,
                "description": "This is the description part of the Sportsbook Banner. Image Overlay: " + imageOverlay,
                "termsAndConditionsDescription": "",
                "termsAndConditionsApply": false,
                "url": "https://en.wikipedia.org/wiki/Banner",
                "hasImageOverlay": imageOverlay
            }

            getState().sportsbook.sportsbookBanner.content = [];
            getState().sportsbook.sportsbookBanner.content.push(newBanner);
            for (var banner of banners) {
                getState().sportsbook.sportsbookBanner.content.push(banner);
            }
            sbBannerCounter++;
            triggerChangeDetection();
        }

        var crlBannerCounter = 1;
        var crlBgImageCounter = 1;
        var crlBannerKey;
        var crlBannerBgFileName;
        var crlBannerBgWidth;
        var crlBannerBgHeight;
        var crlBannerTarget;
        const chkBannerOverlay = getElementById("chkBannerOverlay");
        const chkBannerDiffColor = getElementById("chkBannerDiffColor");
        var imageOverlay = false;
        window.addCarouselBanner = () => {
            chkBannerOverlay.checked ? imageOverlay = true : imageOverlay = false;
            var banners = getState().sportsbook.carouselBanner.content;


            if (chkBannerDiffColor.checked) {
                crlBgImageCounter++;
            }
            if (crlBgImageCounter > 4) {
                crlBgImageCounter = 1;
            }


            if (DEVICE_TYPE.includes("Mobile")) {
                crlBannerBgFileName = "crl.banner.mobile.750x416-";
                crlBannerBgWidth = 750;
                crlBannerBgHeight = 436;
                crlBannerTarget = "_self"
            } else {
                crlBannerBgFileName = "crl.banner.desktop.1200x214-"
                crlBannerBgWidth = 1200;
                crlBannerBgHeight = 214;
                crlBannerTarget = "_blank"
            }

            crlBannerKey = "SBTool.CarouselBanner." + crlBannerCounter;

            let newBanner = {
                "key": crlBannerKey,
                "heading": "CAROUSEL BANNER " + crlBannerCounter,
                "bodyText": "This is the description part of the Carousel Banner." +
                    "<hr>Image Overlay: " + imageOverlay,
                "buttonText": "Button  " + crlBannerCounter,
                "link": {
                    "url": "https://en.wikipedia.org/wiki/Betsson",
                    "target": crlBannerTarget,
                    "onClick": ""
                },
                "background": {
                    "url": "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/banners/" + crlBannerBgFileName + crlBgImageCounter + ".jpg",
                    "altText": "",
                    "width": crlBannerBgWidth,
                    "height": crlBannerBgHeight
                },
                "priorityIndex": crlBannerCounter,
                "imageOverlay": imageOverlay
            }
            getState().sportsbook.carouselBanner.content = [];
            getState().sportsbook.carouselBanner.content.push(newBanner);
            for (let banner of banners) {
                getState().sportsbook.carouselBanner.content.push(banner);
            }


            crlBannerCounter++;
            // var nextIndexOfCarouselOrder = getState().sportsbook.carousel.item.skeleton.carouselOrder.length;
            // var banner = {
            //     "id": crlBannerKey,
            //     "sortOrder": nextIndexOfCarouselOrder,
            //     "type": "Banner"
            // }
            // getState().sportsbook.carousel.item.skeleton.carouselOrder[nextIndexOfCarouselOrder] = banner;
            let carouselOrder = getState().sportsbook.carousel.item.skeleton.carouselOrder;
            let banner = {
                "id": crlBannerKey,
                "sortOrder": 0,
                "type": "Banner"
            }
            for (let i = 0; i < carouselOrder.length; i++) {
                carouselOrder[i].sortOrder++;
            }
            carouselOrder.unshift(banner);
            getState().sportsbook.carousel.item.skeleton.carouselOrder = carouselOrder;

            triggerChangeDetection();
        }

        window.removeCarouselBanner = () => {

            let carouselOrder = getState().sportsbook.carousel.item.skeleton.carouselOrder;
            for (let i = 0; i < carouselOrder.length; i++) {
                if (carouselOrder[i].type == "Banner") {
                    carouselOrder.splice(i, 1);
                    break;
                }
            }
            for (let i = 0; i < carouselOrder.length; i++) {
                carouselOrder[i].sortOrder = i;
            }

            getState().sportsbook.carousel.item.skeleton.carouselOrder = carouselOrder;
            triggerChangeDetection();
        }
    }



    window.openInTradingTools = (entity) => {
        var serviceInstanceId = "a541c52d-f9c9-429e-80ac-79019ec525e6";
        var ttBaseUrl;
        var ttPath;
        IS_BLE ?
            ttBaseUrl = "https://tradingtools.ble.local/" :
            ttBaseUrl = "https://tradingtools.qa.bde.local/";
        if (isBonusSystemUs()) {
            serviceInstanceId = "3f31b226-2fcc-4497-a40a-2f958c205a13"
        }
        switch (entity) {
            case "acca":
                ttPath = "bonus/" + accaInsId + "?serviceInstanceId=" + serviceInstanceId;
                break;
            case "accaBoost":
                ttPath = "bonus/" + accaBoostId + "?serviceInstanceId=" + serviceInstanceId;
                break;
            case "priceBoost":
                ttPath = "bonus/" + priceBoostId + "?serviceInstanceId=" + serviceInstanceId;
                break;
            case "profitBoost":
                ttPath = "bonus/" + profitBoostId + "?serviceInstanceId=" + serviceInstanceId;
                break;
            case "freeBet":
                ttPath = "bonus/" + freeBetId + "?serviceInstanceId=" + serviceInstanceId;
                break;
            case "event":
                ttPath = "fixture-management/fixture/" + eventId;
                break;
            case "market":
                ttPath = "fixture-management/fixture/" + eventId + "/market/" + marketId;
                break;
        }
        window.open(ttBaseUrl + ttPath);
    }

    window.openInNewWindow = (url) => {
        switch (url) {
            case "brandsJson":
                url = "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/brands.json";
                break;
        }
        window.open(url)
    }

    function getRandomInt(minOrMax, max) {
        if (max === undefined) {
            max = minOrMax;
            minOrMax = 0;
        }
        minOrMax = Math.ceil(minOrMax);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - minOrMax + 1)) + minOrMax;
    }

    function getRandomBoolean() {
        return Math.random() < 0.5;
    }

    function getRandomFloat(minOrMax, max) {
        if (max === undefined) {
            max = minOrMax;
            minOrMax = 0;
        }
        return (Math.random() * (max - minOrMax) + minOrMax).toFixed(4);
    }


    function createScoreBoard(eventId, scoreBoardExtras) {
        categoryId = getCategoryIdByEventId(eventId);
        participants = getParticipants(eventId);
        lastDateTimeSet = new Date().toISOString();

        switch (categoryId) {
            case "1": return getFootballScoreBoard(participants, scoreBoardExtras);
            case "2": return getIceHockeyScoreBoard(participants, scoreBoardExtras);
            case "3": return getHandballScoreBoard(participants);
            case "4": return getBasketBallScoreBoard(participants);
            case "7": return getRugbyLeagueScoreBoard(participants);
            case "8": return getRugbyUnionScoreBoard(participants);
            case "9": return getVolleyBallScoreBoard(participants);
            case "10": return getAmericanFootballScoreBoard(participants);
            case "11": return getTennisScoreBoard(participants, scoreBoardExtras);
            case "17": return getSnookerScoreBoard(participants)
            case "19": return getBaseballScoreBoard(participants);
            case "26": return getCricketScoreBoard(participants);
            case "34": return getDartsScoreBoard(participants, scoreBoardExtras);
            case "39": return getWaterPoloScoreBoard(participants);
            case "58": return getFutsalScoreBoard(participants);
            case "60": return getBeachVolleyBallScoreBoard(participants);
            case "72": return getBadmintonScoreBoard(participants);
            case "104": return getSquashScoreBoard(participants);
            case "119": return getEsportsScoreBoard(participants);
            case "138": return getTableTennisScoreBoard(participants);
        }

    }

    function getFootballScoreBoard(participants, scoreBoardExtras) {

        let homeFinalScore = getRandomInt(4);
        let awayFinalScore = getRandomInt(4);
        let isExtraTime = scoreBoardExtras.isExtraTimeActive;
        let isHalfTime = scoreBoardExtras.isHalfTimeActive;
        let possession = getRandomInt(25, 75);
        let totalShotsHome = getRandomInt(2, 15);
        let totalShotsAway = getRandomInt(2, 15);
        let totalShotsOnTargetHome = Math.ceil(totalShotsHome * getRandomInt(15, 85) / 100);
        let totalShotsOnTargetAway = Math.ceil(totalShotsAway * getRandomInt(15, 85) / 100);
        let stoppageTime = getRandomInt(1, 5)

        let matchClockMinutes, matchClockSeconds, phaseCategoryId, isFirstHalf, gameClockMode;
        if (isHalfTime) {
            isFirstHalf = true;
            gameClockMode = "Stopped";
            matchClockMinutes = 45;
            matchClockSeconds = 0;
            phaseCategoryId = "17-1";

        } else {
            isFirstHalf = getRandomBoolean();
            gameClockMode = "RunningUp";
            matchClockMinutes = isFirstHalf
                ? (isExtraTime ? 90 + getRandomInt(2, 17) : getRandomInt(47))
                : (isExtraTime ? 90 + getRandomInt(16, 33) : getRandomInt(46, 93));
            matchClockSeconds = getRandomInt(59);
            phaseCategoryId = isFirstHalf
                ? (isExtraTime ? "3-1" : "1-1")
                : (isExtraTime ? "4-1" : "2-1");
        }

        let currentPhaseLabel = isFirstHalf
            ? (isExtraTime ? "1st half - extra time" : "1st half")
            : (isExtraTime ? "2nd half - extra time" : "2nd half");

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: homeFinalScore,
                [participants[1].id]: awayFinalScore
            },
            statistics: {
                [participants[0].id]: {
                    corners: { value: scoreBoardExtras.isCornersActive ? getRandomInt(4) : 0, isActive: scoreBoardExtras.isCornersActive},
                    goalsScored: { value: homeFinalScore, isActive: true },
                    penaltyShots: { value: getRandomInt(4), isActive: true },
                    redCards: { value: scoreBoardExtras.isRedCardsActive ? getRandomInt(1, 2) : 0, isActive: scoreBoardExtras.isRedCardsActive },
                    substitutions: { value: getRandomInt(2), isActive: true },
                    yellowCards: { value: scoreBoardExtras.isYellowCardsActive ? getRandomInt(1, 2) : 0, isActive: scoreBoardExtras.isYellowCardsActive },
                    isSecondLeg: { value: scoreBoardExtras.isAggActive, isActive: scoreBoardExtras.isAggActive },
                    aggregateScore: { value: homeFinalScore + getRandomInt(4), isActive: scoreBoardExtras.isAggActive },

                    stoppageTime: { value: scoreBoardExtras.isStoppageTimeActive ? stoppageTime : 0, isActive: scoreBoardExtras.isStoppageTimeActive },
                    expectedGoals: { value: scoreBoardExtras.isExpectedGoalsActive ? getRandomFloat(3) : 0, isActive: scoreBoardExtras.isExpectedGoalsActive },
                    dangerousAttack: { value: scoreBoardExtras.isDangerousAttacksActive ? getRandomInt(2, 10) : 0, isActive: scoreBoardExtras.isDangerousAttacksActive },
                    shotsOnTarget: { value: scoreBoardExtras.isShotsOnTargetActive ? totalShotsOnTargetHome : 0, isActive: scoreBoardExtras.isShotsOnTargetActive },
                    shotsOffTarget: { value: totalShotsHome - totalShotsOnTargetHome, isActive: false },
                    totalShots: { value: scoreBoardExtras.isTotalShotsActive ? totalShotsHome : 0, isActive: scoreBoardExtras.isTotalShotsActive },
                    possession: { value: scoreBoardExtras.isPossessionActive ? possession : 0, isActive: scoreBoardExtras.isPossessionActive },
                    woodwork: { value: getRandomInt(1, 3), isActive: false },
                    goalKeeperSave: { value: getRandomInt(1, 5), isActive: false },
                    goalsScored: { value: homeFinalScore, isActive: true }
                },
                [participants[1].id]: {
                    corners: { value: scoreBoardExtras.isCornersActive ? getRandomInt(4) : 0, isActive: scoreBoardExtras.isCornersActive},
                    goalsScored: { value: awayFinalScore, isActive: true },
                    penaltyShots: { value: getRandomInt(4), isActive: true },
                    redCards: { value: scoreBoardExtras.isRedCardsActive ? getRandomInt(1, 2) : 0, isActive: scoreBoardExtras.isRedCardsActive },
                    substitutions: { value: getRandomInt(2), isActive: true },
                    yellowCards: { value: scoreBoardExtras.isYellowCardsActive ? getRandomInt(1, 2) : 0, isActive: scoreBoardExtras.isYellowCardsActive },
                    isSecondLeg: { value: scoreBoardExtras.isAggActive, isActive: scoreBoardExtras.isAggActive },
                    aggregateScore: { value: awayFinalScore + getRandomInt(4), isActive: scoreBoardExtras.isAggActive },

                    stoppageTime: { value: scoreBoardExtras.isStoppageTimeActive ? stoppageTime : 0, isActive: scoreBoardExtras.isStoppageTimeActive },
                    expectedGoals: { value: scoreBoardExtras.isExpectedGoalsActive ? getRandomFloat(3) : 0, isActive: scoreBoardExtras.isExpectedGoalsActive },
                    dangerousAttack: { value: scoreBoardExtras.isDangerousAttacksActive ? getRandomInt(2, 10) : 0, isActive: scoreBoardExtras.isDangerousAttacksActive },
                    shotsOnTarget: { value: scoreBoardExtras.isShotsOnTargetActive ? totalShotsOnTargetAway : 0, isActive: scoreBoardExtras.isShotsOnTargetActive },
                    shotsOffTarget: { value: totalShotsAway - totalShotsOnTargetAway, isActive: false },
                    totalShots: { value: scoreBoardExtras.isTotalShotsActive ? totalShotsAway : 0, isActive: scoreBoardExtras.isTotalShotsActive },
                    possession: { value: scoreBoardExtras.isPossessionActive ? 100 - possession : 0, isActive: scoreBoardExtras.isPossessionActive },
                    woodwork: { value: getRandomInt(1, 3), isActive: false },
                    goalKeeperSave: { value: getRandomInt(1, 5), isActive: false },
                    goalsScored: { value: awayFinalScore, isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 1,
            category: "Football",
            currentPhase: {
                id: isFirstHalf ? 1 : 2,
                label: getPhaseLabelWithEnLangCheck(currentPhaseLabel)
            },
            currentVarState: 0,
            isSecondLeg: scoreBoardExtras.isAggActive,
            matchClock: {
                seconds: matchClockSeconds,
                minutes: matchClockMinutes,
                gameClockMode: gameClockMode,
                lastDateTimeSet: lastDateTimeSet
            },
            varState: scoreBoardExtras.isVarStateActive ? 2 : 0,
            phaseCategoryId: phaseCategoryId
        };
    }

    function getBaseballScoreBoard(participants) {
        let isServerHome = getRandomBoolean();
        let scoreBoard = {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[1].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    hitsScored: { value: getRandomInt(2), isActive: false },
                    inningRuns: {
                        byPhase: [
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: 0, isActive: true },
                        ],
                        total: { value: 0, isActive: true }
                    },
                    isBaseOccupied: [
                        { value: false, isActive: true },
                        { value: false, isActive: true },
                        { value: false, isActive: true }
                    ],
                    isServer: { value: isServerHome, isActive: true },
                    outs: { value: getRandomInt(2), isActive: true }
                },
                [participants[1].id]: {
                    hitsScored: { value: getRandomInt(2), isActive: false },
                    inningRuns: {
                        byPhase: [
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: 0, isActive: true },
                        ],
                        total: { value: 0, isActive: true }
                    },
                    isBaseOccupied: [
                        { value: false, isActive: true },
                        { value: false, isActive: true },
                        { value: false, isActive: true }
                    ],
                    isServer: { value: !isServerHome, isActive: true },
                    outs: { value: getRandomInt(2), isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 19,
            category: "Baseball",
            currentPhase: { id: 8, label: getPhaseLabelWithEnLangCheck("8th Inning") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: getRandomInt(59),
                minutes: getRandomInt(1, 19),
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "8-19"
        }
        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getIceHockeyScoreBoard(participants, scoreBoardExtras) {
        let penaltyValueHome, penaltyValueAway;

        if (scoreBoardExtras.isPPNoneActive) {
            penaltyValueHome = 0;
            penaltyValueAway = 0;
        } else if (scoreBoardExtras.isPPHomeActive) {
            penaltyValueHome = 0;
            penaltyValueAway = 1;
        } else if (scoreBoardExtras.isPP2HomeActive) {
            penaltyValueHome = 0;
            penaltyValueAway = 2;
        } else if (scoreBoardExtras.isPPAwayActive) {
            penaltyValueHome = 1;
            penaltyValueAway = 0;
        } else if (scoreBoardExtras.isPP2AwayActive) {
            penaltyValueHome = 2;
            penaltyValueAway = 0;
        }

        let scoreBoard = {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[0].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false }
                        ],
                        total: { value: 0, isActive: true }
                    },
                    penaltyShots: { value: penaltyValueHome, isActive: true }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(5), isActive: true },
                            { value: getRandomInt(5), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false }
                        ],
                        total: { value: 1, isActive: true }
                    },
                    penaltyShots: { value: penaltyValueAway, isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 2,
            category: "IceHockey",
            currentPhase: { id: 2, label: getPhaseLabelWithEnLangCheck("2nd Period") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: getRandomInt(59),
                minutes: getRandomInt(1, 19),
                gameClockMode: "RunningDown",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "2-2"
        }

        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getTennisScoreBoard(participants, scoreBoardExtras) {
        let set1HomeScore, set1AwayScore, set2HomeScore, set2AwayScore, set3HomeScore, set3AwayScore;
        let isServerHome = getRandomBoolean();
        let isSet1WonByHome = getRandomBoolean();
        let isSet2WonByHome = getRandomBoolean();
        let isSet3WonByHome = getRandomBoolean();

        let gamePointsPair = getRandomValidTennisGamePoints();

        let totalScoreHome = 0;
        let totalScoreAway = 0;

        if (isSet1WonByHome) {
            totalScoreHome++;
            set1HomeScore = (6, 7);
            set1AwayScore = (set1HomeScore === 6) ? getRandomInt(4) : 5;
        } else {
            totalScoreAway++;
            set1AwayScore = getRandomInt(6, 7);
            set1HomeScore = (set1AwayScore === 6) ? getRandomInt(4) : 5;
        }

        if (scoreBoardExtras.isFiveSetMatch) {
            if (isSet2WonByHome) {
                totalScoreHome++;
                set2HomeScore = (6, 7);
                set2AwayScore = (set2HomeScore === 6) ? getRandomInt(4) : 5;
            } else {
                totalScoreAway++;
                set2AwayScore = getRandomInt(6, 7);
                set2HomeScore = (set2AwayScore === 6) ? getRandomInt(4) : 5;
            }

            if (isSet3WonByHome) {
                totalScoreHome++;
                set3HomeScore = (6, 7);
                set3AwayScore = (set3HomeScore === 6) ? getRandomInt(4) : 5;
            } else {
                totalScoreAway++;
                set3AwayScore = getRandomInt(6, 7);
                set3HomeScore = (set3AwayScore === 6) ? getRandomInt(4) : 5;
            }
        } else {
            set2HomeScore = getRandomInt(5);
            set2AwayScore = getRandomInt(5);
            set3HomeScore = 0;
            set3AwayScore = 0;
        }

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: totalScoreHome,
                [participants[1].id]: totalScoreAway
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: set1HomeScore, isActive: true },
                            { value: set2HomeScore, isActive: true },
                            { value: set3HomeScore, isActive: true },
                            { value: getRandomInt(5), isActive: scoreBoardExtras.isFiveSetMatch },
                            { value: 0, isActive: scoreBoardExtras.isFiveSetMatch }
                        ],
                        total: { value: gamePointsPair[0], isActive: true }
                    },
                    isServer: { value: isServerHome, isActive: true },
                    setPoints: { value: 0, isActive: true },
                    tieBreakPoints: { value: 0, isActive: false }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: set1AwayScore, isActive: true },
                            { value: set2AwayScore, isActive: true },
                            { value: set3AwayScore, isActive: true },
                            { value: getRandomInt(5), isActive: scoreBoardExtras.isFiveSetMatch },
                            { value: 0, isActive: scoreBoardExtras.isFiveSetMatch }
                        ],
                        total: { value: gamePointsPair[1], isActive: true }
                    },
                    isServer: { value: !isServerHome, isActive: true },
                    setPoints: { value: 0, isActive: true },
                    tieBreakPoints: { value: 0, isActive: false }
                }
            },
            eventId: eventId,
            categoryId: 11,
            category: "Tennis",
            currentPhase: { id: scoreBoardExtras.isFiveSetMatch ? 4 : 2, label: getPhaseLabelWithEnLangCheck(scoreBoardExtras.isFiveSetMatch ? "4th Set" : "2nd Set") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: scoreBoardExtras.isFiveSetMatch ? "4-11" : "2-11"
        }

        function getRandomValidTennisGamePoints() {
            let validGamePoints = ["0", "15", "30", "40", "A"];
            let index1 = Math.floor(Math.random() * validGamePoints.length);
            if (validGamePoints[index1] === 'A') {
                return ["A", "40"];
            }
            if (validGamePoints[index1] === "40") {
                let index2 = Math.random() < 0.5 ? validGamePoints.indexOf("A") : Math.floor(Math.random() * validGamePoints.length);
                return ["40", validGamePoints[index2]];
            }
            let index2 = Math.floor(Math.random() * validGamePoints.length);
            while (validGamePoints[index2] === 'A') {
                index2 = Math.floor(Math.random() * validGamePoints.length);
            }
            return [validGamePoints[index1], validGamePoints[index2]];
        }

    }

    function getBasketBallScoreBoard(participants) {
        let scoreBoard = {
            actions: [],
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[1].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(10, 50), isActive: true },
                            { value: getRandomInt(10, 50), isActive: true },
                            { value: getRandomInt(10, 50), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                        ],
                        total: {
                            value: 0,
                            isActive: true
                        }
                    }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(10, 50), isActive: true },
                            { value: getRandomInt(10, 50), isActive: true },
                            { value: getRandomInt(10, 50), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                        ],
                        total: {
                            value: 0,
                            isActive: true
                        }
                    }
                }
            },
            eventId: eventId,
            categoryId: 4,
            category: "Basketball",
            currentPhase: { id: 3, label: getPhaseLabelWithEnLangCheck("3rd Quarter") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: getRandomInt(59),
                minutes: getRandomInt(1, 11),
                gameClockMode: "RunningDown",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "3-4"
        }
        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getDartsScoreBoard(participants, scoreBoardExtras) {
        let legPointsHome = getRandomInt(3),
            legPointsAway = getRandomInt(3),
            setPointsHome = 0,
            setPointsAway = 0;

        if (scoreBoardExtras.isSetPointsActive) {
            setPointsHome = getRandomInt(3);
            setPointsAway = getRandomInt(3);
        }

        let isServer = getRandomBoolean();

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: legPointsHome,
                [participants[1].id]: legPointsAway
            },
            statistics: {
                [participants[0].id]: {
                    leftovers: { value: getRandomInt(1, 501), isActive: true },
                    legPoints: { value: legPointsHome, isActive: true },
                    setPoints: { value: setPointsHome, isActive: scoreBoardExtras.isSetPointsActive },
                    isServer: { value: isServer, isActive: true },
                    oneEighties: { value: scoreBoardExtras.isSetPointsActive ? getRandomInt((setPointsHome + 1) * getRandomInt(1, 3)) : getRandomInt(legPointsHome), isActive: scoreBoardExtras.is180sActive },
                    matchFormat: { value: scoreBoardExtras.isSetPointsActive ? "best7sets" : "legslimited", isActive: true },
                    matchFormatSummary: { value: "This is the match format summary", isActive: true }
                },
                [participants[1].id]: {
                    leftovers: { value: getRandomInt(1, 501), isActive: true },
                    legPoints: { value: legPointsAway, isActive: true },
                    setPoints: { value: setPointsAway, isActive: scoreBoardExtras.isSetPointsActive },
                    isServer: { value: !isServer, isActive: true },
                    oneEighties: { value: scoreBoardExtras.isSetPointsActive ? getRandomInt((setPointsAway + 1) * getRandomInt(1, 3)) : getRandomInt(legPointsAway), isActive: scoreBoardExtras.is180sActive },
                    matchFormat: { value: scoreBoardExtras.isSetPointsActive ? "best7sets" : "legslimited", isActive: true },
                    matchFormatSummary: { value: "This is the match format summary", isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 34,
            category: "Darts",
            currentPhase: {
                id: 1,
                label: ""
            },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "1-34"
        }
    }

    function getVolleyBallScoreBoard(participants) {
        let isServer = getRandomBoolean();
        let isSet1WonByHome = getRandomBoolean();
        let isSet2WonByHome = getRandomBoolean();
        let isSet3WonByHome = getRandomBoolean();

        let set1HomeScore, set2HomeScore, set3HomeScore;
        let set1AwayScore, set2AwayScore, set3AwayScore;

        let totalScoreHome = 0;
        let totalScoreAway = 0;

        if (isSet1WonByHome) {
            totalScoreHome++;
            set1HomeScore = 25;
            set1AwayScore = getRandomInt(23);
        } else {
            totalScoreAway++;
            set1HomeScore = getRandomInt(23);
            set1AwayScore = 25;
        }

        if (isSet2WonByHome) {
            totalScoreHome++;
            set2HomeScore = 25;
            set2AwayScore = getRandomInt(23);
        } else {
            totalScoreAway++;
            set2HomeScore = getRandomInt(23);
            set2AwayScore = 25;
        }

        if (isSet3WonByHome) {
            totalScoreHome++;
            set3HomeScore = 25;
            set3AwayScore = getRandomInt(23);
        } else {
            totalScoreAway++;
            set3HomeScore = getRandomInt(23);
            set3AwayScore = 25;
        }

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: totalScoreHome,
                [participants[1].id]: totalScoreAway
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: set1HomeScore, isActive: true },
                            { value: set2HomeScore, isActive: true },
                            { value: set3HomeScore, isActive: true },
                            { value: getRandomInt(24), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: {
                            value: totalScoreHome,
                            isActive: true
                        }
                    },
                    isServer: {
                        value: isServer,
                        isActive: true
                    }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: set1AwayScore, isActive: true },
                            { value: set2AwayScore, isActive: true },
                            { value: set3AwayScore, isActive: true },
                            { value: getRandomInt(24), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: {
                            value: totalScoreAway,
                            isActive: true
                        }
                    },
                    isServer: {
                        value: !isServer,
                        isActive: true
                    }
                }
            },
            eventId: eventId,
            categoryId: 9,
            category: "Volleyball",
            currentPhase: { id: 2, label: getPhaseLabelWithEnLangCheck("4th Set") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "4-9"
        }
    }

    function getEsportsScoreBoard(participants) {
        let isMap1WonByHome = getRandomBoolean();
        let isMap2WonByHome = getRandomBoolean();
        let isMap3WonByHome = getRandomBoolean();

        let map1HomeScore, map2HomeScore, map3HomeScore;
        let map1AwayScore, map2AwayScore, map3AwayScore;

        let totalScoreHome = 0;
        let totalScoreAway = 0;

        if (isMap1WonByHome) {
            totalScoreHome++;
            map1HomeScore = 13;
            map1AwayScore = getRandomInt(11);
        } else {
            totalScoreAway++;
            map1HomeScore = getRandomInt(11);
            map1AwayScore = 13;
        }

        if (isMap2WonByHome) {
            totalScoreHome++;
            map2HomeScore = 13;
            map2AwayScore = getRandomInt(11);
        } else {
            totalScoreAway++;
            map2HomeScore = getRandomInt(11);
            map2AwayScore = 13;
        }

        if (isMap3WonByHome) {
            totalScoreHome++;
            map3HomeScore = 13;
            map3AwayScore = getRandomInt(11);
        } else {
            totalScoreAway++;
            map3HomeScore = getRandomInt(11);
            map3AwayScore = 13;
        }

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: totalScoreHome,
                [participants[1].id]: totalScoreAway
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: map1HomeScore, isActive: true },
                            { value: map2HomeScore, isActive: true },
                            { value: map3HomeScore, isActive: true },
                            { value: getRandomInt(12), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false }
                        ],
                        total: { value: totalScoreHome, isActive: true }
                    }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: map1AwayScore, isActive: true },
                            { value: map2AwayScore, isActive: true },
                            { value: map3AwayScore, isActive: true },
                            { value: getRandomInt(12), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false }
                        ],
                        total: { value: totalScoreAway, isActive: true }
                    }
                }
            },
            eventId: eventId,
            categoryId: 119,
            category: "ESport",
            currentPhase: { id: 2, label: getPhaseLabelWithEnLangCheck("Map 4") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "4-119"
        }

    }

    function getTableTennisScoreBoard(participants) {
        let isServer = getRandomBoolean();
        let isSet1WonByHome = getRandomBoolean();
        let isSet2WonByHome = getRandomBoolean();
        let isSet3WonByHome = getRandomBoolean();

        let set1HomeScore, set2HomeScore, set3HomeScore;
        let set1AwayScore, set2AwayScore, set3AwayScore;

        let totalScoreHome = 0;
        let totalScoreAway = 0;

        if (isSet1WonByHome) {
            totalScoreHome++;
            set1HomeScore = 11;
            set1AwayScore = getRandomInt(9);
        } else {
            totalScoreAway++;
            set1HomeScore = getRandomInt(9);
            set1AwayScore = 11;
        }

        if (isSet2WonByHome) {
            totalScoreHome++;
            set2HomeScore = 11;
            set2AwayScore = getRandomInt(9);
        } else {
            totalScoreAway++;
            set2HomeScore = getRandomInt(9);
            set2AwayScore = 11;
        }

        if (isSet3WonByHome) {
            totalScoreHome++;
            set3HomeScore = 11;
            set3AwayScore = getRandomInt(9);
        } else {
            totalScoreAway++;
            set3HomeScore = getRandomInt(9);
            set3AwayScore = 11;
        }
        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: totalScoreHome,
                [participants[1].id]: totalScoreAway
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: set1HomeScore, isActive: true },
                            { value: set2HomeScore, isActive: true },
                            { value: set3HomeScore, isActive: true },
                            { value: getRandomInt(10), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false }
                        ],
                        total: { value: totalScoreHome, isActive: false }
                    },
                    isServer: { value: isServer, isActive: true },
                    setPoints: { value: totalScoreHome, isActive: true },
                    tieBreakPoints: { value: 0, isActive: false }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: set1AwayScore, isActive: true },
                            { value: set2AwayScore, isActive: true },
                            { value: set3AwayScore, isActive: true },
                            { value: getRandomInt(10), isActive: true },
                            { value: 0, isActive: true },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false },
                            { value: 0, isActive: false }
                        ],
                        total: { value: totalScoreAway, isActive: false }
                    },
                    isServer: { value: !isServer, isActive: true },
                    setPoints: { value: totalScoreAway, isActive: true },
                    tieBreakPoints: { value: 0, isActive: false }
                }
            },
            eventId: eventId,
            categoryId: 138,
            category: "TableTennis",
            currentPhase: { id: 4, label: "" },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: { seconds: 0, minutes: 0, gameClockMode: "Stopped", lastDateTimeSet: lastDateTimeSet },
            varState: 0,
            phaseCategoryId: "4-138"
        }

    }

    function getHandballScoreBoard(participants) {
        let isFirstHalf = getRandomBoolean();

        let scoreBoard = {
            actions: [],
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[1].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(5, 30), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(5, 30), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(5, 30), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(5, 30), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                }
            },
            eventId: eventId,
            categoryId: 3,
            category: "Handball",
            currentPhase: {
                id: isFirstHalf ? 1 : 2,
                label: getPhaseLabelWithEnLangCheck(isFirstHalf ? "1st half" : "2nd half")
            },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: isFirstHalf ? "1-3" : "2-3" //added manually
        }
        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getWaterPoloScoreBoard() {
        let homeFinalScore = getRandomInt(20);
        let awayFinalScore = getRandomInt(20);

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: homeFinalScore,
                [participants[1].id]: awayFinalScore
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [],
                        total: { value: homeFinalScore, isActive: true }
                    },
                    penaltyShots: { value: 0, isActive: false }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [],
                        total: { value: awayFinalScore, isActive: true }
                    },
                    penaltyShots: { value: 0, isActive: false }
                }
            },
            eventId: eventId,
            categoryId: 39,
            category: "Waterpolo",
            // currentPhase: { id: 3, label: getPhaseLabelWithEnLangCheck("3rd Quarter") },
            currentPhase: { id: 3, label: "" },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: getRandomInt(59),
                minutes: getRandomInt(1, 8),
                gameClockMode: "RunningDown",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "3-39"
        }


    }

    function getBadmintonScoreBoard() {
        let isServer = getRandomBoolean();
        let isgame1WonByHome = getRandomBoolean();

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: isgame1WonByHome ? 1 : 0,
                [participants[1].id]: isgame1WonByHome ? 0 : 1
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: isgame1WonByHome ? 21 : getRandomInt(19), isActive: true },
                            { value: getRandomInt(20), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: { value: isgame1WonByHome ? 1 : 0, isActive: true }
                    },
                    isServer: { value: isServer, isActive: true }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: isgame1WonByHome ? getRandomInt(19) : 21, isActive: true },
                            { value: getRandomInt(20), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: { value: isgame1WonByHome ? 0 : 1, isActive: true }
                    },
                    isServer: { value: !isServer, isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 72,
            category: "Badminton",
            currentPhase: { id: 2, label: getPhaseLabelWithEnLangCheck("2nd Game") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "2-72"
        }
    }

    function getFutsalScoreBoard() {
        let isFirstHalf = getRandomBoolean();

        let scoreBoard = {
            actions: [],
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[1].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(0, 7), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(0, 7), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(0, 7), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(0, 7), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                }
            },
            eventId: eventId,
            categoryId: 58,
            category: "Futsal",
            currentPhase: { id: isFirstHalf ? 1 : 2 },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: getRandomInt(59),
                minutes: getRandomInt(1, 19),
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: isFirstHalf ? "1-58" : "2-58"

        }
        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getSquashScoreBoard() {
        let isServer = getRandomBoolean();
        let isgame1WonByHome = getRandomBoolean();
        let isgame2WonByHome = getRandomBoolean();
        let isgame3WonByHome = getRandomBoolean();

        let game1HomeScore, game2HomeScore, game3HomeScore;
        let game1AwayScore, game2AwayScore, game3AwayScore;

        let totalScoreHome = 0;
        let totalScoreAway = 0;

        if (isgame1WonByHome) {
            totalScoreHome++;
            game1HomeScore = 11;
            game1AwayScore = getRandomInt(9);
        } else {
            totalScoreAway++;
            game1HomeScore = getRandomInt(9);
            game1AwayScore = 11;
        }

        if (isgame2WonByHome) {
            totalScoreHome++;
            game2HomeScore = 11;
            game2AwayScore = getRandomInt(9);
        } else {
            totalScoreAway++;
            game2HomeScore = getRandomInt(9);
            game2AwayScore = 11;
        }

        if (isgame3WonByHome) {
            totalScoreHome++;
            game3HomeScore = 11;
            game3AwayScore = getRandomInt(9);
        } else {
            totalScoreAway++;
            game3HomeScore = getRandomInt(9);
            game3AwayScore = 11;
        }

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: totalScoreHome,
                [participants[1].id]: totalScoreAway
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: game1HomeScore, isActive: true },
                            { value: game2HomeScore, isActive: true },
                            { value: game3HomeScore, isActive: true },
                            { value: getRandomInt(10), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: { value: totalScoreHome, isActive: true }
                    },
                    isServer: { value: isServer, isActive: true }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: game1AwayScore, isActive: true },
                            { value: game2AwayScore, isActive: true },
                            { value: game3AwayScore, isActive: true },
                            { value: getRandomInt(10), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: { value: totalScoreAway, isActive: true }
                    },
                    isServer: { value: !isServer, isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 104,
            category: "Squash",
            currentPhase: { id: 4, label: getPhaseLabelWithEnLangCheck("4th Game") },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimegame: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "4-104"
        }
    }

    function getBeachVolleyBallScoreBoard() {
        let isServer = getRandomBoolean();
        let isSet1WonByHome = getRandomBoolean();
        let totalScoreHome = isSet1WonByHome ? 1 : 0;
        let totalScoreAway = isSet1WonByHome ? 0 : 1;

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: totalScoreHome,
                [participants[1].id]: totalScoreAway
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: isSet1WonByHome ? 21 : getRandomInt(19), isActive: true },
                            { value: getRandomInt(20), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: { value: totalScoreHome, isActive: true }
                    },
                    isServer: { value: isServer, isActive: true }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: isSet1WonByHome ? getRandomInt(19) : 21, isActive: true },
                            { value: getRandomInt(20), isActive: true },
                            { value: 0, isActive: true }
                        ],
                        total: { value: totalScoreAway, isActive: true }
                    },
                    isServer: { value: !isServer, isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 60,
            category: "BeachVolleyball",
            currentPhase: {
                id: 2,
                label: getPhaseLabelWithEnLangCheck("2nd Set")
            },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "2-60"
        }

    }

    function getRugbyUnionScoreBoard(participants) {
        let isFirstHalf = getRandomBoolean();

        let scoreBoard = {
            actions: [],
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[1].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(2, 30), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(2, 30), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(2, 30), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(2, 30), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                }
            },
            eventId: eventId,
            categoryId: 8,
            category: "RugbyUnion",
            currentPhase: {
                id: isFirstHalf ? 1 : 2,
                label: getPhaseLabelWithEnLangCheck(isFirstHalf ? "1st Period" : "2nd Period")
            },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: isFirstHalf ? "1-8" : "2-8" // added manually
        }
        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getRugbyLeagueScoreBoard() {
        let isFirstHalf = getRandomBoolean();

        let scoreBoard = {
            actions: [],
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[1].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(2, 30), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(2, 30), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(2, 30), isActive: true },
                            { value: isFirstHalf ? 0 : getRandomInt(2, 30), isActive: true }
                        ],
                        total: { value: 0, isActive: true }
                    }
                }
            },
            eventId: eventId,
            categoryId: 7,
            category: "RugbyLeague",
            currentPhase: {
                id: 2,
                label: "2. īnings"
            },
            currentPhase: {
                id: isFirstHalf ? 1 : 2,
                label: getPhaseLabelWithEnLangCheck(isFirstHalf ? "1st Period" : "2nd Period")
            },
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: isFirstHalf ? "1-7" : "2-7"
        }
        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getSnookerScoreBoard() {
        let homeMatchPoints = getRandomInt(140);
        let awayMatchPoints = getRandomInt(140);
        let homeFramePoints = getRandomInt(16);
        let awayFramePoints = getRandomInt(16);
        let currentPhaseId = homeFramePoints + awayFramePoints + 1;

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: homeMatchPoints,
                [participants[1].id]: awayMatchPoints
            },
            statistics: {
                [participants[0].id]: {
                    framePoints: { value: homeFramePoints, isActive: true },
                    matchPoints: { value: homeMatchPoints, isActive: true }
                },
                [participants[1].id]: {
                    framePoints: { value: awayFramePoints, isActive: true },
                    matchPoints: { value: awayMatchPoints, isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 17,
            category: "Snooker",
            currentPhase: {
                id: currentPhaseId,
                label: getPhaseLabelWithEnLangCheck(getOrdinalSuffix(currentPhaseId) + " Frame")
            },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: currentPhaseId + "-35"
        }
    }

    function getCricketScoreBoard() {
        let currentPhaseId = getRandomInt(3, 4);
        let homeScore = getRandomInt(300) + getRandomInt(300),
            awayScore = getRandomInt(300);

        if (currentPhaseId == 4) {
            awayScore += getRandomInt(300);
        }

        return {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: homeScore,
                [participants[1].id]: awayScore
            },
            statistics: {
                [participants[0].id]: {
                    totalScore: {
                        byPhase: [],
                        total: { value: homeScore, isActive: true }
                    },
                    lastInningsWicket: { value: getRandomInt(1, 10), isActive: true }
                },
                [participants[1].id]: {
                    totalScore: {
                        byPhase: [],
                        total: { value: awayScore, isActive: true }
                    },
                    lastInningsWicket: { value: getRandomInt(1, 10), isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 26,
            category: "Cricket",
            currentPhase: {
                id: currentPhaseId,
                label: getPhaseLabelWithEnLangCheck(getOrdinalSuffix(currentPhaseId) + " Inning")
            },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: 0,
                minutes: 0,
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: currentPhaseId + "-26"
        }

    }

    function getAmericanFootballScoreBoard() {
        let isServer = getRandomBoolean();
        let scoreBoard = {
            participants: participants,
            scorePerParticipant: {
                [participants[0].id]: 0,
                [participants[1].id]: 0
            },
            statistics: {
                [participants[0].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(28), isActive: true },
                            { value: getRandomInt(28), isActive: true },
                            { value: getRandomInt(28), isActive: true },
                            { value: getRandomInt(0), isActive: true },
                            { value: getRandomInt(0), isActive: false }
                        ],
                        total: { value: 0, isActive: true }
                    },
                    isServer: { value: isServer, isActive: true }
                },
                [participants[1].id]: {
                    score: {
                        byPhase: [
                            { value: getRandomInt(28), isActive: true },
                            { value: getRandomInt(28), isActive: true },
                            { value: getRandomInt(28), isActive: true },
                            { value: getRandomInt(0), isActive: true },
                            { value: getRandomInt(0), isActive: false }
                        ],
                        total: { value: 0, isActive: true }
                    },
                    isServer: { value: !isServer, isActive: true }
                }
            },
            eventId: eventId,
            categoryId: 10,
            category: "AmericanFootball",
            currentPhase: {
                id: 3,
                label: getPhaseLabelWithEnLangCheck("3rd Quarter")
            },
            currentVarState: 0,
            isSecondLeg: false,
            matchClock: {
                seconds: getRandomInt(59),
                minutes: getRandomInt(14),
                gameClockMode: "Stopped",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
            phaseCategoryId: "3-10" // added manually
        }
        return getScoreBoardWithFinalScores(scoreBoard, participants, categoryId);
    }

    function getScoreBoardWithFinalScores(scoreBoard, participants, categoryId) {
        let homeFinalScore = getFinalScore(0);
        let awayFinalScore = getFinalScore(1);

        scoreBoard.scorePerParticipant[participants[0].id] = homeFinalScore;
        scoreBoard.scorePerParticipant[participants[1].id] = awayFinalScore;

        let statKey = categoryId === "19" ? "inningRuns" : "score";
        scoreBoard.statistics[participants[0].id][statKey].total.value = homeFinalScore;
        scoreBoard.statistics[participants[1].id][statKey].total.value = awayFinalScore;

        function getFinalScore(index) {
            let byPhase = categoryId === "19" ? scoreBoard.statistics[participants[index].id].inningRuns.byPhase : scoreBoard.statistics[participants[index].id].score.byPhase;
            return byPhase.reduce((total, currentValue) => total + currentValue.value, 0);
        }
        return scoreBoard;
    }

    function getPhaseLabelWithEnLangCheck(phaseLabel) {
        return LANGUAGECODE == "en" ? phaseLabel : phaseLabel + " (English)";
    }

    function getOrdinalSuffix(number) {
        if (number % 100 >= 11 && number % 100 <= 13) {
            return number + "th";
        }
        switch (number % 10) {
            case 1:
                return number + "st";
            case 2:
                return number + "nd";
            case 3:
                return number + "rd";
            default:
                return number + "th";
        }
    }

    function createScore24Statistics(eventId) {
        let participants = getParticipants(eventId);
        let competitionName = getCompetitionNameByEventId(eventId);
        let labels = getRandomParticipantLabels(10);

        let lastMeetingResults = [];
        for (let i = 1; i < 6; i++) {
            lastMeetingResults.push(getLastMeetingsResult(i));
        }

        function getLastMeetingsResult(i) {
            let scoreHome = getRandomInt(5);
            let scoreAway = getRandomInt(5);
            let res;

            if (scoreHome > scoreAway) {
                res = 1;
            } else if (scoreHome < scoreAway) {
                res = -1;
            } else {
                res = 0
            }

            let index = getRandomInt(0, 1);
            return {
                date: getRandomDateAsIsoString(i * 100, i * 100 + 100),
                league: competitionName,
                participants: [{
                    id: participants[index].id,
                    score: scoreHome
                }, {
                    id: participants[index == 0 ? 1 : 0].id,
                    score: scoreAway
                }],
                result: res
            }
        }

        let participantWonCount0 = 0;
        let participantWonCount1 = 0;
        let drawCount = 0;
        for (let k = 0; k < 5; k++) {
            if (lastMeetingResults[k].result == 1) {
                participantWonCount0++;
            } else if (lastMeetingResults[k].result == -1) {
                participantWonCount1++
            } else {
                drawCount++
            }
        }

        function getRandomInt(minOrMax, max) {
            if (max === undefined) {
                max = minOrMax;
                minOrMax = 0;
            }
            minOrMax = Math.ceil(minOrMax);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - minOrMax + 1)) + minOrMax;
        }

        let table = [{
            label: labels[0],
            tableType: 1,
            p: 1,
            mp: 30,
            w: 25,
            l: 1,
            d: 4,
            gf: 73,
            ga: 14,
            gd: 59,
            pts: 79,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            id: participants[1].id,
            label: participants[1].label,
            tableType: 1,
            p: 2,
            mp: 30,
            w: 20,
            l: 5,
            d: 5,
            gf: 57,
            ga: 34,
            gd: 23,
            pts: 65,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            label: labels[1],
            tableType: 1,
            p: 3,
            mp: 30,
            w: 17,
            l: 5,
            d: 8,
            gf: 44,
            ga: 24,
            gd: 20,
            pts: 59,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            id: participants[0].id,
            label: participants[0].label,
            tableType: 1,
            p: 4,
            mp: 30,
            w: 16,
            l: 5,
            d: 9,
            gf: 45,
            ga: 25,
            gd: 20,
            pts: 57,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            label: labels[2],
            tableType: 1,
            p: 5,
            mp: 30,
            w: 15,
            l: 8,
            d: 7,
            gf: 55,
            ga: 35,
            gd: 20,
            pts: 52,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            label: labels[3],
            tableType: 1,
            p: 6,
            mp: 29,
            w: 15,
            l: 9,
            d: 5,
            gf: 54,
            ga: 32,
            gd: 22,
            pts: 50,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            label: labels[4],
            tableType: 1,
            p: 7,
            mp: 30,
            w: 14,
            l: 12,
            d: 4,
            gf: 37,
            ga: 33,
            gd: 4,
            pts: 46,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            label: labels[5],
            tableType: 1,
            p: 8,
            mp: 30,
            w: 12,
            l: 9,
            d: 9,
            gf: 44,
            ga: 36,
            gd: 8,
            pts: 45,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            label: labels[6],
            tableType: 1,
            p: 9,
            mp: 30,
            w: 11,
            l: 8,
            d: 11,
            gf: 29,
            ga: 26,
            gd: 3,
            pts: 44,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }, {
            label: labels[7],
            tableType: 1,
            p: 10,
            mp: 29,
            w: 12,
            l: 10,
            d: 7,
            gf: 42,
            ga: 34,
            gd: 8,
            pts: 43,
            gb: 0,
            lot: 0,
            pf: 0,
            pa: 0
        }]

        function getLastGameScores(i) {
            let homeScore = getRandomInt(5);
            let awayScore = getRandomInt(5);
            let result;
            if (homeScore > awayScore) {
                result = 1;
            } else if (homeScore < awayScore) {
                result = -1;
            } else {
                result = 0
            }
            return {
                homeScore: homeScore,
                awayScore: awayScore,
                result: result,
                date: getRandomDateAsIsoString(i * 10, i * 10 + 10)
            }
        }

        let lastGamesResults0 = [];
        let lastGamesResults1 = [];
        let form0 = [];
        let form1 = [];
        for (let i = 1; i < 6; i++) {
            lastGamesResults0.push(getLastGameScores(i));
            lastGamesResults1.push(getLastGameScores(i));
        }

        for (let r of lastGamesResults0) {
            form0.push(r.result);
        }
        for (let r of lastGamesResults1) {
            form1.push(r.result);
        }

        getState().sportsbook.statistics = {
            [eventId]: {
                table: table,
                tables: {
                    [competitionName]: table
                },
                lastMeetings: {
                    summary: {
                        [participants[0].id]: participantWonCount0,
                        [participants[1].id]: participantWonCount1,
                        draw: drawCount
                    },
                    results: lastMeetingResults
                },
                lastGames: {
                    [participants[0].id]: [{
                        participants: [{
                            label: participants[0].label,
                            id: participants[0].id,
                            score: lastGamesResults0[0].homeScore
                        }, {
                            label: labels[0],
                            score: lastGamesResults0[0].awayScore
                        }],
                        result: lastGamesResults0[0].result,
                        league: competitionName,
                        date: lastGamesResults0[0].date
                    }, {
                        participants: [{
                            label: labels[1],
                            score: lastGamesResults0[1].homeScore
                        }, {
                            label: participants[0].label,
                            id: participants[0].id,
                            score: lastGamesResults0[1].awayScore
                        }],
                        result: lastGamesResults0[1].result,
                        league: competitionName,
                        date: lastGamesResults0[1].date
                    }, {
                        participants: [{
                            label: participants[0].label,
                            id: participants[0].id,
                            score: lastGamesResults0[2].homeScore
                        }, {
                            label: labels[2],
                            score: lastGamesResults0[2].awayScore
                        }],
                        result: lastGamesResults0[2].result,
                        league: competitionName,
                        date: lastGamesResults0[2].date
                    }, {
                        participants: [{
                            label: labels[3],
                            score: lastGamesResults0[3].homeScore
                        }, {
                            label: participants[0].label,
                            id: participants[0].id,
                            score: lastGamesResults0[3].awayScore
                        }],
                        result: lastGamesResults0[3].result,
                        league: competitionName,
                        date: lastGamesResults0[3].date
                    }, {
                        participants: [{
                            label: participants[0].label,
                            id: participants[0].id,
                            score: lastGamesResults0[4].homeScore
                        }, {
                            label: labels[4],
                            score: lastGamesResults0[4].awayScore
                        }],
                        result: lastGamesResults0[4].result,
                        league: competitionName,
                        date: lastGamesResults0[4].date
                    }],
                    [participants[1].id]: [{
                        participants: [{
                            label: participants[1].label,
                            id: participants[1].id,
                            score: lastGamesResults1[0].homeScore
                        }, {
                            label: labels[5],
                            score: lastGamesResults1[0].awayScore
                        }],
                        result: lastGamesResults1[0].result,
                        league: competitionName,
                        date: lastGamesResults1[0].date
                    }, {
                        participants: [{
                            label: labels[6],
                            score: lastGamesResults1[1].homeScore
                        }, {
                            label: participants[1].label,
                            id: participants[1].id,
                            score: lastGamesResults1[1].awayScore
                        }],
                        result: lastGamesResults1[1].result,
                        league: competitionName,
                        date: lastGamesResults1[1].date
                    }, {
                        participants: [{
                            label: labels[7],
                            score: lastGamesResults1[2].homeScore
                        }, {
                            label: participants[1].label,
                            id: participants[1].id,
                            score: lastGamesResults1[2].awayScore
                        }],
                        result: lastGamesResults1[2].result,
                        league: competitionName,
                        date: lastGamesResults1[2].date
                    }, {
                        participants: [{
                            label: participants[1].label,
                            id: participants[1].id,
                            score: lastGamesResults1[3].homeScore
                        }, {
                            label: labels[8],
                            score: lastGamesResults1[3].awayScore
                        }],
                        result: lastGamesResults1[3].result,
                        league: competitionName,
                        date: lastGamesResults1[3].date
                    }, {
                        participants: [{
                            label: labels[9],
                            score: lastGamesResults1[4].homeScore
                        }, {
                            label: participants[1].label,
                            id: participants[1].id,
                            score: lastGamesResults1[4].awayScore
                        }],
                        result: lastGamesResults1[4].result,
                        league: competitionName,
                        date: lastGamesResults1[4].date
                    }]
                },
                form: {
                    [participants[0].id]: form0,
                    [participants[1].id]: form1

                },
                isBusy: false,
                isFetched: true
            }
        };

        function getRandomDateAsIsoString(earlierDaysBack, laterDaysBack) {
            let currentDate = new Date();
            let minDate = new Date(currentDate.getTime() - (earlierDaysBack * 24 * 60 * 60 * 1000));
            let maxDate = new Date(currentDate.getTime() - (laterDaysBack * 24 * 60 * 60 * 1000));
            let randomTimestamp = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
            let randomDate = new Date(randomTimestamp);
            let formattedDate = randomDate.toISOString();
            return formattedDate;
        }

        function getRandomParticipantLabels(amount) {
            const possibleLabels = ["Mighty Muffin Men", "Turbo Turtles", "Quirky Quokkas", "Wacky Walruses", "Funky Ferrets", "Jolly Jellybeans", "Sneaky Sloths", "Zany Zebras", "Silly Squirrels", "Laughing Llamas", "Goofy Gophers", "Crazy Crickets", "Cheeky Chinchillas", "Bouncing Bananas", "Hilarious Hedgehogs", "Bonkers Badgers", "Whimsical Wombats", "Chuckling Chipmunks", "Riotous Rhinos", "Outrageous Ostriches", "Happy Hippos", "Daring Donkeys", "Giggling Giraffes", "Playful Pandas", "Sassy Salamanders", "Marvelous Meerkats", "Bubbly Buffaloes", "Adventurous Anteaters", "Dynamic Dolphins", "Sparkling Sparrows", "Clever Cranes", "Merry Monkeys", "Dizzy Ducks", "Radiant Rabbits", "Joyful Jaguars", "Cunning Coyotes", "Sizzling Snakes", "Vivacious Vultures", "Rowdy Raccoons", "Eccentric Elephants", "Peculiar Penguins", "Zesty Zeppelins", "Gleeful Gazelles", "Wondrous Whales", "Fierce Falcons", "Elegant Eagles", "Swift Seals", "Majestic Moose", "Proud Pumas"];
            let selectedLabels = [];
            while (selectedLabels.length < amount && possibleLabels.length > 0) {
                let randomIndex = Math.floor(Math.random() * possibleLabels.length);
                let randomLabel = possibleLabels[randomIndex];
                selectedLabels.push(randomLabel);
                possibleLabels.splice(randomIndex, 1);
            }
            return selectedLabels;
        }
    }

    function getElementById(id) {
        return document.getElementById(id);
    }

    function getElementsByClassName(className) {
        return document.getElementsByClassName(className);
    }




})();