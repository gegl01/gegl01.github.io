(function () {

    var url, iframeURL;
    var isSportsbookInIframeWithoutObgTools = false;
    class URLParam {
        constructor(key, value) {
            this.key = key;
            this.value = value;
        }
    }
    const ENABLE_OBGRT = new URLParam("exposeObgRt", "1");
    const ENABLE_OBGSTATE = new URLParam("exposeObgState", "1");

    if (!isItSportsbookPage()) {
        return;
    };

    // // ************** REMOTE ****************
    if (isSportsbookInIframeWithoutObgTools) {
        if (confirm("Sportsbook is in iframe so Sportsbook Tool does not work from here.\nDo you want to open the iframe itself?")) {
            url = new URL(iframeURL);
            reloadPageWithSearchParams([ENABLE_OBGSTATE, ENABLE_OBGRT]);
            return;
        } else {
            return;
        }
    }
    removeExistingSportsbookTool();
    var sportsbookTool = document.createElement("div");
    sportsbookTool.id = "sportsbookTool";
    createWindow();
    // // ************* /REMOTE ****************

    // ************** LOCAL ****************
    // var sportsbookTool = document.getElementById("sportsbookTool");
    // ************* /LOCAL ****************

    var accCollection = document.getElementsByClassName("accordion");
    var accHeadCollection = document.getElementsByClassName("accHeading");
    var eventId, lockedEventId;
    var participants, selectedParticipantId;
    var previousEventId, previousMarketId, previousSelectionLabel, previousAcca, previousPriceBoosts, previousFreeBets;
    var eventLabel, savedEventLabel;
    var mockedEventPhase;
    var marketId, lockedMarketId, marketLabel, marketTemplateId;
    var marketTemplateTagsToDisplay;
    var categoryId;
    var selectionId, lockedSelectionId, selectionLabel;
    var detectionResultText;
    var initialOdds, lockedInitialOdds;
    var accaName, accaId, priceBoostId, freeBetId;
    var segmentGuid, previousSegmentGuid, segmentName, segmentLegacyId;
    var intervalIdForPolling;
    var intervalIdsForPolling = [];
    var previousIframeURL;
    var brands;
    var routes;
    var betBuilderEvents, previousBetBuilderEvents = [];
    var labelRow;


    // const IS_UNSECURE_HTTP = isUnsecureHTTP();
    const SB_TOOL_VERSION = "v1.5.4";
    const IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED = isExposed("obgClientEnvironmentConfig");
    const DEVICE_TYPE = getDeviceType();
    const IS_TOUCH_BROWSER = isTouchBrowser();
    const DEVICE_EXPERIENCE = getDeviceExperience();
    const ENVIRONMENT = getEnvironment();
    const IS_SPORTSBOOK_IN_IFRAME = isSportsbookInIframe();
    const IS_B2B = isB2B();
    const BRAND_NAME = getBrandName();
    const CULTURE = getCulture();
    const BRANDWITHCULTURE = BRAND_NAME + " (" + CULTURE + ")";
    const BROWSER_VERSION = getBrowserVersion();
    const OBG_VERSION = getObgVersion();
    const NOT_FOUND = "Not found.";
    const IS_OBGRT_EXPOSED = isExposed("obgRt");
    const IS_OBGSTATE_EXPOSED = isExposed("obgState");
    // const IS_LOCALHOST_WITH_PROD = !(IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED && IS_OBGSTATE_EXPOSED);
    const POLLING_INTERVAL = 100;
    const IS_SGP_USED = isSGPUsed();
    const IS_BLE = isBLE();

    // cleanupSearchParams("configOverride");
    // example: configOverride=[(matSportsbookUi.eventContainer.enableEventSelectorDropdown,false,boolean)]
    // https://www.test.betsson.com/sv/odds?configOverride=[(sportsbookUi.sportsbookCarousel.autoplayInterval,1000000,number)]
    initHeader();
    initAccordions();
    initContext();
    // initDeviceTypeDependent();
    initTouchDependent();
    checkEnabledFeatures();

    function createWindow() {
        document.body.appendChild(sportsbookTool);
        var htmlContent =
            '<div id="sportsbookToolHeader"><div id="sportsbookToolHeaderTitle"><div id="sportsbookToolNameRow"><span id="sportsbookToolName"><span id="sportsbookToolNameLeft">sportsbook</span><span id="sportsbookToolNameRight">tool</span></span><span id="sportsbookToolVersion"></span></div><div id="sportsbookToolAuthorName">by gergely.glosz@betssongroup.com</div></div><div id="sportsbookToolHeaderButtonRow" class="floatRight"><button id="btZoomInOut" class="sportsbookToolHeaderButtons" onclick="zoomInOut()"><img id="iconZoomInOut" class="iconZoomOut iconHeader"></button><button id="btMinimizeClosed" class="sportsbookToolHeaderButtons" onclick="toggleClosedAccordionsVisibility()"><img id="iconMinimizeClosed" class="iconMinimize iconHeader"></button><button id="btClose" class="sportsbookToolHeaderButtons" onclick="closePopup()"><img class="iconClose iconHeader"></button></div></div><div id="sportsbookToolContent"><div id="sbToolsContext" class="accordion open"><button id="contextAccordion" class="accHeading" onclick="initContext()">Context<span id="limitedFunctionsMessage"></span></button><div class="accContent"><div id="obgStateAndRtSection" class="hide"><div id="obgStateAndRtRow" class="resolveLimitationRow">Enable obgState and obgRt<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("exposeObgStateAndRt")\'><span>Enable</span></button></div><hr class="hRule"></div><div id="openIframeSection" class="hide"><div id="openIframeRow" class="resolveLimitationRow">Open Sportsbook iframe<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("openIframe")\'>SB iframe</button></div><div class="twoItemsJustified"><div id="iframeUrlValue" class="displayInGreen sportsbookLink width100percent"></div><button class="btCopy btIcon" id="btIframeUrl" onclick=\'copyToClipboard("iframeURL")\'><img class="iconCopy"></button></div><hr class="hRule"></div><div class="contextLayout"><div class="displayFlex"><span class="keyForContext">Environment:</span><span class="valueForContext" id="environment"></span></div><div class="displayFlex"><span class="keyForContext">Device Type:</span><span class="valueForContext" id="deviceType"></span></div><div class="displayFlex"><span class="keyForContext">Brand:</span><span class="valueForContext twoItemsJustified"><span id="brandName"></span><span><button class="btCopy btIcon" onclick=\'copyToClipboard("brand")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForContext">Browser:</span><span class="valueForContext twoItemsJustified"><span id="browserVersion"></span><span><button class="btCopy btIcon" onclick=\'copyToClipboard("browserVersion")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForContext">App Version:</span><span class="valueForContext twoItemsJustified"><span id="obgVersion"></span><span><button class="btCopy btIcon" onclick=\'copyToClipboard("obgVersion")\'><img class="iconCopy"></button></span></span></div><button onclick=\'toggleSection("contextUtilities")\' class="moreLess">Extras</button><div id="contextUtilities" class="marginTop10px hide"><div class="twoItemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Jira QA Table</span><span class="displayInLightGrey">from the above data</span></div><button class="btCopy btIcon" id="btCreateJiraTable" onclick=\'copyToClipboard("jiraTemplate")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Deep Link</span><span class="displayInLightGrey">of the actual page & slip</span></div><button class="btCopy btIcon" id="btCreateDeepLink" onclick=\'copyToClipboard("deepLink")\'><img class="iconCopy"></button></div><div id="postMessageRow" class="twoItemsJustified hide"><div class="width95Percent"><span class="keyColumnForExtras">PostMessage</span><span class="displayInLightGrey">routeChangeIn in native</span></div><button class="btCopy btIcon" id="btCreatePostMessage" onclick=\'copyToClipboard("postMessage")\'><img class="iconCopy"></button></div><div id="disableCacheRow" class="twoItemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off Cache</span><span class="displayInLightGrey">with page reload</span></div><button class="btDisable btIcon" onclick=\'reloadPageWithFeature("disableCache")\'><img class="iconDisable"></button></div><div id="disableSSRRow" class="twoItemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off SSR</span><span class="displayInLightGrey">with page reload</span></div><button class="btDisable btIcon" onclick=\'reloadPageWithFeature("disableSSR")\'><img class="iconDisable"></button></div><div id="disableGeoFencingRow" class="twoItemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off GeoFencing</span><span class="displayInLightGrey">for Betsson ArBa login</span></div><button class="btDisable btIcon" onclick=\'reloadPageWithFeature("disableGeoFencing")\'><img class="iconDisable"></button></div></div></div></div></div><div id="sbToolsSegments" class="accordion closed"><button id="segmentsAccordion" class="accHeading" onclick="initSegments()"><span class="accordionTitle">Segment</span><span class="accordionHint">Get/Set SegmentGuid</span></button><div class="accContent"><div class="marginBottom10px"><div class="twoItemsJustified"><div class="width95Percent displayFlex"><span class="width17percent">Name:</span><span id="segmentNameSpan" class="width100percent displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentName")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><div class="width95Percent displayFlex"><span class="width17percent">Guid:</span><span id="segmentGuidSpan" class="width100percent displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentGuid")\'><img class="iconCopy"></button></div><hr class="hRule"><div><div class="width95Percent displayFlex"><span class="marginRight5px">Segment ID (used in ISA/Redis):</span><span id="segmentLegacyIdSpan" class="displayInGreen"></span></div></div></div><button onclick=\'toggleSection("segmentChangers")\' class="moreLess">Set Segment</button><div id="segmentChangers" class="hide"><div class="segmentChangeSectionHint">Partially useful features, no data refresh triggered on change</div><div>New Segment</div><select id="segmentSelector" onchange="setSegmentGuid(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div>Enter Segment Guid manually</div><div class="twoItemsJustified"><input id="fdSegmentGuid" class="fdSbTools width100percent height20px"><button class="btSimple btSubmit" onclick="changeSegmentGuid()">Set</button></div><div class="checkBoxRowToRight marginTop5px"><span>Open list of existing SegmentGuids</span><button class="btOpenInNewWindow btIcon chkInline" onclick=\'openInNewWindow("segmentGuidWiki")\'><img class="iconOpenInNewWindow"></button></div></div></div></div><div id="sbToolsEvent" class="accordion closed"><button id="eventAccordion" class="accHeading" onclick="initSbToolsEvent()"><span class="accordionTitle">Event</span><span class="accordionHint">Set Phase, Carousel/Cards, Override Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsEvent">Detected event:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsEventInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="eventLabelForSbToolsEvent"></div><div id="lockEventSectionForSbToolsEvent" class="lockSection hide">Lock <input type="checkbox" id="chkLockEventForSbToolsEvent" class="chkLock chkSbTools" onclick="lockEvent()"></div></div><div id="eventFeaturesSection" class="hide"><button onclick=\'toggleSection("eventDetailsSection")\' class="moreLess">Event Details</button><div id="eventDetailsSection" class="marginTopBottom10px hide"><div class="displayFlex"><span class="keyForEventDetails">Event ID:</span><span class="valueForEventDetails twoItemsJustified"><span id="eventIdForEventDetails" class="displayInGreen"></span><span><button class="btCopy btIcon" id="btCopyEventId" onclick=\'copyToClipboard("eventId")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Start Date:</span><span id="startDateForEventDetails" class="valueForEventDetails displayInGreen"></span></div><div class="displayFlex"><span class="keyForEventDetails">Category:</span><span class="valueForEventDetails twoItemsJustified displayInGreen"><span id="categoryForEventDetails"></span><span id="categoryIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Region:</span><span class="valueForEventDetails twoItemsJustified displayInGreen"><span id="regionForEventDetails"></span><span id="regionIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Competition:</span><span class="valueForEventDetails twoItemsJustified displayInGreen"><span id="competitionForEventDetails"></span><span id="competitionIdForEventDetails"></span></span></div><hr class="hRule"><div id="sbEventIdForOddsManagerSection" class="twoItemsJustified"><span class="width95Percent">Get Event ID for ISA/Redis, Odds Manager/LOM</span><button class="btIcon btOpenInNewWindow" onclick=\'getSbIdForOddsManager("event")\'><img class="iconOpenInNewWindow"></button></div><div class="twoItemsJustified"><div class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("event")\'><img class="iconOpenInNewWindow"></button></div></div><div><button onclick=\'toggleSection("renameEventSection")\' class="moreLess">Participants & Label</button><div id="renameEventSection" class="marginTopBottom10px hide"><div id="renameParticipantLabelSection"><div>Participant<span id="selectedParticipantIdSpan" class="displayInGreen marginLeft5px"></span><button class="btCopy btIcon" onclick=\'copyToClipboard("participantId")\'><img class="iconCopy"></button><span class="accordionHint">displayed for normal Matches</span></div><select id="participantSelector" onchange="selectParticipant(value)" class="comboSbTools width100percent height20px"></select><div class="twoItemsJustified marginTop5px"><span contenteditable="true" id="fdRenameParticipantLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setParticipantLabel()"><img class="width16px iconSubmit"></button></div></div><div class="marginTop10px">Label:<span class="accordionHint">displayed for Outrights, Boosts Page</span></div><div class="twoItemsJustified"><span contenteditable="true" id="fdRenameEventLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setEventLabel()"><img class="width16px iconSubmit"></button></div></div></div><div><button onclick=\'toggleSection("setEventPhaseSection")\' class="moreLess">Set Event Phase</button><div id="setEventPhaseSection" class="marginTopBottom10px hide"><div id="setEventPhaseButtonsLayout"><button id="btSetEventPhaseLive" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Live")\'><span class="ico-live-betting iconOnBtSimple"></span><span class="labelOnBtSimple">Live</span></button><button id="btSetEventPhasePrematch" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Prematch")\'><span class="ico-starting-soon iconOnBtSimple"></span><span class="labelOnBtSimple">Prematch</span></button><button id="btSetEventPhaseOver" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Over")\'><span class="ico-event-ended iconOnBtSimple"></span><span class="labelOnBtSimple">Over</span></button></div><div class="checkBoxRowToRight"><span>\'Over\' suspends all markets</span><input type="checkbox" class="chkInline" id="chkSuspendAllMarkets"></div></div></div><div><button onclick=\'toggleSection("addToCarouselSection")\' class="moreLess">Add to Carousel or Cards</button><div id="addToCarouselSection" class="hide marginTopBottom10px"><div id="carouselButtonsDiv"><div id="stopCarouselAutoplayRow" class="marginTopBottom10px"><div class="twoItemsJustified"><span class="width95Percent">Stop Carousel Autoplay</span><button class="btDisable btIcon" onclick=\'reloadPageWithFeature("stopCarouselAutoplay")\'><img class="iconDisable"></button></div></div><div class="twoItemsJustified"><span>Add event to Carousel or Cards</span><button class="btSimple btCarousel" id="btAddToCarousel" onclick="addToCarousel()"><span id="addToCarouselButtonLabel" class="labelOnBtSimple">Add</span></button></div><div class="marginTop5px"><span id="addToCarouselMessage"></span></div><div id="addToCarouselErrorMessage" class="displayInRed infoMessage hide">Could not get data for 3-column layout.<br>If the slide/card is 3-column layout, please remove the detected event from the betslip/event panel, then add again.</div></div></div></div><div><button onclick=\'toggleSection("eventPropertiesSection")\' class="moreLess">Override Event Properties</button><div id="eventPropertiesSection" class="marginTopBottom10px hide"><div class="marginBottom5px">Has effect on icons and event panel tabs</div><div id="hasBetBuilderLinkSection" class="iconMocksRow"><span class="width95Percent"><span id="betBuilderIcon" class="ico-bet-builder iconMockIconColumn vertMiddle"></span><span id="betBuilderLabel" class="iconMockLabelColumn">Bet Builder Link</span></span><input type="checkbox" onclick=\'toggleEventProperty("betBuilderLink")\' id="chkHasBetBuilderLink" class="chkSbTools"></div><div id="hasPriceBoostSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-price-boost iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Price Boost</span></span><input type="checkbox" onclick=\'toggleEventProperty("priceBoost")\' id="chkHasPriceBoost" class="chkSbTools"></div><div id="hasFastMarketsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-action-betting iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Fast Markets</span></span><input type="checkbox" onclick=\'toggleEventProperty("fastMarkets")\' id="chkHasFastMarkets" class="chkSbTools"></div><div id="hasLiveVisualSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-visual iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Visual</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveVisual")\' id="chkHasLiveVisual" class="chkSbTools"></div><div id="hasLiveStreamingSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-live-streaming iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Streaming</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStreaming")\' id="chkHasLiveStreaming" class="chkSbTools"></div><div id="hasPrematchStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-stats-prematch iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Prematch Statistics</span></span><input type="checkbox" onclick=\'toggleEventProperty("prematchStatistics")\' id="chkHasPrematchStatistics" class="chkSbTools"></div><div id="hasLiveStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-stats-prematch iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Statistics</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStatistics")\' id="chkHasLiveStatistics" class="chkSbTools"></div></div></div><div><button onclick=\'toggleSection("createMarketSection")\' class="moreLess">Create Fast/Player Props Market</button><div id="createMarketSection" class="hide marginTopBottom10px"><div id="createMarketErrorSection" class="displayInRed">Open an Event Panel.</div><div id="createMarketFeatures"><div id="createPlayerPropsSection" class="marginTopBottom10px">Player Props<div class="infoMessage">Football, Basketball, Baseball, Ice Hockey, American Football, Handball</div><div class="createMarketLayout"><button class="btSimple playerProps" id="btCreatePlayerPropsMarket" onclick=\'createMarket("playerProps")\'>4 selections</button><div class="buttonLabelToRight" id="playerPropsMessage"></div><button class="btSimple playerProps" id="btCreatePlayerPropsDummyMarket" onclick=\'createMarket("playerPropsDummy")\'>15 dummy selections</button></div></div><hr class="hRule"><div id="createFastMarketSection" class="marginTopBottom10px">Fast Market<div class="infoMessage">Football, Tennis, Table Tennis, Ice Hockey</div><div class="createMarketLayout"><button class="btSimple" id="btCreateFastMarket" onclick=\'createMarket("fast")\'><span class="ico-action-betting iconOnBtSimple"></span><span class="labelOnBtSimple">Create</span></button><div class="buttonLabelToRight" id="fastMarketMessage"></div></div></div></div></div></div><div><button onclick=\'toggleSection("footballScoreBoardSection")\' class="moreLess">Football Scoreboard</button><div id="footballScoreBoardSection" class="marginTopBottom10px hide"><div id="notFootballScoreBoardMessage" class="hide displayInRed">No Football Scoreboard found for this event.</div><div id="scoreBoardFeatures" class="hide"><div id="scoreBoardScores" class="scoreLayout"><div id="homeScoreLabel"><span class="ico-score vertMiddle marginRight2px"></span>Home Score</div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="homeScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("home")\'>Set</button><div id="awayScoreLabel"><span class="ico-score vertMiddle marginRight2px"></span>Away Score</div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="awayScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("away")\'>Set</button></div><div id="scoreBoardDetails"><div class="scoreBoardLayout"><div class="iconScoreboard ico-corner"></div><div class="iconScoreboard ico-substitutions"></div><div class="iconScoreboard outlinedText ico-referee-card obg-scoreboard-football-icon-yellow-card"></div><div class="iconScoreboard outlinedText ico-referee-card obg-scoreboard-football-icon-red-card"></div><div class="iconScoreboard ico-penalty"></div><input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeSubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homePenalties" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awaySubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayPenalties" min="0" oninput=\'validity.valid||(value="")\'></div><button id="submitScoreBoard" class="btSubmit btSimple" onclick="submitScoreBoard()">Set</button></div></div></div></div><div id="sbToolsEventInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Event detection order:<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol></div></div></div></div><div id="sbToolsMarket" class="accordion closed"><button id="marketAccordion" class="accHeading" onclick="initSbToolsMarket()"><span class="accordionTitle">Market</span><span class="accordionHint">Set Status, Override Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsMarket">Detected market:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsMarketInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="labelRowForSbToolsMarket"><div class="hide" id="messageForSbToolsMarket"></div><div id="labelsForDetectedMarketAndEvent"><div id="eventLabelForDetectedMarket"></div><div class="marginLeft5px fontBold" id="marketLabelForDetectedMarket"></div></div></div><div id="lockMarketSection" class="lockSection hide">Lock <input type="checkbox" id="chkLockMarket" class="chkLock chkSbTools" onclick="lockMarket()"></div></div><div id="marketFeatures" class="hide"><button onclick=\'toggleSection("marketDetailsSection")\' class="moreLess">Market Details</button><div id="marketDetailsSection" class="marginTopBottom10px hide"><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="marketIdForSbToolsMarket" class="labelRow displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketId")\'><img class="iconCopy"></button></div><hr class="hRule"><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="width48percent">Template ID:</span><span id="marketTemplateIdForSbToolsMarket" class="labelRow width100percent displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketTemplateId")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="width48percent noWrap">Template Tags:</span><span id="marketTemplateTagsForSbToolsMarket" class="labelRow width100percent displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketTemplateTags")\'><img class="iconCopy"></button></div><hr class="hRule"><div id="openMappingForTemplateTagSection" class="twoItemsJustified"><span class="width95Percent">Open Mapping for the Template Tags</span><button class="btIcon btOpenInNewWindow" onclick=\'openStaticPageInNewWindow("MarketTemplateTag.cs")\'><img class="iconOpenInNewWindow"></button></div><div id="sbMarketIdForOddsManagerSection" class="twoItemsJustified"><span id="sbIdForOddsManager" class="width95Percent">Get Market ID for ISA/Redis & Odds Manager</span><button class="btIcon btOpenInNewWindow" onclick=\'getSbIdForOddsManager("market")\'><img class="iconOpenInNewWindow"></button></div><div class="twoItemsJustified"><div class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("market")\'><img class="iconOpenInNewWindow"></button></div></div><button onclick=\'toggleSection("marketStatusSection")\' class="moreLess">Market Status</button><div id="marketStatusSection" class="hide"><div id="setMarketStateButtonsSection" class="setMarketStateLayout marginTopBottom10px"><button class="btSimple btSetMarketState" id="btSetMarketStateSuspended" onclick=\'setMarketState("Suspended")\'>Suspd.</button><button class="btSimple btSetMarketState" id="btSetMarketStateOpen" onclick=\'setMarketState("Open")\'>Open</button><button class="btSimple btSetMarketState" id="btSetMarketStateVoid" onclick=\'setMarketState("Void")\'>Void</button><button class="btSimple btSetMarketState" id="btSetMarketStateSettled" onclick=\'setMarketState("Settled")\'>Settled</button><button class="btSimple btSetMarketState" id="btSetMarketStateHold" onclick=\'setMarketState("Hold")\'>Hold</button></div></div><button onclick=\'toggleSection("marketPropertiesSection")\' class="moreLess">Override Market Properties</button><div id="marketPropertiesSection" class="marginTopBottom10px hide"><div id="isCashoutAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-cash-stack iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Cash Out</span></span><input type="checkbox" onclick=\'toggleMarketProperty("cashoutAvailable")\' id="chkIsCashoutAvailable" class="chkSbTools"></div></div></div><div id="sbToolsMarketInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Market detection: parent market of the last selection from betslip.</div></div></div><div id="sbToolsSelection" class="accordion closed"><button id="changeOddsAccordion" class="accHeading" onclick="initChangeOdds()"><span class="accordionTitle">Selection</span><span class="accordionHint">Change Odds</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsSelection">Detected selection:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsSelectionInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="labelForSbToolsSelection"><div class="hide" id="messageForSbToolsSelection"></div><div id="labelsForDetectedSelectionMarketAndEvent"><div id="eventLabelForDetectedSelection"></div><div id="marketLabelForDetectedSelection" class="marginLeft5px"></div><div class="marginLeft30px fontBold" id="selectionLabelForDetectedSelection"></div></div></div><div id="lockSelectionSection" class="hide lockSection">Lock <input type="checkbox" id="chkLockSelection" class="chkLock chkSbTools verticalAlignMiddle" onclick="lockSelection()"></div></div><div id="changeOddsFeatures" class="hide"><hr class="hRule"><div><div>Selection ID:</div><div class="twoItemsJustified"><span id="selectionIdForSbToolsSelection" class="labelRow displayInGreen width95Percent"></span><button class="btCopy btIcon" onclick=\'copyToClipboard("selectionId")\'><img class="iconCopy"></button></div></div><div class="newOddsLayout"><span>Initial Odds:</span><span id="initialOddsSpan" class="displayInGreen"></span><span></span><span>New Odds:</span><input class="fdSbTools" type="number" id="newOdds" min="1" step="0.01" oninput=\'validity.valid||(value="")\'><button class="btSimple btSubmit" onclick="changeOdds()">Set</button></div></div><div id="sbToolsSelectionInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol"> Selection detection: Last selection from betslip</div></div></div><div id="sbToolsBonuses" class="accordion closed"><button id="bonusesAccordion" class="accHeading" onclick="initBonuses()"><span class="accordionTitle">Bonuses</span><span class="accordionHint">ACCA Insurance, Price Boost, Free Bet</span></button><div class="accContent"><button onclick=\'toggleSection("accaSection")\' class="moreLess">ACCA Insurance</button><div id="accaSection" class="hide marginTopBottom10px"><div id="accaMessage" class="displayInRed"><div id="loginToSeeAcca">Login to see ACCA insurance.</div><div id="noAccaFound">No active ACCA insurance found.</div></div><div id="accaDetailsLayout" class="hide"><div class="twoItemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">Name:</span><span id="accaNameField" class="accaValueColumn displayInGreen"></span></div><button class="btCopy btIcon" id="btAccaName" onclick=\'copyToClipboard("accaName")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="accaIdField" class="accaValueColumn displayInGreen"></span></div><button class="btCopy btIcon" id="btCopyAccaId" onclick=\'copyToClipboard("accaId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px twoItemsJustified"><div class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("acca")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="accaCategoriesSection"><div id="accaCategoriesRow" class="displayFlex"><span class="marginRight5px">Categories:</span><span id="accaCategoriesSpan" class="displayInGreen"></span></div><div id="accaCompetitionsRow"><span class="marginRight5px">Competitions:</span><span id="accaCompetitionsSpan" class="displayInOrange"></span></div><div id="accaMarketTemplatesRow"><span class="marginRight5px">Market Templates:</span><span id="accaMarketTemplatesSpan" class="displayInOrange"></span></div><hr class="hRule"></div><div id="accaEventPhaseRow"><span class="marginRight5px">Event Phase:</span><span id="accaEventPhaseSpan" class="displayInGreen"></span></div><div><span class="marginRight5px">Min Number of Selections:</span><span id="accaMinimumNumberOfSelectionsSpan" class="displayInGreen"></span></div><div><span class="marginRight5px">Min Selection Odds:</span><span id="accaSelectionOddsLimitMinSpan" class="displayInGreen"></span></div><div id="accaTotalOddsLimitMinRow"><span class="marginRight5px">Min Total Odds:</span><span id="accaTotalOddsLimitMinSpan" class="displayInGreen"></span></div><hr class="hRule"><div id="accaMinMaxStakeRow"><span class="marginRight5px">Stake Range:</span><span id="accaMinMaxStakeSpan" class="displayInGreen"></span></div></div></div><button onclick=\'toggleSection("pbSection")\' class="moreLess">Price Boost</button><div id="pbSection" class="hide marginTopBottom10px"><div id="noPbFound" class="displayInRed">No Price Boost found</div><div id="pbDetailsLayout"><div class="twoItemsJustified"><div><span id="pbNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>PB listed</span></div><span><input type="radio" id="radioPbByName" name="pbSelecBy" class="radioSbTools vertMiddle" checked="checked" onclick=\'listPriceBoostsBy("pBname")\'><label for="radioPbByName" class="vertMiddle marginRight10px">by Name</label><input type="radio" id="radioPbByEvent" name="pbSelecBy" class="radioSbTools vertMiddle" onclick=\'listPriceBoostsBy("eventName")\'><label for="radioPbByEvent" class="vertMiddle">by Event Name</label></span></div><select id="pbSelector" onchange="selectPb(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="pbSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="pbName" class="displayInGreen"></span></div><div class="twoItemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="pbIdSpan" class="displayInGreen"></span></div><button class="btCopy btIcon" id="btCopyAccaId" onclick=\'copyToClipboard("priceBoostId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px twoItemsJustified"><div class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("priceBoost")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div>Path to the Competition:<div id="pbPathToCompetition" class="displayInGreen marginBottom10px"></div>Boosted Selection:<div class="displayInGreen"><div id="eventLabelForPbDiv"></div><div id="marketLabelForPbDiv" class="marginLeft5px"></div><div id="selectionLabelForPbDiv" class="marginLeft30px fontBold"></div></div></div><hr class="hRule"><div class="displayFlex"><span class="keyForPb">Visibility:</span><span id="pbVisibility" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Type:</span><span id="pbType" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Event Phases:</span><span id="pbEventPhases" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Odds Range:</span><span id="pbMinMaxOdds" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Stake Range:</span><span id="pbMinMaxStake" class="displayInGreen"></span></div></div></div></div><button onclick=\'toggleSection("freeBetSection")\' class="moreLess">Free or Risk Free Bet</button><div id="freeBetSection" class="hide marginTopBottom10px"><div id="freeBetNotFound" class="displayInRed">No Free Bet found</div><div id="freeBetLogin" class="displayInRed">Login to see your Free Bets.</div><div id="freeBetDetailsLayout"><div><span id="freeBetNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>Free or Risk Free Bets found</span></div><select id="freeBetSelector" onchange="selectFreeBet(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="freeBetSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="freeBetName" class="displayInGreen"></span></div><div class="twoItemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="freeBetIdSpan" class="displayInGreen"></span></div><button class="btCopy btIcon" id="btCopyAccaId" onclick=\'copyToClipboard("freeBetId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px twoItemsJustified"><div class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("freeBet")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="freeBetRestrictionsSection">Restriction path:<div id="freeBetPathToCompetition" class="displayInGreen marginBottom10px"></div><div id="freeBetFurtherRestricions" class="displayInOrange hide">Further restrictions are set on Event/Market level. See the details in Trading Tools.</div><hr class="hRule"></div><div class="displayFlex"><span class="keyForFreeBet">Type:</span><span id="freeBetType" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Stake:</span><span id="freeBetStake" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Bet Types:</span><span id="freeBetBetTypes" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Event Phases:</span><span id="freeBetEvetPhases" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Number of Selections:</span><span id="freeBetNoOfSelections" class="displayInGreen"></span></div></div></div></div></div></div></div><div id="sbToolsBanners" class="accordion closed"><button id="bannersAccordion" class="accHeading" onclick="initBanners()"><span class="accordionTitle">Banners</span><span class="accordionHint">Carousel & Sportsbook Banners</span></button><div class="accContent"><div id="bannersMessage" class="displayInRed hide">Current page is not Sportsbook Home</div><div id="bannersFeatures" class="hide"><div class="bannersRow"><span class="keyColumnForBanners">Carousel Banners</span><span><button id="btCrlBannersMinus" class="btPlusMinus btIcon" onclick="removeCarouselBanner()"><img class="iconMinus"></button></span><span id="noOfCrlBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addCarouselBanner()"><img class="iconPlus"></button></span><span class="floatRight">Overlay<input type="checkbox" id="chkCrlBannerOverlay" class="chkInline"></span></div><div class="bannersRow"><span class="keyColumnForBanners">Sportsbook Banners</span><span><button id="btSbBannersMinus" class="btPlusMinus btIcon" onclick="removeSportsbookBanner()"><img class="iconMinus"></button></span><span id="noOfSbBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addSportsbookBanner()"><img class="iconPlus"></button></span></div></div></div></div><div id="sbToolsNative" class="accordion closed"><button id="nativeAccordion" class="accHeading" onclick="initNativeApp()"><span class="accordionTitle">Native App</span><span class="accordionHint">Navigate by postMessages</span></button><div class="accContent"><div class="nativeDetectedEventLayout"><div><div>Detected event from the betslip:</div><div class="labelRow" id="eventLabelForNative"></div></div><button id="btNativeOpenEvent" class="btSimple btNativeToggleable" onclick="openEventOnNative()"><div class="ico-maximize-event iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">OPEN</div></button></div><hr class="hRule"><div id="nativeErrorMessage" class="displayInRed extraCondensed hide"><hr class="hRule"></div><div class="marginTopBottom10px nativeBottomBarButtons"><button id="btNativeBack" class="btSimple" onclick=\'nativeClick("back")\'><div class="ico-arrow-back iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Back</div></button><button id="btNativeHome" class="btSimple btNativeToggleable" onclick=\'nativeClick("home")\'><div class="ico-home-bottom-bar iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Home</div></button><button id="btNativeAz" class="btSimple btNativeToggleable" onclick=\'nativeClick("az")\'><div class="ico-all-sports-search iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">A-Z</div></button><button id="btNativeLive" class="btSimple btNativeToggleable" onclick=\'nativeClick("live")\'><div class="ico-live-bottom-bar iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Live</div></button><button id="btNativeMyBets" class="btSimple loggedInOnly btNativeToggleable" onclick=\'nativeClick("myBets")\'><div class="ico-my-bets iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">My Bets</div></button><button id="btNativeBetslip" class="btSimple btWithBadge" onclick=\'nativeClick("betSlip")\'><div class="ico-betslip-bottom iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Betslip</div><div id="badgeNativeBetslip" class="badgeNative badgeNativeBetslip hide"></div><div id="badgeNativeBbBetslip" class="badgeNative badgeNativeBbBetslip hide"></div></button></div><div id="nativeOtherSection" class="marginTopBottom10px nativeOtherButtons"><button id="btNativeBetBuilder" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("betBuilder")\'><div id="iconBtNativeBetBuilder" class="ico-bet-builder iconNativeOtherButton"></div><div id="labelBtNativeBetBuilder" class="labelNativeOtherButton">Bet Builder</div></button><button id="btNativeBoost" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("boost")\'><div class="ico-price-boost iconNativeOtherButton"></div><div class="labelNativeOtherButton">Boost</div></button><button id="btNativeLiveSC" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("lsc")\'><div class="ico-live-streaming iconNativeOtherButton"></div><div class="labelNativeOtherButton">LS Calendar</div></button><button id="btNativeStartingSoon" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("startingSoon")\'><div class="ico-starting-soon iconNativeOtherButton"></div><div class="labelNativeOtherButton">Start Soon</div></button><button id="btNativeSettings" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("settings")\'><div class="ico-settings iconNativeOtherButton"></div><div class="labelNativeOtherButton">Settings</div></button></div><div id="nativeQuickLinksSection" class="hide"><div class="displayFlex"><span class="width25percent">Quick Links</span><select id="quickLinkSelector" onchange="selectQuickLink(value)" class="comboSbTools height20px marginBottom10px width75percent"></select></div></div><div id="nativeAzSection" class="hide marginTopBottom10px"><div class="displayFlex"><span class="width25percent">Category</span><select id="categorySelector" onchange="selectCategory(value)" class="comboSbTools height20px marginBottom10px width75percent"></select></div><div class="displayFlex"><span class="width25percent">Region</span><select id="regionSelector" onchange="selectRegion(value)" class="comboSbTools height20px marginBottom10px width75percent inactivated"></select></div><div class="displayFlex"><span class="width25percent">Competition</span><select id="competitionSelector" onchange="selectCompetition(value)" class="comboSbTools height20px width75percent inactivated"></select></div></div><div id="nativeBetBuilderSection" class="marginTopBottom10px hide"><div class="displayFlex"><span id="nativeBetBuilderEventLabel" class="width23percent">BB Event</span><select id="nativeBetBuilderEventSelector" onchange="selectBetuilderEvent(value)" class="comboSbTools height20px marginBottom10px width80percent"></select></div><div id="nativeBetBuilderEventsError" class="displayInRed hide">Open a Bet Builder accordion on the page.</div></div></div></div><div id="sbToolsStreamMappingHelper" class="accordion closed"><button id="streamMappingHelperAccordion" class="accHeading" onclick="initStreamMappingHelper()">IDs for stream mapping (probably YAGNI)</button><div class="accContent">Get LIVE Provider Event IDs for mapping:<div class="streamIdsLayout"><button id="getTwitchProviderIds" class="btSimple" onclick="getTwitchProviderIds()">Twitch</button><button id="getPerformProviderIds" class="btSimple" onclick="getPerformProviderIds()">Perform</button><div id="twitchResults" class="extraCondensed"></div><div id="performResults" class="extraCondensed"></div></div></div></div><style>.twoItemsJustified{display:flex;justify-content:space-between}.checkBoxRowToRight{display:flex;align-items:center;justify-content:flex-end}#performResults,#twitchResults{margin-left:5px;margin-top:5px}.accordionHint{float:right;font-size:x-small;color:gray}.width100percent{width:100%}.width48percent{width:48%}.width75percent{width:75%}.width17percent{width:17%}.width80percent{width:80%}.width23percent{width:23%}.width92percent{width:92%}.iconScoreboard{font-size:initial;margin-bottom:2px}.vertMiddle{vertical-align:middle}.outlinedText{-webkit-text-stroke:1px #444}.keyColumnForBanners{width:130px;display:inline-block}.keyForPb{width:30%}.keyForFreeBet{width:45%}.bannersRow{line-height:25px}.noOfBanners{width:20px;display:inline-block;text-align:center}.btSimple{border:1px solid #444;border-radius:3px;box-shadow:0 1px #666;margin:2px;cursor:pointer;line-height:1em;font-size:inherit;padding:2px;color:#444}@media (hover:hover){.btSimple:hover{background-color:#fff}}.btSimple:active{box-shadow:0 0 #666;background-color:#fff;transform:translateY(1px)}.keyForContext{width:27%}.keyForEventDetails,.width25percent{width:25%}.valueForContext{width:73%;color:#008d90}.valueForEventDetails{width:75%}.truncatable{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.marginTop5px{margin-top:5px}.marginBottom5px{margin-bottom:5px}.marginBottom10px{margin-bottom:10px}.marginTopBottom10px{margin-top:10px;margin-bottom:10px}.marginTopBottom5px{margin-top:5px;margin-bottom:5px}.marginTop10px{margin-top:10px}.marginRight2px{margin-right:2px}.marginRight5px{margin-right:5px}.marginRight10px{margin-right:10px}.marginLeft5px{margin-left:5px}.marginLeft15px{margin-left:15px}.marginLeft30px{margin-left:30px}.height20px{height:20px}.chkInline{vertical-align:middle;margin-left:5px}.labelRow{word-break:break-word}.noWrap{white-space:nowrap}.lockSection{display:flex;justify-content:flex-end;align-self:center}.infoList{margin:3px;padding-inline-start:25px}.detectedEntitySection{display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto;margin-bottom:10px}.streamIdsLayout{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.align-right{text-align:right}.buttonLabelToRight{margin-left:8px}.scoreLayout{margin-bottom:10px;display:grid;grid-template-columns:33% 45px auto;grid-template-rows:1fr 1fr;align-items:center}#scoreBoardDetails{border:1px solid #ccc;margin-bottom:15px}.segmentChangeSectionHint{font-size:x-small;color:#a00000;font-weight:700;margin-bottom:5px;margin-top:5px;font-stretch:extra-condensed}.scoreBoardLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;grid-template-rows:auto auto auto;padding:10px;justify-items:center}.iconMocksRow{line-height:22px;display:flex;justify-content:space-between}.iconOnBtSimple{margin-right:3px;vertical-align:middle}.labelOnBtSimple{vertical-align:middle}.iconMockIconColumn{display:inline-block;text-align:center;width:25px}.iconNativeBottomBarButton{font-size:large}.iconNativeOtherButton{color:#444}.labelNativeOtherButton{margin-top:1px;font-size:x-small;font-stretch:condensed}.labelNativeBottomBarButton{font-stretch:condensed}#btNativeOpenEvent{height:38px}.iconMockLabelColumn{display:inline-block}.monoSpaceFont{font-family:monospace}.resolveLimitationRow{display:grid;grid-template-columns:auto 75px;margin-bottom:8px}.width48percent{width:48%}.keyColumnForExtras{width:120px;display:inline-block}#setEventPhaseButtonsLayout{display:grid;grid-template-columns:1fr 1fr 1fr;margin-bottom:5px}.setMarketStateLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr}.nativeBottomBarButtons{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr}.nativeOtherButtons{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr}.badgeNative{position:absolute;left:-4px;top:-4px;min-height:16px;min-width:16px;line-height:16px;border-radius:8px;padding:0 3px;text-align:center;font-size:10px;color:#fff}.badgeNativeBetslip{background-color:#cc8936}.badgeNativeBbBetslip{background-color:#327bff}.nativeDetectedEventLayout{display:grid;grid-template-columns:5fr 1fr}.createMarketLayout{display:grid;grid-template-columns:55% auto;align-items:center}.newOddsLayout{margin-top:10px;align-items:center;display:grid;grid-template-rows:auto auto;grid-template-columns:25% 20% auto}.btSubmit{margin-left:5px;width:45px}.vertical{writing-mode:tb-rl;transform:rotate(-180deg);margin-bottom:5px}#submitScoreBoard{margin-left:10px;margin-bottom:10px}.fdSbTools{border:1px solid #444;padding-left:3px;color:#0000a0}.comboSbTools{border:1px solid #444;font-size:inherit;color:#444}.fdScoreBoardNumeric{width:45px;margin-bottom:1px}#sportsbookTool{background-color:#fff;color:#444;font-family:Arial;width:310px;height:auto;position:absolute;border:2px solid #d3d3d3;top:0;left:0;z-index:5000;box-shadow:0 0 35px 10px #000;font-size:12px;overflow:auto}#sportsbookToolNameLeft{font-weight:900;margin-right:2px;letter-spacing:-1px;color:#00b9bd}#sportsbookToolNameRight{color:#f9a133}.sbManagerSb{color:#00b9bd;font-weight:900;margin-left:4px;margin-right:2px}.sbManagerManager{color:#cc8936;margin-right:4px}#sportsbookToolHeader{padding:3px;padding-bottom:5px;cursor:move;z-index:5000;background:#1c3448;color:#ddd}#sportsbookToolHeaderTitle{display:inline-block;padding-top:3px;padding-left:4px}#sportsbookToolName{font-size:18px;margin-right:5px}#sportsbookToolAuthorName{font-size:8px;line-height:30%;font-weight:400}.extraCondensed{font-stretch:extra-condensed}.sportsbookToolHeaderButtons{color:#fff;width:25px;height:20px;margin:1px;padding:2px;border-color:#666}#btMinimizeAll,#btZoomInOut{background:#646464}@media (hover:hover){#btMinimizeAll:hover,#btZoomInOut:hover{background:#1e1e1e}}#btMinimizeAll:active,#btZoomInOut:active{background:#1e1e1e}#btMinimizeClosed{background-color:#00b9bd}@media (hover:hover){#btMinimizeClosed:hover{background:#008d90}}#btMinimizeClosed:active{background:#008d90}.btWithBadge{position:relative}#btClose{background:#c86464}@media (hover:hover){#btClose:hover{background:#a00000}}#btClose:active{background:#a00000}.infoMessage{opacity:.5;font-size:x-small}.displayInRed{color:#a00000}.displayInGreen{color:#008d90}.displayInLightGrey{color:#ccc}.displayInOrange{color:#cc8936}.hide{display:none}.show{display:block}.accHeading{border-radius:none;background-color:#eee;color:#444;cursor:pointer;padding:8px;width:100%;text-align:left;border:none;outline:0;transition:.4s}@media (hover:hover){.accHeading:hover,.btNativeOthers:hover,.moreLess:hover{background-color:#ccc}}.accHeading:active,.btNativeOthers:active,.moreLess:active{background-color:#ccc}.open .accHeading{background-color:#ccc}.accContent{margin:10px;background-color:#fff;overflow:hidden}.closed .accContent{display:none}.open .accContent{display:block}.hRule{border-top:1px solid #eee}.scaledTo70percent{transform:scale(.7);transform-origin:0 0}.floatRight{float:right}.carouselList{padding-left:15px}.visibilityHidden{visibility:hidden}.displayInGreenGlow{text-shadow:0 0 7px #fff,0 0 10px #fff,0 0 21px #fff,0 0 42px #008d90,0 0 82px #008d90,0 0 92px #008d90,0 0 102px #008d90,0 0 151px #008d90}#limitedFunctionsMessage{color:#a00000;font-weight:700;float:right;font-stretch:extra-condensed}.fontBold{font-weight:700}.chkLock{margin-left:5px;align-self:center}.chkSbTools{cursor:pointer;align-self:center;accent-color:#008d90}.radioSbTools{margin-right:3px;cursor:pointer;accent-color:#008d90}.btCopy{width:18px;height:20px}.btDisable{width:14px;margin-right:2px}.btIcon{opacity:60%;border:none;background:0 0;cursor:pointer;vertical-align:middle;padding:0}@media (hover:hover){.btIcon:hover{opacity:100%}}.btIcon:active{opacity:20%}.btOpenInNewWindow{width:15px}.iconHeader{width:12px}.segmentKeyColumn{width:35px;display:inline-block}.width16px{width:16px}.iconSubmit{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z M219.429,367.932L108.606,257.108l38.789-38.789l72.033,72.035L355.463,154.32l38.789,38.789L219.429,367.932z"/></svg>\')}.iconCopy{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path fill="black" d="M337.8,56H119.6c-20.1,0-36.4,16.3-36.4,36.4v254.5h36.4V92.4h218.2V56z M392.4,128.7h-200c-20.1,0-36.4,16.3-36.4,36.4v254.5c0,20.1,16.3,36.4,36.4,36.4h200c20.1,0,36.4-16.3,36.4-36.4V165.1C428.7,145,412.5,128.7,392.4,128.7z M392.4,419.6h-200V165.1h200V419.6z"/></svg>\')}.iconClose{content:url(\'data:image/svg+xml;utf8,<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M954.304 190.336a15.552 15.552 0 0 1 0 21.952l-300.032 300.032 298.56 298.56a15.616 15.616 0 0 1 0 22.016l-120.96 120.896a15.552 15.552 0 0 1-21.952 0L511.36 655.232 214.272 952.32a15.552 15.552 0 0 1-21.952 0l-120.896-120.896a15.488 15.488 0 0 1 0-21.952l297.152-297.152L69.888 213.76a15.552 15.552 0 0 1 0-21.952l120.896-120.896a15.552 15.552 0 0 1 21.952 0L511.36 369.472l300.096-300.032a15.36 15.36 0 0 1 21.952 0l120.896 120.896z"/></svg>\')}.iconMaximize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <path fill="white" d="M1,9h14V7H1V9z M1,14h14v-2H1V14z M1,2v2h14V2H1z"/></svg>\')}.iconMinimize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <polygon fill="white" points="15,7 1,7 1,9 15,9"/></svg>\')}.iconZoomOut{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-1.5 2v1h3v-1h-3z"/></svg>\')}.iconZoomIn{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-.5 1v1h-1v1h1v1h1v-1h1v-1h-1v-1h-1z"/></svg>\')}.iconOpenInNewWindow{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 194.818 194.818" style="enable-background:new 0 0 194.818 194.818;" xml:space="preserve"><g><path d="M185.818,2.161h-57.04c-4.971,0-9,4.029-9,9s4.029,9,9,9h35.312l-86.3,86.3c-3.515,3.515-3.515,9.213,0,12.728c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636l86.3-86.3v35.313c0,4.971,4.029,9,9,9s9-4.029,9-9v-57.04C194.818,6.19,190.789,2.161,185.818,2.161z"/><path d="M149,77.201c-4.971,0-9,4.029-9,9v88.456H18v-122h93.778c4.971,0,9-4.029,9-9s-4.029-9-9-9H9c-4.971,0-9,4.029-9,9v140c0,4.971,4.029,9,9,9h140c4.971,0,9-4.029,9-9V86.201C158,81.23,153.971,77.201,149,77.201z"/></g></svg>\')}.iconDisable{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 492.883 492.883" style="enable-background:new 0 0 492.883 492.883;" xml:space="preserve"><g><path d="M122.941,374.241c-20.1-18.1-34.6-39.8-44.1-63.1c-25.2-61.8-13.4-135.3,35.8-186l45.4,45.4c2.5,2.5,7,0.7,7.6-3l24.8-162.3c0.4-2.7-1.9-5-4.6-4.6l-162.4,24.8c-3.7,0.6-5.5,5.1-3,7.6l45.5,45.5c-75.1,76.8-87.9,192-38.6,282c14.8,27.1,35.3,51.9,61.4,72.7c44.4,35.3,99,52.2,153.2,51.1l10.2-66.7C207.441,421.641,159.441,407.241,122.941,374.241z"/><path d="M424.941,414.341c75.1-76.8,87.9-192,38.6-282c-14.8-27.1-35.3-51.9-61.4-72.7c-44.4-35.3-99-52.2-153.2-51.1l-10.2,66.7c46.6-4,94.7,10.4,131.2,43.4c20.1,18.1,34.6,39.8,44.1,63.1c25.2,61.8,13.4,135.3-35.8,186l-45.4-45.4c-2.5-2.5-7-0.7-7.6,3l-24.8,162.3c-0.4,2.7,1.9,5,4.6,4.6l162.4-24.8c3.7-0.6,5.4-5.1,3-7.6L424.941,414.341z"/></g></svg>\')}.btPlusMinus{width:16px}.iconPlus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941h-59.882V57.059c0-4.971-4.029-9-9-9s-9,4.029-9,9v59.882H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h59.882v59.882c0,4.971,4.029,9,9,9s9-4.029,9-9v-59.882h59.882c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconMinus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h137.764c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconInfoCircle,.iconInfoSymbol{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 202.978 202.978" style="enable-background:new 0 0 202.978 202.978" xml:space="preserve"><g><path fill="black" d="M100.942,0.001C44.9,0.304-0.297,45.98,0.006,102.031c0.293,56.051,45.998,101.238,102.02,100.945c56.081-0.303,101.248-45.978,100.945-102.02C202.659,44.886,157.013-0.292,100.942,0.001z M101.948,186.436c-46.916,0.234-85.108-37.576-85.372-84.492c-0.244-46.907,37.537-85.157,84.453-85.411c46.926-0.254,85.167,37.596,85.421,84.483C186.695,147.951,148.855,186.182,101.948,186.436z M116.984,145.899l-0.42-75.865l-39.149,0.254l0.078,16.6l10.63-0.059l0.313,59.237l-11.275,0.039l0.088,15.857l49.134-0.264l-0.098-15.847L116.984,145.899z M102.065,58.837c9.575-0.039,15.349-6.448,15.3-14.323c-0.254-8.07-5.882-14.225-15.095-14.186c-9.184,0.059-15.173,6.292-15.134,14.362C87.185,52.555,93.028,58.906,102.065,58.837z"/></g></svg>\')}.btInfo{width:16px;justify-self:end}.iconInfoSymbol{opacity:60%;width:12px;margin-right:5px}.btCarousel{width:32%;margin-bottom:5px;margin-right:5px}.btGreen{background-color:#008d90;color:#fff}@media (hover:hover){.btGreen:hover{background-color:#00b9bd}}.btGreen:active{background-color:#00b9bd}.mobileUi{line-height:20px}.moreLess{width:100%;border:none;cursor:pointer;padding:4px;margin-top:2px;margin-bottom:2px;color:#444}.btNativeOthers{border:none;cursor:pointer;padding:6px 2px 6px 2px;margin:2px}.width95Percent{width:95%}.displayFlex{display:flex}.inactivated{pointer-events:none;opacity:40%}</style>';

        sportsbookTool.innerHTML = htmlContent;
    }

    function isUnsecureHTTP() {
        if (location.protocol === "http:") {
            return true
        } else {
            return false
        };
    }

    function isItSportsbookPage() {
        try {
            obgNavigationSupported;
        } catch {
            try {
                obgClientEnvironmentConfig;
            } catch {
                try {
                    obgGlobalAppContext;
                } catch {
                    if (isSportsbookInIframe()) {
                        isSportsbookInIframeWithoutObgTools = true;
                    } else {
                        alert("You are not on a Sportsbook page.\nIf you think you are, please contact: gergely.glosz@betssongroup.com")
                        return false;
                    }
                }
            }
        }
        return true;
    }


    function removeExistingSportsbookTool() {
        var sbt = document.getElementById("sportsbookTool");
        if (sbt !== null) {
            sbt.remove();
        }
    }

    // function cleanupSearchParams(...params) {
    //     var url = new URL(window.location.href);
    //     for (var paramName of params) {
    //         url.searchParams.delete(paramName);
    //     }
    //     window.history.replaceState({}, document.title, window.location.pathname + url.search);
    // }


    function checkEnabledFeatures() {
        var sportsbookToolScript = document.getElementById("sportsbookToolScript");
        if (sportsbookToolScript == undefined) {
            return;
        }
        var sportsbookToolFeatures = sportsbookToolScript.getAttribute("data-features");
        if (sportsbookToolFeatures === null) {
            removeFeature(
                "StreamMappingHelper"
            );
        }
    }

    function isB2B() {
        try {
            return obgClientEnvironmentConfig.startupContext.contextId !== undefined;
        } catch {
            try {
                return obgState.b2b !== undefined;
            } catch { return false; }
        }
    }

    function isExposed(command) {
        try {
            switch (command) {
                case "obgState":
                    obgState;
                    break;
                case "obgRt":
                    obgRt;
                    break;
                case "obgClientEnvironmentConfig":
                    obgClientEnvironmentConfig;
                    break;
            }
        } catch { return false; }
        return true;
    }

    function isSportsbookInIframe() {
        getIframeURL();
        if (iframeURL == undefined) {
            return false
        } else { return true; }
    }

    function getIframeURL() {
        iframeURL == undefined;
        var iframes = document.body.getElementsByTagName("iframe");
        for (var iframe of iframes) {
            if (iframe.src.includes("playground") && iframe.src.includes("/stc-")) {
                iframeURL = iframe.src;
            }
        }
    }

    function isTouchBrowser() {
        return "ontouchstart" in document.documentElement;
    }

    function getObgVersion() {
        var obgVersion;
        try {
            obgVersion = obgClientEnvironmentConfig.startupContext.appContext.version;
        } catch {
            try {
                obgVersion = obgState.appContext.version;
            } catch {
                return "Data not available"
            }
        }
        return "OBGA-" + obgVersion;
    }

    function getDeviceType() {
        var deviceType;
        try {
            deviceType = obgClientEnvironmentConfig.startupContext.device.deviceType;
        } catch {
            try {
                deviceType = obgState.appContext.device.deviceType;
            } catch {
                deviceType = obgGlobalAppContext.deviceType;
            }
        }
        return deviceType;
    }

    function getDeviceExperience() {
        var deviceExperience = null;
        try {
            deviceExperience = obgClientEnvironmentConfig.startupContext.device.deviceExperience;
        } catch {
            deviceExperience = obgState.appContext.device.deviceExperience
        }
        return deviceExperience;
    }

    function getEnvironment() {
        try {
            return obgClientEnvironmentConfig.startupContext.appContext.environment.toUpperCase();
        } catch {
            try {
                return obgGlobalAppContext.environment.toUpperCase() + " (Local)";
            } catch {
                return obgState.appContext.environment.toUpperCase() + " (Local)";
            }
        }
    }

    function getCurrentRouteName() {
        return obgState.route.current.name;
    }

    function isSGPUsed() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            let marketsUsingSingleGameParlay = obgClientEnvironmentConfig.startupContext.config.sportsbookUi.betBuilder.marketsUsingSingleGameParlay;
            let languageCode = obgClientEnvironmentConfig.startupContext.config.core.market.languageCode;
            for (let market of marketsUsingSingleGameParlay) {
                if (market == languageCode) {
                    return true;
                }
            } return false;
        } else {
            if (BRAND_NAME == "Betsafe" && CULTURE == "en-CA") {
                return false;
            }
            if (CULTURE == "en-CA" || CULTURE == "en-US") {
                return true;
            }
        }
    }

    function getCulture() {
        try {
            return obgState.appContext.device.culture;
        } catch {
            return obgClientEnvironmentConfig.startupContext.appContext.device.culture;
        }
    }


    function isBonusSystemUs() {
        return (BRAND_NAME == "Firestorm US" || BRAND_NAME == "Betsafe Colorado");
    }

    function getBrandName() {
        let brandName;
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            brandName = obgClientEnvironmentConfig.startupContext.brandName;
        } else {
            brandName = "localhost";
        }

        let brandNames;
        if (IS_B2B || IS_SPORTSBOOK_IN_IFRAME) {
            brandNames = {
                betsson: "Betsson B2B",
                nordicbet: "Nordicbet",
                firestorm: "Firestorm",
                firestormus: "Firestorm US",
                guts: "Guts",
                ibet: "Ibet",
                jetbahis: "Jetbahis",
                rexbet: "Rexbet",
                rizk: "Rizk",
                betsafeco: "Betsafe Colorado",
                betsafeon: "Betsafe Ontario",
                hovarda: "Hovarda",
                betssonmx: "Betsson MX",
                localhost: "Localhost",
                betssoncz: "Betsson CZ"
            }
        } else {
            brandNames = {
                localhost: "Localhost",
                betsafe: "Betsafe",
                betsafelatvia: "Betsafe LV",
                betsafeestonia: "Betsafe EE",
                betsson: "Betsson",
                betssoncz: "Betsson CZ",
                betssonarba: "Betsson AR BA-Province",
                betssonarbacity: "Betsson AR BA-City",
                betssongr: "Betsson GR",
                betssones: "Betsson ES",
                nordicbetdk: "Nordicbet DK",
                bets10: "Bets10",
                mobilbahis: "Mobilbahis",
                b10: "B10",
                krooncasino: "Kroon Casino",
                oranjecasino: "Oranje Casino",
                betssonnl: "Betsson NL"
            }
        }
        let brandNameToReturn = brandNames[brandName];
        if (brandNameToReturn == undefined) {
            return brandName;
        }
        return brandNames[brandName];
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
        var btMinimizeClosed = document.getElementById("btMinimizeClosed");
        if (!IS_OBGSTATE_EXPOSED) {
            hide(btMinimizeClosed);
        }
        document.getElementById("sportsbookToolVersion").innerText = SB_TOOL_VERSION;
    }

    function removeFeature(...features) {
        for (var feature of features) {
            try {
                document.getElementById("sbTools" + feature).remove();
            } catch { }
        }
    }

    function initAccordions() {
        for (var accHead of accHeadCollection) {
            accHead.addEventListener("click", toggleAccordion, false);
        }

        if (IS_SPORTSBOOK_IN_IFRAME) {
            limitFeatures("iframe");
        } else if (!IS_OBGSTATE_EXPOSED) {
            limitFeatures("obgState");
        } else if (!IS_OBGRT_EXPOSED) {
            limitFeatures("obgRt");
        }

        if (DEVICE_EXPERIENCE != "Native") {
            removeFeature("Native");
        }

        var limitedFunctionsMessageText;

        function limitFeatures(limitationCause) {
            switch (limitationCause) {
                case "obgState":
                    limitedFunctionsMessageText = "obgState is not available";
                    removeObgStateFeatures()
                    break;
                case "iframe":
                    limitedFunctionsMessageText = "Sportsbook is in iframe";
                    removeObgStateFeatures()
                    break;
                case "obgRt":
                    limitedFunctionsMessageText = "obgRt is not available";
                    removeObgRtFeatures()
                    break;
            }

            function removeObgStateFeatures() {
                removeFeature(
                    "Event",
                    "Market",
                    "CreateMarket",
                    "Selection",
                    "Bonuses",
                    "Banners",
                    "Segments",
                    "Native"
                );
            }

            function removeObgRtFeatures() {
                removeFeature(
                    "Event",
                    "Market",
                    "CreateMarket",
                    "Selection",
                    "Banners"
                );
            }

            var limitedFunctionsMessage = document.getElementById("limitedFunctionsMessage");

            limitedFunctionsMessage.innerText = "Features limited as " + limitedFunctionsMessageText;
        }

        if (IS_B2B || ENVIRONMENT === "TEST (Local)") {
            var noB2Belements = document.getElementsByClassName("noB2B");
            for (elem of noB2Belements) {
                elem.classList.add("visibilityHidden");
            }
        }

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

    window.initContext = () => {
        initContext();
    }

    function initContext() {
        stopPolling();
        var obgStateAndRtSection = document.getElementById("obgStateAndRtSection");
        var openIframeSection = document.getElementById("openIframeSection");
        var iframeUrlValue = document.getElementById("iframeUrlValue");
        var postMessageRow = document.getElementById("postMessageRow");

        if (IS_B2B) {
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
        } else if (!IS_OBGSTATE_EXPOSED || !IS_OBGRT_EXPOSED) {
            show(obgStateAndRtSection);
            hide(openIframeSection);
        } else {
            hide(openIframeSection);
        }

        var deviceType = document.getElementById("deviceType");
        if (DEVICE_TYPE === "Desktop" || DEVICE_EXPERIENCE === null) {
            deviceType.innerText = DEVICE_TYPE;
        } else {
            deviceType.innerText = DEVICE_TYPE + " " + DEVICE_EXPERIENCE;
        }
        document.getElementById("environment").innerText = ENVIRONMENT;
        document.getElementById("brandName").innerText = BRANDWITHCULTURE;
        document.getElementById("browserVersion").innerText = BROWSER_VERSION;
        document.getElementById("obgVersion").innerText = OBG_VERSION;

        function listenerForIframeURL() {
            getIframeURL();
            if (iframeURL == previousIframeURL) {
                return;
            } else {
                iframeUrlValue.setAttribute("href", iframeURL);
                iframeUrlValue.innerText = iframeURL;
                previousIframeURL = iframeURL;
            }
        }
    }

    window.toggleInfo = (infoDiv) => {
        var info = document.getElementById(infoDiv);
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
        var params = [];
        var messageRow;
        switch (feature) {
            case "disableCache":
                params.push(new URLParam("forceNonCacheQueryString", generateGuid()));
                messageRow = "disableCacheRow";
                break;
            case "disableSSR":
                params.push(new URLParam("ssr", 0));
                messageRow = "disableSSRRow";
                break;
            case "exposeObgStateAndRt":
                params.push(ENABLE_OBGSTATE, ENABLE_OBGRT);
                messageRow = "obgStateAndRtRow";
                break;
            case "openIframe":
                url = new URL(iframeURL + window.location.search);
                params.push(ENABLE_OBGSTATE, ENABLE_OBGRT);
                messageRow = "openIframeRow";
                break;
            case "disableGeoFencing":
                // https://edgebravo.corpsson.com/pages/viewpage.action?spaceKey=ACOBA&title=HTML5+geofencing%2C+geofencing+bypass
                let paramValue;
                IS_BLE ? paramValue = "b1ccAR1gW0f8" : paramValue = "gfo";
                params.push(new URLParam("experiments", paramValue));
                messageRow = "disableGeoFencingRow";
                break;
            case "stopCarouselAutoplay":
                // params.push(new URLParam("configOverride", "[(sportsbookUi.sportsbookCarousel.autoplayInterval,1000000,number)]"));
                params.push(new URLParam("configOverride", "[(sportsbookUi.sportsbookCarousel.autoplayInterval=1000000)]"));
                messageRow = "stopCarouselAutoplayRow";
                break;
            // case "disableCustomerInteractionsRT":
            //     params.push(new URLParam("configOverride", "[($jurisdictions." + getJurisdiction().toLowerCase() + ".common.realTimeNotifications.customerInteractionsRT.timeTrigger.isEnabled,false,boolean)]"));
            //     messageRow = "disableCustomerInteractionsRTRow";
            //     break;
        }
        var row = document.getElementById(messageRow);
        displayInGreen(row);
        row.innerHTML = "Reloading...";
        reloadPageWithSearchParams(params);
    }

    function reloadPageWithSearchParams(urlParams) {
        if (url == undefined) {
            url = new URL(window.location.href);
        }
        for (var param of urlParams) {
            url.searchParams.delete(param.key);
            url.searchParams.append(param.key, param.value);
        }
        window.open(url, "_self");
    }

    function getBetSlipReducer() {
        return JSON.parse(localStorage.getItem("betslipReducer"));
    }

    var closedAccordionsVisible = true;
    window.toggleClosedAccordionsVisibility = () => {
        var icon = document.getElementById("iconMinimizeClosed");
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
        sportsbookToolScript = document.getElementById("sportsbookToolScript");
        if (sportsbookToolScript !== null) {
            sportsbookToolScript.remove();
        }
    }

    var isAppWindowSmall = false;
    window.zoomInOut = () => {
        var icon = document.getElementById("iconZoomInOut");
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

    // function initDeviceTypeDependent() {
    //     if (DEVICE_TYPE == "Desktop") {
    //         windowMoverForMouse()
    //     } else {
    //         document.getElementById("sportsbookToolContent").classList.add("mobileUi");
    //         windowMoverForTouch();
    //     }
    // }

    function initTouchDependent() {
        if (IS_TOUCH_BROWSER) {
            document.getElementById("sportsbookToolContent").classList.add("mobileUi");
            windowMoverForTouch();
        } else {
            windowMoverForMouse();
        }
    }

    function windowMoverForTouch() {
        var box = document.getElementById("sportsbookTool");
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
            if (document.getElementById(elmnt.id + "Header")) {
                /* if present, the header is where you move the DIV from:*/
                document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
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
        return params[param];
    }

    function getJiraTemplate() {
        var template =
            "h2. Test Results\n" +
            "|| ||Desktop||Mobile||\n" +
            "|Test|*{color:#00875a}Passed{color}*|*{color:#00875a}Passed{color}*|" + "\n" +
            "|Env|" + ENVIRONMENT + "|" + ENVIRONMENT + "|\n" +
            "|Brand(s)|" + BRANDWITHCULTURE + "|" + BRANDWITHCULTURE + "|\n" +
            "|Browser(s)|" + BROWSER_VERSION + "|" + BROWSER_VERSION + "|\n" +
            "|Version|" + OBG_VERSION + "|" + OBG_VERSION + "|\n" +
            "|Proof| | |";
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

    function getPostMessage() {
        var href = window.location.href;
        var origin = window.location.origin;
        var staticContextId = obgClientEnvironmentConfig.startupContext.contextId.staticContextId;
        var userContextId = obgClientEnvironmentConfig.startupContext.contextId.userContextId;
        var externalUrl = href.replace(origin + "/", "").replace(staticContextId + "/", "").replace(userContextId, "");
        return `postMessage(
    {
        type: "routeChangeIn",
        payload: {
            externalUrl: "${externalUrl}"
        }
    });`
    }

    window.copyToClipboard = (param) => {
        var text;
        switch (param) {
            case "brand":
                text = BRANDWITHCULTURE;
                break;
            case "obgVersion":
                text = OBG_VERSION;
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
            case "accaName":
                text = accaName;
                break;
            case "accaId":
                text = accaId;
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

    window.lockEvent = () => {
        var checkBox = document.getElementById("chkLockEventForSbToolsEvent");
        var detectedOrLockedRow = document.getElementById("detectedOrLockedRowForSbToolsEvent");
        labelRow = document.getElementById("eventLabelForSbToolsEvent");

        if (checkBox.checked) {
            lockedEventId = eventId;
            detectedOrLockedRow.innerHTML = "&#128274; Locked event:"
            labelRow.classList.add("displayInGreenGlow");
            stopPolling();
            initSbToolsEvent("buttonsOnly");
            inactivateAllAccordions();
        } else {
            lockedEventId = undefined;
            detectedOrLockedRow.innerText = "Detected event:";
            labelRow.classList.remove("displayInGreenGlow");
            initSbToolsEvent();
            activateAllAccordions();
        }
    }

    window.initSbToolsMarket = () => {
        initSbToolsMarket();
    }

    // hack
    // var savedEventId;
    // end of hack

    function initSbToolsMarket(scope) {
        stopPolling();
        previousMarketId = undefined;
        var marketStateButtons = document.getElementsByClassName("btSetMarketState");
        var marketStateButtonsSection = document.getElementById("setMarketStateButtonsSection");
        labelRow = document.getElementById("labelRowForSbToolsMarket");
        var lockMarketSection = document.getElementById("lockMarketSection");
        var marketIdField = document.getElementById("marketIdForSbToolsMarket");
        var marketTemplateIdField = document.getElementById("marketTemplateIdForSbToolsMarket");
        var marketTemplateTagsField = document.getElementById("marketTemplateTagsForSbToolsMarket");
        var sbMarketIdForOddsManagerSection = document.getElementById("sbMarketIdForOddsManagerSection");
        var marketFeatures = document.getElementById("marketFeatures");
        var marketTemplateTags;

        var chkIsCashoutAvailable = document.getElementById("chkIsCashoutAvailable");
        var isCashoutAvailableSection = document.getElementById("isCashoutAvailableSection");

        var isEnvBLE = ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD";

        scope === "buttonsOnly" ?
            intervalIdForPolling = setInterval(listenerForMarketButtonsOnly, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForMarket, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        var eventLabelForDetectedMarket = document.getElementById("eventLabelForDetectedMarket");
        var marketLabelForDetectedMarket = document.getElementById("marketLabelForDetectedMarket");
        var messageForSbToolsMarket = document.getElementById("messageForSbToolsMarket");
        var labelsForDetectedMarketAndEvent = document.getElementById("labelsForDetectedMarketAndEvent");
        const MAIN_LINE_MARKET_TEMPLATE_TAGS = ["118", "119", "120"];


        function listenerForMarket() {
            marketId = getLastMarketIdFromBetslip();
            // log("\nmarketId: " + marketId + "\npreviousMarketId: " + previousMarketId);
            if (marketId === previousMarketId) {
                if (marketId !== null) {
                    listenerForMarketButtonsOnly();
                }
                return;
            } else {
                previousMarketId = marketId;
            }

            if (marketId === null) {
                displayInRed(labelRow);
                show(messageForSbToolsMarket);
                hide(marketFeatures, lockMarketSection, labelsForDetectedMarketAndEvent);
                messageForSbToolsMarket.innerText = NOT_FOUND;
            } else {
                show(marketFeatures, lockMarketSection, labelsForDetectedMarketAndEvent);
                hide(messageForSbToolsMarket);
                previousMarketId = marketId;
                eventLabelForDetectedMarket.innerText = getEventDisplayLabel(getLastEventIdFromBetslip());
                marketLabelForDetectedMarket.innerHTML = "&boxur;&HorizontalLine; " + getMarketLabel(marketId);
                displayInGreen(labelRow);

                if (isEnvBLE) {
                    hide(sbMarketIdForOddsManagerSection);
                } else if (getEventPhase() !== "Prematch") {
                    hide(sbMarketIdForOddsManagerSection);
                } else {
                    show(sbMarketIdForOddsManagerSection);
                }

                if (IS_OBGRT_EXPOSED) {
                    show(lockMarketSection, marketStateButtonsSection);
                    listenerForMarketButtonsOnly();
                } else {
                    hide(lockMarketSection, marketStateButtonsSection);
                }
                // displayInGreen(marketIdField);
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

            // labelRow.innerHTML = detectionResultText;
        }

        function initMarketPropertyCheckboxes() {
            obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable ?
                chkIsCashoutAvailable.checked = true :
                chkIsCashoutAvailable.checked = false;
        }


        var marketPropertiesSection = document.getElementById("marketPropertiesSection");

        function listenerForMarketButtonsOnly() {
            // initMarketPropertyCheckboxes();
            var marketStatus = obgState.sportsbook.eventMarket.markets[marketId].status;
            for (var button of marketStateButtons) {
                if (marketStatus === button.id.replace("btSetMarketState", "")) {
                    inactivate(button);
                } else {
                    activate(button);
                }
            }

            if (!marketPropertiesSection.classList.contains("hide")) {
                switch (getEventPhase(eventId)) {
                    case "Live":
                        activate(isCashoutAvailableSection);
                        break;
                    case "Prematch":
                        activate(isCashoutAvailableSection);
                        break;
                    case "Over":
                        inactivate(isCashoutAvailableSection);
                        break;
                }
            }
        }

        window.toggleMarketProperty = (property) => {
            switch (property) {
                case "cashoutAvailable":
                    toggleIsCashoutAvailable();
                    break;
            }
            if (isCategoryInUsFormat(getCategoryIdByEventId(eventId))) {
                triggerMarketChangeDetection();
            } else {
                triggerChangeDetection(eventId, 500)
            }
        }

        function toggleIsCashoutAvailable() {
            if (chkIsCashoutAvailable.checked) {
                obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable = true;
            } else {
                obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable = false;
            }
        }
    }

    function triggerMarketChangeDetection() {
        let state = obgState.sportsbook.eventMarket.markets[marketId].status;
        if (state == "Hold") {
            setMarketState("Open");
        } else {
            setMarketState("Hold");
        }
        setMarketState(state);
    }

    window.lockMarket = () => {
        var checkBox = document.getElementById("chkLockMarket");
        var detectedOrLockedRow = document.getElementById("detectedOrLockedRowForSbToolsMarket");
        // var labelRow = document.getElementById("labelsForDetectedMarketAndEvent");
        if (checkBox.checked) {
            lockedMarketId = marketId;
            detectedOrLockedRow.innerHTML = "&#128274; Locked market:";
            labelRow.classList.add("displayInGreenGlow");
            stopPolling();
            initSbToolsMarket("buttonsOnly");
            inactivateAllAccordions();
        } else {
            lockedMarketId = undefined;
            detectedOrLockedRow.innerText = "Detected market:";
            labelRow.classList.remove("displayInGreenGlow");
            activateAllAccordions();
            initSbToolsMarket();
        }
    }

    function getEventIdFromEventWidget() {
        var items = Object.values(obgState.sportsbook.eventWidget.items);
        for (var targetItem of items) {
            if (targetItem.isActive === true) {
                return targetItem.item.skeleton.eventId;
            }
        }
    }

    function getCategoryTrackingLabel() {
        return obgState.sportsbook.sportCatalog.categories[getCategoryIdByEventId(eventId)].trackingLabel;
    }

    // function isThreeColumnLayout(categoryId) {
    //     if (obgState.sportsbook.sportCatalog.categories[categoryId].metaData.style == "2") {
    //         return true;
    //     } return false;
    // }

    function isBLE() {
        if (ENVIRONMENT == "PROD" || ENVIRONMENT == "ALPHA") {
            return true;
        } return false;
    }

    function getEventWidgetActiveTabId(eventId) {
        return obgState.sportsbook.marketListWidget.items[eventId].marketTemplateGroupingId;
    }


    function stopPolling() {
        if (!!intervalIdForPolling) {
            // log("intervalIdsForPolling: " + intervalIdsForPolling);
            for (var id of intervalIdsForPolling) {
                clearInterval(id);
                // log("polling cleared for id: " + id);
            }
            intervalIdForPolling = undefined;
            intervalIdsForPolling = [];
        }
    }

    function isCategoryInUsFormat(categoryId) {
        if (obgState.sportsbook.sportCatalog.categories[categoryId].metaData.style == "2") {
            return true;
        } return false;
    }

    function getSymbolBetweenParticipants(categoryId) {
        if (isCategoryInUsFormat(categoryId)) {
            return " @ ";
        }
        return " - ";
    }

    // window.initCreateMarket = () => {
    //     stopPolling();
    //     previousEventId = null;

    //     labelRow = document.getElementById("eventLabelForCreateMarket");
    //     var fastMarketMessage = document.getElementById("fastMarketMessage");
    //     var playerPropsMessage = document.getElementById("playerPropsMessage");
    //     var btCreateFastMarket = document.getElementById("btCreateFastMarket");
    //     var btCreatePlayerPropsMarket = document.getElementById("btCreatePlayerPropsMarket");
    //     var btCreatePlayerPropsDummyMarket = document.getElementById("btCreatePlayerPropsDummyMarket");
    //     var createMarketFeatures = document.getElementById("createMarketFeatures");

    //     intervalIdForPolling = setInterval(listenerForCreateMarket, POLLING_INTERVAL);
    //     intervalIdsForPolling.push(intervalIdForPolling);

    //     function listenerForCreateMarket() {

    //         eventId = getUrlParam("eventId");
    //         if (eventId == undefined || !eventId.startsWith("f-")) {
    //             eventId = getEventIdFromEventWidget();
    //         }

    //         if (eventId === previousEventId) {
    //             return;
    //         } else {
    //             previousEventId = eventId;
    //         }

    //         if (eventId === undefined) {
    //             displayInRed(labelRow);
    //             detectionResultText = NOT_FOUND;
    //             hide(createMarketFeatures);
    //         } else {
    //             show(createMarketFeatures);
    //             detectionResultText = getEventLabel(eventId);
    //             displayInGreen(labelRow);
    //             let categoryId = getCategoryIdByEventId(eventId);
    //             initCreateFastMarketSection(categoryId);
    //             initCreatePlayerPropsMarketSection(categoryId);
    //         }
    //         labelRow.innerText = detectionResultText;
    //     }

    //     function initCreateFastMarketSection(categoryId) {
    //         let eligibleCategoryIdsForFastMarket = ["1", "11", "138", "2"];
    //         if (eligibleCategoryIdsForFastMarket.includes(categoryId)) {
    //             // marketTemplateTagsArrayForFastMarket = [84, 6, 82, 85];
    //             activate(btCreateFastMarket);
    //             fastMarketMessage.innerText = null;
    //         } else {
    //             marketTemplateTagsArrayForFastMarket = undefined;
    //             displayInRed(fastMarketMessage);
    //             fastMarketMessage.innerText = "Not for this category"
    //             inactivate(btCreateFastMarket);
    //         }
    //     }

    //     function initCreatePlayerPropsMarketSection(categoryId) {
    //         let eligibleCategoryIdsPlayerPropsMarket = ["1", "2", "3", "4", "10", "19"];
    //         if (eligibleCategoryIdsPlayerPropsMarket.includes(categoryId)) {
    //             // marketTemplateTagsArray = [14, 35, 41, 47, 53, 101, 104, 106];
    //             activate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket);
    //             playerPropsMessage.innerText = null;
    //         } else {
    //             marketTemplateTagsArray = undefined;
    //             displayInRed(playerPropsMessage);
    //             playerPropsMessage.innerText = "Not for this category"
    //             inactivate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket);
    //         }
    //     }
    // }

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

    window.initChangeOdds = () => {
        stopPolling();
        labelRow = document.getElementById("labelForSbToolsSelection");
        var selectionIdForSbToolsSelection = document.getElementById("selectionIdForSbToolsSelection");
        var changeOddsFeatures = document.getElementById("changeOddsFeatures");
        var eventLabelForDetectedSelection = document.getElementById("eventLabelForDetectedSelection");
        var marketLabelForDetectedSelection = document.getElementById("marketLabelForDetectedSelection");
        var selectionLabelForDetectedSelection = document.getElementById("selectionLabelForDetectedSelection");
        var messageForSbToolsSelection = document.getElementById("messageForSbToolsSelection");
        var labelsForDetectedSelectionMarketAndEvent = document.getElementById("labelsForDetectedSelectionMarketAndEvent");
        var initialOddsSpan = document.getElementById("initialOddsSpan");

        intervalIdForPolling = setInterval(listenerForChangeOdds, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForChangeOdds() {
            eventLabel = getEventDisplayLabel(getLastEventIdFromBetslip());
            marketLabel = getMarketLabel(getLastMarketIdFromBetslip());
            selectionLabel = getSelectionLabel(getLastSelectionIdFromBetslip());

            if (selectionLabel === previousSelectionLabel) {
                return;
            } else {
                previousSelectionLabel = selectionLabel;
            }

            odds = getLastInitialOddsFromBetslip();

            if (eventLabel === null || selectionLabel === null) {
                displayInRed(labelRow);
                show(messageForSbToolsSelection);
                messageForSbToolsSelection.innerText = NOT_FOUND;
                hide(changeOddsFeatures, lockSelectionSection, labelsForDetectedSelectionMarketAndEvent);
            } else {
                displayInGreen(labelRow);
                show(changeOddsFeatures, lockSelectionSection, labelsForDetectedSelectionMarketAndEvent);
                hide(messageForSbToolsSelection);
                eventLabelForDetectedSelection.innerText = eventLabel;
                marketLabelForDetectedSelection.innerHTML = "&boxur;&HorizontalLine; " + marketLabel;
                selectionLabelForDetectedSelection.innerHTML = "&boxur;&HorizontalLine; " + selectionLabel;
                selectionIdForSbToolsSelection.innerHTML = selectionId;
                initialOddsSpan.innerText = odds.toFixed(2);
            }
        }
    }


    window.changeOdds = () => {
        var newOdds = document.getElementById("newOdds").value;
        if (lockedSelectionId !== undefined) {
            selectionId = lockedSelectionId;
        }
        if (lockedInitialOdds !== undefined) {
            initialOdds = lockedInitialOdds;
        }
        if (newOdds === "" || newOdds === null) {
            newOdds = initialOdds;
        }
        obgRt.setSelectionOdds([{
            msi: selectionId,
            o: Number(newOdds)
        }]);
    }

    window.lockSelection = () => {
        var checkBox = document.getElementById("chkLockSelection");
        var detectedOrLockedRow = document.getElementById("detectedOrLockedRowForSbToolsSelection");
        // labelRow = document.getElementById("selectionLabelForSbToolsSelection");

        if (checkBox.checked) {
            lockedSelectionId = getLastSelectionIdFromBetslip();
            lockedInitialOdds = getLastInitialOddsFromBetslip();
            detectedOrLockedRow.innerHTML = "&#128274; Locked selection:";
            labelRow.classList.add("displayInGreenGlow");
            stopPolling();
            inactivateAllAccordions();
        } else {
            lockedSelectionId = undefined;
            lockedInitialOdds = undefined;
            detectedOrLockedRow.innerText = "Detected selection:";
            labelRow.classList.remove("displayInGreenGlow");
            initChangeOdds();
            activateAllAccordions();
        }
    }

    function getLastSelectionIdFromBetslip() {
        try {
            var selections = Object.values(getBetSlipByObgState().selections);
            var indexOfLastSelection = selections.length - 1;
            selectionId = selections[indexOfLastSelection].selectionId;
        } catch {
            selectionId = null;
        }
        return selectionId;
    }

    function getLastInitialOddsFromBetslip() {
        try {
            var allInitialOdds = Object.values(getBetSlipByObgState().initialOdds);
            var indexOfLastInitialOdds = allInitialOdds.length - 1;
            initialOdds = allInitialOdds[indexOfLastInitialOdds];
        } catch {
            initialOdds = null;
        }
        return initialOdds;
    }

    function getSelectionLabel(selectionId) {
        if (selectionId === null) {
            return null;
        } else return obgState.sportsbook.selection.selections[selectionId].label;
    }

    // window.initScoreBoard = () => {
    //     initScoreBoard();
    // }

    // function initScoreBoard() {
    //     stopPolling();
    //     previousEventId = undefined;
    //     labelRow = document.getElementById("eventLabelForScoreBoard");
    //     var notFootballScoreBoardMessage = document.getElementById("notFootballScoreBoardMessage");
    //     var lockEventSection = document.getElementById("lockEventSectionForScoreBoard");
    //     var scoreBoardObjects;
    //     var itHasFootballScoreBoard;
    //     var scoreBoardFeatures = document.getElementById("scoreBoardFeatures");

    //     intervalIdForPolling = setInterval(listenerForScoreBoard, POLLING_INTERVAL);
    //     intervalIdsForPolling.push(intervalIdForPolling);

    //     function listenerForScoreBoard() {
    //         scoreBoardObjects = Object.values(obgState.sportsbook.scoreboard);
    //         eventId = getDetectedEventId();
    //         if (eventId === previousEventId) {
    //             return;
    //         } else {
    //             previousEventId = eventId;
    //         }
    //         detectionResultText = getDetectedEventDisplayLabel();
    //         itHasFootballScoreBoard = false;
    //         if (detectionResultText === null) {
    //             detectionResultText = NOT_FOUND;
    //             hide(notFootballScoreBoardMessage, lockEventSection);
    //             hideScoreBoard();
    //         } else {
    //             for (object of scoreBoardObjects) {
    //                 if (eventId == object.eventId && getCategoryIdByEventId(eventId) === "1") {
    //                     itHasFootballScoreBoard = true;
    //                     hide(notFootballScoreBoardMessage);
    //                     break;
    //                 }
    //             }
    //             if (itHasFootballScoreBoard) {
    //                 hide(notFootballScoreBoardMessage);
    //                 showScoreBoard();
    //                 show(lockEventSection);
    //             } else {
    //                 hide(lockEventSection);
    //                 show(notFootballScoreBoardMessage);
    //                 hideScoreBoard();
    //             }
    //         }
    //         labelRow.innerText = detectionResultText;
    //     }

    //     function showScoreBoard() {
    //         displayInGreen(labelRow);
    //         show(scoreBoardFeatures);
    //     }

    //     function hideScoreBoard() {
    //         displayInRed(labelRow);
    //         hide(scoreBoardFeatures);
    //     }
    // }

    function isBetslipVisible() {
        return obgState.sportsbook.betslip.isVisible;
    }

    function isBetBuilderBetslipVisible() {
        if (obgState.route.current.queryParams.betbuilderbetslip == 1) {
            return true;
        } return false;
    }

    // function isEventWidgetActive() {
    //         return obgState.sportsbook.eventWidget.items[eventId].isActive;
    // }

    function getMarketTemplateTags(marketId) {
        return obgState.sportsbook.eventMarket.markets[marketId].marketTemplateTags;
    }

    window.initNativeApp = () => {
        stopPolling();
        previousEventId = undefined;
        var menu = obgState.sportsbook.sportCatalog.menu.items;
        var quickLinks;
        var categories, regions, competitions;
        var categorySelector = document.getElementById("categorySelector");
        var regionSelector = document.getElementById("regionSelector");
        var competitionSelector = document.getElementById("competitionSelector");
        var menuOption;
        labelRow = document.getElementById("eventLabelForNative");

        var btNativeOpenEvent = document.getElementById("btNativeOpenEvent");
        var btNativeBack = document.getElementById("btNativeBack");
        var btNativeHome = document.getElementById("btNativeHome");
        var btNativeAz = document.getElementById("btNativeAz");
        var btNativeLive = document.getElementById("btNativeLive");
        var btNativeBetslip = document.getElementById("btNativeBetslip");
        var btNativeMyBets = document.getElementById("btNativeMyBets");
        var btNativeBetBuilder = document.getElementById("btNativeBetBuilder");
        var btNativeBoost = document.getElementById("btNativeBoost");
        var btNativeLiveSC = document.getElementById("btNativeLiveSC");
        var btNativeStartingSoon = document.getElementById("btNativeStartingSoon");
        var btNativeSettings = document.getElementById("btNativeSettings");

        var loggedInOnly = document.getElementsByClassName("loggedInOnly");
        var badgeNativeBetslip = document.getElementById("badgeNativeBetslip");
        var badgeNativeBbBetslip = document.getElementById("badgeNativeBbBetslip");
        var nativeAzSection = document.getElementById("nativeAzSection");
        var iconBtNativeBetBuilder = document.getElementById("iconBtNativeBetBuilder");
        var labelBtNativeBetBuilder = document.getElementById("labelBtNativeBetBuilder");
        var nativeBetBuilderEventLabel = document.getElementById("nativeBetBuilderEventLabel");
        var nativeBetBuilderSection = document.getElementById("nativeBetBuilderSection");
        var nativeBetBuilderEventSelector = document.getElementById("nativeBetBuilderEventSelector");
        var nativeBetBuilderEventsError = document.getElementById("nativeBetBuilderEventsError");
        var nativeQuickLinksSection = document.getElementById("nativeQuickLinksSection");



        var quickLinkSelector = document.getElementById("quickLinkSelector");
        var nativeErrorMessage = document.getElementById("nativeErrorMessage");
        var btNativeToggleableCollection = document.getElementsByClassName("btNativeToggleable");
        var nativeRouteHistory = [];

        var betSlipVisibleState;
        var previousBetSlipVisibleState = undefined;
        var currentRoute;
        var previousRoute = undefined;


        try { quickLinks = getQuickLinks() } catch {
        }

        initNativeButtonsState();
        changeNativeBetBuilderToSGPifNeeded();

        function getQuickLinks() {
            return Object.values((obgState.quicklink.quicklinks)["sportsbook.quicklink-menu"]);
        }

        function changeNativeBetBuilderToSGPifNeeded() {
            if (IS_SGP_USED) {
                iconBtNativeBetBuilder.classList.replace("ico-bet-builder", "ico-single-game-parlay");
                labelBtNativeBetBuilder.innerText = "SG Parlay";
                nativeBetBuilderEventLabel.innerText = "SGP Event";
                nativeBetBuilderEventsError.innerText = "Open an SGP accordion on the page.";
            }
        }


        if (!isUserLoggedIn()) {
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
                case "sportsbook.bet-builder":
                case "sportsbook.bet-builder-category":
                case "sportsbook.bet-builder-event":
                    initNativeBetBuilderSection();
                    toggleButtons("betBuilder");
                    break;
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
            setBadgeNativeBbBetslip();
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

        var slipSelectionCount, previousSlipSelectionCount = 0;
        function setBadgeNativeBetslip() {
            if (getCurrentRouteName() == "sportsbook.bet-builder-event") {
                hide(badgeNativeBetslip);
            } else {
                if (slipSelectionCount == 0 || slipSelectionCount == undefined) {
                    hide(badgeNativeBetslip);
                } else {
                    show(badgeNativeBetslip)
                }
            }
            slipSelectionCount = Object.values(obgState.sportsbook.betslip.selections).length;
            if (slipSelectionCount == previousSlipSelectionCount) {
                return;
            } else {
                badgeNativeBetslip.innerText = slipSelectionCount;
                previousSlipSelectionCount = slipSelectionCount;
            }
        }

        var bBslipSelectionCount, previousBbSlipSelectionCount = 0;
        function setBadgeNativeBbBetslip() {
            if (getCurrentRouteName() != "sportsbook.bet-builder-event") {
                hide(badgeNativeBbBetslip);
            } else {
                if (bBslipSelectionCount == 0 || bBslipSelectionCount == undefined) {
                    hide(badgeNativeBbBetslip);
                } else {
                    show(badgeNativeBbBetslip);
                }
            }
            bBslipSelectionCount = obgState.betBuilder.betslip.selectionIds.length;
            if (bBslipSelectionCount == previousBbSlipSelectionCount) {
                return;
            } else {
                badgeNativeBbBetslip.innerText = bBslipSelectionCount;
                previousBbSlipSelectionCount = bBslipSelectionCount;
            }
        };

        function setNativeBetslipButtonState() {
            betSlipVisibleState = isBetslipVisible() || isBetBuilderBetslipVisible();
            if (betSlipVisibleState == previousBetSlipVisibleState) {
                return;
            }
            previousBetSlipVisibleState = betSlipVisibleState;
            if (betSlipVisibleState) {
                btNativeBetslip.classList.add("btGreen");
            } else {
                btNativeBetslip.classList.remove("btGreen");
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

        function getSlugByRoute(route) {
            return routes[route].slug;
        }

        window.nativeClick = (value) => {
            nativeClick(value);
        }


        function nativeClick(value) {
            routes = obgClientEnvironmentConfig.startupContext.routes;
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
                case "betBuilder":
                    routeChangeInWithPushToHistory(getSlugByRoute("sportsbook.bet-builder"));
                    initNativeBetBuilderSection();
                    break;
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

        function hideAllNativeSections() {
            hide(nativeAzSection, nativeBetBuilderSection, nativeQuickLinksSection);
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
                "betBuilder": btNativeBetBuilder,
                "boost": btNativeBoost,
                "lsc": btNativeLiveSC,
                "startingSoon": btNativeStartingSoon,
                "settings": btNativeSettings,
                "az": btNativeAz
            }
            return nativeButtonsMap[key];
        }


        function initNativeBetBuilderSection() {
            show(nativeBetBuilderSection);
            hide(nativeQuickLinksSection, nativeAzSection);
            inactivate(btNativeBetBuilder);
            populateBetBuilderEvents();
            intervalIdForPolling = setInterval(listenerForNativeBetBuilderEvents, POLLING_INTERVAL);
            intervalIdsForPolling.push(intervalIdForPolling);

            function populateBetBuilderEvents() {
                clearSelector(nativeBetBuilderEventSelector);
                createHeaderOptionFor(nativeBetBuilderEventSelector);
                betBuilderEvents = Object.values(obgState.betBuilder.event.events).sort((a, b) => (a.participants[0].label > b.participants[0].label) ? 1 : -1);
                for (var event of betBuilderEvents) {
                    menuOption = document.createElement("option");
                    menuOption.text = event.participants[0].label + getSymbolBetweenParticipants(event.categoryId) + event.participants[1].label;
                    menuOption.value = event.id;
                    nativeBetBuilderEventSelector.appendChild(menuOption);
                }
            }

            function listenerForNativeBetBuilderEvents() {
                betBuilderEvents = Object.values(obgState.betBuilder.event.events);
                if (betBuilderEvents.length == 0) {
                    show(nativeBetBuilderEventsError);
                } else {
                    hide(nativeBetBuilderEventsError);
                }
                if (betBuilderEvents.length == previousBetBuilderEvents.length) {
                    return;
                } else {
                    previousBetBuilderEvents = betBuilderEvents;
                    populateBetBuilderEvents();
                }
            }
        }

        window.selectBetuilderEvent = (value) => {
            for (var event of betBuilderEvents) {
                if (value == event.id) {
                    routeChangeIn(routes["sportsbook.bet-builder"].slug + "/" + event.slug + "?eventId=" + value);
                }
            }
            activate(btNativeBetBuilder);
        }


        window.openEventOnNative = () => {
            routeChangeInWithPushToHistory(obgState.sportsbook.event.events[eventId].slug + "?eventId=" + eventId);
            for (var bt of btNativeToggleableCollection) {
                activate(bt);
            }
        }


        function initNativeAzSection() {
            show(nativeAzSection);
            hide(nativeQuickLinksSection, nativeBetBuilderSection);
            resetAzNavigation();
            categories = Object.values(menu);
            populateSelector(categorySelector, categories);
        }

        function resetAzNavigation() {
            clearSelector(categorySelector, regionSelector, competitionSelector);
            inactivate(regionSelector, competitionSelector);
        }



        window.selectCategory = (value) => {
            clearSelector(regionSelector, competitionSelector);
            activate(regionSelector);
            inactivate(competitionSelector);
            for (var category of categories) {
                if (value == category.id) {
                    regions = Object.values(category.items);
                    populateSelector(regionSelector, regions);
                }
            }
        }

        window.selectRegion = (value) => {
            clearSelector(competitionSelector);
            for (var region of regions) {
                if (value == region.id) {
                    if (region.items != undefined) {
                        competitions = Object.values(region.items);
                        populateSelector(competitionSelector, competitions);
                        activate(competitionSelector);
                    } else {
                        inactivate(competitionSelector);
                        routeChangeIn(region.slug);
                    }
                }
            }
        }

        window.selectCompetition = (value) => {
            for (var competition of competitions) {
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
            hide(nativeBetBuilderSection, nativeAzSection);
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
                extUrl: obgState.route.current.externalUrl
            }
        }

        function setNativeBtBackState() {
            if (nativeRouteHistory.length == 0) {
                inactivate(btNativeBack);
            } else activate(btNativeBack);
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
        try {
            var selections = Object.values(getBetSlipByObgState().selections);
            var indexOfLastSelection = selections.length - 1;
            eventId = selections[indexOfLastSelection].eventId;
        } catch {
            eventId = null;
        }
        return eventId;
    }

    function getDetectedEventDisplayLabel() {
        eventId = getDetectedEventId();
        return getEventDisplayLabel(eventId);
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

    function isEventWidgetVisibleFor(eventId) {
        if (eventId = getUrlParam("eventId")) {
            return true
        } return false;
    }

    function getEventLabel(eventId) {
        if (eventId === null || eventId === undefined) {
            return null;
        }
        return obgState.sportsbook.event.events[eventId].label;
    }

    function getEventPhase() {
        return obgState.sportsbook.event.events[eventId].phase;
    }

    function getParticipants(eventId) {
        return obgState.sportsbook.event.events[eventId].participants;
    }

    function getCategoryNameByEventId(eventId) {
        if (isEventInObgState(eventId)) {
            return obgState.sportsbook.event.events[eventId].categoryName;
        }
    }

    function getRegionNameByEventId(eventId) {
        if (isEventInObgState(eventId)) {
            return obgState.sportsbook.event.events[eventId].regionName;
        }
    }

    function getCompetitionNameByEventId(eventId) {
        if (isEventInObgState(eventId)) {
            return obgState.sportsbook.event.events[eventId].competitionName;
        }
    }

    function getCategoryIdByEventId(eventId) {
        if (isEventInObgState(eventId)) {
            return obgState.sportsbook.event.events[eventId].categoryId;
        }
    }

    function getRegionIdByEventId(eventId) {
        if (isEventInObgState(eventId)) {
            return obgState.sportsbook.event.events[eventId].regionId;
        }
    }

    function getCompetitionIdByEventId(eventId) {
        if (isEventInObgState(eventId)) {
            return obgState.sportsbook.event.events[eventId].competitionId;
        }
    }

    function isEventInObgState(eventId) {
        let evt = obgState.sportsbook.event.events[eventId];
        if (evt == undefined) {
            return false;
        } return true;
    }

    window.toggleSection = (section) => {
        var element = document.getElementById(section);
        if (element.classList.contains("hide")) {
            show(element);
        } else {
            hide(element);
        }
    }

    function isEventTypeOutright(eventId) {
        if (obgState.sportsbook.event.events[eventId].eventType == "Outright") {
            return true;
        } else return false;
    }

   
    window.initSbToolsEvent = () => {
        initSbToolsEvent();
    }
    function initSbToolsEvent(scope) {
        stopPolling();
        previousEventId = undefined;
        labelRow = document.getElementById("eventLabelForSbToolsEvent");
        var lockEventSection = document.getElementById("lockEventSectionForSbToolsEvent");
        var eventPhaseButtons = document.getElementsByClassName("btSetEventPhase");
        var eventPhase;
        var sbEventIdForOddsManagerSection = document.getElementById("sbEventIdForOddsManagerSection");
        var eventIdValue = document.getElementById("eventIdForEventDetails");
        var startDateValue = document.getElementById("startDateForEventDetails");
        var categoryForEventDetails = document.getElementById("categoryForEventDetails");
        var regionForEventDetails = document.getElementById("regionForEventDetails");
        var competitionForEventDetails = document.getElementById("competitionForEventDetails");
        var categoryIdForEventDetails = document.getElementById("categoryIdForEventDetails");
        var regionIdForEventDetails = document.getElementById("regionIdForEventDetails");
        var competitionIdForEventDetails = document.getElementById("competitionIdForEventDetails");

        var chkSuspendAllMarkets = document.getElementById("chkSuspendAllMarkets");

        var addToCarouselErrorMessage = document.getElementById("addToCarouselErrorMessage");

        var hasBetBuilderLinkSection = document.getElementById("hasBetBuilderLinkSection");
        var chkHasBetBuilderLink = document.getElementById("chkHasBetBuilderLink");
        var betBuilderIcon = document.getElementById("betBuilderIcon");
        var betBuilderLabel = document.getElementById("betBuilderLabel");

        var hasPriceBoostSection = document.getElementById("hasPriceBoostSection");
        var chkHasPriceBoost = document.getElementById("chkHasPriceBoost");

        var hasLiveVisualSection = document.getElementById("hasLiveVisualSection");
        var chkHasLiveVisual = document.getElementById("chkHasLiveVisual");

        var hasLiveStreamingSection = document.getElementById("hasLiveStreamingSection");
        var chkHasLiveStreaming = document.getElementById("chkHasLiveStreaming");

        var hasFastMarketsSection = document.getElementById("hasFastMarketsSection");
        var chkHasFastMarkets = document.getElementById("chkHasFastMarkets");

        var hasPrematchStatisticsSection = document.getElementById("hasPrematchStatisticsSection");
        var chkHasPrematchStatistics = document.getElementById("chkHasPrematchStatistics");

        var hasLiveStatisticsSection = document.getElementById("hasLiveStatisticsSection");
        var chkHasLiveStatistics = document.getElementById("chkHasLiveStatistics");

        // rename event
        var fdRenameEventLabel = document.getElementById("fdRenameEventLabel");
        var renameParticipantLabelSection = document.getElementById("renameParticipantLabelSection");
        var fdRenameParticipantLabel = document.getElementById("fdRenameParticipantLabel");
        var participantSelector = document.getElementById("participantSelector");
        var selectedParticipantIdSpan = document.getElementById("selectedParticipantIdSpan");

        // carousel
        var addToCarouselMessage = document.getElementById("addToCarouselMessage");
        var eventFeaturesSection = document.getElementById("eventFeaturesSection");
        var addToCarouselButton = document.getElementById("btAddToCarousel");
        var addToCarouselButtonLabel = document.getElementById("addToCarouselButtonLabel");
        // var appendToCarouselSpan = document.getElementById("appendToCarouselSpan");
        // var chkAppendToCarousel = document.getElementById("chkAppendToCarousel");

        //scoreboard
        var notFootballScoreBoardMessage = document.getElementById("notFootballScoreBoardMessage");
        var scoreBoardObjects;
        var itHasFootballScoreBoard;
        var scoreBoardFeatures = document.getElementById("scoreBoardFeatures");

        //create markets
        var createMarketErrorSection = document.getElementById("createMarketErrorSection");
        var createMarketFeatures = document.getElementById("createMarketFeatures");
        var fastMarketMessage = document.getElementById("fastMarketMessage");
        var playerPropsMessage = document.getElementById("playerPropsMessage");
        var btCreateFastMarket = document.getElementById("btCreateFastMarket");
        var btCreatePlayerPropsMarket = document.getElementById("btCreatePlayerPropsMarket");
        var btCreatePlayerPropsDummyMarket = document.getElementById("btCreatePlayerPropsDummyMarket");

        changeBetBuilderToSGPifNeeded();


        (ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD") ?
            hide(sbEventIdForOddsManagerSection) :
            show(sbEventIdForOddsManagerSection);

        scope === "buttonsOnly" ?
            intervalIdForPolling = setInterval(listenerForEventButtonsOnly, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForEvent, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function changeBetBuilderToSGPifNeeded() {
            if (IS_SGP_USED) {
                betBuilderIcon.classList.replace("ico-bet-builder", "ico-single-game-parlay");
                betBuilderLabel.innerText = "Single Game Parlay Link"
            }
        }

        var previousIsEventVisible = undefined;
        var isEventVisible;
        function listenerForEvent() {
            // previousEventId = undefined;
            eventId = getDetectedEventId();
            isEventVisible = isEventWidgetVisibleFor(eventId);

            if (eventId === previousEventId && isEventVisible == previousIsEventVisible) {
                if (eventId !== null) {
                    listenerForEventButtonsOnly();
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
                    hide(eventFeaturesSection, addToCarouselErrorMessage, lockEventSection);
                }
            } else {
                show(eventFeaturesSection, lockEventSection);
                detectionResultText = getEventDisplayLabel(eventId);
                eventIdValue.innerText = eventId;
                startDateValue.innerText = getStartDate();
                categoryForEventDetails.innerHTML = getCategoryNameByEventId(eventId);
                regionForEventDetails.innerHTML = getRegionNameByEventId(eventId);
                competitionForEventDetails.innerHTML = getCompetitionNameByEventId(eventId);
                categoryIdForEventDetails.innerHTML = "[" + getCategoryIdByEventId(eventId) + "]";
                regionIdForEventDetails.innerHTML = "[" + getRegionIdByEventId(eventId) + "]";
                competitionIdForEventDetails.innerHTML = "[" + getCompetitionIdByEventId(eventId) + "]";
                displayInGreen(labelRow);
                initRenameEventSection();
                listenerForEventButtonsOnly();
                initFootballScoreboard();
                initCreateMarkets();
            }

            labelRow.innerText = detectionResultText;
            savedEventLabel = eventLabel;
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
                let categoryId = getCategoryIdByEventId(eventId);
                initCreateFastMarketSection(categoryId);
                initCreatePlayerPropsMarketSection(categoryId);
            }
        }

        function initCreateFastMarketSection(categoryId) {
            let eligibleCategoryIdsForFastMarket = ["1", "11", "138", "2"];
            if (eligibleCategoryIdsForFastMarket.includes(categoryId)) {
                activate(btCreateFastMarket);
                fastMarketMessage.innerText = null;
            } else {
                marketTemplateTagsArrayForFastMarket = undefined;
                displayInRed(fastMarketMessage);
                fastMarketMessage.innerText = "Not for this category"
                inactivate(btCreateFastMarket);
            }
        }

        function initCreatePlayerPropsMarketSection(categoryId) {
            let eligibleCategoryIdsPlayerPropsMarket = ["1", "2", "3", "4", "10", "19"];
            if (eligibleCategoryIdsPlayerPropsMarket.includes(categoryId)) {
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
            scoreBoardObjects = Object.values(obgState.sportsbook.scoreboard);
            itHasFootballScoreBoard = false;
            if (eventId === null) {
                hide(notFootballScoreBoardMessage, lockEventSection);
            } else {
                for (object of scoreBoardObjects) {
                    if (eventId == object.eventId && getCategoryIdByEventId(eventId) === "1") {
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

        function initRenameEventSection() {
            eventLabel = getEventLabel(eventId);
            if (!isEventTypeOutright(eventId)) {
                show(renameParticipantLabelSection);
                participants = getParticipants(eventId);
                populateParticipantSelector();
                populateParticipantLabel();
                populateParticipantId();
                fdRenameParticipantLabel.focus();
            } else {
                hide(renameParticipantLabelSection);
            }
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
                trimString("eventLabel")
            }, false);
        }

        function populateParticipantLabel() {
            fdRenameParticipantLabel.innerText = participants[0].label;
            selectedParticipantId = participants[0].id;
            fdRenameParticipantLabel.addEventListener("input", () => {
                trimString("participantLabel")
            }, false);
        }

        function trimString(string) {
            var element;
            var maxChars;
            if (string == "eventLabel") {
                element = fdRenameEventLabel;
                maxChars = 255;
            } else if (string == "participantLabel") {
                element = fdRenameParticipantLabel;
                maxChars = 50;
            }
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
            obgState.sportsbook.event.events[eventId].label = fdRenameEventLabel.textContent;
            triggerChangeDetection(eventId, 100);
        }

        window.setParticipantLabel = () => {
            var index;
            for (var participant of participants) {
                if (participant.id == selectedParticipantId) {
                    index = participants.indexOf(participant);
                }
            }
            obgState.sportsbook.event.events[eventId].participants[index].label = fdRenameParticipantLabel.textContent;
            triggerChangeDetection(eventId, 500);
            populateParticipantSelector();
        }


        window.setEventPhase = (phase) => {
            mockedEventPhase = phase;
            if (lockedEventId !== undefined) {
                eventId = lockedEventId;
            }
            switch (phase) {
                case "Prematch":
                    obgRt.setEventPhasePrematch(eventId);
                    break;
                case "Live":
                    obgRt.setEventPhaseLive(eventId);
                    break;
                case "Over":
                    chkSuspendAllMarkets.checked ?
                        obgRt.setEventPhaseOver(eventId, true) :
                        obgRt.setEventPhaseOver(eventId);
                    break;
            }
        }

        window.toggleEventProperty = (property) => {
            switch (property) {
                case "betBuilderLink":
                    toggleHasBetBuilderlink();
                    break;
                case "priceBoost":
                    toggleHasPriceBoost();
                    break;
                case "liveVisual":
                    toggleHasLiveVisual();
                    break;
                case "liveStreaming":
                    toggleHasLiveStreaming();
                    break;
                case "fastMarkets":
                    toggleHasFastMarkets();
                    break;
                case "prematchStatistics":
                    toggleHasPrematchStatistics();
                    break;
                case "liveStatistics":
                    toggleHasLiveStatistics();
                    break;
            }
            triggerChangeDetection(eventId, 500);
        }

        function toggleHasBetBuilderlink() {
            if (chkHasBetBuilderLink.checked) {
                obgState.sportsbook.event.events[eventId].hasBetBuilderLink = true;
            } else {
                obgState.sportsbook.event.events[eventId].hasBetBuilderLink = false;
            }
        }

        function toggleHasPriceBoost() {
            if (chkHasPriceBoost.checked) {
                obgState.sportsbook.priceBoost.eventMap[eventId] = ["Prematch", "Live"];
                marketId = getFirstMarketIdOfEvent(eventId);
                selectionId = getFirstSelectionIdOfMarket(marketId);
                createPriceBoost(eventId, marketId, selectionId);
            } else {
                delete obgState.sportsbook.priceBoost.eventMap[eventId];
                let boosts = Object.keys(obgState.sportsbook.priceBoost.priceBoost);
                let criteriaEntityDetails;
                for (let b of boosts) {
                    criteriaEntityDetails = obgState.sportsbook.priceBoost.priceBoost[b].criteria.criteriaEntityDetails;
                    for (let detail of criteriaEntityDetails) {
                        if (detail.eventId == eventId) {
                            delete obgState.sportsbook.priceBoost.priceBoost[b];
                        }
                    }
                }
            }
            function createPriceBoost(eventId, marketId, selectionId) {
                let priceBoostStateItem = {
                    "criteria": {
                        "eventPhases": [
                            "Prematch", "Live"
                        ],
                        "criteriaEntityDetails": [
                            {
                                "eventId": eventId,
                                "marketId": marketId,
                                "marketSelectionId": selectionId
                            }
                        ]
                    },
                    "conditions": {
                        "oddsLimit": {
                            "maxOdds": 10000,
                            "minOdds": 1.01
                        }
                    }
                }
                obgState.sportsbook.priceBoost.priceBoost["SBTOOL-" + generateGuid()] = priceBoostStateItem;
            }
        }


        function toggleHasLiveVisual() {
            if (chkHasLiveVisual.checked) {
                obgState.sportsbook.event.events[eventId].hasLiveVisual = true;
            } else {
                obgState.sportsbook.event.events[eventId].hasLiveVisual = false;
            }
        }

        function toggleHasLiveStreaming() {
            if (chkHasLiveStreaming.checked) {
                obgState.sportsbook.event.events[eventId].hasLiveStreaming = true;
            } else {
                obgState.sportsbook.event.events[eventId].hasLiveStreaming = false;
            }
        }

        function toggleHasFastMarkets() {
            if (chkHasFastMarkets.checked) {
                obgState.sportsbook.event.events[eventId].hasFastMarkets = true;
            } else {
                obgState.sportsbook.event.events[eventId].hasFastMarkets = false;
            }
        }

        function toggleHasPrematchStatistics() {
            if (chkHasPrematchStatistics.checked) {
                if (obgState.sportsbook.event.events[eventId].prematchStatisticsProviders.length === 0) {
                    obgState.sportsbook.event.events[eventId].prematchStatisticsProviders.push("Score24");
                }
            } else {
                obgState.sportsbook.event.events[eventId].prematchStatisticsProviders = [];
            }
        }

        function toggleHasLiveStatistics() {
            if (chkHasLiveStatistics.checked) {
                obgState.sportsbook.event.events[eventId].hasLiveStatistics = true;
            } else {
                obgState.sportsbook.event.events[eventId].hasLiveStatistics = false;
            }
        }

        function getStartDate() {
            var dateObj = new Date(obgState.sportsbook.event.events[eventId].startDate);
            var day = dateObj.getDate();
            var month = (dateObj.toLocaleString('default', { month: 'short' })).toUpperCase();
            var year = dateObj.getFullYear();
            var hours = ("0" + dateObj.getHours()).slice(-2);
            var minutes = ("0" + dateObj.getMinutes()).slice(-2);
            return day + " " + month + " " + year + ", " + hours + ":" + minutes;
        }

        function initEventPropertyCheckboxes() {

            obgState.sportsbook.event.events[eventId].hasLiveVisual ?
                chkHasLiveVisual.checked = true :
                chkHasLiveVisual.checked = false;

            obgState.sportsbook.event.events[eventId].hasLiveStreaming ?
                chkHasLiveStreaming.checked = true :
                chkHasLiveStreaming.checked = false;

            obgState.sportsbook.event.events[eventId].hasFastMarkets ?
                chkHasFastMarkets.checked = true :
                chkHasFastMarkets.checked = false;

            if (obgState.sportsbook.priceBoost.eventMap[eventId] !== undefined) {
                if (obgState.sportsbook.priceBoost.eventMap[eventId].length !== 0) {
                    chkHasPriceBoost.checked = true;
                }
            } else chkHasPriceBoost.checked = false;


            obgState.sportsbook.event.events[eventId].hasLiveStatistics ?
                chkHasLiveStatistics.checked = true :
                chkHasLiveStatistics.checked = false;

            obgState.sportsbook.event.events[eventId].hasBetBuilderLink ?
                chkHasBetBuilderLink.checked = true :
                chkHasBetBuilderLink.checked = false;

            obgState.sportsbook.event.events[eventId].prematchStatisticsProviders.length !== 0 ?
                chkHasPrematchStatistics.checked = true :
                chkHasPrematchStatistics.checked = false;
        }

        var eventPropertiesSection = document.getElementById("eventPropertiesSection");

        function listenerForEventButtonsOnly() {
            initEventPropertyCheckboxes();

            if (mockedEventPhase == undefined) {
                mockedEventPhase = getEventPhase();
            }

            eventLabel !== savedEventLabel ?
                eventPhase = getEventPhase() :
                eventPhase = mockedEventPhase;

            for (var button of eventPhaseButtons) {
                if (eventPhase === button.id.replace("btSetEventPhase", "")) {
                    inactivate(button);
                } else {
                    activate(button);
                }
            }

            if (!eventPropertiesSection.classList.contains("hide")) {
                switch (getEventPhase(eventId)) {
                    case "Live":
                        activate(hasLiveStreamingSection,
                            hasLiveStatisticsSection,
                            hasPriceBoostSection,
                            hasFastMarketsSection,
                            hasLiveVisualSection);
                        inactivate(hasBetBuilderLinkSection,
                            hasPrematchStatisticsSection);
                        break;
                    case "Prematch":
                        activate(hasBetBuilderLinkSection,
                            hasPrematchStatisticsSection,
                            hasLiveStreamingSection,
                            hasPriceBoostSection);
                        inactivate(hasLiveStatisticsSection,
                            hasFastMarketsSection,
                            hasLiveVisualSection);
                        break;
                    case "Over":
                        inactivate(hasBetBuilderLinkSection,
                            hasLiveStreamingSection,
                            hasPrematchStatisticsSection,
                            hasLiveStatisticsSection,
                            hasPriceBoostSection,
                            hasFastMarketsSection,
                            hasLiveVisualSection);
                        break;
                }
            }

            // carousel
            var notSupportedHere = "Not supported on this page";

            if ((isPageCardCapable() || isPageHomePage())) {
                activateAddToCarouselButton();
            } else {
                inactivate(addToCarouselButton);
                displayInRed(addToCarouselMessage);
                addToCarouselMessage.innerText = notSupportedHere;
            }

            function activateAddToCarouselButton() {
                activate(addToCarouselButton);
                addToCarouselMessage.innerText = addToCarouselMessage.textContent.replace(notSupportedHere, "");
            }
        }

        window.addToCarousel = () => {
            if (!isCarouselOrCardsDefined()) {
                obgState.sportsbook.carousel.item = {
                    "skeleton": {
                        "backgrounds": {},
                        "eventIds": [],
                        "marketTemplateIds": [
                            // "MW2W",
                            // "MW3W"
                        ],
                        "marketGroups": {}
                    },
                    "marketToDisplay": {}
                }
            }

            var carouselOrderDefined = isCarouselOrderDefined();
            var pageCardCapable = isPageCardCapable();

            if (lockedEventId !== undefined) {
                eventId = lockedEventId;
            }

            if (pageCardCapable) {
                var cardBackGround = getCardBackGround();
            }

            var item = obgState.sportsbook.carousel.item;
            var firstMarketTemplateId = getMarketTemplateIdOfFirstMarket();
            item.skeleton.eventIds[0] = eventId;
            item.marketToDisplay[eventId] = firstMarketTemplateId;
            if (pageCardCapable) {
                item.skeleton.backgrounds[eventId] = cardBackGround;
            }

            // making markets available on carousel if they are not by default
            var marketTemplateIds = item.skeleton.marketTemplateIds;
            // var firstMarketTemplateId = getMarketTemplateIdOfFirstMarket();
            if (!marketTemplateIds.includes(firstMarketTemplateId)) {
                marketTemplateIds.push(firstMarketTemplateId);
            }

            // for 3-column markets
            categoryId = getCategoryIdByEventId(eventId);
            if (isCategoryInUsFormat(categoryId) && !isEventTypeOutright(eventId)) {
                var threeColumnLayouts = getThreeColumnLayouts();
                if (threeColumnLayouts == undefined) {
                    show(addToCarouselErrorMessage);
                    // return;
                } else {
                    hide(addToCarouselErrorMessage);
                }
                item.skeleton.threeColumnLayouts = threeColumnLayouts;
            }

            if (carouselOrderDefined) {
                let indexOfEventInCarouselOrder = getIndexOfFirstEventInCarouselOrder();
                let carouselOrderElement = {
                    id: eventId,
                    sortOrder: indexOfEventInCarouselOrder,
                    type: "Event"
                }
                item.skeleton.carouselOrder[indexOfEventInCarouselOrder] = carouselOrderElement;
            }


            obgState.sportsbook.carousel.item = item;
            addToCarouselButtonLabel.innerText = "Added"
            triggerChangeDetection();

            setTimeout(function () {
                addToCarouselButtonLabel.innerText = "Add";
            }, 200);
        }

        function getIndexOfFirstEventInCarouselOrder() {
            let carouselOrder = obgState.sportsbook.carousel.item.skeleton.carouselOrder;
            for (let obj of carouselOrder) {
                if (obj.type == "Event") {
                    return obj.sortOrder;
                }
            }
            return carouselOrder.length;
        }

        function getCardBackGround() {
            var bgImageWidth, bgImageHeight, bgImageUrl;
            try {
                bgImageUrl = Object.values(obgState.sportsbook.carousel.item.skeleton.backgrounds)[0].url;
            } catch {
                bgImageUrl = getGoodEnoughImageUrl();
                // console.log("bgImageUrl: " + bgImageUrl);
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

        function getGoodEnoughImageUrl() {
            var images = Object.values(obgState.image.images.sportsbook);
            var categoryName = getCategoryTrackingLabel();
            // console.log("categoryName: " + categoryName);
            var platformName;
            DEVICE_TYPE === "Desktop" ? platformName = "desktop" : platformName = "mobile";
            var imageUrl, lowerCaseImageUrl, goodEnoughImageUrl;
            for (var image of images) {
                imageUrl = image.url;
                lowerCaseImageUrl = image.url.toLowerCase();
                if (lowerCaseImageUrl.includes(categoryName) && !lowerCaseImageUrl.includes("american-" + categoryName) && !lowerCaseImageUrl.includes("ncaa-" + categoryName)) {
                    goodEnoughImageUrl = imageUrl;
                    // console.log("categoryName imageUrl: " + goodEnoughImageUrl);
                    if (lowerCaseImageUrl.includes("card")) {
                        goodEnoughImageUrl = imageUrl;
                        // console.log("card imageUrl: " + imageUrl);
                        if (lowerCaseImageUrl.includes("platform")) {
                            goodEnoughImageUrl = imageUrl;
                            // console.log("platform imageUrl: " + imageUrl);
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
            // console.log(goodEnoughImageUrl);
            return goodEnoughImageUrl;
        }

        function getThreeColumnLayouts() {
            var eventTables = obgState.sportsbook.eventTable.eventTables;
            var eventIds;
            var marketTimeFrames;
            var timeFrame;
            var threeColumnLayouts;

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

        function isCarouselOrCardsDefined() {
            if (obgState.sportsbook.carousel.item != undefined) {
                return true;
            }
            return false;
        }
    }

    window.getSbIdForOddsManager = (entity) => {
        entity === 'event' ?
            window.open("http://sbtradingmappingmainapi.qa.bde.local/mapping/fixture/new/" + eventId) :
            window.open("http://sbtradingmappingmainapi.qa.bde.local/mapping/market/new/" + marketId);
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
        for (var element of elements) {
            element.classList.add("displayInGreen");
            element.classList.remove("displayInRed");
        }
    }

    function displayInRed(...elements) {
        for (var element of elements) {
            element.classList.add("displayInRed");
            element.classList.remove("displayInGreen");
        }
    }

    function hide(...elements) {
        for (var element of elements) {
            if (!element.classList.contains("hide")) {
                element.classList.add("hide");
            }
        }
    }

    function show(...elements) {
        for (var element of elements) {
            if (element.classList.contains("hide")) {
                element.classList.remove("hide");
            }
        }
    }

    function getMarketLabel(marketId) {
        if (marketId == null) {
            return NOT_FOUND;
        }
        marketLabel = obgState.sportsbook.eventMarket.markets[marketId].label;
        if (marketLabel === undefined) {
            marketLabel = obgState.sportsbook.eventMarket.markets[marketId].marketFriendlyName;
        }
        return marketLabel;
    }

    function getMarketTemplateId(marketId) {
        return obgState.sportsbook.eventMarket.markets[marketId].marketTemplateId;
    }

    function isCarouselOrderDefined() {
        return obgState.sportsbook.carousel.item.skeleton.carouselOrder != undefined
    }

    function getMarketTemplateIdOfFirstMarket() {
        return getMarketTemplateId(obgState.sportsbook.eventMarket.eventMap[eventId][0]);
        // return getMarketTemplateId(firstMarketId);
    }

    function isUserLoggedIn() {
        return obgState.auth.isAuthenticated;
    }

    function getLastMarketIdFromBetslip() {
        try {
            var markets = Object.values(getBetSlipByObgState().selections);
            var indexOfLastMarket = markets.length - 1;
            marketId = markets[indexOfLastMarket].marketId;
        } catch {
            marketId = null;
        }
        return marketId;
    }

    function getFirstMarketIdOfEvent(eventId) {
        return obgState.sportsbook.eventMarket.eventMap[eventId][0];
    }

    function getFirstSelectionIdOfMarket(marketId) {
        return obgState.sportsbook.selection.marketMap[marketId][0];
    }

    window.setMarketState = (state) => {
        setMarketState(state);
    }

    function setMarketState(state) {
        if (lockedMarketId !== undefined) {
            marketId = lockedMarketId;
        }
        // obgState.sportsbook.eventMarket.markets[marketId].status = state;
        switch (state) {
            case "Suspended":
                obgRt.setMarketStateSuspended(marketId);
                break;
            case "Open":
                obgRt.setMarketStateOpen(marketId);
                break;
            case "Void":
                obgRt.setMarketStateVoid(marketId);
                break;
            case "Settled":
                obgRt.setMarketStateSettled(marketId);
                break;
            case "Hold":
                obgRt.setMarketStateHold(marketId);
                break;
        }
    }

    window.createMarket = (marketType) => {
        let marketTemplateTagsArrayForPlayerPropsMarket = [14, 35, 41, 47, 53, 101, 104, 106];
        let marketTemplateTagsForFastMarket = [84, 6, 82, 85];
        if (isEventWidgetVisibleFor(eventId)) {
            show(createMarketFeatures);
            hide(createMarketErrorSection);
        } else {                
            show(createMarketErrorSection)
            hide(createMarketFeatures); 
            return;             
        }        
        
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


        let initialNumberOfMarketTabsOnEventPanel = getMarketTabsOnEventPanel().length;
        setTimeout(function () {
            let updatedMarketTabsOnEventPanel = getMarketTabsOnEventPanel();
            if (initialNumberOfMarketTabsOnEventPanel != updatedMarketTabsOnEventPanel.length) {
                updatedMarketTabsOnEventPanel[updatedMarketTabsOnEventPanel.length - 1].click();
            }
        }, 500);

        function getMarketTabsOnEventPanel() {
            return document.querySelector("[test-id='pinning']").parentElement.getElementsByClassName("obg-tab-label");
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
                        obgRt.createSelection(eventId, marketId, selectionId, selectionLabel);
                        obgRt.setSelectionOdds([{
                            msi: selectionId,
                            // o: i + k + j / 10 * 2
                            o: getRandomOdds()
                        }]);
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
        obgState.sportsbook.event.events[eventId].hasFastMarkets = value;
        triggerChangeDetection(eventId, 100);
    }

    function getBetSlipByObgState() {
        return obgState.sportsbook.betslip;
    }

    function getUsersCurrency() {
        return obgState.customer.customer.basicInformation.currencyCode;
    }

    window.submitScore = (participant) => {
        var scoreBoard = obgState.sportsbook.scoreboard[eventId];
        var participantId;
        var score;
        if (participant === "home") {
            participantId = scoreBoard.participants[0].id;
            score = document.getElementById("homeScoreInputField").value;
            setValues(participantId, Number(score));
        } else {
            participantId = scoreBoard.participants[1].id;
            score = document.getElementById("awayScoreInputField").value;
            setValues(participantId, score);
        }

        function setValues(participantId, score) {
            if (score !== "") {
                obgRt.setFootballParticipantScore(eventId, participantId, Number(score));
            }
        }
    }

    function triggerChangeDetection(eventId, delay) {
        if (eventId === undefined) {
            eventId = Object.values(obgState.sportsbook.event.events)[0].id;
        }
        if (delay === undefined) {
            delay = 0;
        }
        var currentEventPhase = obgState.sportsbook.event.events[eventId].phase;
        switch (currentEventPhase) {
            case "Live":
                obgRt.setEventPhaseOver(eventId);
                setTimeout(function () { obgRt.setEventPhaseLive(eventId); }, delay);
                break;
            case "Prematch":
                obgRt.setEventPhaseOver(eventId);
                setTimeout(function () { obgRt.setEventPhasePrematch(eventId); }, delay);
                break;
            case "Over":
                obgRt.setEventPhasePrematch(eventId);
                setTimeout(function () { obgRt.setEventPhaseOver(eventId); }, delay);
                break;
        }
    }

    window.submitScoreBoard = () => {
        if (lockedEventId !== undefined) {
            eventId = lockedEventId;
        }
        var scoreBoard = obgState.sportsbook.scoreboard[eventId];
        var homeId = scoreBoard.participants[0].id;
        var awayId = scoreBoard.participants[1].id;

        setValues("corners", homeId, document.getElementById("homeCorners").value);
        setValues("corners", awayId, document.getElementById("awayCorners").value);
        setValues("substitutions", homeId, document.getElementById("homeSubstitutions").value);
        setValues("substitutions", awayId, document.getElementById("awaySubstitutions").value);
        setValues("yellowCards", homeId, document.getElementById("homeYellowCards").value);
        setValues("yellowCards", awayId, document.getElementById("awayYellowCards").value);
        setValues("redCards", homeId, document.getElementById("homeRedCards").value);
        setValues("redCards", awayId, document.getElementById("awayRedCards").value);
        setValues("penalties", homeId, document.getElementById("homePenalties").value);
        setValues("penalties", awayId, document.getElementById("awayPenalties").value);

        function setValues(scoreBoardItem, participantId, value) {
            if (value !== "") {
                switch (scoreBoardItem) {
                    case "corners":
                        obgRt.setFootballParticipantCorners(eventId, participantId, Number(value));
                        break;
                    case "substitutions":
                        obgRt.setFootballParticipantSubstitutions(eventId, participantId, Number(value));
                        break;
                    case "yellowCards":
                        obgRt.setFootballParticipantYellowCards(eventId, participantId, Number(value));
                        break;
                    case "redCards":
                        obgRt.setFootballParticipantRedCards(eventId, participantId, Number(value));
                        break;
                    case "penalties":
                        obgRt.setFootballParticipantPenalties(eventId, participantId, Number(value));
                        break;
                }
            }
        }
    }

    window.getTwitchProviderIds = () => {
        var twitchResultSection = document.getElementById("twitchResults");
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
        var performResultSection = document.getElementById("performResults");
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
        var usersCurrency;
        var separatorArrow = "&NonBreakingSpace;&NonBreakingSpace;&#10132;&NonBreakingSpace;&NonBreakingSpace;"

        var acca;
        var accaCategoriesArray;
        var accaSelectionOddsLimitMin;
        var accaTotalOddsLimitMin;
        var accaMinStake;
        var accaMaxStake;
        previousAcca = null;
        var loginToSeeAcca = document.getElementById("loginToSeeAcca");
        var noAccaFound = document.getElementById("noAccaFound");
        var accaDetailsLayout = document.getElementById("accaDetailsLayout");
        var accaNameField = document.getElementById("accaNameField");
        var accaIdField = document.getElementById("accaIdField");
        var accaCategoriesSection = document.getElementById("accaCategoriesSection");
        var accaCategoriesSpan = document.getElementById("accaCategoriesSpan");
        var accaCompetitionsRow = document.getElementById("accaCompetitionsRow");
        var accaCompetitionsSpan = document.getElementById("accaCompetitionsSpan");
        var accaMarketTemplatesRow = document.getElementById("accaMarketTemplatesRow");
        var accaMarketTemplatesSpan = document.getElementById("accaMarketTemplatesSpan");
        var accaEventPhaseRow = document.getElementById("accaEventPhaseRow");
        var accaEventPhaseSpan = document.getElementById("accaEventPhaseSpan");
        var accaMinimumNumberOfSelectionsSpan = document.getElementById("accaMinimumNumberOfSelectionsSpan");
        var accaSelectionOddsLimitMinSpan = document.getElementById("accaSelectionOddsLimitMinSpan");
        var accaTotalOddsLimitMinRow = document.getElementById("accaTotalOddsLimitMinRow");
        var accaTotalOddsLimitMin = document.getElementById("accaTotalOddsLimitMin");
        var accaMinMaxStakeSpan = document.getElementById("accaMinMaxStakeSpan");


        var priceBoosts;
        previousPriceBoosts = null;
        var noPbFound = document.getElementById("noPbFound");
        var pbSelector = document.getElementById("pbSelector");
        var pbDetailsLayout = document.getElementById("pbDetailsLayout");
        var pbNumberOf = document.getElementById("pbNumberOf");
        var pbName = document.getElementById("pbName");
        var pbIdSpan = document.getElementById("pbIdSpan");
        var pbVisibility = document.getElementById("pbVisibility");
        var pbType = document.getElementById("pbType");
        var pbEventPhases = document.getElementById("pbEventPhases");
        var pbMinMaxStake = document.getElementById("pbMinMaxStake");
        var pbMinMaxOdds = document.getElementById("pbMinMaxOdds");
        var pbPathToCompetition = document.getElementById("pbPathToCompetition");
        var eventLabelForPbDiv = document.getElementById("eventLabelForPbDiv");
        var marketLabelForPbDiv = document.getElementById("marketLabelForPbDiv");
        var selectionLabelForPbDiv = document.getElementById("selectionLabelForPbDiv");
        var radioPbByName = document.getElementById("radioPbByName");
        var radioPbByEvent = document.getElementById("radioPbByEvent");

        var freeBets;
        previousFreeBets = null;
        var freeBetNotFound = document.getElementById("freeBetNotFound");
        var freeBetLogin = document.getElementById("freeBetLogin");
        var freeBetSelector = document.getElementById("freeBetSelector");
        var freeBetNumberOf = document.getElementById("freeBetNumberOf");
        var freeBetDetailsLayout = document.getElementById("freeBetDetailsLayout");
        var freeBetName = document.getElementById("freeBetName");
        var freeBetIdSpan = document.getElementById("freeBetIdSpan");
        var freeBetRestrictionsSection = document.getElementById("freeBetRestrictionsSection");
        var freeBetPathToCompetition = document.getElementById("freeBetPathToCompetition");
        var freeBetFurtherRestricions = document.getElementById("freeBetFurtherRestricions");
        var freeBetType = document.getElementById("freeBetType");
        var freeBetStake = document.getElementById("freeBetStake");
        var freeBetBetTypes = document.getElementById("freeBetBetTypes");
        var freeBetEvetPhases = document.getElementById("freeBetEvetPhases");
        var freeBetNoOfSelections = document.getElementById("freeBetNoOfSelections");


        intervalIdForPolling = setInterval(listenerForAccaDetails, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForPriceBoostDetails, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForFreeBetDetails, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForAccaDetails() {

            if (!isUserLoggedIn()) {
                show(loginToSeeAcca);
                hide(noAccaFound, accaDetailsLayout);
                return;
            } else {
                hide(loginToSeeAcca);
            }

            acca = obgState.sportsbook.betInsurance.selectedBetInsurance;
            if (acca === previousAcca) {
                if (acca === undefined) {
                    show(noAccaFound);
                }
                return;
            } else {
                previousAcca = acca;
            }

            if (acca === undefined) {
                show(noAccaFound);
                hide(accaDetailsLayout, loginToSeeAcca);
                return;
            } else {
                hide(loginToSeeAcca, noAccaFound);
                show(accaDetailsLayout);
                // accaMessage.innerText = "";
            }
            usersCurrency = getUsersCurrency();
            accaName = acca.name;
            accaNameField.innerText = accaName;
            accaId = acca.id;
            accaIdField.innerText = accaId;

            accaCategoriesArray = acca.criteria.criteriaEntityDetails;
            if (accaCategoriesArray.length == 0) {
                hide(accaCategoriesSection);
            } else {
                show(accaCategoriesSection);
                var categoryId;
                var categoryName;
                var categoryInSportCatalog;
                var categoryNames = [];
                var competitionCriteriaExists = false;
                var marketTemplateCriteriaExists = false;
                for (var i = 0; i < accaCategoriesArray.length; i++) {
                    categoryId = acca.criteria.criteriaEntityDetails[i].categoryId;
                    if (acca.criteria.criteriaEntityDetails[i].competitionId != undefined) {
                        competitionCriteriaExists = true;
                    }
                    if (acca.criteria.criteriaEntityDetails[i].marketTemplateIds != undefined) {
                        marketTemplateCriteriaExists = true;
                    }
                    categoryInSportCatalog = obgState.sportsbook.sportCatalog.categories[categoryId];
                    if (categoryInSportCatalog != undefined) {
                        categoryName = categoryInSportCatalog.label;
                        categoryNames.push(categoryName);
                    }
                }
                accaCategoriesSpan.innerText = String(categoryNames).replaceAll(",", ", ");
                if (!competitionCriteriaExists) {
                    hide(accaCompetitionsRow);
                } else {
                    show(accaCompetitionsRow);
                    accaCompetitionsSpan.innerText = "See restrictions in Trading Tools";
                }
                if (!marketTemplateCriteriaExists) {
                    hide(accaMarketTemplatesRow);
                } else {
                    show(accaMarketTemplatesRow);
                    accaMarketTemplatesSpan.innerText = "See restrictions in Trading Tools";
                }
            }

            var eventPhases = acca.criteria.eventPhases;
            if (eventPhases.length > 1) {
                hide(accaEventPhaseRow);
            } else {
                show(accaEventPhaseRow);
                accaEventPhaseSpan.innerText = acca.criteria.eventPhases;
            }

            accaMinimumNumberOfSelectionsSpan.innerText = acca.conditions.minimumNumberOfSelections;

            accaSelectionOddsLimitMin = acca.conditions.selectionOddsLimit.minOdds;
            accaTotalOddsLimitMin = acca.conditions.oddsLimit.minOdds;
            if (accaTotalOddsLimitMin <= accaSelectionOddsLimitMin) {
                hide(accaTotalOddsLimitMinRow);
            } else {
                show(accaTotalOddsLimitMinRow);
                accaTotalOddsLimitMinSpan.innerText = accaTotalOddsLimitMin.toFixed(2);
            }
            accaSelectionOddsLimitMinSpan.innerText = accaSelectionOddsLimitMin.toFixed(2);

            accaMinStake = acca.conditions.minimumStake;
            accaMaxStake = acca.conditions.maximumStake;
            accaMinMaxStakeSpan.innerText = accaMinStake + " - " + accaMaxStake + " " + usersCurrency;
        }

        function listenerForPriceBoostDetails() {
            priceBoosts = obgState.sportsbook.priceBoost.priceBoost;
            if (priceBoosts === previousPriceBoosts) {
                return;
            } else {
                previousPriceBoosts = priceBoosts;
            }

            if (JSON.stringify(priceBoosts) == "{}") {
                show(noPbFound);
                hide(pbDetailsLayout);
                return;
            } else {
                show(pbDetailsLayout);
                hide(noPbFound);
            }

            if (radioPbByName.checked) {
                listPriceBoostsBy("pbName");
            } else if (radioPbByEvent.checked) {
                listPriceBoostsBy("eventName");
            }
        }

        function populatePriceBoostSelector(byEntityName) {
            pbSelector.innerHTML = "";
            var option;
            var priceBoostsArray;
            if (byEntityName == "pbName") {
                priceBoostsArray = Object.values(priceBoosts).sort((a, b) => a.name > b.name ? 1 : -1);
            } else if (byEntityName == "eventName") {
                try {
                    priceBoostsArray = Object.values(priceBoosts).sort((a, b) => getEventDisplayLabel(a.criteria.criteriaEntityDetails[0].eventId) > getEventDisplayLabel(b.criteria.criteriaEntityDetails[0].eventId) ? 1 : -1);
                } catch {
                }
            }

            pbNumberOf.innerText = priceBoostsArray.length;

            for (var pb of priceBoostsArray) {
                option = document.createElement("option");
                if (byEntityName == "pbName") {
                    option.text = pb.name;
                } else if (byEntityName == "eventName") {
                    option.text = getEventDisplayLabel(pb.criteria.criteriaEntityDetails[0].eventId);
                }
                option.value = pb.id;
                pbSelector.appendChild(option);
            }
            selectPb(priceBoostsArray[0].id);
        }

        window.listPriceBoostsBy = (value) => {
            listPriceBoostsBy(value);
        }
        function listPriceBoostsBy(value) {
            if (value == "eventName") {
                populatePriceBoostSelector("eventName");
            } else {
                populatePriceBoostSelector("pbName");
            }
        }

        window.selectPb = (value) => {
            selectPb(value);
        }
        function selectPb(value) {
            let selectedPriceBoost = priceBoosts[value];
            priceBoostId = selectedPriceBoost.id;
            pbIdSpan.innerText = priceBoostId;
            pbName.innerText = selectedPriceBoost.name;
            pbVisibility.innerText = getPbVisibility();
            pbType.innerHTML = getPbType();
            pbEventPhases.innerText = getArrayAsCommaSeparatedString(selectedPriceBoost.criteria.eventPhases);

            let minMaxStake = getPbMinMaxStake();
            if (minMaxStake != "0") {
                pbMinMaxStake.innerText = minMaxStake + " " + getCurrencyForBonuses();
            } else {
                pbMinMaxStake.innerText = "---";
            }

            pbMinMaxOdds.innerText = selectedPriceBoost.conditions.oddsLimit.minOdds + " - " + selectedPriceBoost.conditions.oddsLimit.maxOdds;

            let pbEvent = selectedPriceBoost.criteria.criteriaEntityDetails[0];


            try {
                pbPathToCompetition.innerHTML =
                    getCategoryNameByEventId(pbEvent.eventId) + separatorArrow
                    + getRegionNameByEventId(pbEvent.eventId) + separatorArrow
                    + getCompetitionNameByEventId(pbEvent.eventId);
                eventLabelForPbDiv.innerHTML = getEventDisplayLabel(pbEvent.eventId);
                marketLabelForPbDiv.innerHTML = "&boxur;&HorizontalLine; " + getMarketLabel(pbEvent.marketId);
                selectionLabelForPbDiv.innerHTML = "&boxur;&HorizontalLine; " + getSelectionLabel(pbEvent.marketSelectionId);
                displayInGreen(pbPathToCompetition, eventLabelForPbDiv);
            } catch {
                displayInRed(pbPathToCompetition, eventLabelForPbDiv);
                pbPathToCompetition.innerHTML = "Couldn't fetch necessary data.<br>Please navigate to Price Boost lobby to fix this.<br>If it didn't help the related selection may not be open anymore while the API returned the boost for it regardless.";
                eventLabelForPbDiv.innerHTML = "---";
            }

            function getPbVisibility() {
                if (selectedPriceBoost.isPersonal) {
                    return "Personal";
                }
                return "Global";
            }

            function getPbType() {
                if (selectedPriceBoost.bonusData.type == "FixedOdds") {
                    let priceBoostedFormats = selectedPriceBoost.bonusData.priceBoostedFormats;
                    let priceBoostedOdds = priceBoostedFormats["1"];
                    let selectedPriceFormat = getSelectedOddsFormat();
                    if (selectedPriceFormat == "American") {
                        priceBoostedOdds = priceBoostedOdds + " (American: " + priceBoostedFormats["2"] + ")";
                    } else if (selectedPriceFormat == "Fractional") {
                        priceBoostedOdds = priceBoostedOdds + " (Fractional: " + priceBoostedFormats["3"] + ")";
                    }
                    return "Fixed Odds: " + priceBoostedOdds;
                }
                if (selectedPriceBoost.bonusData.type == "Multiplier") {
                    return "Percentage: " + selectedPriceBoost.bonusData.boostedOdds + "%";
                }
            }

            function getPbMinMaxStake() {
                let min = selectedPriceBoost.conditions.minimumStake;
                let max = selectedPriceBoost.conditions.maximumStake;
                if (min != max) {
                    return min + " - " + max;
                } return min;
            }

        }

        function listenerForFreeBetDetails() {
            if (!isUserLoggedIn()) {
                hide(freeBetNotFound, freeBetDetailsLayout);
                show(freeBetLogin);
                return;
            } else {
                hide(freeBetLogin);
            }
            freeBets = obgState.sportsbook.bonusStake.bonusStakes;
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
            freeBetStake.innerText = selectedFreebet.conditions.minimumStake + " " + getCurrencyForBonuses();
            freeBetBetTypes.innerText = getArrayAsCommaSeparatedString(selectedFreebet.conditions.betTypes);
            freeBetEvetPhases.innerText = getArrayAsCommaSeparatedString(selectedFreebet.criteria.eventPhases);
            freeBetNoOfSelections.innerText = getNumberOfSelections();

            function getFreeBetPathToCompetition() {
                let categoryId, categoryName, regionName, competitionId, competitionName, eventId;

                categoryId = selectedFreebet.criteria.criteriaEntityDetails[0].categoryId;
                categoryName = getCategoryNameById(categoryId);
                competitionId = selectedFreebet.criteria.criteriaEntityDetails[0].competitionId;
                if (competitionId != undefined) {
                    competitionName = getCompetitionNameById(competitionId);
                    regionName = getRegionNameByCompetitionId(competitionId);
                    eventId = selectedFreebet.criteria.criteriaEntityDetails[0].eventId;
                    if (eventId != undefined) {
                        show(freeBetFurtherRestricions);
                    } else {
                        hide(freeBetFurtherRestricions);
                    }
                    return categoryName + separatorArrow + regionName + separatorArrow + competitionName;
                } else {
                    hide(freeBetFurtherRestricions);
                    return categoryName;
                }
            }

            function getFreeBetType() {
                if (selectedFreebet.type == "FreeBet") {
                    return "Free Bet";
                } return "Risk Free Bet";
            }

            function getNumberOfSelections() {
                let min = selectedFreebet.conditions.minimumNumberOfSelections;
                let max = selectedFreebet.conditions.maximumNumberOfSelections;
                if (min != max) {
                    return min + " - " + max;
                }
                if (min != undefined) {
                    return min;
                } return "---"
            }
        }
    }

    function getCurrencyForBonuses() {
        if (isUserLoggedIn()) {
            return getUsersCurrency();
        } return "EUR"
    }

    function getSelectedOddsFormat() {
        return obgState.sportsbook.userSettings.settings.oddsFormat;
    }

    function getArrayAsAlphaBeticalCommaSeparatedString(arr) {
        return arr.sort((a, b) => (a > b) ? 1 : -1).toString().replaceAll(",", ", ");
    }

    function getArrayAsCommaSeparatedString(arr) {
        return arr.toString().replaceAll(",", ", ");
    }

    function getCategoryNameById(categoryId) {
        var categories = obgState.sportsbook.sportCatalog.menu.items;
        for (cat of categories) {
            if (cat.id == categoryId) {
                return cat.label;
            }
        }
    }

    function getRegionNameById(regionId) {
        var categories = obgState.sportsbook.sportCatalog.menu.items;
        var regions;
        for (cat of categories) {
            regions = cat.items;
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
        var categories = obgState.sportsbook.sportCatalog.menu.items;
        var regions, competitions;
        for (cat of categories) {
            regions = cat.items;
            if (regions != undefined) {
                for (reg of regions) {
                    competitions = reg.items;
                    if (competitions != undefined) {
                        for (comp of competitions) {
                            if (comp.id == competitionId) {
                                return reg.label;
                            }
                        }
                    }
                }
            }
        }
    }

    function getCompetitionNameById(competitionId) {
        var categories = obgState.sportsbook.sportCatalog.menu.items;
        var regions, competitions;
        for (cat of categories) {
            regions = cat.items;
            if (regions != undefined) {
                for (reg of regions) {
                    competitions = reg.items;
                    if (competitions != undefined) {
                        for (comp of competitions) {
                            if (comp.id == competitionId) {
                                return comp.label;
                            }
                        }
                    }
                }
            }
        }
    }

    window.initSegments = () => {

        if (brands == undefined) {
            var brandsUrl = "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/brands.json";
            var xhr = new XMLHttpRequest();
            xhr.open("GET", brandsUrl, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    brands = JSON.parse(xhr.responseText);
                    setIntervalForSegments();
                }
            }
            xhr.send();
        } else {
            if (intervalIdForPolling != undefined) {
                setIntervalForSegments();
            }
        }

        previousSegmentGuid = null;
        var segmentGuidSpan = document.getElementById("segmentGuidSpan");
        var segmentNameSpan = document.getElementById("segmentNameSpan");
        var segmentLegacyIdSpan = document.getElementById("segmentLegacyIdSpan");

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

        function getSegmentGuid() {
            return segmentGuid = obgState.sportsbook.segment.segmentGuid.toLowerCase();
        }

        function populateSegmentSelector() {
            var segments = getSegments(getLegacyBrandId());
            var segmentSelector = document.getElementById("segmentSelector");
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

        function getSegmentLegacyId() {
            for (var brand of brands) {
                var segments = brand.segments;
                for (var segment of segments) {
                    if (segment.id.toLowerCase() === segmentGuid) {
                        return segment.legacyId;
                    }
                }
            }
        }
    }

    window.changeSegmentGuid = () => {
        var fdSegmentGuid = document.getElementById("fdSegmentGuid");
        var newSegmentGuid = fdSegmentGuid.value;
        obgState.sportsbook.segment.segmentGuid = newSegmentGuid;
        fdSegmentGuid.value = "";
    }

    window.setSegmentGuid = (guid) => {
        obgState.sportsbook.segment.segmentGuid = guid;
        log("Segment in obgState changed to: " + guid);
    }

    function isPageCardCapable() {
        var pages = ["sportsbook.region", "sportsbook.competition", "sportsbook.category"];
        if (pages.includes(getCurrentRouteName())) {
            return true;
        } return false;
    }

    function isPageHomePage() {
        return getCurrentRouteName() === "sportsbook";
    }

    // var previousNoOfSbBanners, previousNoOfCrlBanners;
    window.initBanners = () => {
        stopPolling();
        var noOfSbBannersSpan = document.getElementById("noOfSbBanners");
        var noOfCrlBannersSpan = document.getElementById("noOfCrlBanners");
        var bannersMessage = document.getElementById("bannersMessage");
        var bannersFeatures = document.getElementById("bannersFeatures");
        var btCrlBannersMinus = document.getElementById("btCrlBannersMinus");
        var btSbBannersMinus = document.getElementById("btSbBannersMinus");
        var noOfSbBanners, noOfCrlBanners;
        var previousNoOfSbBanners, previousNoOfCrlBanners;

        intervalIdForPolling = setInterval(listenerForBanners, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForBanners() {
            if (!isPageHomePage()) {
                show(bannersMessage);
                hide(bannersFeatures);
                return;
            } else {
                hide(bannersMessage);
                show(bannersFeatures);
            }

            if (isCarouselOrderDefined()) {
                noOfCrlBanners = getNoOfCrlBanners();
            } else {
                noOfCrlBanners = obgState.sportsbook.carouselBanner.content.length
            }
            noOfSbBanners = obgState.sportsbook.sportsbookBanner.content.length;
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
            for (var page of obgState.sportsbook.carousel.item.skeleton.carouselOrder) {
                if (page.type == "Banner") { i++ }
            }
            return i;
        }

        window.removeSportsbookBanner = () => {
            obgState.sportsbook.sportsbookBanner.content.pop();
            var banners = obgState.sportsbook.sportsbookBanner.content;
            obgState.sportsbook.sportsbookBanner.content = [];
            for (var banner of banners) {
                obgState.sportsbook.sportsbookBanner.content.push(banner);
            };
            triggerChangeDetection();
        }

        var sbBannerCounter = 1;
        var sbBannerBgImageCounter = 1;
        var sbBannerBgFileName;
        var sbBannerBgWidth;
        window.addSportsbookBanner = () => {
            var banners = obgState.sportsbook.sportsbookBanner.content;

            if (DEVICE_TYPE.includes("Mobile")) {
                sbBannerBgFileName = "sb.banner.mobile.1024x60-";
                sbBannerBgWidth = 1024;
            } else {
                sbBannerBgFileName = "sb.banner.desktop.1920x60-"
                sbBannerBgWidth = 1920;
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
                "description": "This is the description part of the Sportsbook Banner.",
                "termsAndConditionsDescription": "",
                "termsAndConditionsApply": false,
                "url": "https://en.wikipedia.org/wiki/Banner"
            }
            obgState.sportsbook.sportsbookBanner.content = [];
            obgState.sportsbook.sportsbookBanner.content.push(newBanner);
            for (var banner of banners) {
                obgState.sportsbook.sportsbookBanner.content.push(banner);
            }
            sbBannerCounter++;
            sbBannerBgImageCounter++;
            triggerChangeDetection();
        }

        var crlBannerCounter = 1;
        var crlBgImageCounter = 1;
        var crlBannerKey;
        var crlBannerBgFileName;
        var crlBannerBgWidth;
        var crlBannerBgHeight;
        var crlBannerTarget;
        var chkCrlBannerOverlay = document.getElementById("chkCrlBannerOverlay");
        var imageOverlay = false;
        window.addCarouselBanner = () => {
            chkCrlBannerOverlay.checked ? imageOverlay = true : imageOverlay = false;
            var banners = obgState.sportsbook.carouselBanner.content;
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

            var newBanner = {
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
            obgState.sportsbook.carouselBanner.content = [];
            obgState.sportsbook.carouselBanner.content.push(newBanner);
            for (var banner of banners) {
                obgState.sportsbook.carouselBanner.content.push(banner);
            }
            crlBannerCounter++;
            crlBgImageCounter++;

            if (isCarouselOrderDefined()) {
                var nextIndexOfCarouselOrder = obgState.sportsbook.carousel.item.skeleton.carouselOrder.length;
                var banner = {
                    "id": crlBannerKey,
                    "sortOrder": nextIndexOfCarouselOrder,
                    "type": "Banner"
                }
                obgState.sportsbook.carousel.item.skeleton.carouselOrder[nextIndexOfCarouselOrder] = banner;
            }
            triggerChangeDetection();
        }

        window.removeCarouselBanner = () => {
            if (isCarouselOrderDefined()) {
                let carouselOrder = obgState.sportsbook.carousel.item.skeleton.carouselOrder;
                for (let i = 0; i < carouselOrder.length; i++) {
                    if (carouselOrder[i].type == "Banner") {
                        carouselOrder.splice(i, 1);
                        break;
                    }
                    carouselOrder[i].sortOrder = i;
                }
                obgState.sportsbook.carousel.item.skeleton.carouselOrder = carouselOrder;
            } else {
                obgState.sportsbook.carouselBanner.content.pop();
                var banners = obgState.sportsbook.carouselBanner.content;
                obgState.sportsbook.carouselBanner.content = [];
                for (var banner of banners) {
                    obgState.sportsbook.carouselBanner.content.push(banner);
                };
            }
            triggerChangeDetection();
        }
    }



    window.openInTradingTools = (entity) => {
        var serviceInstanceId = "a541c52d-f9c9-429e-80ac-79019ec525e6";
        var ttBaseUrl;
        var ttPath;
        ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD" ?
            ttBaseUrl = "https://tradingtools.ble.local/" :
            ttBaseUrl = "https://tradingtools.qa.bde.local/";
        if (isBonusSystemUs()) {
            serviceInstanceId = "3f31b226-2fcc-4497-a40a-2f958c205a13"
        }
        switch (entity) {
            case "acca":
                ttPath = "bonus/" + accaId + "?serviceInstanceId=" + serviceInstanceId;
                break;
            case "priceBoost":
                ttPath = "bonus/" + priceBoostId + "?serviceInstanceId=" + serviceInstanceId;
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
            case "segmentGuidWiki":
                url = "https://edgebravo.corpsson.com/display/OSB/SB+Segment+GUIDs";
                break;
        }
        window.open(url)
    }
})();