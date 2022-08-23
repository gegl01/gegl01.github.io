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

    var btNativeOtherCollection = document.getElementsByClassName("accordion");
    var accHeadCollection = document.getElementsByClassName("accHeading");
    var eventId, lockedEventId;
    var previousEventId, previousEventLabel, previousMarketId, previousSelectionLabel, previousAcca;
    var eventLabel, savedEventLabel;
    var mockedEventPhase;
    var marketId, lockedMarketId, marketLabel, marketTemplateId, marketTemplateTag;
    var selectionId, lockedSelectionId, selectionLabel;
    var detectionResultText;
    var initialOdds, lockedInitialOdds;
    var accaName, accaIdToLookupInTradingTools;
    var segmentGuid, previousSegmentGuid, segmentName;
    var intervalIdForPolling;
    var intervalIdsForPolling = [];
    var previousIframeURL;
    var brands;
    var routes;
    var betBuilderEvents, previousBetBuilderEvents = [];


    // const IS_UNSECURE_HTTP = isUnsecureHTTP();
    const SB_TOOL_VERSION = "v1.4.2";
    const IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED = isExposed("obgClientEnvironmentConfig");
    const DEVICE_TYPE = getDeviceType();
    const DEVICE_EXPERIENCE = getDeviceExperience();
    const ENVIRONMENT = getEnvironment();
    const IS_B2B = isB2B();
    const BRAND_NAME = getBrandName();
    const BROWSER_VERSION = getBrowserVersion();
    const OBG_VERSION = getObgVersion();
    const NOT_FOUND = "Not found.";
    const IS_OBGRT_EXPOSED = isExposed("obgRt");
    const IS_OBGSTATE_EXPOSED = isExposed("obgState");
    const IS_SPORTSBOOK_IN_IFRAME = isSportsbookInIframe();
    // const IS_LOCALHOST_WITH_PROD = !(IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED && IS_OBGSTATE_EXPOSED);
    const POLLING_INTERVAL = 100;

    // cleanupSearchParams("configOverride");
    initHeader();
    initAccordions();
    initContext();
    initDeviceTypeDependent();
    checkEnabledFeatures();

    function createWindow() {
        document.body.appendChild(sportsbookTool);
        var htmlContent =
            '<div id="sportsbookToolHeader"><div id="sportsbookToolHeaderTitle"><div id="sportsbookToolNameRow"><span id="sportsbookToolName"><span id="sportsbookToolNameLeft">sportsbook</span><span id="sportsbookToolNameRight">tool</span></span><span id="sportsbookToolVersion"></span></div><div id="sportsbookToolAuthorName">by gegl01@betssongroup.com</div></div><div id="sportsbookToolHeaderButtonRow" class="floatRight"><button id="btZoomInOut" class="sportsbookToolHeaderButtons" onclick="zoomInOut()"><img id="iconZoomInOut" class="iconZoomOut iconHeader"></button><button id="btMinimizeClosed" class="sportsbookToolHeaderButtons" onclick="toggleClosedAccordionsVisibility()"><img id="iconMinimizeClosed" class="iconMinimize iconHeader"></button><button id="btClose" class="sportsbookToolHeaderButtons" onclick="closePopup()"><img class="iconClose iconHeader"></button></div></div><div id="sportsbookToolContent"><div id="sbToolsContext" class="accordion open"><button id="contextAccordion" class="accHeading" onclick="initContext()">Context<span id="limitedFunctionsMessage"></span></button><div class="accContent"><div id="obgStateAndRtSection" class="hide"><div id="obgStateAndRtRow" class="resolveLimitationRow">Enable obgState and obgRt<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("exposeObgStateAndRt")\'><span>Enable</span></button></div><hr class="hRule"></div><div id="openIframeSection" class="hide"><div id="openIframeRow" class="resolveLimitationRow">Open Sportsbook iframe<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("openIframe")\'>SB iframe</button></div><div class="twoItemsJustified"><div id="iframeUrlValue" class="displayInGreen sportsbookLink width100percent"></div><button class="btCopy btIcon" id="btIframeUrl" onclick=\'copyToClipboard("iframeURL")\'><img class="iconCopy"></button></div><hr class="hRule"></div><div class="contextLayout"><div class="displayFlex"><span class="keyForContext">Environment:</span><span class="valueForContext" id="environment"></span></div><div class="displayFlex"><span class="keyForContext">Device Type:</span><span class="valueForContext" id="deviceType"></span></div><div class="displayFlex"><span class="keyForContext">Brand:</span><span class="valueForContext twoItemsJustified"><span id="brandName"></span><span><button class="btCopy btIcon" onclick=\'copyToClipboard("brand")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForContext">Browser:</span><span class="valueForContext twoItemsJustified"><span id="browserVersion"></span><span><button class="btCopy btIcon" onclick=\'copyToClipboard("browserVersion")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForContext">App Version:</span><span class="valueForContext twoItemsJustified"><span id="obgVersion"></span><span><button class="btCopy btIcon" onclick=\'copyToClipboard("obgVersion")\'><img class="iconCopy"></button></span></span></div><button onclick=\'toggleSection("contextUtilities")\' class="moreLess">Extras</button><div id="contextUtilities" class="marginTop10px hide"><div class="twoItemsJustified"><span class="width95Percent"><span class="keyColumnForExtras">Jira QA Table</span><span class="displayInLightGrey">from the above data</span></span><button class="btCopy btIcon" id="btCreateJiraTable" onclick=\'copyToClipboard("jiraTemplate")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><span class="width95Percent"><span class="keyColumnForExtras">Deep Link</span><span class="displayInLightGrey">of the actual page & slip</span></span><button class="btCopy btIcon" id="btCreateDeepLink" onclick=\'copyToClipboard("deepLink")\'><img class="iconCopy"></button></div><div id="postMessageRow" class="twoItemsJustified hide"><span class="width95Percent"><span class="keyColumnForExtras">PostMessage</span><span class="displayInLightGrey">routeChangeIn in native</span></span><button class="btCopy btIcon" id="btCreatePostMessage" onclick=\'copyToClipboard("postMessage")\'><img class="iconCopy"></button></div><div id="disableCacheRow" class="twoItemsJustified"><span class="width95Percent"><span class="keyColumnForExtras">Disable Cache</span><span class="displayInLightGrey">with page reload</span></span><button class="btDisable btIcon" onclick=\'reloadPageWithFeature("disableCache")\'><img class="iconDisable"></button></div><div id="disableSSRRow" class="twoItemsJustified"><span class="width95Percent"><span class="keyColumnForExtras">Disable SSR</span><span class="displayInLightGrey">with page reload</span></span><button class="btDisable btIcon" onclick=\'reloadPageWithFeature("disableSSR")\'><img class="iconDisable"></button></div><div id="disableGeoFencingRow" class="twoItemsJustified"><span class="width95Percent"><span class="keyColumnForExtras">Disable GeoFencing</span><span class="displayInLightGrey">for Betsson ArBa login</span></span><button class="btDisable btIcon" onclick=\'reloadPageWithFeature("disableGeoFencing")\'><img class="iconDisable"></button></div></div></div></div></div><div id="sbToolsSegments" class="accordion closed"><button id="segmentsAccordion" class="accHeading" onclick="initSegments()"><span class="accordionTitle">Segment</span><span class="accordionHint">Get/Set SegmentGuid</span></button><div class="accContent"><div class="marginBottom10px"><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">Name:</span><span id="segmentNameSpan" class="displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentName")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">Guid:</span><span id="segmentGuidSpan" class="displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentGuid")\'><img class="iconCopy"></button></div></div><button onclick=\'toggleSection("segmentChangers")\' class="moreLess">Set Segment</button><div id="segmentChangers" class="hide"><div class="segmentChangeSectionHint">Partially useful features, no data refresh triggered on change</div><div>New Segment</div><select id="segmentSelector" onchange="setSegmentGuid(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div>Enter Segment Guid manually</div><div class="twoItemsJustified"><input id="fdSegmentGuid" class="fdSbTools width100percent height20px"><button class="btSimple btSubmit" onclick="changeSegmentGuid()">Set</button></div><div class="checkBoxRowToRight marginTop5px"><span>Open list of existing SegmentGuids</span><button class="btOpenInNewWindow btIcon chkInline" onclick=\'openInNewWindow("segmentGuidWiki")\'><img class="iconOpenInNewWindow"></button></div></div></div></div><div id="sbToolsEvent" class="accordion closed"><button id="eventAccordion" class="accHeading" onclick="initSbToolsEvent()"><span class="accordionTitle">Event</span><span class="accordionHint">Set Phase, Carousel/Cards, Override Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsEvent">Detected event:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsEventInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="eventLabelForSbToolsEvent"></div><div id="lockEventSectionForSbToolsEvent" class="lockSection hide">Lock <input type="checkbox" id="chkLockEventForSbToolsEvent" class="chkLock chkSbTools" onclick=\'lockEvent("SbToolsEvent")\'></div></div><div id="eventFeaturesSection" class="hide"><div><button onclick=\'toggleSection("eventDetailsSection")\' class="moreLess">Event Details</button><div id="eventDetailsSection" class="marginTopBottom10px hide"><div class="displayFlex"><span class="keyForEventDetails">Event ID:</span><span class="valueForEventDetails twoItemsJustified"><span id="eventIdForEventDetails" class="displayInGreen"></span><span><button class="btCopy btIcon" id="btCopyEventId" onclick=\'copyToClipboard("eventId")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Start Date:</span><span id="startDateForEventDetails" class="valueForEventDetails displayInGreen"></span></div><div class="displayFlex"><span class="keyForEventDetails">Category:</span><span class="valueForEventDetails twoItemsJustified displayInGreen"><span id="categoryForEventDetails"></span><span id="categoryIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Region:</span><span class="valueForEventDetails twoItemsJustified displayInGreen"><span id="regionForEventDetails"></span><span id="regionIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Competition:</span><span class="valueForEventDetails twoItemsJustified displayInGreen"><span id="competitionForEventDetails"></span><span id="competitionIdForEventDetails"></span></span></div><hr class="hRule"><div id="sbEventIdForOddsManagerSection" class="twoItemsJustified"><span class="width95Percent">Get Event ID for Odds Manager & LOM</span><button class="btIcon btOpenInNewWindow" onclick=\'getSbIdForOddsManager("event")\'><img class="iconOpenInNewWindow"></button></div><div class="twoItemsJustified"><span class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></span><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("event")\'><img class="iconOpenInNewWindow"></button></div></div><div><button onclick=\'toggleSection("renameEventSection")\' class="moreLess">Rename Event/Participants</button><div id="renameEventSection" class="marginTopBottom10px hide"><div id="renameParticipantLabelSection"><div>Participant:<span class="accordionHint">displayed for normal Matches</span></div><select id="participantSelector" onchange="selectParticipant(value)" class="comboSbTools width100percent height20px"></select><div class="twoItemsJustified marginTop5px"><span contenteditable="true" id="fdRenameParticipantLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setParticipantLabel()"><img class="width16px iconSubmit"></button></div></div><div class="marginTop10px">Label:<span class="accordionHint">displayed for Outrights, Boosts Page</span></div><div class="twoItemsJustified"><span contenteditable="true" id="fdRenameEventLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setEventLabel()"><img class="width16px iconSubmit"></button></div></div></div><div><button onclick=\'toggleSection("setEventPhaseSection")\' class="moreLess">Set Event Phase</button><div id="setEventPhaseSection" class="marginTopBottom10px hide"><div id="setEventPhaseButtonsLayout"><button id="btSetEventPhaseLive" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Live")\'><span class="ico-live-betting iconOnBtSimple"></span><span class="labelOnBtSimple">Live</span></button><button id="btSetEventPhasePrematch" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Prematch")\'><span class="ico-starting-soon iconOnBtSimple"></span><span class="labelOnBtSimple">Prematch</span></button><button id="btSetEventPhaseOver" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Over")\'><span class="ico-event-ended iconOnBtSimple"></span><span class="labelOnBtSimple">Over</span></button></div><div class="checkBoxRowToRight"><span>\'Over\' suspends all markets</span><input type="checkbox" class="chkInline" id="chkSuspendAllMarkets"></div></div></div><div><button onclick=\'toggleSection("addToCarouselSection")\' class="moreLess">Add to Carousel/Cards</button><div id="addToCarouselSection" class="hide marginTopBottom10px"><div id="carouselButtonsDiv"><div class="twoItemsJustified"><span>Add event to Carousel or Cards</span><span id="appendToCarouselSpan"><span>Append</span><input type="checkbox" id="chkAppendToCarousel" class="chkInline chkSbTools"></span></div><div class="marginTop5px"><button class="btSimple btCarousel" id="btAddToCarousel" onclick="addToCarousel()"><span class="labelOnBtSimple">Add</span></button><span id="addToCarouselMessage"></span></div><div id="addToCarouselErrorMessage" class="displayInRed infoMessage hide">Could not get data for 3-column layout.<br>If the slide/card is 3-column layout, please remove the detected event from the slip/event panel, then add again.</div></div></div></div><div><button onclick=\'toggleSection("eventPropertiesSection")\' class="moreLess">Override Event Properties</button><div id="eventPropertiesSection" class="marginTopBottom10px hide"><div class="marginBottom5px">Has effect on icons and event panel tabs</div><div id="hasBetBuilderLinkSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-bet-builder iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Bet Builder Link</span></span><input type="checkbox" onclick=\'toggleEventProperty("betBuilderLink")\' id="chkHasBetBuilderLink" class="chkSbTools"></div><div id="hasPriceBoostSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-price-boost iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Price Boost (not for US 3-Column)</span></span><input type="checkbox" onclick=\'toggleEventProperty("priceBoost")\' id="chkHasPriceBoost" class="chkSbTools"></div><div id="hasFastMarketsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-action-betting iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Fast Markets</span></span><input type="checkbox" onclick=\'toggleEventProperty("fastMarkets")\' id="chkHasFastMarkets" class="chkSbTools"></div><div id="hasLiveVisualSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-visual iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Visual</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveVisual")\' id="chkHasLiveVisual" class="chkSbTools"></div><div id="hasLiveStreamingSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-live-streaming iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Streaming</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStreaming")\' id="chkHasLiveStreaming" class="chkSbTools"></div><div id="hasPrematchStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-stats-prematch iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Prematch Statistics</span></span><input type="checkbox" onclick=\'toggleEventProperty("prematchStatistics")\' id="chkHasPrematchStatistics" class="chkSbTools"></div><div id="hasLiveStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-stats-prematch iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Statistics</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStatistics")\' id="chkHasLiveStatistics" class="chkSbTools"></div></div></div></div><div id="sbToolsEventInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Event detection order:<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol></div></div></div></div><div id="sbToolsMarket" class="accordion closed"><button id="marketAccordion" class="accHeading" onclick="initSbToolsMarket()"><span class="accordionTitle">Market</span><span class="accordionHint">Set Status, Override Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsMarket">Detected market:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsMarketInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="marketLabelForSbToolsMarket"></div><div id="lockMarketSection" class="lockSection hide">Lock <input type="checkbox" id="chkLockMarket" class="chkLock chkSbTools" onclick="lockMarket()"></div></div><div id="marketFeatures" class="hide"><button onclick=\'toggleSection("marketDetailsSection")\' class="moreLess">Market Details</button><div id="marketDetailsSection" class="marginTopBottom10px hide"><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="marketIdForSbToolsMarket" class="labelRow"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketId")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">Template ID:</span><span id="marketTemplateIdForSbToolsMarket" class="labelRow"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketTemplateId")\'><img class="iconCopy"></button></div><hr class="hRule"><div id="sbMarketIdForOddsManagerSection" class="twoItemsJustified"><span id="sbIdForOddsManager" class="width95Percent">Get Market ID for Odds Manager</span><button class="btIcon btOpenInNewWindow" onclick=\'getSbIdForOddsManager("market")\'><img class="iconOpenInNewWindow"></button></div><div class="twoItemsJustified"><span class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></span><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("market")\'><img class="iconOpenInNewWindow"></button></div></div><button onclick=\'toggleSection("marketStatusSection")\' class="moreLess">Market Status</button><div id="marketStatusSection" class="hide"><div id="setMarketStateButtonsSection" class="setMarketStateLayout marginTopBottom10px"><button class="btSimple btSetMarketState" id="btSetMarketStateSuspended" onclick=\'setMarketState("Suspended")\'>Suspd.</button><button class="btSimple btSetMarketState" id="btSetMarketStateOpen" onclick=\'setMarketState("Open")\'>Open</button><button class="btSimple btSetMarketState" id="btSetMarketStateVoid" onclick=\'setMarketState("Void")\'>Void</button><button class="btSimple btSetMarketState" id="btSetMarketStateSettled" onclick=\'setMarketState("Settled")\'>Settled</button><button class="btSimple btSetMarketState" id="btSetMarketStateHold" onclick=\'setMarketState("Hold")\'>Hold</button></div></div><button onclick=\'toggleSection("marketPropertiesSection")\' class="moreLess">Override Market Properties</button><div id="marketPropertiesSection" class="marginTopBottom10px hide"><div id="isCashoutAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-cash-stack iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Cash Out Available (not for US 3-Column)</span></span><input type="checkbox" onclick=\'toggleMarketProperty("cashoutAvailable")\' id="chkIsCashoutAvailable" class="chkSbTools"></div></div></div><div id="sbToolsMarketInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Market detection: parent market of the last selection from betslip.</div></div></div><div id="sbToolsSelection" class="accordion closed"><button id="changeOddsAccordion" class="accHeading" onclick="initChangeOdds()"><span class="accordionTitle">Selection</span><span class="accordionHint">Change Odds</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsSelection">Detected selection:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsSelectionInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="selectionLabelForSbToolsSelection"></div><div id="lockSelectionSection" class="hide lockSection">Lock <input type="checkbox" id="chkLockSelection" class="chkLock chkSbTools verticalAlignMiddle" onclick="lockSelection()"></div></div><div id="changeOddsFeatures" class="hide"><hr class="hRule"><div><div>Selection ID:</div><div class="twoItemsJustified"><span id="selectionIdForSbToolsSelection" class="labelRow displayInGreen width95Percent"></span><button class="btCopy btIcon" onclick=\'copyToClipboard("selectionId")\'><img class="iconCopy"></button></div></div><div id="newOddsRow" class="newOddsLayout"><label for="newOdds">New Odds:</label><input class="fdSbTools" type="number" id="newOdds" min="1" step="0.01" oninput=\'validity.valid||(value="")\'><button class="btSimple btSubmit" onclick="changeOdds()">Set</button></div></div><div id="sbToolsSelectionInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol"> Selection detection: Last selection from betslip</div></div></div><div id="sbToolsCreateMarket" class="accordion closed"><button id="createMarketAccordion" class="accHeading" onclick="initCreateMarket()">Create Fast/PlayerProps Market</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForCreateMarket">Detected event:</div><button class="btInfo btIcon" onclick=\'toggleInfo("createMarketInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="eventLabelForCreateMarket"></div><div></div></div><div id="createMarketFeatures" class="hide"><button onclick=\'toggleSection("createPlayerPropsSection")\' class="moreLess">Create Player Props</button><div id="createPlayerPropsSection" class="marginTopBottom10px hide"><div class="createMarketLayout"><button class="btSimple playerProps" id="btCreatePlayerPropsMarket" onclick=\'createMarket("playerProps")\'>4 selections</button><div class="buttonLabelToRight" id="playerPropsMessage"></div><button class="btSimple playerProps" id="btCreatePlayerPropsDummyMarket" onclick=\'createMarket("playerPropsDummy")\'>15 dummy selections</button><div></div></div></div><button onclick=\'toggleSection("createFastMarketSection")\' class="moreLess"><span class="ico-action-betting iconOnBtSimple"></span><span>Create Fast Market</span></button><div id="createFastMarketSection" class="marginTopBottom10px hide"><div class="infoMessage">Football, Tennis, Table Tennis, Ice Hockey</div><div class="createMarketLayout"><button class="btSimple" id="btCreateFastMarket" onclick=\'createMarket("fast")\'><span class="ico-action-betting iconOnBtSimple"></span><span class="labelOnBtSimple">Create</span></div></div></div><div id="createMarketInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Event detection: Open event panel</div></div></div><div id="sbToolsScoreBoard" class="accordion closed"><button id="scoreBoardAccordion" class="accHeading" onclick="initScoreBoard()">Football Scoreboard</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForScoreBoard">Detected event:</div><button class="btInfo btIcon" onclick=\'toggleInfo("scoreBoardInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="eventLabelForScoreBoard"></div><div id="lockEventSectionForScoreBoard" class="hide lockSection">Lock <input type="checkbox" id="chkLockEventForScoreBoard" class="chkLock chkSbTools" onclick=\'lockEvent("ScoreBoard")\'></div></div><div id="notFootballScoreBoardMessage" class="hide displayInRed"><hr class="hRule">Not having Football Scoreboard</div><div id="scoreBoardFeatures" class="hide"><div id="scoreBoardScores" class="scoreLayout"><div id="homeScoreLabel"><span class="ico-score vertMiddle marginRight2px"></span>Home Score</div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="homeScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("home")\'>Set</button><div id="awayScoreLabel"><span class="ico-score vertMiddle marginRight2px"></span>Away Score</div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="awayScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("away")\'>Set</button></div><div id="scoreBoardDetails"><div class="scoreBoardLayout"><div class="iconScoreboard ico-corner"></div><div class="iconScoreboard ico-substitutions"></div><div class="iconScoreboard outlinedText ico-referee-card obg-scoreboard-football-icon-yellow-card"></div><div class="iconScoreboard outlinedText ico-referee-card obg-scoreboard-football-icon-red-card"></div><div class="iconScoreboard ico-penalty"></div><input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeSubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homePenalties" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awaySubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayPenalties" min="0" oninput=\'validity.valid||(value="")\'></div><button id="submitScoreBoard" class="btSubmit btSimple" onclick="submitScoreBoard()">Set</button></div></div><div id="scoreBoardInfo" class="hide"><img class="iconInfoSymbol">Event detection order (with Football Scoreboard):<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol></div></div></div><div id="sbToolsAccaDetails" class="accordion closed"><button id="accaDetailsAccordion" class="accHeading" onclick="initAccaDetails()">ACCA Insurance Details</button><div class="accContent"><div id="accaMessage" class="displayInRed"><div id="loginToSeeAcca">Login to see ACCA</div><div id="noAccaFound">No active ACCA insurance found</div></div><div id="accaDetailsLayout" class="hide"><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">Name:</span><span id="accaNameField" class="accaValueColumn displayInGreen"></span></span><button class="btCopy btIcon" id="btAccaName" onclick=\'copyToClipboard("accaName")\'><img class="iconCopy"></button></div><div class="twoItemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="accaId" class="accaValueColumn displayInGreen"></span></span><button class="btCopy btIcon" id="btCopyAccaId" onclick=\'copyToClipboard("accaId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px twoItemsJustified"><span class="width95Percent">Open in<span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span><span>(ex-Trading Tools)</span></span><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("acca")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="accaCategoriesSection"><div id="accaCategoriesRow" class="displayFlex"><span class="marginRight5px">Categories:</span><span id="accaCategories" class="displayInGreen"></span></div><div id="accaCompetitionsRow"><span class="marginRight5px">Competitions:</span><span id="accaCompetitions" class="displayInLightGrey"></span></div><div id="accaMarketTemplatesRow"><span class="marginRight5px">Market Templates:</span><span id="accaMarketTemplates" class="displayInLightGrey"></span></div><hr class="hRule"></div><div id="accaEventPhaseRow"><span class="marginRight5px">Event Phase:</span><span id="accaEventPhase" class="displayInGreen"></span></div><div><span class="marginRight5px">Min Number of Selections:</span><span id="accaMinimumNumberOfSelections" class="displayInGreen"></span></div><div><span class="marginRight5px">Min Selection Odds:</span><span id="accaSelectionOddsLimitMin" class="displayInGreen"></span></div><div id="accaTotalOddsLimitMinRow"><span class="marginRight5px">Min Total Odds:</span><span id="accaTotalOddsLimitMin" class="displayInGreen"></span></div><hr class="hRule"><div id="accaMinimumStakeRow"><span class="marginRight5px">Min Stake:</span><span id="accaMinimumStake" class="displayInGreen"></span></div><div id="accaMaximumStakeRow"><span class="marginRight5px">Max Stake:</span><span id="accaMaximumStake" class="displayInGreen"></span></div></div></div></div><div id="sbToolsBanners" class="accordion closed"><button id="bannersAccordion" class="accHeading" onclick="initBanners()">Banners</button><div class="accContent"><div id="bannersMessage" class="displayInRed hide">Current page is not Sportsbook Home</div><div id="bannersFeatures" class="hide"><div class="bannersRow"><span class="keyColumnForBanners">Carousel Banners</span><span><button id="btCrlBannersMinus" class="btPlusMinus btIcon" onclick="removeCarouselBanner()"><img class="iconMinus"></button></span><span id="noOfCrlBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addCarouselBanner()"><img class="iconPlus"></button></span><span class="floatRight">Overlay<input type="checkbox" id="chkCrlBannerOverlay" class="chkInline"></span></div><div class="bannersRow"><span class="keyColumnForBanners">Sportsbook Banners</span><span><button id="btSbBannersMinus" class="btPlusMinus btIcon" onclick="removeSportsbookBanner()"><img class="iconMinus"></button></span><span id="noOfSbBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addSportsbookBanner()"><img class="iconPlus"></button></span></div></div></div></div><div id="sbToolsNative" class="accordion closed"><button id="nativeAccordion" class="accHeading" onclick="initNativeApp()"><span class="accordionTitle">Native App</span><span class="accordionHint">Navigate by postMessages</span></button><div class="accContent"><div class="nativeDetectedEventLayout"><div><div>Detected event from the slip:</div><div class="labelRow" id="eventLabelForNative"></div></div><button id="btOpenEventOnNative" class="btSimple" onclick="openEventOnNative()"><div class="ico-maximize-event iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">OPEN</div></button></div><hr class="hRule"><div id="noRoutesError" class="displayinRed extraCondensed hide"><hr class="hRule">\'obgClientEnvironmentConfig.startupContext.routes\' is not defined. Please refresh the page.<hr class="hRule"></div><div class="marginTopBottom10px nativeBottomBarButtons"><button class="btSimple btNativeToggleable" onclick=\'nativeNavigate("home")\'><div class="ico-home-bottom-bar iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Home</div></button><button id="nativeButtonAz" class="btSimple btNativeToggleable" onclick=\'nativeToggle("az")\'><div class="ico-all-sports-search iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">A-Z</div></button><button id="nativeButtonOther" class="btSimple btNativeToggleable" onclick=\'nativeToggle("other")\'><div class="ico-all-games iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Other</div></button><button id="nativeButtonBetslip" class="btSimple" onclick=\'nativeNavigate("betSlip")\'><div class="ico-betslip-bottom iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Betslip</div></button><button class="btSimple loggedInOnly btNativeToggleable" onclick=\'nativeNavigate("myBets")\'><div class="ico-my-bets iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">My Bets</div></button><button class="btSimple btNativeToggleable" onclick=\'nativeNavigate("live")\'><div class="ico-live-bottom-bar iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Live</div></button></div><div id="nativeAzSection" class="hide marginTopBottom10px"><div class="displayFlex"><span class="width25percent">Category</span><select id="categorySelector" onchange="selectCategory(value)" class="comboSbTools height20px marginBottom10px width75percent"></select></div><div class="displayFlex"><span class="width25percent">Region</span><select id="regionSelector" onchange="selectRegion(value)" class="comboSbTools height20px marginBottom10px width75percent inactivated"></select></div><div class="displayFlex"><span class="width25percent">Competition</span><select id="competitionSelector" onchange="selectCompetition(value)" class="comboSbTools height20px width75percent inactivated"></select></div></div><div id="nativeOtherSection" class="hide marginTopBottom10px nativeOtherButtons"><button id="nativeButtonBetBuilder" class="btNativeOther btNativeToggleable" onclick=\'nativeNavigate("betBuilder")\'><div class="ico-bet-builder iconNativeOtherButton"></div><div class="labelNativeOtherButton">B.Builder</div></button><button class="btNativeOther btNativeToggleable" onclick=\'nativeNavigate("search")\'><div class="ico-search iconNativeOtherButton"></div><div class="labelNativeOtherButton">Search</div></button><button class="btNativeOther btNativeToggleable" onclick=\'nativeNavigate("boost")\'><div class="ico-price-boost iconNativeOtherButton"></div><div class="labelNativeOtherButton">Boost</div></button><button class="btNativeOther btNativeToggleable" onclick=\'nativeNavigate("lsc")\'><div class="ico-live-streaming iconNativeOtherButton"></div><div class="labelNativeOtherButton">LS.Calend</div></button><button class="btNativeOther btNativeToggleable" onclick=\'nativeNavigate("startingSoon")\'><div class="ico-starting-soon iconNativeOtherButton"></div><div class="labelNativeOtherButton">Start Soon</div></button><button class="btNativeOther btNativeToggleable" onclick=\'nativeNavigate("settings")\'><div class="ico-settings iconNativeOtherButton"></div><div class="labelNativeOtherButton">Settings</div></button></div><div id="nativeBetBuilderSection" class="marginTopBottom10px hide"><div class="displayFlex"><span class="width20percent">BB Event</span><select id="nativeBetBuilderEventSelector" onchange="selectBetuilderEvent(value)" class="comboSbTools height20px marginBottom10px width80percent"></select></div><div id="nativeBetBuilderEventsError" class="displayInRed hide">Open a Bet Builder accordion.</div></div></div></div><div id="sbToolsStreamMappingHelper" class="accordion closed"><button id="streamMappingHelperAccordion" class="accHeading" onclick="initStreamMappingHelper()">IDs for stream mapping (probably YAGNI)</button><div class="accContent">Get LIVE Provider Event IDs for mapping:<div class="streamIdsLayout"><button id="getTwitchProviderIds" class="btSimple" onclick="getTwitchProviderIds()">Twitch</button><button id="getPerformProviderIds" class="btSimple" onclick="getPerformProviderIds()">Perform</button><div id="twitchResults" class="extraCondensed"></div><div id="performResults" class="extraCondensed"></div></div></div></div></div><style>.twoItemsJustified{display:flex;justify-content:space-between}.checkBoxRowToRight{display:flex;align-items:center;justify-content:flex-end}#performResults,#twitchResults{margin-left:5px;margin-top:5px}.accordionHint{float:right;font-size:x-small;color:gray}.width100percent{width:100%}.width75percent{width:75%}.width80percent{width:80%}.width20percent{width:20%}.width92percent{width:92%}.iconScoreboard{font-size:initial;margin-bottom:2px}.vertMiddle{vertical-align:middle}.outlinedText{-webkit-text-stroke:1px #444}.keyColumnForBanners{width:130px;display:inline-block}.bannersRow{line-height:25px}.noOfBanners{width:20px;display:inline-block;text-align:center}.btSimple{border:1px solid #444;border-radius:3px;box-shadow:0 1px #666;margin:2px;cursor:pointer;line-height:1em;font-size:inherit;padding:2px;color:#444}@media (hover:hover){.btSimple:hover{background-color:#fff}}.btSimple:active{box-shadow:0 0 #666;background-color:#fff;transform:translateY(1px)}.keyForContext{width:27%}.keyForEventDetails,.width25percent{width:25%}.valueForContext{width:73%;color:#008d90}.valueForEventDetails{width:75%}.truncatable{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.marginTop5px{margin-top:5px}.marginBottom5px{margin-bottom:5px}.marginBottom10px{margin-bottom:10px}.marginTopBottom10px{margin-top:10px;margin-bottom:10px}.marginTopBottom5px{margin-top:5px;margin-bottom:5px}.marginTop10px{margin-top:10px}.marginRight2px{margin-right:2px}.marginRight5px{margin-right:5px}.height20px{height:20px}.chkInline{vertical-align:middle;margin-left:5px}.labelRow{padding-right:3px;word-break:break-word}.lockSection{display:flex;justify-content:flex-end;align-self:center}.infoList{margin:3px;padding-inline-start:25px}.detectedEntitySection{display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto;margin-bottom:10px}.streamIdsLayout{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.align-right{text-align:right}.buttonLabelToRight{margin-left:8px}.scoreLayout{margin-bottom:10px;display:grid;grid-template-columns:33% 45px auto;grid-template-rows:1fr 1fr;align-items:center}#scoreBoardDetails{border:1px solid #ccc;margin-bottom:15px}.segmentChangeSectionHint{font-size:x-small;color:#a00000;font-weight:700;margin-bottom:5px;margin-top:5px;font-stretch:extra-condensed}.scoreBoardLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;grid-template-rows:auto auto auto;padding:10px;justify-items:center}.iconMocksRow{line-height:22px;display:flex;justify-content:space-between}.iconOnBtSimple{margin-right:3px;vertical-align:middle}.labelOnBtSimple{vertical-align:middle}.iconMockIconColumn{display:inline-block;text-align:center;width:25px}.iconNativeBottomBarButton{font-size:large}.iconNativeOtherButton{color:#444}.labelNativeOtherButton{font-size:x-small;font-stretch:condensed}.labelNativeBottomBarButton{font-stretch:condensed}#btOpenEventOnNative{height:38px}.iconMockLabelColumn{display:inline-block}.monoSpaceFont{font-family:monospace}.resolveLimitationRow{display:grid;grid-template-columns:auto 75px;margin-bottom:8px}.width48percent{width:48%}.keyColumnForExtras{width:120px;display:inline-block}#setEventPhaseButtonsLayout{display:grid;grid-template-columns:1fr 1fr 1fr;margin-bottom:5px}.setMarketStateLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr}.nativeBottomBarButtons,.nativeOtherButtons{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr}.nativeDetectedEventLayout{display:grid;grid-template-columns:5fr 1fr}.createMarketLayout{display:grid;grid-template-columns:55% auto;align-items:center}.newOddsLayout{padding-top:10px;align-items:center;display:grid;grid-template-columns:30% 20% auto}.btSubmit{margin-left:5px;width:45px}.vertical{writing-mode:tb-rl;transform:rotate(-180deg);margin-bottom:5px}#submitScoreBoard{margin-left:10px;margin-bottom:10px}.fdSbTools{border:1px solid #444;padding-left:3px;color:#0000a0}.comboSbTools{border:1px solid #444;font-size:inherit;color:#444}.fdScoreBoardNumeric{width:45px;margin-bottom:1px}#sportsbookTool{background-color:#fff;color:#444;font-family:Arial;width:310px;height:auto;position:absolute;border:2px solid #d3d3d3;top:0;left:0;z-index:5000;box-shadow:0 0 35px 10px #000;font-size:12px;overflow:auto}#sportsbookToolNameLeft{font-weight:900;margin-right:2px;letter-spacing:-1px;color:#00b9bd}#sportsbookToolNameRight{color:#f9a133}.sbManagerSb{color:#00b9bd;font-weight:900;margin-left:4px;margin-right:2px}.sbManagerManager{color:#cc8936;margin-right:4px}#sportsbookToolHeader{padding:3px;padding-bottom:5px;cursor:move;z-index:5000;background:#1c3448;color:#ddd}#sportsbookToolHeaderTitle{display:inline-block;padding-top:3px;padding-left:4px}#sportsbookToolName{font-size:18px;margin-right:5px}#sportsbookToolAuthorName{font-size:8px;line-height:30%;font-weight:400}.extraCondensed{font-stretch:extra-condensed}.sportsbookToolHeaderButtons{color:#fff;width:25px;height:20px;margin:1px;padding:2px;border-color:#666}#btMinimizeAll,#btZoomInOut{background:#646464}@media (hover:hover){#btMinimizeAll:hover,#btZoomInOut:hover{background:#1e1e1e}}#btMinimizeAll:active,#btZoomInOut:active{background:#1e1e1e}#btMinimizeClosed{background-color:#00b9bd}@media (hover:hover){#btMinimizeClosed:hover{background:#008d90}}#btMinimizeClosed:active{background:#008d90}#btClose{background:#c86464}@media (hover:hover){#btClose:hover{background:#a00000}}#btClose:active{background:#a00000}.infoMessage{opacity:.5;font-size:x-small}.displayInRed{color:#a00000}.displayInGreen{color:#008d90}.displayInLightGrey{color:#ccc}.hide{display:none}.show{display:block}.accHeading{border-radius:none;background-color:#eee;color:#444;cursor:pointer;padding:8px;width:100%;text-align:left;border:none;outline:0;transition:.4s}@media (hover:hover){.accHeading:hover,.btNativeOther:hover,.moreLess:hover{background-color:#ccc}}.accHeading:active,.btNativeOther:active,.moreLess:active{background-color:#ccc}.open .accHeading{background-color:#ccc}.accContent{margin:10px;background-color:#fff;overflow:hidden}.closed .accContent{display:none}.open .accContent{display:block}.hRule{border-top:1px solid #eee}.scaledTo70percent{transform:scale(.7);transform-origin:0 0}.floatRight{float:right}.carouselList{padding-left:15px}.visibilityHidden{visibility:hidden}.displayInGreenGlow{text-shadow:0 0 7px #fff,0 0 10px #fff,0 0 21px #fff,0 0 42px #008d90,0 0 82px #008d90,0 0 92px #008d90,0 0 102px #008d90,0 0 151px #008d90}#limitedFunctionsMessage{color:#a00000;font-weight:700;float:right;font-stretch:extra-condensed}.chkLock{margin-left:5px;align-self:center}.chkSbTools{cursor:pointer;align-self:center}.btCopy{width:18px;height:20px}.btDisable{width:14px;margin-right:2px}.btIcon{opacity:60%;border:none;background:0 0;cursor:pointer;vertical-align:middle;padding:0}@media (hover:hover){.btIcon:hover{opacity:100%}}.btIcon:active{opacity:20%}.btOpenInNewWindow{width:15px}.iconHeader{width:12px}.segmentKeyColumn{width:35px;display:inline-block}.width16px{width:16px}.iconSubmit{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z M219.429,367.932L108.606,257.108l38.789-38.789l72.033,72.035L355.463,154.32l38.789,38.789L219.429,367.932z"/></svg>\')}.iconCopy{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path fill="black" d="M337.8,56H119.6c-20.1,0-36.4,16.3-36.4,36.4v254.5h36.4V92.4h218.2V56z M392.4,128.7h-200c-20.1,0-36.4,16.3-36.4,36.4v254.5c0,20.1,16.3,36.4,36.4,36.4h200c20.1,0,36.4-16.3,36.4-36.4V165.1C428.7,145,412.5,128.7,392.4,128.7z M392.4,419.6h-200V165.1h200V419.6z"/></svg>\')}.iconClose{content:url(\'data:image/svg+xml;utf8,<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M954.304 190.336a15.552 15.552 0 0 1 0 21.952l-300.032 300.032 298.56 298.56a15.616 15.616 0 0 1 0 22.016l-120.96 120.896a15.552 15.552 0 0 1-21.952 0L511.36 655.232 214.272 952.32a15.552 15.552 0 0 1-21.952 0l-120.896-120.896a15.488 15.488 0 0 1 0-21.952l297.152-297.152L69.888 213.76a15.552 15.552 0 0 1 0-21.952l120.896-120.896a15.552 15.552 0 0 1 21.952 0L511.36 369.472l300.096-300.032a15.36 15.36 0 0 1 21.952 0l120.896 120.896z"/></svg>\')}.iconMaximize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <path fill="white" d="M1,9h14V7H1V9z M1,14h14v-2H1V14z M1,2v2h14V2H1z"/></svg>\')}.iconMinimize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <polygon fill="white" points="15,7 1,7 1,9 15,9"/></svg>\')}.iconZoomOut{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-1.5 2v1h3v-1h-3z"/></svg>\')}.iconZoomIn{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-.5 1v1h-1v1h1v1h1v-1h1v-1h-1v-1h-1z"/></svg>\')}.iconOpenInNewWindow{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 194.818 194.818" style="enable-background:new 0 0 194.818 194.818;" xml:space="preserve"><g><path d="M185.818,2.161h-57.04c-4.971,0-9,4.029-9,9s4.029,9,9,9h35.312l-86.3,86.3c-3.515,3.515-3.515,9.213,0,12.728c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636l86.3-86.3v35.313c0,4.971,4.029,9,9,9s9-4.029,9-9v-57.04C194.818,6.19,190.789,2.161,185.818,2.161z"/><path d="M149,77.201c-4.971,0-9,4.029-9,9v88.456H18v-122h93.778c4.971,0,9-4.029,9-9s-4.029-9-9-9H9c-4.971,0-9,4.029-9,9v140c0,4.971,4.029,9,9,9h140c4.971,0,9-4.029,9-9V86.201C158,81.23,153.971,77.201,149,77.201z"/></g></svg>\')}.iconDisable{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 492.883 492.883" style="enable-background:new 0 0 492.883 492.883;" xml:space="preserve"><g><path d="M122.941,374.241c-20.1-18.1-34.6-39.8-44.1-63.1c-25.2-61.8-13.4-135.3,35.8-186l45.4,45.4c2.5,2.5,7,0.7,7.6-3l24.8-162.3c0.4-2.7-1.9-5-4.6-4.6l-162.4,24.8c-3.7,0.6-5.5,5.1-3,7.6l45.5,45.5c-75.1,76.8-87.9,192-38.6,282c14.8,27.1,35.3,51.9,61.4,72.7c44.4,35.3,99,52.2,153.2,51.1l10.2-66.7C207.441,421.641,159.441,407.241,122.941,374.241z"/><path d="M424.941,414.341c75.1-76.8,87.9-192,38.6-282c-14.8-27.1-35.3-51.9-61.4-72.7c-44.4-35.3-99-52.2-153.2-51.1l-10.2,66.7c46.6-4,94.7,10.4,131.2,43.4c20.1,18.1,34.6,39.8,44.1,63.1c25.2,61.8,13.4,135.3-35.8,186l-45.4-45.4c-2.5-2.5-7-0.7-7.6,3l-24.8,162.3c-0.4,2.7,1.9,5,4.6,4.6l162.4-24.8c3.7-0.6,5.4-5.1,3-7.6L424.941,414.341z"/></g></svg>\')}.btPlusMinus{width:16px}.iconPlus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941h-59.882V57.059c0-4.971-4.029-9-9-9s-9,4.029-9,9v59.882H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h59.882v59.882c0,4.971,4.029,9,9,9s9-4.029,9-9v-59.882h59.882c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconMinus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h137.764c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconInfoCircle,.iconInfoSymbol{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 202.978 202.978" style="enable-background:new 0 0 202.978 202.978" xml:space="preserve"><g><path fill="black" d="M100.942,0.001C44.9,0.304-0.297,45.98,0.006,102.031c0.293,56.051,45.998,101.238,102.02,100.945c56.081-0.303,101.248-45.978,100.945-102.02C202.659,44.886,157.013-0.292,100.942,0.001z M101.948,186.436c-46.916,0.234-85.108-37.576-85.372-84.492c-0.244-46.907,37.537-85.157,84.453-85.411c46.926-0.254,85.167,37.596,85.421,84.483C186.695,147.951,148.855,186.182,101.948,186.436z M116.984,145.899l-0.42-75.865l-39.149,0.254l0.078,16.6l10.63-0.059l0.313,59.237l-11.275,0.039l0.088,15.857l49.134-0.264l-0.098-15.847L116.984,145.899z M102.065,58.837c9.575-0.039,15.349-6.448,15.3-14.323c-0.254-8.07-5.882-14.225-15.095-14.186c-9.184,0.059-15.173,6.292-15.134,14.362C87.185,52.555,93.028,58.906,102.065,58.837z"/></g></svg>\')}.btInfo{width:16px;justify-self:end}.iconInfoSymbol{opacity:60%;width:12px;margin-right:5px}.btCarousel{width:32%;margin-bottom:5px;margin-right:5px}.btGreen{background-color:#008d90;color:#fff}@media (hover:hover){.btGreen:hover{background-color:#00b9bd}}.btGreen:active{background-color:#00b9bd}.mobileUi{line-height:20px}.moreLess{width:100%;border:none;cursor:pointer;padding:4px;margin-top:2px;margin-bottom:2px;color:#444}.btNativeOther{border:none;cursor:pointer;padding:6px 2px 6px 2px;margin:2px}.width95Percent{width:95%}.displayFlex{display:flex}.inactivated{pointer-events:none;opacity:40%}</style>';

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

    function getBrandName() {
        var brandName;
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            brandName = obgClientEnvironmentConfig.startupContext.brandName;
        } else {
            brandName = "localhost";
        }

        var brandNames;
        if (IS_B2B) {
            brandNames = {
                betsson: "Betsson (B2B)",
                nordicbet: "Nordicbet",
                firestorm: "Firestorm",
                guts: "Guts",
                ibet: "Ibet",
                jetbahis: "Jetbahis",
                rexbet: "Rexbet",
                rizk: "Rizk",
                betsafeco: "Betsafe Colorado",
                betsafeon: "Betsafe Ontario",
                hovarda: "Hovarda",
                betssonmx: "BetssonMX"
            }
        } else {
            brandNames = {
                localhost: "Localhost",
                betsafe: "Betsafe",
                betsafelatvia: "BetsafeLV",
                betsafeestonia: "BetsafeEE",
                betsson: "Betsson",
                betssonarba: "BetssonArBa (Province)",
                betssonarbacity: "BetssonArBa (City)",
                betssongr: "BetssonGR",
                betssones: "BetssonES",
                nordicbetdk: "NordicbetDK",
                bets10: "Bets10",
                mobilbahis: "Mobilbahis",
                b10: "B10"
            }
        }

        for (var i = 0; i < Object.keys(brandNames).length; i++) {
            if (brandName === Object.keys(brandNames)[i]) {
                return Object.values(brandNames)[i];
            }
        }
        return brandName;
    }

    function log(content) {
        console.log("SBTOOL: " + content);
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
            fullVersion = nAgt.substring(verOffset + 7);
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
        // if (IS_UNSECURE_HTTP) {
        //     var contextButtons = document.getElementsByClassName("btCopy");
        //     var contextUtilities = document.getElementById("contextUtilities");
        //     for (button of contextButtons) {
        //         hide(button, contextUtilities);
        //     }
        // }

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
                    "ScoreBoard",
                    "AccaDetails",
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
                    "ScoreBoard",
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
            for (i = 0; i < btNativeOtherCollection.length; i++) {
                if (btNativeOtherCollection[i] !== this.parentNode) {
                    btNativeOtherCollection[i].className = "accordion closed";
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
            deviceType.innerText = DEVICE_TYPE + " (" + DEVICE_EXPERIENCE + ")";
        }
        document.getElementById("environment").innerText = ENVIRONMENT;
        document.getElementById("brandName").innerText = BRAND_NAME;
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
                params.push(new URLParam("experiments", "geofencingdisabled"));
                messageRow = "disableGeoFencingRow";
                break;
        }
        document.getElementById(messageRow).innerHTML = "Reloading...";
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

    function initDeviceTypeDependent() {
        if (DEVICE_TYPE == "Desktop") {
            windowMoverForMouse()
        } else {
            document.getElementById("sportsbookToolContent").classList.add("mobileUi");
            windowMoverForTouch();
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
            "|Brand(s)|" + BRAND_NAME + "|" + BRAND_NAME + "|\n" +
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
                text = BRAND_NAME;
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
                text = accaIdToLookupInTradingTools;
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

    window.lockEvent = (parentAccordion) => {
        var checkBox = document.getElementById("chkLockEventFor" + parentAccordion);
        var detectedOrLockedRow = document.getElementById("detectedOrLockedRowFor" + parentAccordion);
        var labelRow = document.getElementById("eventLabelFor" + parentAccordion);

        if (checkBox.checked) {
            lockedEventId = eventId;
            detectedOrLockedRow.innerHTML = "&#128274; Locked event:"
            labelRow.classList.add("displayInGreenGlow");
            stopPolling();
            switch (parentAccordion) {
                case "SbToolsEvent":
                    initSbToolsEvent("buttonsOnly");
                    break;
            }
            inactivateAllAccordions();
        } else {
            lockedEventId = undefined;
            detectedOrLockedRow.innerText = "Detected event:";
            labelRow.classList.remove("displayInGreenGlow");
            switch (parentAccordion) {
                case "SbToolsEvent":
                    initSbToolsEvent();
                    break;
                case "ScoreBoard":
                    initScoreBoard();
                    break;
            }
            activateAllAccordions();
        }
    }

    window.initSbToolsMarket = () => {
        initSbToolsMarket();
    }

    // hack
    var savedEventId;
    // end of hack
    function initSbToolsMarket(scope) {
        stopPolling();
        var marketStateButtons = document.getElementsByClassName("btSetMarketState");
        var marketStateButtonsSection = document.getElementById("setMarketStateButtonsSection");
        var labelRow = document.getElementById("marketLabelForSbToolsMarket");
        var lockMarketSection = document.getElementById("lockMarketSection");
        var marketIdField = document.getElementById("marketIdForSbToolsMarket");
        var marketTemplateIdField = document.getElementById("marketTemplateIdForSbToolsMarket");
        var sbMarketIdForOddsManagerSection = document.getElementById("sbMarketIdForOddsManagerSection");
        var marketFeatures = document.getElementById("marketFeatures");

        var chkIsCashoutAvailable = document.getElementById("chkIsCashoutAvailable");
        var isCashoutAvailableSection = document.getElementById("isCashoutAvailableSection");

        var isEnvBLE = ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD";

        // (isBLE) ?
        // hide(sbMarketIdForOddsManagerSection):
        //     show(sbMarketIdForOddsManagerSection);

        scope === "buttonsOnly" ?
            intervalIdForPolling = setInterval(listenerForMarketButtonsOnly, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForMarket, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);


        function listenerForMarket() {

            if (Object.values(getBetSlipByObgState().selections) == "") {
                detectionResultText = NOT_FOUND;
                displayInRed(labelRow);
                hide(marketFeatures, lockMarketSection);
            } else {
                show(marketFeatures, lockMarketSection);
                marketId = getLastMarketIdFromBetslip();

                if (marketId === previousMarketId) {
                    listenerForMarketButtonsOnly();
                    return;
                } else {
                    previousMarketId = marketId;
                }


                detectionResultText = getEventLabel(getLastEventIdFromBetslip()) + "<br><b>" + getMarketLabel(marketId) + "</b>";
                displayInGreen(labelRow);

                eventId = obgState.sportsbook.eventMarket.markets[marketId].eventId;
                // hack
                // console.log("eventId 1: " + eventId);
                // console.log("savedEventId 1: " + savedEventId);
                if (eventId == '') {
                    eventId = savedEventId;
                    obgState.sportsbook.eventMarket.markets[marketId].eventId = eventId;
                } else {
                    savedEventId = eventId;
                }
                // console.log("eventId 2: " + eventId);
                // console.log("savedEventId 2: " + savedEventId);
                // end of hack
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
                displayInGreen(marketTemplateIdField, marketIdField);
                marketIdField.innerText = marketId;
                marketTemplateId = getMarketTemplateId(marketId);
                marketTemplateIdField.innerText = marketTemplateId;
            }
            labelRow.innerHTML = detectionResultText;

        }

        function initMarketPropertyCheckboxes() {
            obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable ?
                chkIsCashoutAvailable.checked = true :
                chkIsCashoutAvailable.checked = false;
        }


        var marketPropertiesSection = document.getElementById("marketPropertiesSection");

        function listenerForMarketButtonsOnly() {
            initMarketPropertyCheckboxes();
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
            triggerChangeDetection(eventId, 500);
        }

        function toggleIsCashoutAvailable() {
            if (chkIsCashoutAvailable.checked) {
                obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable = true;
            } else {
                obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable = false;
            }
        }
    }

    window.lockMarket = () => {
        var checkBox = document.getElementById("chkLockMarket");
        var detectedOrLockedRow = document.getElementById("detectedOrLockedRowForSbToolsMarket");
        var labelRow = document.getElementById("marketLabelForSbToolsMarket");
        if (checkBox.checked) {
            lockedMarketId = marketId;
            detectedOrLockedRow.innerHTML = "&#128274; Locked market:";
            labelRow.classList.add("displayInGreenGlow");
            // replaceBodyEventListenersWith(null);
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

    function getCategoryId(eventId) {
        return obgState.sportsbook.event.events[eventId].categoryId;
    }

    function getCategoryTrackingLabel() {
        return obgState.sportsbook.sportCatalog.categories[getCategoryId(eventId)].trackingLabel;
    }

    function isThreeColumnLayout() {
        if (obgState.sportsbook.sportCatalog.categories[categoryId].metaData.style === 2) {
            return true;
        } return false;
    }

    function getEventWidgetActiveTabId(eventId) {
        return obgState.sportsbook.marketListWidget.items[eventId].marketTemplateGroupingId;
    }

    // function stopPolling() {
    //     if (!!intervalIdForPolling) {
    //         clearInterval(intervalIdForPolling);
    //         intervalIdForPolling = undefined;
    //     }
    // }

    function stopPolling() {
        if (!!intervalIdForPolling) {
            // console.log("intervalIdsForPolling: " + intervalIdsForPolling);
            for (var id of intervalIdsForPolling) {
                clearInterval(id);
                // console.log("polling cleared for id: " + id);
            }
            intervalIdForPolling = undefined;
            intervalIdsForPolling = [];
        }
    }

    window.initCreateMarket = () => {
        stopPolling();
        previousEventId = null;

        var labelRow = document.getElementById("eventLabelForCreateMarket");
        var fastMarketMessage = document.getElementById("fastMarketMessage");
        var btCreateFastMarket = document.getElementById("btCreateFastMarket");
        var createMarketFeatures = document.getElementById("createMarketFeatures");

        intervalIdForPolling = setInterval(listenerForCreateMarket, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForCreateMarket() {

            eventId = getUrlParam("eventId");
            if (eventId == undefined || !eventId.startsWith("f-")) {
                eventId = getEventIdFromEventWidget();
            }

            if (eventId === previousEventId) {
                return;
            } else {
                previousEventId = eventId;
            }

            if (eventId === undefined) {
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                hide(createMarketFeatures);

            } else {
                show(createMarketFeatures);
                detectionResultText = getEventLabel(eventId);
                displayInGreen(labelRow);

                var categoryId = getCategoryId(eventId);
                switch (categoryId) {
                    case "1":
                        marketTemplateTag = 84; // football
                        break;
                    case "11":
                        marketTemplateTag = 6; // tennis
                        break;
                    case "138":
                        marketTemplateTag = 82; // table tennis
                        break;
                    case "2":
                        marketTemplateTag = 85; // ice hockey
                        break;
                    default:
                        marketTemplateTag = undefined;
                }

                if (marketTemplateTag == undefined) {
                    displayInRed(fastMarketMessage);
                    fastMarketMessage.innerText = "Not for this sport"
                    inactivate(btCreateFastMarket);
                } else {
                    activate(btCreateFastMarket);
                    fastMarketMessage.innerText = null;
                }
            }

            labelRow.innerText = detectionResultText;
        }
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

    window.initChangeOdds = () => {
        stopPolling();
        var labelRow = document.getElementById("selectionLabelForSbToolsSelection");
        var selectionIdForSbToolsSelection = document.getElementById("selectionIdForSbToolsSelection");
        var changeOddsFeatures = document.getElementById("changeOddsFeatures");

        intervalIdForPolling = setInterval(listenerForChangeOdds, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForChangeOdds() {
            eventLabel = getEventLabel(getLastEventIdFromBetslip());
            marketLabel = getMarketLabel(getLastMarketIdFromBetslip());
            selectionLabel = getSelectionLabel(getLastSelectionIdFromBetslip());

            if (selectionLabel === previousSelectionLabel) {
                return;
            } else {
                previousSelectionLabel = selectionLabel;
            }

            odds = getLastInitialOddsFromBetslip();
            var detectionResultText;

            if (eventLabel === null || selectionLabel === null) {
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                hide(changeOddsFeatures, lockSelectionSection);
            } else {
                displayInGreen(labelRow);
                show(changeOddsFeatures, lockSelectionSection);
                selectionIdForSbToolsSelection.innerHTML = selectionId;
                detectionResultText = eventLabel + "<br>" + marketLabel + " :<br><b>" + selectionLabel + "</b> (init. odds: " + odds.toFixed(2) + ")</b>";
            }
            labelRow.innerHTML = detectionResultText;
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
        var labelRow = document.getElementById("selectionLabelForSbToolsSelection");

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

    window.initScoreBoard = () => {
        initScoreBoard();
    }

    function initScoreBoard() {
        stopPolling();
        previousEventId = undefined;
        var labelRow = document.getElementById("eventLabelForScoreBoard");
        var notFootballScoreBoardMessage = document.getElementById("notFootballScoreBoardMessage");
        var lockEventSection = document.getElementById("lockEventSectionForScoreBoard");
        var scoreBoardObjects;
        var itHasFootballScoreBoard;
        var scoreBoardFeatures = document.getElementById("scoreBoardFeatures");

        intervalIdForPolling = setInterval(listenerForScoreBoard, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForScoreBoard() {
            scoreBoardObjects = Object.values(obgState.sportsbook.scoreboard);
            eventId = getDetectedEventId();
            if (eventId === previousEventId) {
                return;
            } else {
                previousEventId = eventId;
            }
            detectionResultText = getDetectedEventLabel();
            itHasFootballScoreBoard = false;
            if (detectionResultText === null) {
                detectionResultText = NOT_FOUND;
                hide(notFootballScoreBoardMessage, lockEventSection);
                hideScoreBoard();
            } else {
                for (object of scoreBoardObjects) {
                    if (eventId == object.eventId && getCategoryId(eventId) === "1") {
                        itHasFootballScoreBoard = true;
                        hide(notFootballScoreBoardMessage);
                        break;
                    }
                }
                if (itHasFootballScoreBoard) {
                    hide(notFootballScoreBoardMessage);
                    showScoreBoard();
                    show(lockEventSection);
                } else {
                    hide(lockEventSection);
                    show(notFootballScoreBoardMessage);
                    hideScoreBoard();
                }
            }
            labelRow.innerText = detectionResultText;
        }

        function showScoreBoard() {
            displayInGreen(labelRow);
            show(scoreBoardFeatures);
        }

        function hideScoreBoard() {
            displayInRed(labelRow);
            hide(scoreBoardFeatures);
        }
    }

    function isBetslipVisible() {
        return obgState.sportsbook.betslip.isVisible;
    }

    // function isEventWidgetActive() {
    //         return obgState.sportsbook.eventWidget.items[eventId].isActive;
    // }

    window.initNativeApp = () => {
        stopPolling();
        // eventId = undefined;
        var sportCatalog = obgState.sportsbook.sportCatalog;
        var menu = sportCatalog.menu.items;
        var categories, regions, competitions;
        var categorySelector = document.getElementById("categorySelector");
        var regionSelector = document.getElementById("regionSelector");
        var competitionSelector = document.getElementById("competitionSelector");
        var menuOption;
        var labelRow = document.getElementById("eventLabelForNative");
        var btOpenEventOnNative = document.getElementById("btOpenEventOnNative");
        var loggedInOnly = document.getElementsByClassName("loggedInOnly");
        var nativeButtonBetslip = document.getElementById("nativeButtonBetslip");
        var nativeButtonAz = document.getElementById("nativeButtonAz");
        var nativeAzSection = document.getElementById("nativeAzSection");
        var nativeButtonOther = document.getElementById("nativeButtonOther");
        var nativeOtherSection = document.getElementById("nativeOtherSection");
        var nativeButtonBetBuilder = document.getElementById("nativeButtonBetBuilder");
        var nativeBetBuilderSection = document.getElementById("nativeBetBuilderSection");
        var nativeBetBuilderEventSelector = document.getElementById("nativeBetBuilderEventSelector");
        var nativeBetBuilderEventsError = document.getElementById("nativeBetBuilderEventsError");


        var noRoutesError = document.getElementById("noRoutesError");
        var btNativeToggleableCollection = document.getElementsByClassName("btNativeToggleable");

        if (!isUserLoggedIn()) {
            for (var element of loggedInOnly) {
                element.classList.add("visibilityHidden");
            }
        }

        for (var bt of btNativeToggleableCollection) {
            bt.addEventListener("click", toggleButtons, false);
        }

        intervalIdForPolling = setInterval(listenerForNativeEvent, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForNativeEvent() {
            setNativeBetslipButtonState();
            eventId = getLastEventIdFromBetslip();
            if (eventId === previousEventId) {
                return;
            } else {
                previousEventId = eventId;
            }

            if (eventId == null) {
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                inactivate(btOpenEventOnNative);
            } else {
                displayInGreen(labelRow);
                activate(btOpenEventOnNative);
                detectionResultText = getEventLabel(eventId);
            }
            eventLabelForNative.innerText = detectionResultText;
        }

        function setNativeBetslipButtonState() {
            if (isBetslipVisible()) {
                nativeButtonBetslip.classList.add("btGreen");
            } else {
                nativeButtonBetslip.classList.remove("btGreen");
            }
        }



        window.nativeNavigate = (value) => {
            routes = obgClientEnvironmentConfig.startupContext.routes;
            if (Object.values(routes).length == 0) {
                // console.log(routes);
                show(noRoutesError);
            }

            switch (value) {
                case "home":
                    routeChangeIn("");
                    // hide(nativeOtherSection, nativeAzSection);
                    break;
                case "betSlip":
                    toggleAction("betslip");
                    break;
                case "myBets":
                    routeChangeIn(routes["sportsbook.bet-history"].slug);
                    // hide(nativeOtherSection, nativeAzSection);
                    break;
                case "live":
                    routeChangeIn(routes["sportsbook.live"].slug);
                    // hide(nativeOtherSection, nativeAzSection);
                    break;
                case "betBuilder":
                    routeChangeIn(routes["sportsbook.bet-builder"].slug);
                    show(nativeBetBuilderSection);
                    initNativeBetBuilderSection();
                    break;
                case "search":
                    routeChangeIn("search");
                    break;
                case "boost":
                    routeChangeIn(routes["sportsbook.price-boost"].slug);
                    break;
                case "lsc":
                    routeChangeIn(routes["sportsbook.live-stream-calendar"].slug);
                    break;
                case "startingSoon":
                    routeChangeIn(routes["sportsbook.starting-soon"].slug);
                    break;
                case "settings":
                    routeChangeIn(routes["sportsbook.settings"].slug);
                    break;
            }
        }

        function toggleButtons() {
            for (var bt of btNativeToggleableCollection) {
                if (bt == this) {
                    inactivate(bt);
                } else {
                    if (this.classList.contains("btNativeOther")) {
                        if (bt.id != "nativeButtonOther") {
                            activate(bt);
                        }
                    } else {
                        activate(bt);
                    }                  
                }
            }
            toggleNativeBetBuilderSection();
            toggleNativeAzSection();
            toggleNativeOtherSection();
        }

        function toggleNativeBetBuilderSection() {
            if (nativeButtonBetBuilder.classList.contains("inactivated")) {
                show(nativeBetBuilderSection);
            } else {
                hide(nativeBetBuilderSection);
            }
        }

        function toggleNativeAzSection() {
            if (nativeButtonAz.classList.contains("inactivated")) {
                show(nativeAzSection);
            } else {
                hide(nativeAzSection);
            }
        }

        function toggleNativeOtherSection() {
            if (nativeButtonOther.classList.contains("inactivated")) {
                show(nativeOtherSection);
            } else {
                hide(nativeOtherSection);
            }
        }

        function initNativeBetBuilderSection() {
            populateBetBuilderEvents();
            intervalIdForPolling = setInterval(listenerForNativeBetBuilderEvents, POLLING_INTERVAL);
            intervalIdsForPolling.push(intervalIdForPolling);

            function populateBetBuilderEvents() {
                nativeBetBuilderEventSelector.innerHTML = "";
                var headerOption = document.createElement("option");
                headerOption.text = "Select...";
                nativeBetBuilderEventSelector.appendChild(headerOption);
                // betBuilderEvents = Object.values(obgState.betBuilder.event.events).sort((a, b) => (a.startDate > b.startDate) ? 1 : -1);
                betBuilderEvents = Object.values(obgState.betBuilder.event.events);
                for (var event of betBuilderEvents) {
                    menuOption = document.createElement("option");
                    menuOption.text = event.participants[0].label + " - " + event.participants[1].label;
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
            activate(nativeButtonBetBuilder);
        }

        window.nativeToggle = (value) => {
            switch (value) {
                case "az":
                    inactivate(nativeButtonAz);
                    activate(nativeButtonOther);
                    show(nativeAzSection);
                    hide(nativeOtherSection);
                    break;
                case "other":
                    inactivate(nativeButtonOther);
                    activate(nativeButtonAz);
                    show(nativeOtherSection);
                    hide(nativeAzSection);
                    break;
            }
        }

        window.openEventOnNative = () => {
            routeChangeIn(obgState.sportsbook.event.events[eventId].slug + "?eventId=" + eventId);
        }


        initAzNavigation();

        function initAzNavigation() {
            categories = Object.values(menu);
            populateSelector(categorySelector, categories);
        }

        window.selectCategory = (value) => {
            regionSelector.innerHTML = "";
            competitionSelector.innerHTML = "";
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
            competitionSelector.innerHTML = "";

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

        function populateSelector(selector, options) {
            var headerOption = document.createElement("option");
            headerOption.text = "Select...";
            selector.appendChild(headerOption);
            for (var option of options) {
                menuOption = document.createElement("option");
                menuOption.text = option.label;
                menuOption.value = option.id;
                selector.appendChild(menuOption);
            }
        }

        function routeChangeIn(extUrl) {
            postMessage(
                {
                    type: "routeChangeIn",
                    payload: {
                        externalUrl: "/" + extUrl
                    }
                });
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

    function getDetectedEventLabel() {
        eventId = getDetectedEventId();
        return (eventId === undefined || eventId === null || eventId.length != 24) ?
            null :
            getEventLabel(eventId);
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

    window.toggleSection = (section) => {
        var element = document.getElementById(section);
        if (element.classList.contains("hide")) {
            show(element);
        } else {
            hide(element);
        }
    }

    function isEventTypeOutright() {
        if (obgState.sportsbook.event.events[eventId].eventType == "Outright") {
            return true;
        } else return false;
    }

    window.initSbToolsEvent = () => {
        initSbToolsEvent();
    }
    function initSbToolsEvent(scope) {
        stopPolling();
        // previousEventLabel = null;
        var labelRow = document.getElementById("eventLabelForSbToolsEvent");
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
        var participants;
        var selectedParticipantId;


        // carousel
        var addToCarouselMessage = document.getElementById("addToCarouselMessage");
        var eventFeaturesSection = document.getElementById("eventFeaturesSection");
        var addToCarouselButton = document.getElementById("btAddToCarousel");
        var appendToCarouselSpan = document.getElementById("appendToCarouselSpan");
        var chkAppendToCarousel = document.getElementById("chkAppendToCarousel");


        (ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD") ?
            hide(sbEventIdForOddsManagerSection) :
            show(sbEventIdForOddsManagerSection);

        scope === "buttonsOnly" ?
            intervalIdForPolling = setInterval(listenerForEventButtonsOnly, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForEvent, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        function listenerForEvent() {

            eventLabel = getDetectedEventLabel();

            if (eventLabel === previousEventLabel) {
                if (eventLabel !== null) {
                    listenerForEventButtonsOnly();
                }
                return;
            } else {
                previousEventLabel = eventLabel;
            }

            if (eventLabel === null) {
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                if (lockedEventId === undefined) {
                    hide(eventFeaturesSection, addToCarouselErrorMessage, lockEventSection);
                }
            } else {
                show(eventFeaturesSection, lockEventSection);
                detectionResultText = eventLabel;
                eventIdValue.innerText = eventId;
                startDateValue.innerText = getStartDate();
                categoryForEventDetails.innerHTML = getCatCompRegName("category");
                regionForEventDetails.innerHTML = getCatCompRegName("region");
                competitionForEventDetails.innerHTML = getCatCompRegName("competition");
                categoryIdForEventDetails.innerHTML = "[" + getCatCompRegId("category") + "]";
                regionIdForEventDetails.innerHTML = "[" + getCatCompRegId("region") + "]";
                competitionIdForEventDetails.innerHTML = "[" + getCatCompRegId("competition") + "]";
                displayInGreen(labelRow);
                initRenameEventSection();
                listenerForEventButtonsOnly();
            }

            labelRow.innerText = detectionResultText;
            savedEventLabel = eventLabel;
        }

        function initRenameEventSection() {
            if (!isEventTypeOutright()) {
                show(renameParticipantLabelSection);
                getParticipants();
                populateParticipantSelector();
                populateParticipantLabel();
                fdRenameParticipantLabel.focus();
            } else {
                hide(renameParticipantLabelSection);
            }
            populateEventLabel();
        }

        function getParticipants() {
            participants = obgState.sportsbook.event.events[eventId].participants;
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
                }
            }
        }

        window.setEventLabel = () => {
            obgState.sportsbook.event.events[eventId].label = fdRenameEventLabel.textContent;
            triggerChangeDetection(eventId, 100);
            // triggerChangeDetection(eventId);
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
            // triggerChangeDetection(eventId);
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
            } else {
                delete obgState.sportsbook.priceBoost.eventMap[eventId];
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

        function getCatCompRegName(subject) {
            var event = obgState.sportsbook.event.events[eventId];
            var name;
            switch (subject) {
                case "category":
                    name = event.categoryName;
                    break;
                case "region":
                    name = event.regionName;
                    break;
                case "competition":
                    name = event.competitionName;
                    break;
            }
            return name;
        }

        function getCatCompRegId(subject) {
            var event = obgState.sportsbook.event.events[eventId];
            var id;
            switch (subject) {
                case "category":
                    id = event.categoryId;
                    break;
                case "region":
                    id = event.regionId;
                    break;
                case "competition":
                    id = event.competitionId;
                    break;
            }
            return id;
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

            // if (isPageCardCapable() || isPageHomePage()) {
            //     activate(addToCarouselButton, chkAppendToCarousel);
            //     addToCarouselMessage.innerText = addToCarouselMessage.textContent.replace(notSupportedHere, "");
            // } else {
            //     inactivate(addToCarouselButton, chkAppendToCarousel);
            //     displayInRed(addToCarouselMessage);
            //     addToCarouselMessage.innerText = notSupportedHere;
            // }


            if (isPageCardCapable()) {
                show(appendToCarouselSpan);
                activatedeToCarouselButton();
            } else if (isPageHomePage()) {
                activatedeToCarouselButton();
                if (isCarouselOrderEnabled()) {
                    hide(appendToCarouselSpan);
                } else {
                    show(appendToCarouselSpan);
                }
            } else {
                inactivate(addToCarouselButton);
                hide(appendToCarouselSpan);
                displayInRed(addToCarouselMessage);
                addToCarouselMessage.innerText = notSupportedHere;
            }

            function activatedeToCarouselButton() {
                activate(addToCarouselButton);
                addToCarouselMessage.innerText = addToCarouselMessage.textContent.replace(notSupportedHere, "");
            }
        }

        function isCarouselOrderEnabled() {
            // return obgClientEnvironmentConfig.startupContext.config.sportsbookUi.sportsbookCarousel.isCarouselOrderEnabled;
            return obgState.sportsbook.carousel.item.skeleton.carouselOrder != undefined
        }

        window.addToCarousel = () => {
            if (lockedEventId !== undefined) {
                eventId = lockedEventId;
            }

            if (!isCarouselAvailable()) {
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

            var item = obgState.sportsbook.carousel.item;
            var addToCarouselMessage = document.getElementById("addToCarouselMessage");
            // var chkAppendToCarousel = document.getElementById("chkAppendToCarousel");

            if (chkAppendToCarousel.checked) {
                var savedEventIds = item.skeleton.eventIds;
                item.skeleton.eventIds = [];
                item.skeleton.eventIds.push(eventId);
                for (var savedEventId of savedEventIds) {
                    item.skeleton.eventIds.push(savedEventId);
                }
            } else {
                item.skeleton.eventIds = [];
                item.skeleton.eventIds.push(eventId);
            }

            if (isPageCardCapable()) {
                item.skeleton.backgrounds[eventId] = getCardBackGround();
            }

            // making markets available on carousel if they are not by default
            var marketTemplateIds = item.skeleton.marketTemplateIds;
            var firstMarketTemplateId = getMarketTemplateIdOfFirstMarket();
            if (!marketTemplateIds.includes(firstMarketTemplateId)) {
                marketTemplateIds.push(firstMarketTemplateId);
            }


            // for 3-column markets
            categoryId = Number(getCategoryId(eventId));

            if (isThreeColumnLayout() && !isEventTypeOutright()) {
                var threeColumnLayouts = getThreeColumnLayouts();
                if (threeColumnLayouts == undefined) {
                    show(addToCarouselErrorMessage);
                    // return;
                } else {
                    hide(addToCarouselErrorMessage);
                }
                item.skeleton.threeColumnLayouts = threeColumnLayouts;
            }

            if (isCarouselOrderEnabled()) {
                // if (obgState.sportsbook.carousel.item.skeleton.carouselOrder != undefined) {
                obgState.sportsbook.carousel.item.skeleton.carouselOrder = [];
                var carouselOrderElement = {
                    id: eventId,
                    sortOrder: 0,
                    type: "Event"
                }
                item.skeleton.carouselOrder.push(carouselOrderElement);
                // }
            }

            obgState.sportsbook.carousel.item = item;
            displayInGreen(addToCarouselMessage);
            addToCarouselMessage.innerHTML = "&#10004;"
            triggerChangeDetection();

            setTimeout(function () {
                addToCarouselMessage.innerHTML = null;
            }, 3000);
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
            // for (var table = 0; table < Object.values(eventTables).length; table++) {
            //     try {
            //         eventIds = Object.values(eventTables)[table].item.skeleton.eventIds;
            //         // console.log("eventIds of eventTable[" + t + "]: " + eventIds);
            //     } catch {
            //         // console.log("eventTable[" + t + "] had no events");
            //     }
            //     for (var i = 0; i < Object.values(eventIds).length; i++) {
            //         if (eventIds[i] === eventId) {
            //             // console.log("eventId found in: " + i);
            //             try {
            //                 marketTimeFrames = Object.values(eventTables)[table].item.skeleton.marketTimeFrames;
            //                 // console.log("marketTimeFrames of eventTable[" + t + "]: " + JSON.stringify(marketTimeFrames));
            //                 timeFrame = Object.values(marketTimeFrames)[0];
            //                 // console.log("marketTimeFrame: " + JSON.stringify(timeFrame));
            //             } catch { }
            //             if (timeFrame !== undefined) {
            //                 threeColumnLayouts = {
            //                     [categoryId]: {
            //                         columns: [],
            //                         key: "key",
            //                         label: "label"
            //                     }
            //                 };
            //                 for (var indexOfMarkets = 0; indexOfMarkets < Object.values(timeFrame).length; indexOfMarkets++) {
            //                     threeColumnLayouts[categoryId].columns.push(
            //                         {
            //                             columnIndex: indexOfMarkets,
            //                             label: Object.values(timeFrame)[indexOfMarkets].label,
            //                             marketTemplateIds: Object.values(timeFrame)[indexOfMarkets].marketTemplateIds
            //                         }
            //                     )
            //                 }
            //             }
            //         }
            //     }
            // }

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

        function isCarouselAvailable() {
            var isAvailable;
            obgState.sportsbook.carousel.item !== undefined ? isAvailable = true : isAvailable = false;
            return isAvailable;
        }
    }

    window.getSbIdForOddsManager = (entity) => {
        entity === 'event' ?
            window.open("http://sbtradingmappingmainapi.qa.bde.local/mapping/fixture/new/" + eventId) :
            window.open("http://sbtradingmappingmainapi.qa.bde.local/mapping/market/new/" + marketId);
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

    window.setMarketState = (state) => {
        if (lockedMarketId !== undefined) {
            marketId = lockedMarketId;
        }
        obgState.sportsbook.eventMarket.markets[marketId].status = state;
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
        document.querySelector("[test-id='all']").click();
        switch (marketType) {
            case "playerProps":
                createPlayerPropsMarket();
                break;
            case "playerPropsDummy":
                createPlayerPropsDummyMarket();
                break;
            case "fast":
                createFastmarket(marketTemplateTag);
                break;
        }

        function createPlayerPropsMarket() {
            var playerPropsMarketName = "(Player Props Test) Player Total Shots";
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
                obgRt.createMarket(eventId, marketId, "N1MGKA", [106], playerPropsMarketName + " | " + players[i], "", 2, 88, [{
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
            var playerPropsMarketName = "(Player Props Test) Player Total Shots";
            for (var i = 5; i < 20; i++) {
                obgRt.createMarketWithDummySelection(eventId, "m-" + eventId + "-test-" + String(i), "N1MGKA", [106], playerPropsMarketName + " | Dummy Player - Arsenal F.C.", "", 2, 88, [{
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
            obgRt.createMarketWithDummySelection(eventId, "m-" + eventId + "-" + fastMarketTemplateId, fastMarketTemplateId, [marketTemplateTag], "Test Fast Market Next 1 minute (0:00 - 0:59) | A stray dog interrupted the match", 0, 2, 69, [{
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

    window.initAccaDetails = () => {
        stopPolling();
        var acca;
        var usersCurrency;
        var categories;
        var selectionOddsLimitMin;
        var totalOddsLimitMin;
        var minimumStake;
        var maximumStake;
        previousAcca = null;

        var loginToSeeAcca = document.getElementById("loginToSeeAcca");
        var noAccaFound = document.getElementById("noAccaFound");

        var accaDetailsLayout = document.getElementById("accaDetailsLayout");
        var accaNameField = document.getElementById("accaNameField");
        var accaId = document.getElementById("accaId");

        var accaCategoriesSection = document.getElementById("accaCategoriesSection");
        var accaCategories = document.getElementById("accaCategories");

        var accaCompetitionsRow = document.getElementById("accaCompetitionsRow");
        var accaCompetitions = document.getElementById("accaCompetitions");

        var accaMarketTemplatesRow = document.getElementById("accaMarketTemplatesRow");
        var accaMarketTemplates = document.getElementById("accaMarketTemplates");

        var accaEventPhaseRow = document.getElementById("accaEventPhaseRow");
        var accaEventPhase = document.getElementById("accaEventPhase");

        var accaMinimumNumberOfSelections = document.getElementById("accaMinimumNumberOfSelections");
        var accaSelectionOddsLimitMin = document.getElementById("accaSelectionOddsLimitMin");

        var accaTotalOddsLimitMinRow = document.getElementById("accaTotalOddsLimitMinRow");
        var accaTotalOddsLimitMin = document.getElementById("accaTotalOddsLimitMin");

        var accaMinimumStakeRow = document.getElementById("accaMinimumStakeRow");
        var accaMinimumStake = document.getElementById("accaMinimumStake");
        var accaMaximumStakeRow = document.getElementById("accaMaximumStakeRow");
        var accaMaximumStake = document.getElementById("accaMaximumStake");


        // replaceBodyEventListenersWith(new BodyEventListener("click", listenerForAccaDetails));
        intervalIdForPolling = setInterval(listenerForAccaDetails, POLLING_INTERVAL);
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
            accaIdToLookupInTradingTools = acca.id;
            accaId.innerText = accaIdToLookupInTradingTools;

            categories = acca.criteria.criteriaEntityDetails;
            if (categories.length == 0) {
                hide(accaCategoriesSection);
            } else {
                show(accaCategoriesSection);
                var categoryId;
                var categoryName;
                var categoryInSportCatalog;
                var categoryNames = [];
                var competitionCriteriaExists = false;
                var marketTemplateCriteriaExists = false;
                for (var i = 0; i < categories.length; i++) {
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
                accaCategories.innerText = String(categoryNames).replaceAll(",", ", ");
                if (!competitionCriteriaExists) {
                    hide(accaCompetitionsRow);
                } else {
                    show(accaCompetitionsRow);
                    accaCompetitions.innerText = "Check restrictions in Trading Tools";
                }
                if (!marketTemplateCriteriaExists) {
                    hide(accaMarketTemplatesRow);
                } else {
                    show(accaMarketTemplatesRow);
                    accaMarketTemplates.innerText = "Check restrictions in Trading Tools";
                }
            }


            var eventPhases = acca.criteria.eventPhases;
            if (eventPhases.length > 1) {
                hide(accaEventPhaseRow);
            } else {
                show(accaEventPhaseRow);
                accaEventPhase.innerText = acca.criteria.eventPhases;
            }

            accaMinimumNumberOfSelections.innerText = acca.conditions.minimumNumberOfSelections;

            selectionOddsLimitMin = acca.conditions.selectionOddsLimit.minOdds;
            totalOddsLimitMin = acca.conditions.oddsLimit.minOdds;
            if (totalOddsLimitMin <= selectionOddsLimitMin) {
                hide(accaTotalOddsLimitMinRow);
            } else {
                show(accaTotalOddsLimitMinRow);
                accaTotalOddsLimitMin.innerText = totalOddsLimitMin.toFixed(2);
            }
            accaSelectionOddsLimitMin.innerText = selectionOddsLimitMin.toFixed(2);

            minimumStake = acca.conditions.minimumStake;
            if (minimumStake == 0) {
                hide(accaMinimumStakeRow);
            } else {
                show(accaMinimumStakeRow);
                accaMinimumStake.innerText = minimumStake + " " + usersCurrency;
            }

            maximumStake = acca.conditions.maximumStake;
            if (maximumStake == 0) {
                hide(accaMaximumStakeRow);
            } else {
                show(accaMaximumStakeRow);
                accaMaximumStake.innerText = maximumStake + " " + usersCurrency;
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

        function setIntervalForSegments() {
            stopPolling();
            intervalIdForPolling = setInterval(listenerForSegments, POLLING_INTERVAL);
        }

        function listenerForSegments() {
            segmentGuid = obgState.sportsbook.segment.segmentGuid.toLowerCase();
            if (previousSegmentGuid == segmentGuid) {
                return;
            } else {
                segmentGuidSpan.innerText = segmentGuid;
                segmentName = getSegmentName();
                if (segmentName == undefined) {
                    segmentName = NOT_FOUND;
                    displayInRed(segmentNameSpan);
                } else {
                    displayInGreen(segmentNameSpan);
                }
                segmentNameSpan.innerText = segmentName;
                previousSegmentGuid = segmentGuid;
                populateSegmentSelector();
            }
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
                        // segments.push(segment);
                        segmentArray.push(segment);
                    }
                }
            }
            // same as function compareSegments()
            return segmentArray.sort((segmentA, segmentB) => segmentA.name > segmentB.name ? 1 : -1);
        }

        // function compareSegments(segmentA, segmentB) {
        //     return segmentA.name > segmentB.name ? 1 : -1;
        // }

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
        var fdSegmentGuid = document.getElementById("fdSegmentGuid");
        var newSegmentGuid = fdSegmentGuid.value;
        obgState.sportsbook.segment.segmentGuid = newSegmentGuid;
        fdSegmentGuid.value = "";
    }

    window.setSegmentGuid = (guid) => {
        obgState.sportsbook.segment.segmentGuid = guid;
        console.log("segment changed to: " + guid);
    }

    function getCurrentPageName() {
        return obgState.route.current.name;
    }

    function isPageCardCapable() {
        var pages = ["sportsbook.region", "sportsbook.competition", "sportsbook.category"];
        if (pages.includes(getCurrentPageName())) {
            return true;
        } return false;
    }

    function isPageHomePage() {
        return getCurrentPageName() === "sportsbook";
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

        function listenerForBanners() {
            if (!isPageHomePage()) {
                show(bannersMessage);
                hide(bannersFeatures);
                return;
            } else {
                hide(bannersMessage);
                show(bannersFeatures);
            }

            noOfSbBanners = obgState.sportsbook.sportsbookBanner.content.length;
            noOfCrlBanners = obgState.sportsbook.carouselBanner.content.length;
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

            var newBanner = {
                "key": "",
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
            triggerChangeDetection();
        }

        window.removeCarouselBanner = () => {
            obgState.sportsbook.carouselBanner.content.pop();
            var banners = obgState.sportsbook.carouselBanner.content;
            obgState.sportsbook.carouselBanner.content = [];
            for (var banner of banners) {
                obgState.sportsbook.carouselBanner.content.push(banner);
            };
            triggerChangeDetection();
        }
    }

    window.openInTradingTools = (entity) => {
        var ttBaseUrl;
        var ttPath;
        ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD" ?
            ttBaseUrl = "https://tradingtools.ble.local/" :
            ttBaseUrl = "https://tradingtools.qa.bde.local/";
        switch (entity) {
            case "acca":
                ttPath = "bonus/" + accaIdToLookupInTradingTools;
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