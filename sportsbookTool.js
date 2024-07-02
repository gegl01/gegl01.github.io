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
    const IS_OBGGLOBALAPPCONTEXT_EXPOSED = isDefined("obgGlobalAppContext");
    const IS_OBGSTATE_EXPOSED = isDefined("obgState");
    const IS_OBGRT_EXPOSED = isDefined("obgRt");
    const IS_OBGNAVIGATIONSUPPORTED_EXPOSED = isDefined("obgNavigationSupported");
    const IS_SPORTSBOOK_IN_IFRAME = getIsSportsbookInIframe();

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
    var previousEventId, previousMarketId, previousSelectionId, previousAcca, previousPriceBoosts, previousFreeBets, previousProfitBoosts;
    var eventLabel; //,savedEventLabel;
    // var mockedEventPhase;
    var marketId, lockedMarketId, marketLabel, marketTemplateId, marketVersion;
    var marketTemplateTagsToDisplay;
    var categoryId, competitionId;
    var selectionId, lockedSelectionId, selectionLabel;
    var selectionIdArray = [];
    var detectionResultText;
    var initialOdds, lockedInitialOdds;
    var accaName, accaId, priceBoostId, freeBetId, profitBoostId;
    var segmentGuid, previousSegmentGuid, segmentName, segmentLegacyId;
    var intervalIdForPolling;
    var intervalIdsForPolling = [];
    var previousIframeURL;
    var brands;
    var routes;
    var betBuilderEvents, previousBetBuilderEvents = [];
    var labelRow;
    var threeColumnLayouts;
    var carouselOrCardsDefined;
    var isPageValidForCarousel, previousIsPageValidForCarousel;
    var lastDateTimeSet;
    var eventIdArray = [];

    // const IS_UNSECURE_HTTP = isUnsecureHTTP();
    const SB_TOOL_VERSION = "v1.6.18";
    const DEVICE_TYPE = getDeviceType();
    // const IS_TOUCH_BROWSER = getIsTouchBrowser();
    const DEVICE_EXPERIENCE = getDeviceExperience();
    const ENVIRONMENT = getEnvironment();
    const ENVIRONMENT_TO_DISPLAY = getEnvironmentToDisplay();
    const IS_B2B_IFRAME_ONLY = getIsB2BIframeOnly();
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
    const IS_SGP_USED = getIsSGPUsed();
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
            '<div id="sportsbookToolHeader"><div id="sportsbookToolHeaderTitle"><div id="sportsbookToolNameRow"><span id="sportsbookToolName"><span id="sportsbookToolNameLeft">sportsbook</span><span id="sportsbookToolNameRight">tool</span></span><span id="sportsbookToolVersion"></span></div><div id="sportsbookToolAuthorName">by gergely.glosz@betssongroup.com</div></div><div id="sportsbookToolHeaderButtonRow" class="floatRight"><button id="btZoomInOut" class="sportsbookToolHeaderButtons" onclick="zoomInOut()"><img id="iconZoomInOut" class="iconZoomOut iconHeader"></button><button id="btMinimizeClosed" class="sportsbookToolHeaderButtons" onclick="toggleClosedAccordionsVisibility()"><img id="iconMinimizeClosed" class="iconMinimize iconHeader"></button><button id="btClose" class="sportsbookToolHeaderButtons" onclick="closePopup()"><img class="iconClose iconHeader"></button></div></div><div id="sportsbookToolContent"><div id="sbToolsContext" class="accordion open"><button id="contextAccordion" class="accHeading" onclick="initContext()">Context<span id="limitedFunctionsMessage"></span></button><div class="accContent"><div id="obgStateAndRtSection" class="hide"><div id="obgStateAndRtRow" class="resolveLimitationRow">Expose obgState and obgRt<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("exposeObgStateAndRt")\'><span>Expose</span></button></div><hr class="hRule"></div><div id="disableSealStoreSection" class="hide"><div id="disableSealStoreRow" class="resolveLimitationRow">Disable sealStore<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("disableSealStore")\'><span>Disable</span></button></div><hr class="hRule"></div><div id="openIframeSection" class="hide"><div id="openIframeRow" class="resolveLimitationRow">Open Sportsbook iframe<button class="btSimple btGreen" onclick=\'reloadPageWithFeature("openIframe")\'>SB iframe</button></div><div id="notMatchingIframeSection" class="hide"><div id="iframeNotMatchingWarningMessage">Mismatch between host page and SB iframe environments, meaning you are testing<span id="notMatchingIframeEnvSpan"></span>Sportsbook</div><div id="openMatchingIframeRow" class="marginBottom2px resolveLimitationRow">Open just the matching SB iframe<button id="btOpenMatchingIframe" class="btSimple btGreen" onclick=\'reloadPageWithFeature("openMatchingIframe")\'></button></div><div id="replaceIframeSrcRow" class="resolveLimitationRow"><div>Keep host page and fix SB iframe with matching one</div><button id="btOpenFullPageWithMatchingIframe" class="btSimple btOrange" onclick=\'reloadPageWithFeature("hostPageWithMatchingIframe")\'></button></div></div><div class="itemsJustified marginTop10px"><div id="iframeUrlValue" class="displayInGreen sportsbookLink width100percent"></div><button class="btCopy btIcon" id="btIframeUrl" onclick=\'copyToClipboard("iframeURL")\'><img class="iconCopy"></button></div><hr class="hRule"></div><div id="contextSection"><div class="displayFlex"><div class="keyForContext">Environment:</div><div class="valueForContext" id="environment"></div></div><div class="displayFlex"><div class="keyForContext">Device / Login:</div><div class="valueForContext"><span id="deviceType"></span><span id="loginState"></span></div></div><div class="displayFlex"><div class="keyForContext">Brand (Market):</div><div class="valueForContext itemsJustified"><div id="brandName"></div><button class="btCopy btIcon" onclick=\'copyToClipboard("brand")\'><img class="iconCopy"></button></div></div><div class="displayFlex"><div class="keyForContext">Browser:</div><div class="valueForContext itemsJustified"><div id="browserVersion"></div><button class="btCopy btIcon" onclick=\'copyToClipboard("browserVersion")\'><img class="iconCopy"></button></div></div><div class="displayFlex"><div class="keyForContext">App Version:</div><div class="valueForContext itemsJustified"><div><span id="obgVersion"></span><span id="B2BorB2C" class="displayInLightGrey"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("obgVersion")\'><img class="iconCopy"></button></div></div><button onclick=\'toggleSection("contextUtilities")\' class="moreLess">Extras</button><div id="contextUtilities" class="marginTop10px hide"><div class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Jira QA Table</span><span class="displayInLightGrey">from the above data</span></div><button class="btCopy btIcon" id="btCreateJiraTable" onclick=\'copyToClipboard("jiraTemplate")\'><img class="iconCopy"></button></div><div class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Deep Link</span><span class="displayInLightGrey">of the actual page & slip</span></div><button class="btCopy btIcon" id="btCreateDeepLink" onclick=\'copyToClipboard("deepLink")\'><img class="iconCopy"></button></div><div id="postMessageRow" class="itemsJustified hide"><div class="width95Percent"><span class="keyColumnForExtras">PostMessage</span><span class="displayInLightGrey">routeChangeIn in native</span></div><button class="btCopy btIcon" id="btCreatePostMessage" onclick=\'copyToClipboard("postMessage")\'><img class="iconCopy"></button></div><div id="disableCacheRow" class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off Cache</span><span class="displayInLightGrey">with page reload</span></div><button class="btReload btIcon" onclick=\'reloadPageWithFeature("disableCache")\'><img class="iconReload"></button></div><div id="disableSSRRow" class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off SSR</span><span class="displayInLightGrey">with page reload</span></div><button class="btReload btIcon" onclick=\'reloadPageWithFeature("disableSSR")\'><img class="iconReload"></button></div><div id="disableGeoFencingRow" class="itemsJustified"><div class="width95Percent"><span class="keyColumnForExtras">Off GeoFencing</span><span class="displayInLightGrey">for Betsson ArBa login</span></div><button class="btReload btIcon" onclick=\'reloadPageWithFeature("disableGeoFencing")\'><img class="iconReload"></button></div></div></div></div></div><div id="sbToolsSegments" class="accordion closed"><button id="segmentsAccordion" class="accHeading" onclick="initSegments()"><span class="accordionTitle">Segment</span><span class="accordionHint">Get/Set SegmentGuid</span></button><div class="accContent"><div class="marginBottom10px"><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="width17percent">Name:</span><span id="segmentNameSpan" class="width100percent displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentName")\'><img class="iconCopy"></button></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="width17percent">Guid:</span><span id="segmentGuidSpan" class="width100percent displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("segmentGuid")\'><img class="iconCopy"></button></div><hr class="hRule"><div><div class="width95Percent displayFlex"><span class="marginRight5px">Segment ID (used in ISA/Redis):</span><span id="segmentLegacyIdSpan" class="displayInGreen"></span></div></div></div><button onclick=\'toggleSection("segmentChangers")\' class="moreLess">Set Segment</button><div id="segmentChangers" class="hide"><div class="segmentChangeSectionHint">Partially useful features, no data refresh triggered on change</div><div>New Segment</div><select id="segmentSelector" onchange="setSegmentGuid(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div>Enter Segment Guid manually</div><div class="itemsJustified"><input id="fdSegmentGuid" class="fdSbTools width100percent height20px"><button class="btSimple btSubmit" onclick="changeSegmentGuid()">Set</button></div><div class="checkBoxRowToRight marginTop5px"><span>Segment data known to this tool</span><button class="btOpenInNewWindow btIcon chkInline" onclick=\'openInNewWindow("brandsJson")\'><img class="iconOpenInNewWindow"></button></div></div></div></div><div id="sbToolsEvent" class="accordion closed"><button id="eventAccordion" class="accHeading" onclick="initSbToolsEvent()"><span class="accordionTitle">Event</span><span class="accordionHint">Set Phase & Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsEvent">Detected event:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsEventInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="eventLabelForSbToolsEvent"></div><div id="lockEventSectionForSbToolsEvent" class="lockSection hide">Lock <input type="checkbox" id="chkLockEventForSbToolsEvent" class="chkLock chkSbTools" onclick="lockEvent()"></div></div><div id="eventFeaturesSection" class="hide"><button onclick=\'toggleSection("eventDetailsSection")\' class="moreLess">Event Details</button><div id="eventDetailsSection" class="marginTopBottom10px hide"><div class="displayFlex"><span class="keyForEventDetails">Event ID:</span><span class="valueForEventDetails itemsJustified"><span id="eventIdForEventDetails" class="displayInGreen"></span><span><button class="btCopy btIcon" id="btCopyEventId" onclick=\'copyToClipboard("eventId")\'><img class="iconCopy"></button></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Start Date:</span><span id="startDateForEventDetails" class="valueForEventDetails displayInGreen"></span></div><div class="displayFlex"><span class="keyForEventDetails">Category:</span><span class="valueForEventDetails itemsJustified displayInGreen"><span id="categoryForEventDetails"></span><span id="categoryIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Region:</span><span class="valueForEventDetails itemsJustified displayInGreen"><span id="regionForEventDetails"></span><span id="regionIdForEventDetails"></span></span></div><div class="displayFlex"><span class="keyForEventDetails">Competition:</span><span class="valueForEventDetails itemsJustified displayInGreen"><span id="competitionForEventDetails"></span><span id="competitionIdForEventDetails"></span></span></div><hr class="hRule"><div id="sbEventIdForOddsManagerSection" class="itemsJustified"><span class="width95Percent itemsJustified paddingRight8px"><span>Legacy Event ID</span><span class="displayInLightGrey">for ISA/Redis/SB Admin Client</span></span><button class="btIcon btOpenInNewWindow" onclick="getLegacyEventId()"><img class="iconOpenInNewWindow"></button></div><div id="sbEventIdForOddsManagerSection" class="itemsJustified"><span class="width95Percent itemsJustified paddingRight8px"><span>Whole ISA response</span><span class="displayInLightGrey">el[0].sr.pbbpoe = popularity</span></span><button class="btIcon btOpenInNewWindow" onclick="getWholeIsaResponse()"><img class="iconOpenInNewWindow"></button></div><div class="itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("event")\'><img class="iconOpenInNewWindow"></button></div></div><div><button onclick=\'toggleSection("renameEventSection")\' class="moreLess">Participants & Label</button><div id="renameEventSection" class="marginTopBottom10px hide"><div id="renameParticipantLabelSection"><div>Participant ID:<span id="selectedParticipantIdSpan" class="displayInGreen marginLeft5px"></span><button class="btCopy btIcon" onclick=\'copyToClipboard("participantId")\'><img class="iconCopy"></button><span class="accordionHint">displayed for normal Matches</span></div><select id="participantSelector" onchange="selectParticipant(value)" class="comboSbTools width100percent height20px"></select><div id="renameParticipantLabelRow" class="itemsJustified marginTop5px"><span contenteditable="true" id="fdRenameParticipantLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setParticipantLabel()"><img class="width16px iconSubmit"></button></div></div><div class="marginTop10px">Label:<span class="accordionHint">displayed for Outrights, Boosts Page</span></div><div class="itemsJustified"><span contenteditable="true" id="fdRenameEventLabel" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setEventLabel()"><img class="width16px iconSubmit"></button></div></div></div><div><button onclick=\'toggleSection("setEventPhaseSection")\' class="moreLess">Set Event Phase / Scoreboards</button><div id="setEventPhaseSection" class="marginTopBottom10px hide"><div id="setEventPhaseButtonsLayout"><button id="btSetEventPhaseLive" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Live")\'><span class="ico-live-betting iconOnBtSimple"></span><span class="labelOnBtSimple">Live</span></button><button id="btSetEventPhasePrematch" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Prematch")\'><span class="ico-starting-soon iconOnBtSimple"></span><span class="labelOnBtSimple">Prematch</span></button><button id="btSetEventPhaseOver" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Over")\'><span class="ico-event-ended iconOnBtSimple"></span><span class="labelOnBtSimple">Over</span></button></div><div class="checkBoxRowToLeft"><input type="checkbox" class="chkInlineRight chkSbTools" id="chkSuspendAllMarkets"><span>\'Over\' suspends all markets</span></div><div id="liveAddsScoreBoardSection" class="checkBoxRowToLeft"><input type="checkbox" checked="checked" class="chkInlineRight chkSbTools" id="chkLiveAddsScoreBoard" onclick="toggleScoreBoardExtras()"><span id="scoreBoardSupportedMessage"></span></div><div id="scoreBoardExtrasSection"><hr class="hRule"><div>Scoreboard Extras</div><div class="scoreBoardExtrasDetails"><div id="footballScoreBoardExtrasSection"><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Red Cards</span><input id="chkRedCardsHome" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Home</span><input id="chkRedCardsAway" type="checkbox" checked="checked" class="marginLeft15px chkInlineRight chkSbTools"><span>Away</span></div><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Aggregated Score</span><input id="chkAggScore" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>AGG</span></div><div class="checkBoxRowToLeft"><span class="scoreBoardExtrasKey">Extra Time</span><input id="chkExtraTime" type="checkbox" class="chkInlineRight chkSbTools"><span>For long match phase label</span></div></div><div id="iceHockeyScoreBoardExtrasSection"><div class="radioRowToLeft"><span id="ppKeyLabelTop" class="scoreBoardExtrasKey">Power Play Home</span><input id="radioPPHome" type="radio" checked="checked" name="powerPlay" class="radioSbTools"><span>PP</span><input id="radioPP2Home" type="radio" name="powerPlay" class="marginLeft15px radioSbTools"><span>PP2</span></div><div class="radioRowToLeft"><span id="ppKeyLabelBottom" class="scoreBoardExtrasKey">Power Play Away</span><input id="radioPPAway" type="radio" name="powerPlay" class="radioSbTools"><span>PP</span><input id="radioPP2Away" type="radio" name="powerPlay" class="marginLeft15px chkInlineRight radioSbTools"><span>PP2</span></div><div class="radioRowToLeft"><span class="scoreBoardExtrasKey">No Power Play</span><input id="radioPPNone" type="radio" name="powerPlay" class="radioSbTools"></div></div><div id="dartsScoreBoardExtrasSection"><div class="checkBoxRowToLeft"><input id="chkSetPoints" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Set Points</span><input id="chk180s" type="checkbox" checked="checked" class="marginLeft30px chkInlineRight chkSbTools"><span>180s</span></div></div><div id="tennisScoreBoardExtrasSection"><div class="radioRowToLeft"><span class="scoreBoardExtrasKey">Number of Sets</span><input id="radio3setTennis" type="radio" checked="checked" name="tennisNumberOfSets" class="radioSbTools"><span>3</span><input id="radio5setTennis" type="radio" name="tennisNumberOfSets" class="marginLeft15px radioSbTools"><span>5</span></div></div></div></div><div id="scoreBoardNotSupportedSection" class="inactivated checkBoxRowToLeft"><input type="checkbox" class="chkInlineRight chkSbTools"><span id="scoreBoardNotSupportedMessage"></span></div></div></div><div><button onclick=\'toggleSection("eventPropertiesSection")\' class="moreLess">Event Properties</button><div id="eventPropertiesSection" class="marginTopBottom10px hide"><div class="marginBottom5px">Has effect on icons and event panel tabs</div><div id="hasBetBuilderSection" class="iconMocksRow"><span class="width95Percent"><span id="betBuilderIcon" class="ico-bet-builder-seamless iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Bet Builder / SGP</span></span><input type="checkbox" onclick=\'toggleEventProperty("betBuilderLink")\' id="chkHasBetBuilder" class="chkSbTools"></div><div id="hasPriceBoostSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-price-boost iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Price Boost (Single)</span></span><input type="checkbox" onclick=\'toggleEventProperty("priceBoost")\' id="chkHasPriceBoost" class="chkSbTools"></div><div id="hasSuperBoostSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-super-boost iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Super Boost (Single)</span></span><input type="checkbox" onclick=\'toggleEventProperty("superBoost")\' id="chkHasSuperBoost" class="chkSbTools"></div><div id="hasFastMarketsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-action-betting iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Fast Markets</span></span><input type="checkbox" onclick=\'toggleEventProperty("fastMarkets")\' id="chkHasFastMarkets" class="chkSbTools"></div><div id="hasLiveVisualSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-visual iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Visual</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveVisual")\' id="chkHasLiveVisual" class="chkSbTools"></div><div id="hasLiveStreamingSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-live-streaming iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Streaming</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStreaming")\' id="chkHasLiveStreaming" class="chkSbTools"></div><div id="hasScore24StatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-stats-prematch iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Prematch Statistics (Score24)</span></span><input type="checkbox" onclick=\'toggleEventProperty("score24Stats")\' id="chkHasScore24Statistics" class="chkSbTools"></div><div id="hasExternalStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-stats-prematch iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Prematch Statistics (External)</span></span><input type="checkbox" onclick=\'toggleEventProperty("externalStats")\' id="chkHasExternalStatistics" class="chkSbTools"></div><div id="hasLiveStatisticsSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-stats-prematch iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Live Statistics</span></span><input type="checkbox" onclick=\'toggleEventProperty("liveStatistics")\' id="chkHasLiveStatistics" class="chkSbTools"></div><div title="Live event with scoreboard required" id="hasVarSection" class="iconMocksRow"><span class="width95Percent"><span id="varIcon" class="ico-var iconMockIconColumn vertMiddle"></span><span id="varLabel" class="iconMockLabelColumn">Video Assistant Referee (VAR)</span></span><input type="checkbox" onclick=\'toggleEventProperty("var")\' id="chkHasVar" class="chkSbTools"></div></div></div><div><button onclick=\'toggleSection("createMarketSection")\' class="moreLess">Create Fast/Player Props Market</button><div id="createMarketSection" class="hide marginTopBottom10px"><div id="createMarketErrorSection" class="displayInRed">Open an Event Panel.</div><div id="createMarketFeatures"><div id="createPlayerPropsSection" class="marginTopBottom10px">Player Props<div class="infoMessage">Football, Basketball, Baseball, Ice Hockey, American Football, Handball</div><div class="createMarketLayout"><button class="btSimple playerProps" id="btCreatePlayerPropsMarket" onclick=\'createMarket("playerProps")\'>4 selections</button><div class="buttonLabelToRight" id="playerPropsMessage"></div><button class="btSimple playerProps" id="btCreatePlayerPropsDummyMarket" onclick=\'createMarket("playerPropsDummy")\'>15 dummy selections</button></div></div><hr class="hRule"><div id="createFastMarketSection" class="marginTopBottom10px">Fast Market<div class="infoMessage">Football, Tennis, Table Tennis, Ice Hockey</div><div class="createMarketLayout"><button class="btSimple" id="btCreateFastMarket" onclick=\'createMarket("fast")\'><span class="ico-action-betting iconOnBtSimple"></span><span class="labelOnBtSimple">Create</span></button><div class="buttonLabelToRight" id="fastMarketMessage"></div></div></div></div></div></div><div><button onclick=\'toggleSection("footballScoreBoardSection")\' class="moreLess">Football Scoreboard (RealTime Test)</button><div id="footballScoreBoardSection" class="marginTopBottom10px hide"><div id="notFootballScoreBoardMessage" class="hide displayInRed">No Football Scoreboard found for this event.</div><div id="scoreBoardFeatures" class="hide"><div id="scoreBoardScores" class="scoreLayout"><div id="homeScoreLabel"><span class="ico-score vertMiddle marginRight2px"></span>Home Score</div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="homeScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("home")\'>Set</button><div id="awayScoreLabel"><span class="ico-score vertMiddle marginRight2px"></span>Away Score</div><input class="fdSbTools fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="awayScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("away")\'>Set</button></div><div id="scoreBoardDetails"><div class="scoreBoardLayout"><div class="iconScoreboard ico-corner"></div><div class="iconScoreboard ico-substitutions"></div><div class="iconScoreboard outlinedText ico-referee-card obg-scoreboard-football-icon-yellow-card"></div><div class="iconScoreboard outlinedText ico-referee-card obg-scoreboard-football-icon-red-card"></div><div class="iconScoreboard ico-penalty"></div><input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeSubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homeRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="homePenalties" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awaySubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdSbTools fdScoreBoardNumeric" type="number" id="awayPenalties" min="0" oninput=\'validity.valid||(value="")\'></div><button id="submitScoreBoard" class="btSubmit btSimple" onclick="submitScoreBoard()">Set</button></div></div></div></div><div id="sbToolsEventInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Event detection order:<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol></div></div></div></div><div id="sbToolsMarket" class="accordion closed"><button id="marketAccordion" class="accHeading" onclick="initSbToolsMarket()"><span class="accordionTitle">Market</span><span class="accordionHint">Set Status, Add to Carousel/Cards, Properties</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsMarket">Detected market:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsMarketInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="labelRowForSbToolsMarket"><div class="hide" id="messageForSbToolsMarket"></div><div id="labelsForDetectedMarketAndEvent"><div id="eventLabelForDetectedMarket"></div><div class="marginLeft5px fontBold" id="marketLabelForDetectedMarket"></div></div></div><div id="lockMarketSection" class="lockSection hide">Lock <input type="checkbox" id="chkLockMarket" class="chkLock chkSbTools" onclick="lockMarket()"></div></div><div id="addToCarouselSection"><hr class="hRule"><div id="carouselButtonsDiv"><div class="itemsJustifiedVertCenter"><span>Add market to Carousel or Cards</span><button class="btSimple btCarousel" id="btAddToCarousel" onclick="addMarketToCarouselOrCards()"><span id="addToCarouselButtonLabel" class="labelOnBtSimple">Add</span></button></div></div><div id="addToCarouselErrorMessage" class="marginBottom10px displayInRed"></div></div><div id="marketFeatures" class="hide"><button onclick=\'toggleSection("marketDetailsSection")\' class="moreLess">Market Details</button><div id="marketDetailsSection" class="marginTopBottom10px hide"><div class="itemsJustified"><span class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="marketIdForSbToolsMarket" class="labelRow displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketId")\'><img class="iconCopy"></button></div><hr class="hRule"><div class="itemsJustified"><span class="width95Percent displayFlex"><span class="width48percent">Template ID:</span><span id="marketTemplateIdForSbToolsMarket" class="labelRow width100percent displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketTemplateId")\'><img class="iconCopy"></button></div><div class="itemsJustified"><span class="width95Percent displayFlex"><span class="width48percent noWrap">Template Tags:</span><span id="marketTemplateTagsForSbToolsMarket" class="labelRow width100percent displayInGreen"></span></span><button class="btCopy btIcon" onclick=\'copyToClipboard("marketTemplateTags")\'><img class="iconCopy"></button></div><hr class="hRule"><div id="openMappingForTemplateTagSection" class="itemsJustified"><span class="width95Percent">Mapping for the Template Tags</span><button class="btIcon btOpenInNewWindow" onclick=\'openStaticPageInNewWindow("MarketTemplateTag.cs")\'><img class="iconOpenInNewWindow"></button></div><div id="sbMarketIdForOddsManagerSection" class="itemsJustified"><span class="width95Percent itemsJustified paddingRight8px"><span>Legacy Market ID</span><span class="displayInLightGrey">for ISA/Redis/SB Admin Client</span></span><button class="btIcon btOpenInNewWindow" onclick="getLegacyMarketId()"><img class="iconOpenInNewWindow"></button></div><div class="itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("market")\'><img class="iconOpenInNewWindow"></button></div></div><button onclick=\'toggleSection("marketStatusSection")\' class="moreLess">Market State</button><div id="marketStatusSection" class="hide"><div id="setMarketStateButtonsSection" class="setMarketStateLayout marginTopBottom10px"><button class="btSimple btSetMarketState" id="btSetMarketStateOpen" onclick=\'setMarketState("Open")\'>Open</button><button class="btSimple btSetMarketState" id="btSetMarketStateSuspended" onclick=\'setMarketState("Suspended")\'>Suspd.</button><button class="btSimple btSetMarketState" id="btSetMarketStateVoid" onclick=\'setMarketState("Void")\'>Void</button><button class="btSimple btSetMarketState" id="btSetMarketStateSettled" onclick=\'setMarketState("Settled")\'>Settled</button><button class="btSimple btSetMarketState" id="btSetMarketStateHold" onclick=\'setMarketState("Hold")\'>Hold</button></div></div><button onclick=\'toggleSection("marketPropertiesSection")\' class="moreLess">Cashout, BB, Bet Distribution, Help Text</button><div id="marketPropertiesSection" class="marginTopBottom10px hide"><div id="marketCheckboxesSection"><div id="isCashoutAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-cash-stack iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Cash Out</span></span><input type="checkbox" onclick=\'toggleMarketProperty("cashoutAvailable")\' id="chkIsCashoutAvailable" class="chkSbTools"></div><div id="isBetBuilderAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-bet-builder-seamless iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Bet Builder / SGP</span></span><input type="checkbox" onclick=\'toggleMarketProperty("betBuilderAvailable")\' id="chkIsBetBuilderAvailable" class="chkSbTools"></div><div id="isBetDistributionAvailableSection" class="iconMocksRow"><span class="width95Percent"><span class="ico-bet-trends iconMockIconColumn vertMiddle"></span><span class="iconMockLabelColumn">Bet Distribution</span></span><input type="checkbox" onclick=\'toggleMarketProperty("betDistributionAvailable")\' id="chkIsBetDistributionAvailable" class="chkSbTools"></div></div><hr class="hRule"><div class="marginTop10px">Bet Group Description:<span class="accordionHint">displayed in event page</span></div><div class="itemsJustified"><span contenteditable="true" id="fdBetGroupDescription" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setBetGroupDescription()"><img class="width16px iconSubmit"></button></div><div class="marginTop10px">Help Text:<span class="accordionHint">displayed in event tables & page</span></div><div class="itemsJustified"><span contenteditable="true" id="fdHelpText" class="fdSbTools width92percent"></span><button class="btIcon" onclick="setHelpText()"><img class="width16px iconSubmit"></button></div></div></div><div id="sbToolsMarketInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol">Market detection: parent market of the last selection from betslip.</div></div></div><div id="sbToolsSelection" class="accordion closed"><button id="changeOddsAccordion" class="accHeading" onclick="initSbToolsSelection()"><span class="accordionTitle">Selection</span><span class="accordionHint">Change Odds/Status, Add Price Boost, Pop Bets</span></button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSbToolsSelection">Detected selection:</div><button class="btInfo btIcon" onclick=\'toggleInfo("sbToolsSelectionInfo")\'><img class="iconInfoCircle"></button><div class="labelRow" id="labelForSbToolsSelection"><div class="hide" id="messageForSbToolsSelection"></div><div id="labelsForDetectedSelectionMarketAndEvent"><div id="eventLabelForDetectedSelection"></div><div id="marketLabelForDetectedSelection" class="marginLeft5px"></div><div class="marginLeft30px fontBold" id="selectionLabelForDetectedSelection"></div></div></div><div id="lockSelectionSection" class="hide lockSection">Lock <input type="checkbox" id="chkLockSelection" class="chkLock chkSbTools" onclick="lockSelection()"></div></div><div id="selectionFeatures" class="hide"><hr class="hRule"><div><div>Selection ID:</div><div class="itemsJustified marginBottom10px"><span id="selectionIdForSbToolsSelection" class="labelRow displayInGreen width95Percent"></span><button class="btCopy btIcon" onclick=\'copyToClipboard("selectionId")\'><img class="iconCopy"></button></div></div><button onclick=\'toggleSection("changeSelectionSection")\' class="moreLess">Change Odds/Status</button><div id="changeSelectionSection" class="hide"><div class="newOddsLayout"><span>Initial Odds:</span><span id="initialOddsSpan" class="displayInGreen"></span><button id="btResetOdds" class="btSimple btSubmit inactivated" onclick="resetOdds()">Reset</button><span>New Odds:</span><input class="fdSbTools" type="number" id="fdNewOdds" min="1" step="0.01" oninput=\'validity.valid||(value="")\'><button class="btSimple btSubmit" onclick="setOdds()">Set</button></div><hr class="hRule"><div id="selectionStatusSection"><div class="marginBottom5px">Selection Status:</div><div id="setSelectionStateButtonsSection" class="setSelectionStateLayout marginBottom10px"><button class="btSimple btSetSelectionState" id="btSetSelectionStateOpen" onclick=\'setSelectionState("Open")\'>Open</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateWon" onclick=\'setSelectionState("Won")\'>Won</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateLost" onclick=\'setSelectionState("Lost")\'>Lost</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateVoid" onclick=\'setSelectionState("Void")\'>Void</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateSuspended" onclick=\'setSelectionState("Suspended")\'>Suspd</button><button class="btSimple btSetSelectionState" id="btSetSelectionStateSettled" onclick=\'setSelectionState("Settled")\'>Settled</button></div></div></div><button onclick=\'toggleSection("createPriceBoostSection")\' class="moreLess">Create Price Boost</button><div id="createPriceBoostSection" class="marginTopBottom10px hide"><div class="displayFlex"><span class="keyForCreatePb">Name:</span><input class="fdSbTools flex1" id="fdCreatePbName" value=""></div><div class="displayFlex"><span class="keyForCreatePb">Bet Type:</span><span class="radioForCreatePb"><input type="radio" name="radioPbBetType" id="radioPbSingle" class="vertMiddle radioSbTools" checked="checked" onclick=\'selectRadioForPbBetType("single")\'><label for="radioPbSingle">Single</label></span><span><input type="radio" name="radioPbBetType" id="radioPbCombi" class="vertMiddle radioSbTools" onclick=\'selectRadioForPbBetType("combi")\'><label for="radioPbCombi">Combination</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Event Phase:</span><span class="radioForCreatePb"><input type="radio" name="radioPbEventPhase" id="radioCreatePbEventPrematch" class="vertMiddle radioSbTools"><label for="radioCreatePbEventPrematch" class="vertMiddle">Prematch</label></span><span class="radioForCreatePb disabledIfCombi"><input type="radio" name="radioPbEventPhase" id="radioCreatePbEventLive" class="vertMiddle radioSbTools"><label for="radioCreatePbEventLive" class="vertMiddle">Live</label></span><span class="disabledIfCombi"><input type="radio" name="radioPbEventPhase" id="radioCreatePbEventBoth" class="vertMiddle radioSbTools" checked="checked"><label for="radioCreatePbEventBoth" class="vertMiddle">All</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Payout Mode:</span><span class="radioForCreatePb"><input type="radio" name="radioPbPayoutMode" id="radioCreatePbRealMoney" class="vertMiddle radioSbTools" checked="checked"><label for="radioCreatePbRealMoney" class="vertMiddle">Real Money</label></span><span><input type="radio" name="radioPbPayoutMode" id="radioCreatePbBonusMoney" class="vertMiddle radioSbTools"><label for="radioCreatePbBonusMoney">Bonus Money</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Visibility:</span><span class="radioForCreatePb"><input type="radio" name="radioPbVisibility" id="radioPbGlobal" class="vertMiddle radioSbTools" checked="checked"><label for="radioPbGlobal">Global</label></span><span><input type="radio" name="radioPbVisibility" id="radioPbPersonal" class="vertMiddle radioSbTools"><label for="radioPbPersonal">Personal</label></span></div><div class="displayFlex"><span class="keyForCreatePb">Type:</span><span class="radioForCreatePb"><input type="radio" name="radioPbType" id="radioCreatePbPercentage" class="vertMiddle radioSbTools" onclick=\'selectRadioForPbType("percentage")\' checked="checked"><label for="radioCreatePbPercentage" class="vertMiddle">Percentage</label></span><span><input type="radio" name="radioPbType" id="radioCreatePbFixedOdds" class="vertMiddle radioSbTools" onclick=\'selectRadioForPbType("fixedOdds")\'><label for="radioCreatePbFixedOdds">Fixed Odds</label></span></div><div id="createPbPercentageValueSecion"><div class="displayFlex"><span class="keyForCreatePb">Percentage:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbPercentage" min="1" value="10" max="1000" step="1" oninput=\'validity.valid||(value="")\'></div></div><div id="createPbFixedOddsValueSecion" class="hide"><div class="displayFlex"><span class="keyForCreatePb">Fixed Odds:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbFixed" min="1" value="500" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'></div></div><div class="displayFlex"><span class="keyForCreatePb">Odds Range:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMinOdds" value="1.01" min="1.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'><span class="marginLeft5px marginRight5px">-</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMaxOdds" value="1000" min="1.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'></div><div class="displayFlex"><span class="keyForCreatePb">Stake Range:</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMinStake" value="0.01" min="0.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'><span class="marginLeft5px marginRight5px">-</span><input class="fdSbTools width23percent" type="number" id="fdCreatePbMaxStake" value="1000" min="0.01" max="1000000" step="0.01" oninput=\'validity.valid||(value="")\'></div><div class="displayFlex"><span class="keyForCreatePb">Super Boost:</span><input type="checkbox" id="chkCreatePbIsSuperBoost" class="chkSbTools"></div><div class="displayFlex"><button class="btSimple btGreen flex1" id="btCreatePbFromSelections" onclick="createPbFromSelections()">Create Price Boost</button></div><div id="betTypeCombiHintSection" class="hide fontSizeSmaller displayInGray"><span class="ico-info lineHeight20px"></span><span>Combination Price Boost</span><ul><li>requires at least two prematch selections on the betslip</li><li>created from all prematch selections found on the betslip</li></ul></div></div></div><button onclick=\'toggleSection("popularBetsSection")\' class="moreLess">Popular Bets or Pre-Built Bets</button><div id="popularBetsSection" class="marginTopBottom10px hide"><div id="popularBetsControls"><div id="isPopularBetsEnabledSection" class="hide"><div id="popularBetsNotEnabledMessage" class="displayInRed hide">Popular Bets feature not enabled</div><div id="popularPreBuiltBetsNotEnabledMessage" class="displayInRed hide">Popular Pre-Built Bets feature not enabled</div><hr id="popularBetsHr" class="hRule"><div id="bothPopularBetsNotEnabledMessage" class="displayInRed hide">Neither Popular Bets nor Popular Pre-Built Bets feature enabled</div></div><div id="popularBetsButtons"><div class="">Add detected selection or full betslip content</div><div class="displayFlex"><button id="btAddDetectedToPopBets" onclick=\'setPopularBets("addDetected")\' class="btSimple btEqualWidth">Add Detected</button><button id="btAddAllToPopBets" onclick=\'setPopularBets("addAllFromSlip")\' class="btSimple btEqualWidth">Add Full Slip</button></div><div class="checkBoxRowToLeft"><input id="chkPrematchOnly" type="checkbox" checked="checked" class="chkInlineRight chkSbTools"><span>Prematch only (as designed)</span></div><hr class="hRule"><div class="">Remove all normal or pre-built bets respectively</div><div class="displayFlex"><button id="btRemoveAllPopBets" onclick=\'setPopularBets("removeAllNormal")\' class="btSimple btEqualWidth">Remove Pop Normal</button><button id="btRemoveAllPerBuilt" onclick=\'setPopularBets("removeAllPreBuilt")\' class="btSimple btEqualWidth">Remove Pop Pre-Built</button></div></div></div><div id="popularBetsNotHomeMessage" class="displayInRed hide">Works only on Sportsbook Home</div><div id="popularBetsTooManySelectionsMessage" class="hide fontSizeSmaller displayInGray"><span class="ico-info lineHeight20px"></span><span>Pre-built cards can have maximum 3 swipeable bets</span></div></div></div><div id="sbToolsSelectionInfo" class="hide"><hr class="hRule"><img class="iconInfoSymbol"> Selection detection: Last selection from betslip</div></div><div id="sbToolsBonuses" class="accordion closed"><button id="bonusesAccordion" class="accHeading" onclick="initBonuses()"><span class="accordionTitle">Bonuses</span><span class="accordionHint">Price Boost, ACCA Insurance, Free Bet</span></button><div class="accContent"><button onclick=\'toggleSection("pbSection")\' class="moreLess">Price Boost</button><div id="pbSection" class="hide marginTopBottom10px"><div id="noPbFound" class="displayInRed">No Price Boost found</div><div id="pbDetailsLayout"><div><div class="marginBottom5px"><span id="pbNumberOfListed" class="displayInGreen fontBold marginRight3px"></span><span class="marginRight5px">PB(s) listed</span><span class="marginRight3px">&lpar;altogether</span><span id="pbNumberOf" class="displayInGreen fontBold marginRight3px"></span><span>returned by API&rpar;</span></div><div class="itemsJustified marginBottom2px"><div id="listPbByNameDiv"><input type="radio" name="radioPb" id="radioPbByName" class="radioSbTools vertMiddle" checked="checked" onclick=\'listPriceBoostsBy("pbName")\'><label for="radioPbByName" class="vertMiddle">by bonus name</label></div><div id="listPbByEventNameDiv"><input type="radio" name="radioPb" id="radioPbByEvent" class="radioSbTools vertMiddle" onclick=\'listPriceBoostsBy("eventName")\'><label for="radioPbByEvent" class="vertMiddle">by event name</label></div><div title="These boost are not applicable as the selections for them are not available in the system"><input type="radio" name="radioPb" id="radioPbGarbage" class="radioSbTools vertMiddle" onclick=\'listPriceBoostsBy("garbage")\'><label for="radioPbGarbage" class="vertMiddle">garbage</label></div></div></div><select id="pbSelector" onchange="selectPb(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="pbLegendCloseable"><div id="pbLegendSection"><div class="marginBottom2px">Icons in the above dropdown:</div><div id="pbLegendCriteriaNotMet">&#128683; PB criteria not met</div><div id="pbLegendPersonal">&#128151; Personal</div><div id="pbLegendCombi">&#x1F9E9; Combination</div><div id="pbLegendSuperBoost">&#128640; Super Boost</div><button id="btClosePbLegend" onclick="closePbLegend()">x</button></div></div><div id="pbSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="pbName" class="displayInGreen"></span></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="pbIdSpan" class="displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("priceBoostId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px"><div class="itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("priceBoost")\'><img class="iconOpenInNewWindow"></button></div><div id="goToEventPageRow" class="itemsJustified"><span class="width95Percent">Go to the event page</span><a id="goToEventPageLink" href=""><button class="btReload btIcon" onclick="goToEventPage()"><img class="iconReload"></button></a></div><div title="Enabled on SB Home and A-Z pages to which the related event belongs" id="addPbToCarouselRow" class="itemsJustified"><span id="addPbToCarouselLabel" class="width95Percent">Add to carousel or cards</span><button class="btIcon" onclick="addPbToCarouselOrCards()"><img class="iconPlus"></button></div></div><hr class="hRule"><div>Path to the Competition:<div id="pbPathToCompetition" class="displayInGreen marginBottom10px"></div><div id="boostedSelectionDiv">Boosted Selection:<div class="displayInGreen"><div id="eventLabelForPbDiv"></div><div id="marketLabelForPbDiv" class="marginLeft5px"></div><div id="selectionLabelForPbDiv" class="marginLeft30px fontBold"></div></div></div></div><hr class="hRule"><div class="displayFlex"><span class="keyForPb">Visibility:</span><span id="pbVisibility" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Type:</span><span id="pbType" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Event Phases:</span><span id="pbEventPhases" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForPb">Odds Range:</span><span id="pbMinMaxOdds" class="displayInGreen"></span></div><div id="pbStakeRangeDiv"><div class="displayFlex"><span class="keyForPb">Stake Range:</span><span id="pbMinMaxStake" class="displayInGreen"></span></div></div><div id="pbExpiryDateDiv"><div class="displayFlex"><span class="keyForPb">Expiry Date:</span><span id="pbExpiryDate" class="displayInGreen"></span></div></div></div></div></div><button onclick=\'toggleSection("profitBoostSection")\' class="moreLess">Profit Boost</button><div id="profitBoostSection" class="hide marginTopBottom10px"><div id="profitBoostNotFound" class="displayInRed">No Profit Boost found</div><div id="profitBoostLogin" class="displayInRed">Login to see your Profit Boosts.</div><div id="profitBoostDetailsLayout"><div><span id="profitBoostNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>Profit Boosts found</span></div><select id="profitBoostSelector" onchange="selectProfitBoost(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="profitBoostSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="profitBoostName" class="displayInGreen"></span></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="profitBoostId" class="displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("profitBoostId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("profitBoost")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="profitBoostRestrictionsSection">Restriction path:<div id="profitBoostPathToCompetition" class="displayInGreen marginBottom10px"></div><div id="profitBoostFurtherRestricions" class="displayInOrange hide">Further restrictions are set on Event/Market level. See the details in Trading Tools.</div><hr class="hRule"></div><div class="displayFlex"><span class="keyForProfitBoost">Profit Boost %:</span><span id="profitBoostMultiplier" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Max Winning:</span><span id="profitBoostMaxBoostedWinningsInEuro" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Bet Types:</span><span id="profitBoostBetTypes" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Event Phases:</span><span id="profitBoostEventPhases" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Stake Range:</span><span id="profitBoostStake" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForProfitBoost">Odds Range:</span><span id="profitBoostMinMaxOdds" class="displayInGreen"></span></div><div id="profitBoostNoOfSelectionsDiv"><div class="displayFlex"><span class="keyForProfitBoost">No. of Selections:</span><span id="profitBoostNoOfSelections" class="displayInGreen"></span></div></div><div id="profitBoostExpiryDateDiv"><div class="displayFlex"><span class="keyForProfitBoost">Expiry Date:</span><span id="profitBoostExpiryDate" class="displayInGreen"></span></div></div></div></div></div><button onclick=\'toggleSection("accaSection")\' class="moreLess">ACCA Insurance</button><div id="accaSection" class="hide marginTopBottom10px"><div id="accaMessage" class="displayInRed"><div id="loginToSeeAcca">Login to see ACCA insurance.</div><div id="noAccaFound">No active ACCA insurance found.</div></div><div id="accaDetailsLayout" class="hide"><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">Name:</span><span id="accaNameField" class="accaValueColumn displayInGreen"></span></div><button class="btCopy btIcon" id="btAccaName" onclick=\'copyToClipboard("accaName")\'><img class="iconCopy"></button></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="accaIdField" class="accaValueColumn displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("accaId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("acca")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="accaCategoriesSection"><div id="accaCategoriesRow" class="displayFlex"><span class="marginRight5px">Categories:</span><span id="accaCategoriesSpan" class="displayInGreen"></span></div><div id="accaCompetitionsRow"><span class="marginRight5px">Competitions:</span><span id="accaCompetitionsSpan" class="displayInOrange"></span></div><div id="accaMarketTemplatesRow"><span class="marginRight5px">Market Templates:</span><span id="accaMarketTemplatesSpan" class="displayInOrange"></span></div><hr class="hRule"></div><div id="accaEventPhaseRow"><span class="marginRight5px">Event Phase:</span><span id="accaEventPhaseSpan" class="displayInGreen"></span></div><div><span class="marginRight5px">Min Number of Selections:</span><span id="accaMinimumNumberOfSelectionsSpan" class="displayInGreen"></span></div><div><span class="marginRight5px">Min Selection Odds:</span><span id="accaSelectionOddsLimitMinSpan" class="displayInGreen"></span></div><div id="accaTotalOddsLimitMinRow"><span class="marginRight5px">Min Total Odds:</span><span id="accaTotalOddsLimitMinSpan" class="displayInGreen"></span></div><hr class="hRule"><div id="accaMinMaxStakeRow"><span class="marginRight5px">Stake Range:</span><span id="accaMinMaxStakeSpan" class="displayInGreen"></span></div><div id="accaExpiryDateRow"><span class="marginRight5px">Expiry Date:</span><span id="accaExpiryDateSpan" class="displayInGreen"></span></div></div></div><button onclick=\'toggleSection("freeBetSection")\' class="moreLess">Free or Risk Free Bet</button><div id="freeBetSection" class="hide marginTop10px"><div id="freeBetNotFound" class="displayInRed">No Free Bet found</div><div id="freeBetLogin" class="displayInRed">Login to see your Free Bets.</div><div id="freeBetDetailsLayout"><div><span id="freeBetNumberOf" class="displayInGreen fontBold marginRight5px"></span><span>Free or Risk Free Bets found</span></div><select id="freeBetSelector" onchange="selectFreeBet(value)" class="comboSbTools height20px marginBottom10px width100percent"></select><div id="freeBetSelectedDetails"><div><span class="marginRight5px">Name:</span><span id="freeBetName" class="displayInGreen"></span></div><div class="itemsJustified"><div class="width95Percent displayFlex"><span class="marginRight5px">ID:</span><span id="freeBetIdSpan" class="displayInGreen"></span></div><button class="btCopy btIcon" onclick=\'copyToClipboard("freeBetId")\'><img class="iconCopy"></button></div><div class="marginTopBottom10px itemsJustified"><div class="width95Percent itemsJustified paddingRight8px"><span><span>Open in</span><span class="sbManagerSb">sb</span><span class="sbManagerManager">manager</span></span><span class="displayInLightGrey">(aka Trading Tools)</span></div><button class="btIcon btOpenInNewWindow" onclick=\'openInTradingTools("freeBet")\'><img class="iconOpenInNewWindow"></button></div><hr class="hRule"><div id="freeBetRestrictionsSection">Restriction path:<div id="freeBetPathToCompetition" class="displayInGreen marginBottom10px"></div><div id="freeBetFurtherRestricions" class="displayInOrange hide">Further restrictions are set on Event/Market level. See the details in Trading Tools.</div><hr class="hRule"></div><div class="displayFlex"><span class="keyForFreeBet">Type:</span><span id="freeBetType" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Stake:</span><span id="freeBetStake" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Bet Types:</span><span id="freeBetBetTypes" class="displayInGreen"></span></div><div class="displayFlex"><span class="keyForFreeBet">Event Phases:</span><span id="freeBetEventPhases" class="displayInGreen"></span></div><div id="freeBetNoOfSelectionsDiv"><div class="displayFlex"><span class="keyForFreeBet">No. of Selections:</span><span id="freeBetNoOfSelections" class="displayInGreen"></span></div></div><div id="freeBetExpiryDateDiv"><div class="displayFlex"><span class="keyForFreeBet">Expiry Date:</span><span id="freeBetExpiryDate" class="displayInGreen"></span></div></div></div></div></div></div></div><div id="sbToolsBanners" class="accordion closed"><button id="bannersAccordion" class="accHeading" onclick="initBanners()"><span class="accordionTitle">Banners</span><span class="accordionHint">Carousel & Sportsbook Banners</span></button><div class="accContent"><div id="bannersMessage" class="displayInRed hide">Current page is not Sportsbook Home</div><div id="bannersFeatures" class="hide"><div class="bannersRow"><span class="keyColumnForBanners">Carousel Banners</span><span><button id="btCrlBannersMinus" class="btPlusMinus btIcon" onclick="removeCarouselBanner()"><img class="iconMinus"></button></span><span id="noOfCrlBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addCarouselBanner()"><img class="iconPlus"></button></span><span class="floatRight">Overlay<input type="checkbox" id="chkBannerOverlay" class="chkInline chkSbTools"></span></div><div class="bannersRow"><span class="keyColumnForBanners">Sportsbook Banners</span><span><button id="btSbBannersMinus" class="btPlusMinus btIcon" onclick="removeSportsbookBanner()"><img class="iconMinus"></button></span><span id="noOfSbBanners" class="noOfBanners displayInGreen"></span><span><button class="btPlusMinus btIcon" onclick="addSportsbookBanner()"><img class="iconPlus"></button></span><span class="floatRight">Diff. Color<input type="checkbox" id="chkBannerDiffColor" class="chkInline chkSbTools"></span></div></div></div></div><div id="sbToolsNative" class="accordion closed"><button id="nativeAccordion" class="accHeading" onclick="initNativeApp()"><span class="accordionTitle">Native App</span><span class="accordionHint">Navigate by postMessages</span></button><div class="accContent"><div class="nativeDetectedEventLayout"><div><div>Detected event from the betslip:</div><div class="labelRow" id="eventLabelForNative"></div></div><button id="btNativeOpenEvent" class="btSimple btNativeToggleable" onclick="openEventOnNative()"><div class="ico-maximize-event iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">OPEN</div></button></div><hr class="hRule"><div id="nativeErrorMessage" class="displayInRed extraCondensed hide"><hr class="hRule"></div><div class="marginTopBottom10px nativeBottomBarButtons"><button id="btNativeBack" class="btSimple" onclick=\'nativeClick("back")\'><div class="ico-arrow-back iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Back</div></button><button id="btNativeHome" class="btSimple btNativeToggleable" onclick=\'nativeClick("home")\'><div class="ico-home-bottom-bar iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Home</div></button><button id="btNativeAz" class="btSimple btNativeToggleable" onclick=\'nativeClick("az")\'><div class="ico-all-sports-search iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">A-Z</div></button><button id="btNativeLive" class="btSimple btNativeToggleable" onclick=\'nativeClick("live")\'><div class="ico-live-bottom-bar iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Live</div></button><button id="btNativeMyBets" class="btSimple loggedInOnly btNativeToggleable" onclick=\'nativeClick("myBets")\'><div class="ico-my-bets iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">My Bets</div></button><button id="btNativeBetslip" class="btSimple btWithBadge" onclick=\'nativeClick("betSlip")\'><div class="ico-betslip-bottom iconNativeBottomBarButton"></div><div class="labelNativeBottomBarButton">Betslip</div><div id="badgeNativeBetslip" class="badgeNative badgeNativeBetslip hide"></div><div id="badgeNativeBbBetslip" class="badgeNative badgeNativeBbBetslip hide"></div></button></div><div id="nativeOtherSection" class="marginTopBottom10px nativeOtherButtons"><button id="btNativeBetBuilder" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("betBuilder")\'><div id="iconBtNativeBetBuilder" class="ico-bet-builder iconNativeOtherButton"></div><div id="labelBtNativeBetBuilder" class="labelNativeOtherButton">Bet Builder</div></button><button id="btNativeBoost" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("boost")\'><div class="ico-price-boost iconNativeOtherButton"></div><div class="labelNativeOtherButton">Boost</div></button><button id="btNativeLiveSC" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("lsc")\'><div class="ico-live-streaming iconNativeOtherButton"></div><div class="labelNativeOtherButton">LS Calendar</div></button><button id="btNativeStartingSoon" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("startingSoon")\'><div class="ico-starting-soon iconNativeOtherButton"></div><div class="labelNativeOtherButton">Start Soon</div></button><button id="btNativeSettings" class="btNativeOthers btNativeToggleable" onclick=\'nativeClick("settings")\'><div class="ico-settings iconNativeOtherButton"></div><div class="labelNativeOtherButton">Settings</div></button></div><div id="nativeQuickLinksSection" class="hide"><div class="displayFlex"><span class="width25percent">Quick Links</span><select id="quickLinkSelector" onchange="selectQuickLink(value)" class="comboSbTools height20px marginBottom10px width75percent"></select></div></div><div id="nativeAzSection" class="hide marginTopBottom10px"><div class="displayFlex"><span class="width25percent">Category</span><select id="categorySelector" onchange="selectCategory(value)" class="comboSbTools height20px marginBottom10px width75percent"></select></div><div class="displayFlex"><span class="width25percent">Region</span><select id="regionSelector" onchange="selectRegion(value)" class="comboSbTools height20px marginBottom10px width75percent inactivated"></select></div><div class="displayFlex"><span class="width25percent">Competition</span><select id="competitionSelector" onchange="selectCompetition(value)" class="comboSbTools height20px width75percent inactivated"></select></div></div><div id="nativeBetBuilderSection" class="marginTopBottom10px hide"><div class="displayFlex"><span id="nativeBetBuilderEventLabel" class="width23percent">BB Event</span><select id="nativeBetBuilderEventSelector" onchange="selectBetuilderEvent(value)" class="comboSbTools height20px marginBottom10px width80percent"></select></div><div id="nativeBetBuilderEventsError" class="displayInRed hide">Open a Bet Builder accordion on the page.</div></div></div></div><div id="sbToolsStreamMappingHelper" class="accordion closed"><button id="streamMappingHelperAccordion" class="accHeading" onclick="initStreamMappingHelper()">IDs for stream mapping (probably YAGNI)</button><div class="accContent">Get LIVE Provider Event IDs for mapping:<div class="streamIdsLayout"><button id="getTwitchProviderIds" class="btSimple" onclick="getTwitchProviderIds()">Twitch</button><button id="getPerformProviderIds" class="btSimple" onclick="getPerformProviderIds()">Perform</button><div id="twitchResults" class="extraCondensed"></div><div id="performResults" class="extraCondensed"></div></div></div></div></div><style>#sportsbookToolContent{line-height:18px}.itemsJustified{display:flex;justify-content:space-between;align-items:flex-start}.itemsJustifiedVertCenter{display:flex;justify-content:space-between;align-items:center}.checkBoxRowToRight{display:flex;align-items:center;justify-content:flex-end}.checkBoxRowToLeft,.radioRowToLeft{margin-left:2px;display:flex;align-items:center;justify-content:flex-start}#performResults,#twitchResults{margin-left:5px;margin-top:5px}.accordionHint{float:right;font-size:x-small;color:gray}.width100percent{width:100%}.width48percent{width:48%}.width75percent{width:75%}.width17percent{width:17%}.width80percent{width:80%}.width23percent{width:23%}.width92percent{width:92%}.iconScoreboard{font-size:initial;margin-bottom:2px}.vertMiddle{vertical-align:middle}.outlinedText{-webkit-text-stroke:1px #444}.keyColumnForBanners{width:130px;display:inline-block}.displayInGray{color:gray}.fontSizeSmaller{font-size:smaller}#betTypeCombiHintSection span{display:inline-block;vertical-align:middle;margin-right:3px}#popularBetsTooManySelectionsMessage span{vertical-align:middle;margin-right:3px}#betTypeCombiHintSection ul{margin:unset;line-height:15px;padding-left:20px}.lineHeight20px{line-height:20px}.keyForPb{width:30%}.keyForFreeBet{width:35%}.keyForCreatePb{width:27%}.radioForCreatePb{width:29%}#createPriceBoostSection{line-height:20px}.keyForProfitBoost{width:35%}.bannersRow{line-height:25px}.paddingRight8px{padding-right:8px}.noOfBanners{width:20px;display:inline-block;text-align:center}.btSimple{border:1px solid #444;border-radius:3px;box-shadow:0 1px #666;margin:2px;cursor:pointer;line-height:1em;font-size:inherit;padding:2px;color:#444;height:fit-content}.btEqualWidth{flex:1}@media (hover:hover){.btSimple:hover{background-color:#fff}}.btSimple:active{box-shadow:0 0 #666;background-color:#fff;transform:translateY(1px)}.keyForContext{width:32%}.keyForEventDetails,.width25percent{width:25%}.valueForContext{width:68%;color:#008d90}.valueForEventDetails{width:75%}.truncatable{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.marginTop5px{margin-top:5px}.marginBottom2px{margin-bottom:2px}.marginBottom5px{margin-bottom:5px}.marginBottom10px{margin-bottom:10px}.marginTopBottom10px{margin-top:10px;margin-bottom:10px}.marginTopBottom5px{margin-top:5px;margin-bottom:5px}.marginTop10px{margin-top:10px}.marginRight2px{margin-right:2px}.marginRight5px{margin-right:5px}.marginRight3px{margin-right:3px}.marginRight10px{margin-right:10px}.marginLeft5px{margin-left:5px}.marginLeft15px{margin-left:15px}.marginLeft30px{margin-left:30px}.height20px{height:20px}.chkInline{vertical-align:middle;margin-left:5px}.chkInlineRight{vertical-align:middle;margin-right:5px}#initialOddsSpan{margin-left:4px}.scoreBoardExtrasKey{width:110px}.labelRow{word-break:break-word}.noWrap{white-space:nowrap}.lockSection{display:flex;justify-content:flex-end;align-self:start}.infoList{margin:3px;padding-inline-start:25px}.detectedEntitySection{display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto;margin-bottom:10px}.streamIdsLayout{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.align-right{text-align:right}.buttonLabelToRight{margin-left:8px}.scoreLayout{margin-bottom:10px;display:grid;grid-template-columns:33% 45px auto;grid-template-rows:1fr 1fr;align-items:center}#scoreBoardDetails{border:1px solid #ccc;margin-bottom:15px}.segmentChangeSectionHint{font-size:x-small;color:#a00000;font-weight:700;margin-bottom:5px;margin-top:5px;font-stretch:extra-condensed}.scoreBoardLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;grid-template-rows:auto auto auto;padding:10px;justify-items:center}.iconMocksRow{display:flex;justify-content:space-between}.iconOnBtSimple{margin-right:3px;vertical-align:middle}.labelOnBtSimple{vertical-align:middle}.iconMockIconColumn{display:inline-block;text-align:center;width:25px}.iconNativeBottomBarButton{font-size:large}.iconNativeOtherButton{color:#444}.labelNativeOtherButton{margin-top:1px;font-size:x-small;font-stretch:condensed}.labelNativeBottomBarButton{font-stretch:condensed}#pbLegendSection{position:relative;margin-top:-10px;margin-bottom:10px;line-height:normal;font-size:x-small;border:1px solid #ccc;border-top:none;padding:5px}#btClosePbLegend{position:absolute;bottom:0;right:0;border-style:none;cursor:pointer}#btNativeOpenEvent{height:38px}.iconMockLabelColumn{display:inline-block}.monoSpaceFont{font-family:monospace}.resolveLimitationRow{display:grid;grid-template-columns:auto 100px;align-items:baseline}#iframeNotMatchingWarningMessage,#obgStateFrozenMessage{margin-bottom:8px;color:#a00000;font-weight:700;border:1px solid #a00000;padding:5px}.width48percent{width:48%}.keyColumnForExtras{width:120px;display:inline-block}#setEventPhaseButtonsLayout{display:grid;grid-template-columns:1fr 1fr 1fr;margin-bottom:5px}.setMarketStateLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr}.setSelectionStateLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr}.nativeBottomBarButtons{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr}.nativeOtherButtons{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr}.badgeNative{position:absolute;left:29px;top:-4px;min-height:16px;min-width:16px;line-height:16px;border-radius:8px;padding:0 3px;text-align:center;font-size:10px;color:#fff}.badgeNativeBetslip{background-color:#cc8936}.badgeNativeBbBetslip{background-color:#327bff}.nativeDetectedEventLayout{display:grid;grid-template-columns:5fr 1fr}.createMarketLayout{display:grid;grid-template-columns:55% auto;align-items:center}.newOddsLayout{margin-top:10px;align-items:center;display:grid;grid-template-rows:auto auto;grid-template-columns:25% 20% auto}.newOddsKeys{width:50px}.btSubmit{margin-left:5px;width:45px}.vertical{writing-mode:tb-rl;transform:rotate(-180deg);margin-bottom:5px}#submitScoreBoard{margin-left:10px;margin-bottom:10px}.fdSbTools{border:1px solid #444;padding-left:3px;color:#0000a0;height:fit-content}.comboSbTools{border:1px solid #444;font-size:inherit;color:#444}.fdScoreBoardNumeric{width:45px;margin-bottom:1px}#sportsbookTool{background-color:#fff;color:#444;font-family:Arial;width:310px;height:auto;position:fixed;border:2px solid #d3d3d3;top:0;left:0;z-index:5000;box-shadow:0 0 35px 10px #000;font-size:12px;overflow:auto}#sportsbookToolNameLeft{font-weight:900;margin-right:2px;letter-spacing:-1px;color:#00b9bd}#sportsbookToolNameRight{color:#f9a133}.sbManagerSb{color:#00b9bd;font-weight:900;margin-left:4px;margin-right:2px}.sbManagerManager{color:#cc8936;margin-right:4px}#sportsbookToolHeader{padding:3px;padding-bottom:5px;cursor:move;z-index:5000;background:#1c3448;color:#ddd}#sportsbookToolHeaderTitle{display:inline-block;padding-top:3px;padding-left:4px}#sportsbookToolName{font-size:18px;margin-right:5px}#sportsbookToolAuthorName{font-size:8px;line-height:30%;font-weight:400}.extraCondensed{font-stretch:extra-condensed}.sportsbookToolHeaderButtons{color:#fff;width:25px;height:20px;margin:1px;padding:2px;border-color:#666}#btMinimizeAll,#btZoomInOut{background:#646464}@media (hover:hover){#btMinimizeAll:hover,#btZoomInOut:hover{background:#1e1e1e}}#btMinimizeAll:active,#btZoomInOut:active{background:#1e1e1e}#btMinimizeClosed{background-color:#00b9bd}@media (hover:hover){#btMinimizeClosed:hover{background:#008d90}}#btMinimizeClosed:active{background:#008d90}.btWithBadge{position:relative}#btClose{background:#c86464}@media (hover:hover){#btClose:hover{background:#a00000}}#btClose:active{background:#a00000}.infoMessage{opacity:.5;font-size:x-small}.displayInRed{color:#a00000}.displayInGreen{color:#008d90}.displayInOrange{color:#cc8936}.displayInLightGrey{color:#ccc}.hide{display:none}.show{display:block}.accHeading{border-radius:none;background-color:#eee;color:#444;cursor:pointer;padding:8px;width:100%;text-align:left;border:none;outline:0;transition:.4s}@media (hover:hover){.accHeading:hover,.btNativeOthers:hover,.moreLess:hover{background-color:#ccc}}.accHeading:active,.btNativeOthers:active,.moreLess:active{background-color:#ccc}.open .accHeading{background-color:#ccc}.accContent{margin:10px;background-color:#fff;overflow:hidden}.closed .accContent{display:none}.open .accContent{display:block}.hRule{border-top:1px solid #eee}.scaledTo70percent{transform:scale(.7);transform-origin:0 0}.floatRight{float:right}.carouselList{padding-left:15px}.visibilityHidden{visibility:hidden}.displayInGreenGlow{text-shadow:0 0 7px #fff,0 0 10px #fff,0 0 21px #fff,0 0 42px #008d90,0 0 82px #008d90,0 0 92px #008d90,0 0 102px #008d90,0 0 151px #008d90}#limitedFunctionsMessage{color:#a00000;font-weight:700;float:right;font-stretch:extra-condensed}.fontBold{font-weight:700}.chkLock{margin-left:5px;align-self:center}.chkSbTools{cursor:pointer;align-self:center;accent-color:#008d90}.scoreBoardExtrasDetails{transform:scale(.85);transform-origin:left}.radioSbTools{margin-right:3px;cursor:pointer;accent-color:#008d90}.btCopy{min-width:16px}.btIcon{opacity:60%;border:none;background:0 0;cursor:pointer;vertical-align:middle;padding:0}@media (hover:hover){.btIcon:hover{opacity:100%}}.btIcon:active{opacity:20%}.btOpenInNewWindow{width:15px}.iconHeader{width:12px}.segmentKeyColumn{width:35px;display:inline-block}.width16px{width:16px}.iconSubmit{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M256,0C114.615,0,0,114.615,0,256s114.615,256,256,256s256-114.615,256-256S397.385,0,256,0z M219.429,367.932L108.606,257.108l38.789-38.789l72.033,72.035L355.463,154.32l38.789,38.789L219.429,367.932z"/></svg>\')}.iconCopy{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" style="enable-background:new 0 0 512 512" xml:space="preserve" viewBox="83.2 56 345.6 400" width="16px" height="14px"><path fill="black" d="M337.8,56H119.6c-20.1,0-36.4,16.3-36.4,36.4v254.5h36.4V92.4h218.2V56z M392.4,128.7h-200c-20.1,0-36.4,16.3-36.4,36.4v254.5c0,20.1,16.3,36.4,36.4,36.4h200c20.1,0,36.4-16.3,36.4-36.4V165.1C428.7,145,412.5,128.7,392.4,128.7z M392.4,419.6h-200V165.1h200V419.6z"></path></svg>\')}.iconClose{content:url(\'data:image/svg+xml;utf8,<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M954.304 190.336a15.552 15.552 0 0 1 0 21.952l-300.032 300.032 298.56 298.56a15.616 15.616 0 0 1 0 22.016l-120.96 120.896a15.552 15.552 0 0 1-21.952 0L511.36 655.232 214.272 952.32a15.552 15.552 0 0 1-21.952 0l-120.896-120.896a15.488 15.488 0 0 1 0-21.952l297.152-297.152L69.888 213.76a15.552 15.552 0 0 1 0-21.952l120.896-120.896a15.552 15.552 0 0 1 21.952 0L511.36 369.472l300.096-300.032a15.36 15.36 0 0 1 21.952 0l120.896 120.896z"/></svg>\')}.iconMaximize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <path fill="white" d="M1,9h14V7H1V9z M1,14h14v-2H1V14z M1,2v2h14V2H1z"/></svg>\')}.iconMinimize{content:url(\'data:image/svg+xml;utf8,<svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <rect width="16" height="16" id="icon-bound" fill="none"/> <polygon fill="white" points="15,7 1,7 1,9 15,9"/></svg>\')}.iconZoomOut{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-1.5 2v1h3v-1h-3z"/></svg>\')}.iconZoomIn{content:url(\'data:image/svg+xml;utf8,<svg width="8px" height="8px" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg"> <path fill="white" d="M3.5 0c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c.61 0 1.19-.16 1.69-.44a1 1 0 0 0 .09.13l1 1.03a1.02 1.02 0 1 0 1.44-1.44l-1.03-1a1 1 0 0 0-.13-.09c.27-.5.44-1.08.44-1.69 0-1.93-1.57-3.5-3.5-3.5zm0 1c1.39 0 2.5 1.11 2.5 2.5 0 .59-.2 1.14-.53 1.56-.01.01-.02.02-.03.03a1 1 0 0 0-.06.03 1 1 0 0 0-.25.28c-.44.37-1.01.59-1.63.59-1.39 0-2.5-1.11-2.5-2.5s1.11-2.5 2.5-2.5zm-.5 1v1h-1v1h1v1h1v-1h1v-1h-1v-1h-1z"/></svg>\')}.iconOpenInNewWindow{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 194.818 194.818" height="14px" style="enable-background:new 0 0 194.818 194.818;" xml:space="preserve"><g><path d="M185.818,2.161h-57.04c-4.971,0-9,4.029-9,9s4.029,9,9,9h35.312l-86.3,86.3c-3.515,3.515-3.515,9.213,0,12.728c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636l86.3-86.3v35.313c0,4.971,4.029,9,9,9s9-4.029,9-9v-57.04C194.818,6.19,190.789,2.161,185.818,2.161z"/><path d="M149,77.201c-4.971,0-9,4.029-9,9v88.456H18v-122h93.778c4.971,0,9-4.029,9-9s-4.029-9-9-9H9c-4.971,0-9,4.029-9,9v140c0,4.971,4.029,9,9,9h140c4.971,0,9-4.029,9-9V86.201C158,81.23,153.971,77.201,149,77.201z"/></g></svg>\')}.iconReload{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 492.883 492.883" style="enable-background:new 0 0 492.883 492.883;" xml:space="preserve" width="14px" height="12px"><g><path d="M122.941,374.241c-20.1-18.1-34.6-39.8-44.1-63.1c-25.2-61.8-13.4-135.3,35.8-186l45.4,45.4c2.5,2.5,7,0.7,7.6-3l24.8-162.3c0.4-2.7-1.9-5-4.6-4.6l-162.4,24.8c-3.7,0.6-5.5,5.1-3,7.6l45.5,45.5c-75.1,76.8-87.9,192-38.6,282c14.8,27.1,35.3,51.9,61.4,72.7c44.4,35.3,99,52.2,153.2,51.1l10.2-66.7C207.441,421.641,159.441,407.241,122.941,374.241z"/><path d="M424.941,414.341c75.1-76.8,87.9-192,38.6-282c-14.8-27.1-35.3-51.9-61.4-72.7c-44.4-35.3-99-52.2-153.2-51.1l-10.2,66.7c46.6-4,94.7,10.4,131.2,43.4c20.1,18.1,34.6,39.8,44.1,63.1c25.2,61.8,13.4,135.3-35.8,186l-45.4-45.4c-2.5-2.5-7-0.7-7.6,3l-24.8,162.3c-0.4,2.7,1.9,5,4.6,4.6l162.4-24.8c3.7-0.6,5.4-5.1,3-7.6L424.941,414.341z"/></g></svg>\')}.iconGoTo{content:url(\'data:image/svg+xml;utf8,<svg viewBox="0 -2 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_iconCarrier"><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" height="14px"><g transform="translate(-360.000000, -933.000000)" fill="#000000"><path d="M388,933 L368,933 C365.791,933 364,934.791 364,937 L364,941 L366,941 L366,937 C366,935.896 366.896,935 368,935 L388,935 C389.104,935 390,935.896 390,937 L390,957 C390,958.104 389.104,959 388,959 L368,959 C366.896,959 366,958.104 366,957 L366,953 L364,953 L364,957 C364,959.209 365.791,961 368,961 L388,961 C390.209,961 392,959.209 392,957 L392,937 C392,934.791 390.209,933 388,933 L388,933 Z M377.343,953.243 C376.953,953.633 376.953,954.267 377.343,954.657 C377.733,955.048 378.367,955.048 378.758,954.657 L385.657,947.758 C385.865,947.549 385.954,947.272 385.94,947 C385.954,946.728 385.865,946.451 385.657,946.243 L378.758,939.344 C378.367,938.953 377.733,938.953 377.343,939.344 C376.953,939.733 376.953,940.367 377.343,940.758 L382.586,946 L361,946 C360.447,946 360,946.448 360,947 C360,947.553 360.447,948 361,948 L382.586,948 L377.343,953.243 L377.343,953.243 Z" id="arrow-right"></path></g></g></g></svg>\')}.btPlusMinus{width:16px}.iconPlus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve" height="14px"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941h-59.882V57.059c0-4.971-4.029-9-9-9s-9,4.029-9,9v59.882H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h59.882v59.882c0,4.971,4.029,9,9,9s9-4.029,9-9v-59.882h59.882c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconMinus{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 251.882 251.882" style="enable-background:new 0 0 251.882 251.882;" xml:space="preserve" height="14px"><g><path d="M215.037,36.846c-49.129-49.128-129.063-49.128-178.191,0c-49.127,49.127-49.127,129.063,0,178.19c24.564,24.564,56.83,36.846,89.096,36.846s64.531-12.282,89.096-36.846C264.164,165.909,264.164,85.973,215.037,36.846z M49.574,202.309c-42.109-42.109-42.109-110.626,0-152.735c21.055-21.054,48.711-31.582,76.367-31.582s55.313,10.527,76.367,31.582c42.109,42.109,42.109,110.626,0,152.735C160.199,244.417,91.683,244.417,49.574,202.309z"/><path d="M194.823,116.941H57.059c-4.971,0-9,4.029-9,9s4.029,9,9,9h137.764c4.971,0,9-4.029,9-9S199.794,116.941,194.823,116.941z"/></g></svg>\')}.iconInfoCircle,.iconInfoSymbol{content:url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 202.978 202.978" style="enable-background:new 0 0 202.978 202.978" xml:space="preserve" height="14px"><g><path fill="black" d="M100.942,0.001C44.9,0.304-0.297,45.98,0.006,102.031c0.293,56.051,45.998,101.238,102.02,100.945c56.081-0.303,101.248-45.978,100.945-102.02C202.659,44.886,157.013-0.292,100.942,0.001z M101.948,186.436c-46.916,0.234-85.108-37.576-85.372-84.492c-0.244-46.907,37.537-85.157,84.453-85.411c46.926-0.254,85.167,37.596,85.421,84.483C186.695,147.951,148.855,186.182,101.948,186.436z M116.984,145.899l-0.42-75.865l-39.149,0.254l0.078,16.6l10.63-0.059l0.313,59.237l-11.275,0.039l0.088,15.857l49.134-0.264l-0.098-15.847L116.984,145.899z M102.065,58.837c9.575-0.039,15.349-6.448,15.3-14.323c-0.254-8.07-5.882-14.225-15.095-14.186c-9.184,0.059-15.173,6.292-15.134,14.362C87.185,52.555,93.028,58.906,102.065,58.837z"/></g></svg>\')}.btInfo{justify-self:end}.iconInfoSymbol{opacity:60%;width:12px;margin-right:5px}.btCarousel{width:32%;margin-bottom:5px;margin-right:5px}.btGreen{background-color:#008d90;color:#fff}@media (hover:hover){.btGreen:hover{background-color:#00b9bd}}.btGreen:active{background-color:#00b9bd}.btOrange{background-color:#cc8936;color:#fff}@media (hover:hover){.btOrange:hover{background-color:#f9a133}}.btOrange:active{background-color:#f9a133}.moreLess{width:100%;border:none;cursor:pointer;padding:4px;margin-top:2px;margin-bottom:2px;color:#444}.btNativeOthers{border:none;cursor:pointer;padding:6px 2px 6px 2px;margin:2px}.width95Percent{width:95%}.displayFlex{display:flex}.flex1{flex:1}.inactivated{pointer-events:none;opacity:40%}</style>';

        sportsbookTool.innerHTML = htmlContent;
    }

    function isUnsecureHTTP() {
        if (location.protocol === "http:") {
            return true
        } else {
            return false
        };
    }

    // function checkIfObgStateIsFrozen() {
    //     const obgStateFrozenMessage = getElementById("obgStateFrozenMessage");
    //     if (Object.isFrozen(obgState.sportsbook)) {
    //         show(obgStateFrozenMessage);
    //     } else { hide(obgStateFrozenMessage) };
    // }

    function getIsItSportsbookPage() {
        if (IS_OBGNAVIGATIONSUPPORTED_EXPOSED
            || IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED
            || IS_OBGSTARTUP_EXPOSED
            || IS_OBGGLOBALAPPCONTEXT_EXPOSED) {
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
                    return obgState.b2b !== undefined;
                } catch { return false; }
            }
        }
    }

    function isDefined(entityNameAsString) {
        try {
            eval(entityNameAsString);
        } catch (error) {
            if (error instanceof ReferenceError) {
                return false;
            }
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

    function getIframeEnv() {
        if (iframeURL.includes(".alpha.")) {
            return "alpha";
        }
        if (iframeURL.includes(".test.")) {
            return "test";
        }
        if (iframeURL.includes(".qa.")) {
            return "qa";
        }
        return "prod";
    }

    function getB2X() {
        if (IS_B2B_IFRAME_ONLY || IS_SPORTSBOOK_IN_IFRAME) {
            return "B2B";
        } return "B2C";
    }



    function getStaticContextId() {
        if (IS_OBGSTATE_EXPOSED) {
            return obgState["b2b"].userContext.staticContextId;
        } return obgClientEnvironmentConfig.startupContext.contextId.staticContextId;
    }

    function getUserContextId() {
        if (IS_OBGSTATE_EXPOSED) {
            return obgState["b2b"].userContext.userContextId;
        } return obgClientEnvironmentConfig.startupContext.contextId.userContextId;
    }

    // function getIsTouchBrowser() {
    //     return "ontouchstart" in document.documentElement;
    // }

    function getSbVersion() {
        if (IS_SPORTSBOOK_IN_IFRAME) {
            return "Open SB iframe to get it";
        }
        versionNumber = getSbVersionNumber();
        if (versionNumber == null) {
            return "Data not available";
        }
        if (IS_B2B_IFRAME_ONLY) {
            return "SBB2B-FE-" + versionNumber;
        }
        return "OBGA-" + versionNumber;
    }

    function getSbVersionNumber() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.appContext.version;
        }
        if (IS_NODECONTEXT_EXPOSED) {
            return nodeContext.version;
        }
        if (IS_OBGSTATE_EXPOSED) {
            return obgState.appContext.version;
        }
        return null;
        // try {
        //     return obgClientEnvironmentConfig.startupContext.appContext.version;
        // } catch {
        //     try {
        //         return obgState.appContext.version;
        //     } catch {
        //         return null;
        //     }
        // }
    }

    function getDeviceType() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) { return obgClientEnvironmentConfig.startupContext.device.deviceType; }
        if (IS_OBGSTATE_EXPOSED) { return obgState.appContext.device.deviceType; }
        if (IS_OBGGLOBALAPPCONTEXT_EXPOSED) { return obgGlobalAppContext.deviceType; }
        if (IS_NODECONTEXT_EXPOSED) { return nodeContext.deviceType; }
        return "couldn't get";
    }

    function getIsAnyEssentialObjectExposed() {
        return IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED || IS_OBGSTATE_EXPOSED || IS_OBGGLOBALAPPCONTEXT_EXPOSED || IS_OBGSTARTUP_EXPOSED;
    }

    function getDeviceExperience() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) { return obgClientEnvironmentConfig.startupContext.device.deviceExperience; }
        if (IS_OBGSTATE_EXPOSED) { return obgState.appContext.device.deviceExperience; }
        if (IS_OBGGLOBALAPPCONTEXT_EXPOSED) { return obgState.appContext.device.deviceExperience; }
        if (IS_NODECONTEXT_EXPOSED) { return nodeContext.deviceExperience; }
        return null;
    }

    function getEnvironmentToDisplay() {
        let environmentToDisplay;
        try {
            environmentToDisplay = ENVIRONMENT.toUpperCase();
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

    function getEnvironment() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.appContext.environment;
        }
        if (IS_OBGSTARTUP_EXPOSED) {
            return obgStartup.config.appSettings.environment;
        }
        return obgState.appContext.environment;
    }

    function getCurrentRouteName() {
        return obgState.route.current.name;
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

        // if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
        //     let marketsUsingSingleGameParlay = obgClientEnvironmentConfig.startupContext.config.sportsbookUi.betBuilder.marketsUsingSingleGameParlay;
        //     let languageCode = obgClientEnvironmentConfig.startupContext.config.core.market.languageCode;
        //     for (let market of marketsUsingSingleGameParlay) {
        //         if (market == languageCode) {
        //             return true;
        //         }
        //     }
        //     return false;
        // } else {
        //     if (BRAND_NAME == "betsafe" && CULTURE == "en-CA") {
        //         return false;
        //     }
        //     if (CULTURE == "en-CA" || CULTURE == "en-US") {
        //         return true;
        //     }
        // }
        // return false;
    }

    function getCulture() {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return obgClientEnvironmentConfig.startupContext.appContext.device.culture;
        }
        if (IS_OBGSTATE_EXPOSED) {
            return obgState.appContext.device.culture;
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
        if (IS_OBGSTATE_EXPOSED) { return obgState.market.currentMarket.languageCode; }
        if (IS_NODECONTEXT_EXPOSED) { return nodeContext.detectedMarket.code; }
        if (IS_OBGSTARTUP_EXPOSED) {
            return obgStartup.config.core.market.languageCode;
        }
        return null;
    }

    function getAreAllSelectionsInObgState(marketSelectionIds) {
        for (let id of marketSelectionIds) {
            if (!obgState.sportsbook.selection.selections[id]) {
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
        if (brandName === "nordicbet" && IS_OBGSTATE_EXPOSED) {
            if (obgState?.sportsbook?.features?.arcticbet) {
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
        if (!IS_OBGSTATE_EXPOSED) {
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
        } else if (!IS_OBGSTATE_EXPOSED) {
            limitFeatures("obgState");
        } else if (!IS_OBGRT_EXPOSED) {
            limitFeatures("obgRt");
        } else if (Object.isSealed(obgState.sportsbook)) {
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
                    removeObgStateFeatures();
                    break;
                case "iframe":
                    limitedFunctionsMessageText = "Sportsbook is in iframe";
                    removeObgStateFeatures();
                    break;
                case "obgRt":
                    limitedFunctionsMessageText = "obgRt not exposed";
                    removeObgRtFeatures()
                    break;
                case "sealStore":
                    limitedFunctionsMessageText = "sealStore is enabled";
                    removeObgStateFeatures();
                    break;
            }

            function removeObgStateFeatures() {
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
        if (IS_OBGSTATE_EXPOSED) {
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
        } else if (!IS_OBGSTATE_EXPOSED || !IS_OBGRT_EXPOSED) {
            show(obgStateAndRtSection);
            hide(openIframeSection);
        } else {
            if (Object.isSealed(obgState.sportsbook)){
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
        getElementById("B2BorB2C").innerText = " (" + B2X + ")";
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
            let iframeEnv = getIframeEnv();
            if (ENVIRONMENT != iframeEnv) {
                hide(openIframeRow);
                show(notMatchingIframeSection);
                btOpenMatchingIframe.innerText = ENVIRONMENT.toUpperCase() + " iframe";
                btOpenFullPageWithMatchingIframe.innerText = ENVIRONMENT.toUpperCase() + " full";
                notMatchingIframeEnvSpan.innerText = " " + iframeEnv.toUpperCase() + " ";
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
        var params = [];
        var messageRowId;
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
                messageRowId = "obgStateAndRtRow";
                break;
            case "disableSealStore":
                params.push(TURN_SEALSTORE_OFF);
                messageRowId = "disableSealStoreRow";
                break;
            case "openMatchingIframe":
                url = new URL(replaceEnvInIframeURL(getCleanIframeURL(iframeURL)) + getPathAndParamsFromSportsbookURL(window.location.href));
                params.push(EXPOSE_OBGSTATE, EXPOSE_OBGRT);
                messageRowId = "openMatchingIframeRow";
                break;
            case "openIframe":
                url = new URL(getCleanIframeURL(iframeURL) + getPathAndParamsFromSportsbookURL(window.location.href));
                params.push(EXPOSE_OBGSTATE, EXPOSE_OBGRT);
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
            // case "stopCarouselAutoplay":
            //     params.push(new URLParam("configOverride", "[(sportsbookUi.sportsbookCarousel.autoplayInterval=1000000)]"));
            //     messageRowId = "stopCarouselAutoplayRow";
            //     break;
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
        return obgState.sportsbook.event.events[eventId].slug;
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
        let iframeEnv = getIframeEnv();
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
        return obgState.sportsbook.sportCatalog.routeKey;
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
            case "accaName":
                text = accaName;
                break;
            case "accaId":
                text = accaId;
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

    window.lockEvent = () => {
        var checkBox = getElementById("chkLockEventForSbToolsEvent");
        var detectedOrLockedRow = getElementById("detectedOrLockedRowForSbToolsEvent");
        labelRow = getElementById("eventLabelForSbToolsEvent");

        if (checkBox.checked) {
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

    function getEventIdByMarketId(marketId) {
        return obgState.sportsbook.eventMarket.markets[marketId].eventId;
    }

    function getEventIdBySelectionId(selectionId) {
        return getEventIdByMarketId(getMarketIdBySelectionId(selectionId));
    }

    function getSelectionsByMarketId(marketId) {
        return obgState.sportsbook.selection.marketMap[marketId];
    }

    function getEventHasBetBuilder(eventId) {
        return !!obgState.sportsbook.event.events[eventId]?.tags?.bc_bb_available;
    }

    function getMarketIdBySelectionId(selectionId) {
        let id = obgState.sportsbook.selection.selections[selectionId].marketId;
        if (id != "") {
            return id;
        }
        let marketMap = obgState.sportsbook.selection.marketMap;
        for (let key in marketMap) {
            if (key !== "" && marketMap[key].includes(selectionId)) {
                return key;
            }
        }
    }

    function getMarketIdByEventIdAndMarketTemplateId(eventId, marketTemplateId) {
        try {
            return obgState.sportsbook.eventMarket.marketMap[eventId][marketTemplateId][0];
        } catch { return undefined; }
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
            fdHelpText.innerText = obgState.sportsbook.eventMarket.markets[marketId].helpText;
            fdHelpText.addEventListener("input", () => {
                trimString(fdHelpText, 255)
            }, false);
        }

        function populateBetGroupDescription() {
            fdBetGroupDescription.innerText = obgState.sportsbook.eventMarket.markets[marketId].betGroupDescription;
            fdBetGroupDescription.addEventListener("input", () => {
                trimString(fdBetGroupDescription, 255)
            }, false);
        }

        window.setHelpText = () => {
            obgState.sportsbook.eventMarket.markets[marketId].helpText = fdHelpText.textContent;
            triggerMarketChangeDetection();
        }

        window.setBetGroupDescription = () => {
            obgState.sportsbook.eventMarket.markets[marketId].betGroupDescription = fdBetGroupDescription.textContent;
            triggerMarketChangeDetection();
        }

        function clearAddToCarouselErrorMessage() {
            addToCarouselErrorMessage.innerText = "";
        }

        function initMarketPropertyCheckboxes() {
            chkIsCashoutAvailable.checked = !!obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable;
            chkIsBetBuilderAvailable.checked = obgState.sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state === 1;
            chkIsBetDistributionAvailable.checked = isBetDistributionAvailable(marketId);

            // const marketPropertiesSection = getElementById("marketPropertiesSection");
            // if (!marketPropertiesSection.classList.contains("hide")) {
            switch (getEventPhase(eventId)) {
                case "Live":
                    inactivate(isBetDistributionAvailableSection);
                    activate(isCashoutAvailableSection, isBetBuilderAvailableSection);
                    break;
                case "Prematch":
                    activate(isCashoutAvailableSection, isBetDistributionAvailableSection, isBetBuilderAvailableSection);
                    break;
                case "Over":
                    inactivate(isCashoutAvailableSection, isBetDistributionAvailableSection, isBetBuilderAvailableSection);
                    break;
            }
            // }

            function isBetDistributionAvailable(marketId) {
                let selections = getSelectionsByMarketId(marketId);
                for (selection of selections) {
                    if (obgState.sportsbook.betDistribution.statistics.selections.hasOwnProperty(selection)) {
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
            let marketStatus = obgState.sportsbook.eventMarket.markets[marketId].status;
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
            obgState.sportsbook.eventMarket.markets[marketId].isCashoutAvailable = chkIsCashoutAvailable.checked ? true : false;
        }

        function toggleIsBetBuilderAvailable() {
            if (chkIsBetBuilderAvailable.checked) {
                obgState.sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state = 1
                obgState.sportsbook.eventMarket.markets[marketId].marketTemplateTags.push(133);
                if (!getEventHasBetBuilder(eventId)) {
                    obgRt.setFixtureUpserted(eventId,
                        {
                            bc_bb_available:
                                { name: "bc_bb_available" }
                        }
                    )
                }
            } else {
                obgState.sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state = 0
                let index = obgState.sportsbook.eventMarket.markets[marketId].marketTemplateTags.indexOf(133);
                if (index !== -1) {
                    obgState.sportsbook.eventMarket.markets[marketId].marketTemplateTags.splice(index, 1);
                }
            }

            // obgState.sportsbook.eventMarket.markets[marketId].betBuilderAvailability.state = chkIsBetBuilderAvailable.checked ? 1 : 0;
        }

        function toggleIsBetDistributionAvailable() {
            if (!obgState.sportsbook.betDistribution) {
                obgState.sportsbook.betDistribution = { statistics: { selections: {} } };
            }

            let selections = getSelectionsByMarketId(marketId);
            let percentages = generatePercentages(selections.length);
            if (chkIsBetDistributionAvailable.checked) {
                for (let i = 0; i < selections.length; i++) {
                    obgState.sportsbook.betDistribution.statistics.selections[selections[i]] = {
                        id: selections[i],
                        betcountDistribution: getRandomInt(1, 100),
                        stakeDistribution: percentages[i]
                    }
                }
            } else {
                for (let selection of selections) {
                    delete obgState.sportsbook.betDistribution.statistics.selections[selection];
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

            // let item = obgState.sportsbook.carousel.item;
            let item = getDeepCopyOfObject(obgState.sportsbook.carousel.item);
            console.log("item: " + JSON.stringify(item));

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
                        delete (obgState.sportsbook.carousel.item);
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
            log("item2: " + JSON.stringify(item));
            obgState.sportsbook.carousel.item = item;

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
                        delete (obgState.sportsbook.carousel.item);
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
        carouselOrCardsDefined = isCarouselOrCardsDefined();
        if (!carouselOrCardsDefined) {
            obgState.sportsbook.carousel.item = {
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
            bgImageUrl = Object.values(obgState.sportsbook.carousel.item.skeleton.backgrounds)[0].url;
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
        for (let image of Object.values(obgState.image.images.sportsbook.images)) {
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
        let tcl = obgState.sportsbook.carousel.item.skeleton.threeColumnLayouts ?? {};

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
        var eventTables = obgState.sportsbook.eventTable.eventTables;
        var eventIds;
        var marketTimeFrames;
        var timeFrame;
        // let threeColumnLayouts;

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
        // // var columns = Object.values(threeColumnLayouts)[0].columns;
        // return columns[0].marketTemplateIds.concat(columns[1].marketTemplateIds, columns[2].marketTemplateIds);
        // log ("marketTemplateIdsOfThreeColumnLayout: " + ids);
        return ids;
    }

    // function getIsMarketTemplateIdPartOfThreeColumn(marketTemplateId) {
    //     if (getMarketTemplateIdsOfThreeColumnLayout().includes(marketTemplateId)) {
    //         return true;
    //     } return false;
    // }

    function getIsMarketTemplateIdPartOfThreeColumn(marketTemplateId) {
        return getMarketTemplateIdsOfThreeColumnLayout().includes(marketTemplateId);
    }

    function getThreeColumnLayoutsFromEventPage() {
        try {
            return obgState.sportsbook.marketListWidget.items[eventId].item.skeleton.threeColumnLayouts;
        } catch { return undefined };
    }

    function isCarouselOrCardsDefined() {
        return obgState.sportsbook.carousel.item !== undefined;
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
        const checkBox = getElementById("chkLockMarket");
        const detectedOrLockedRow = getElementById("detectedOrLockedRowForSbToolsMarket");
        // const labelRow = getElementById("labelsForDetectedMarketAndEvent");
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
        var items = Object.values(obgState.sportsbook.eventWidget.items);
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
        return obgState.sportsbook.marketListWidget.items[eventId].marketTemplateGroupingId;
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

        if (category.metaData != undefined) {
            return category.metaData.style == "2";
        } else {
            let usCategoryIds = ["2", "4", "10", "19"];
            let usCultures = ["en-US", "es-MX", "en-CA"];
            if (usCultures.includes(CULTURE) && usCategoryIds.includes(categoryId)) {
                return true;
            }
            return false;
        }
        // return getCategories()[categoryId].metaData.style == "2";
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

            betslip = JSON.stringify(obgState.sportsbook.betslip);
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
                // setCreatePbButtonState();
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
            let selectionStatus = obgState.sportsbook.selection.selections[selectionId].status;
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
            obgState.sportsbook.selection.selections[selectionId].status = state;
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
                obgState.sportsbook.popularBets = getEmptyPopularBets();
                triggerChangeDetection(eid);
            }
        }

        function removeAllSelectionsFromPopularPreBuiltBets() {
            if (getIsPopularPreBuiltBetsMoreThanZero()) {
                let eid = getFirstEventIdFromPopularPreBuiltBets();
                obgState.sportsbook.popularPreBuiltBets = getEmptyPopularPreBuiltBets();
                triggerChangeDetection(eid);
            }
        }

        function getFirstEventIdFromPopularBets() {
            return Object.values(obgState.sportsbook.popularBets.item.selectionsById)[0].eventId;
        }

        function getFirstEventIdFromPopularPreBuiltBets() {
            return obgState.sportsbook.popularPreBuiltBets.events[0].id;
        }

        function getIsPopularBetsMoreThanZero() {
            return (
                obgState.sportsbook?.popularBets?.item?.selectionsById &&
                Object.keys(obgState.sportsbook.popularBets.item.selectionsById).length > 0
            ) ?? false;
        }

        function getIsPopularPreBuiltBetsMoreThanZero() {
            return (
                obgState.sportsbook?.popularPreBuiltBets?.events &&
                obgState.sportsbook.popularPreBuiltBets.events.length > 0
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
            if (!obgState.sportsbook.popularBets.item) {
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
            obgState.sportsbook.popularBets = popularBets;
        }

        function addSelectionToPopularPreBuiltBets(eventId, selectionId) {

            let popularPreBuiltBets;
            if (!obgState.sportsbook.popularPreBuiltBets.events) {
                popularPreBuiltBets = getEmptyPopularPreBuiltBets();
            } else {
                popularPreBuiltBets = getDeepCopyOfObject(getPopularPreBuiltBets());
            }

            let eventObject = obgState.sportsbook.event.events[eventId];
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
            obgState.sportsbook.popularPreBuiltBets = popularPreBuiltBets;

            function getIndexOfEventInPopularPreBuiltBets() {
                return popularPreBuiltBets.events.findIndex(event => event.id === eventId);
            }
        }

        // function addSelectionToPopularPreBuiltBets(eventId, selectionId) {
        //     let popularPreBuiltBets = obgState.sportsbook.popularPreBuiltBets || getEmptyPopularPreBuiltBets();
        //     if (!popularPreBuiltBets) {
        //         popularPreBuiltBets = getDeepCopyOfObject(getPopularPreBuiltBets());
        //     }
        //     let eventObject = obgState.sportsbook.event.events[eventId];
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

        //     obgState.sportsbook.popularPreBuiltBets = popularPreBuiltBets;

        //     function getIndexOfEventInPopularPreBuiltBets() {
        //         return popularPreBuiltBets.events.findIndex(event => event.id === eventId);
        //     }

        //     // function getDeepCopyOfObject(obj) {
        //     //     return JSON.parse(JSON.stringify(obj));
        //     // }
        // }




        function getPopularBets() {
            return obgState.sportsbook.popularBets;
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
            return obgState.sportsbook.popularPreBuiltBets;
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
        obgState.sportsbook.priceBoost.eventMap[eventId] = eventPhasesArr;
    }

    function isSelectionPrematch(selectionId) {
        return obgState.sportsbook.event.events[getEventIdBySelectionId(selectionId)].phase == "Prematch";
    }

    function setPbMarketMap(marketId, eventPhasesArr) {
        obgState.sportsbook.priceBoost.marketMap[marketId] = eventPhasesArr;
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
        for (let selection of Object.values(obgState.sportsbook.betslip.selections)) {
            arr.push(selection.selectionId);
        }
        for (let bbSelection of Object.values(obgState.sportsbook.betslip.betBuilderSelections)) {
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
            return obgState.sportsbook.selection.selections.hasOwnProperty(selectionId) ? selectionId : null;
        }
    }

    function getInitialOddsFromBetslip(selectionId) {
        return getBetSlipByObgState().initialOdds[selectionId];
    }

    function getSelectionLabel(selectionId) {
        if (selectionId === null) {
            return null;
        } else return obgState.sportsbook.selection.selections[selectionId].label;
    }


    function isBetslipVisible() {
        return obgState.sportsbook.betslip.isVisible;
    }


    function isBetBuilderBetslipVisible() {
        return obgState.route.current.queryParams.betbuilderbetslip == 1;
    }

    function getMarketTemplateTags(marketId) {
        return obgState.sportsbook.eventMarket.markets[marketId].marketTemplateTags;
    }

    window.initNativeApp = () => {
        stopPolling();
        previousEventId = undefined;
        // var menu = obgState.sportsbook.sportCatalog.menu.items;
        var categoriesObj = obgState.sportsbook.sportCatalog.offering.categories;
        var quickLinks;
        var categories, regions, competitions;
        const categorySelector = getElementById("categorySelector");
        const regionSelector = getElementById("regionSelector");
        const competitionSelector = getElementById("competitionSelector");
        var menuOption;
        labelRow = getElementById("eventLabelForNative");

        const btNativeOpenEvent = getElementById("btNativeOpenEvent");
        const btNativeBack = getElementById("btNativeBack");
        const btNativeHome = getElementById("btNativeHome");
        const btNativeAz = getElementById("btNativeAz");
        const btNativeLive = getElementById("btNativeLive");
        const btNativeBetslip = getElementById("btNativeBetslip");
        const btNativeMyBets = getElementById("btNativeMyBets");
        const btNativeBetBuilder = getElementById("btNativeBetBuilder");
        const btNativeBoost = getElementById("btNativeBoost");
        const btNativeLiveSC = getElementById("btNativeLiveSC");
        const btNativeStartingSoon = getElementById("btNativeStartingSoon");
        const btNativeSettings = getElementById("btNativeSettings");

        const loggedInOnly = getElementsByClassName("loggedInOnly");
        const badgeNativeBetslip = getElementById("badgeNativeBetslip");
        const badgeNativeBbBetslip = getElementById("badgeNativeBbBetslip");
        const nativeAzSection = getElementById("nativeAzSection");
        const iconBtNativeBetBuilder = getElementById("iconBtNativeBetBuilder");
        const labelBtNativeBetBuilder = getElementById("labelBtNativeBetBuilder");
        const nativeBetBuilderEventLabel = getElementById("nativeBetBuilderEventLabel");
        const nativeBetBuilderSection = getElementById("nativeBetBuilderSection");
        const nativeBetBuilderEventSelector = getElementById("nativeBetBuilderEventSelector");
        const nativeBetBuilderEventsError = getElementById("nativeBetBuilderEventsError");
        const nativeQuickLinksSection = getElementById("nativeQuickLinksSection");

        const quickLinkSelector = getElementById("quickLinkSelector");
        const nativeErrorMessage = getElementById("nativeErrorMessage");
        const btNativeToggleableCollection = getElementsByClassName("btNativeToggleable");
        var nativeRouteHistory = [];

        var betSlipVisibleState;
        var previousBetSlipVisibleState = undefined;
        var currentRoute;
        var previousRoute = undefined;


        if (obgClientEnvironmentConfig.startupContext.config.sportsbook.betBuilder.seamlessBetBuilderEnabled !== false) {
            hide(btNativeBetBuilder);
        }

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
            categories = getArrayOrderedByProperty(Object.values(categoriesObj), "lhsmOrder");
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
                    regions = getArrayOrderedByProperty(Object.values(category.regions), "lhsmOrder");
                    populateSelector(regionSelector, regions);
                }
            }
        }

        window.selectRegion = (value) => {
            clearSelector(competitionSelector);
            for (var region of regions) {
                if (value == region.id) {
                    if (Object.keys(region.competitions).length != 0) {
                        competitions = getArrayOrderedByProperty(Object.values(region.competitions), "lhsmOrder");
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
        let eventMap = obgState.sportsbook.eventMarket.eventMap;
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
        return obgState.route.current.pathName;
    }

    function getIsEventPageVisible(eventId) {
        return eventId === getUrlParam("eventId");
    }

    function getEventLabel(eventId) {
        if (eventId === null || eventId === undefined) {
            return null;
        }
        return obgState.sportsbook.event.events[eventId].label;
    }

    function getEventPhase(eventId) {
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
        return obgState.sportsbook.event.events[eventId] !== undefined;
    }

    window.toggleSection = (section) => {
        const element = getElementById(section);
        element.classList.toggle("hide");
    }

    function isEventTypeOutright(eventId) {
        return obgState.sportsbook.event.events[eventId].eventType === "Outright";
    }

    function getEventHasScoreBoard(eventId) {
        return !!obgState.sportsbook.scoreboard[eventId];
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

        const scoreBoardExtrasSection = getElementById("scoreBoardExtrasSection");

        const footballScoreBoardExtrasSection = getElementById("footballScoreBoardExtrasSection");
        const chkAggScore = getElementById("chkAggScore");
        const chkRedCardsHome = getElementById("chkRedCardsHome");
        const chkRedCardsAway = getElementById("chkRedCardsAway");
        const chkExtraTime = getElementById("chkExtraTime");

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



        scope === "eventLocked" ?
            intervalIdForPolling = setInterval(listenerForEventIfEventLocked, POLLING_INTERVAL) :
            intervalIdForPolling = setInterval(listenerForEvent, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        initUSRelatedUIChanges();

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
                startDateValue.innerText = getFriendlyDateFromIsoDate(obgState.sportsbook.event.events[eventId].startDate);
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
            let categoryIdsForScoreBoard = ["1", "2", "3", "4", "8", "9", "10", "11", "17", "19", "34", "58", "60", "72", "104", "119", "138"];
            let categoryIdsForNoScoreBoard = ["7", "26", "30", "43", "53", "116"];
            let scoreBoardSampleDate = "04/2024";
            // switch (categoryId) {
            //     case "1": {
            //         scoreBoardSampleDate = "06/2024";
            //         break;
            //     }
            // }
            if (categoryIdsForScoreBoard.includes(categoryId)) {
                scoreBoardSupportedMessage.innerText = "'Live' adds scoreboard (sampled in " + scoreBoardSampleDate + ")";
                show(liveAddsScoreBoardSection);
                hide(scoreBoardNotSupportedSection);
            } else {
                hide(liveAddsScoreBoardSection);
                show(scoreBoardNotSupportedSection);
                if (categoryIdsForNoScoreBoard.includes(categoryId)) {
                    scoreBoardNotSupportedMessage.innerText = "Scoreboard not supported by SB as of 04/2024";
                } else {
                    scoreBoardNotSupportedMessage.innerText = "Scoreboard not yet supported by SportsbookTool";
                }
            }
            initScoreBoardExtras(categoryId);
        }

        function initUSRelatedUIChanges() {
            swapPPHomeWithAway();
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
            scoreBoardObject = obgState.sportsbook.scoreboard;
            itHasFootballScoreBoard = false;
            if (eventId === null) {
                hide(notFootballScoreBoardMessage, lockEventSection);
            } else {
                for (object in scoreBoardObject) {
                    if (eventId == scoreBoardObject[object].eventId && getCategoryIdByEventId(eventId) === "1") {
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
            // mockedEventPhase = phase;
            if (lockedEventId !== undefined) {
                eventId = lockedEventId;
            }
            switch (phase) {
                case "Prematch":
                    if (!!obgState.sportsbook.scoreboard[eventId]) {
                        delete obgState.sportsbook.scoreboard[eventId];
                    }
                    obgRt.setEventPhasePrematch(eventId);
                    break;
                case "Live":
                    if (chkLiveAddsScoreBoard.checked && !isEventTypeOutright(eventId)) {
                        obgState.sportsbook.scoreboard[eventId] = createScoreBoard(eventId, getScoreBoardExtras(categoryId));
                    }
                    obgRt.setEventPhaseLive(eventId);
                    if (categoryId == "1") initFootballScoreboard();
                    break;
                case "Over":
                    chkSuspendAllMarkets.checked ?
                        obgRt.setEventPhaseOver(eventId, true) :
                        obgRt.setEventPhaseOver(eventId);
                    break;
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
                        isHomeRedCardsActive: chkRedCardsHome.checked,
                        isAwayRedCardsActive: chkRedCardsAway.checked,
                        isExtraTime: chkExtraTime.checked
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

                obgState.sportsbook.event.events[eventId].hasBetBuilderLink = true; // legacy bb for us brands

                obgRt.setFixtureUpserted(eventId,
                    {
                        bc_bb_available:
                            { name: "bc_bb_available" }
                    }
                )
            } else {
                obgState.sportsbook.event.events[eventId].hasBetBuilderLink = false; // legacy bb for us brands

                delete obgState.sportsbook.event.events[eventId].tags.bc_bb_available;
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
            delete obgState.sportsbook.priceBoost.eventMap[eventId];
            delete obgState.sportsbook.priceBoost.marketMap[marketId];
            let boosts = Object.keys(obgState.sportsbook.priceBoost.priceBoost);
            let criteriaEntityDetails;
            for (let b of boosts) {
                criteriaEntityDetails = obgState.sportsbook.priceBoost.priceBoost[b].criteria.criteriaEntityDetails;
                for (let detail of criteriaEntityDetails) {
                    if (detail.eventId == eventId) {
                        if (isSuperBoost) {
                            if (obgState.sportsbook.priceBoost.priceBoost[b].bonusData.isSuperBoost) {
                                delete obgState.sportsbook.priceBoost.priceBoost[b];
                            }
                        } else {
                            if (!obgState.sportsbook.priceBoost.priceBoost[b].bonusData.isSuperBoost) {
                                delete obgState.sportsbook.priceBoost.priceBoost[b];
                            }
                        }
                    }
                }
            }
            obgState.sportsbook.priceBoost.priceBoost = {
                ...obgState.sportsbook.priceBoost.priceBoost
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

        function toggleHasPrematchStatistics(providerName, checkBox) {
            let providers = obgState.sportsbook.event.events[eventId].prematchStatisticsProviders;
            let isChecked = checkBox.checked;
            let isScore24 = providerName == "Score24";

            if (isChecked && !providers.includes(providerName)) {
                providers.push(providerName);
                if (isScore24) {
                    createScore24Statistics(eventId);
                }
            } else if (!isChecked) {
                obgState.sportsbook.event.events[eventId].prematchStatisticsProviders = providers.filter(item => item !== providerName);
                if (isScore24) {
                    delete obgState.sportsbook.statistics[eventId];
                }
            }
        }


        function toggleHasLiveStatistics() {
            if (chkHasLiveStatistics.checked) {
                obgState.sportsbook.event.events[eventId].hasLiveStatistics = true;
            } else {
                obgState.sportsbook.event.events[eventId].hasLiveStatistics = false;
            }
        }

        function toggleVarState() {
            if (chkHasVar.checked) {
                obgState.sportsbook.scoreboard[eventId].varState = 2;
            } else {
                obgState.sportsbook.scoreboard[eventId].varState = 0;
            }
        }

        function initEventPropertyCheckboxes() {

            chkHasLiveVisual.checked = obgState.sportsbook.event.events[eventId].hasLiveVisual ?? false;

            chkHasLiveStreaming.checked = obgState.sportsbook.event.events[eventId].hasLiveStreaming ?? false;

            chkHasFastMarkets.checked = obgState.sportsbook.event.events[eventId].hasFastMarkets ?? false;

            chkHasPriceBoost.checked = getEventHasSingleBoost(eventId, false);

            chkHasSuperBoost.checked = getEventHasSingleBoost(eventId, true);

            chkHasLiveStatistics.checked = obgState.sportsbook.event.events[eventId].hasLiveStatistics ?? false;

            // chkHasBetBuilder.checked = !!obgState.sportsbook.event.events[eventId]?.tags?.bc_bb_available;

            chkHasBetBuilder.checked = getEventHasBetBuilder(eventId);

            chkHasScore24Statistics.checked = obgState.sportsbook.event.events[eventId].prematchStatisticsProviders.includes("Score24");

            chkHasExternalStatistics.checked = obgState.sportsbook.event.events[eventId].prematchStatisticsProviders.includes("BetRadar");

            chkHasVar.checked = !!obgState.sportsbook.scoreboard[eventId] && obgState.sportsbook.scoreboard[eventId].varState === 2;

        }

        function getEventHasSingleBoost(eventId, isSuperBoost) {
            for (const pb of Object.values(obgState.sportsbook.priceBoost.priceBoost)) {
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

            for (var button of eventPhaseButtons) {
                if (eventPhase === button.id.replace("btSetEventPhase", "")) {
                    inactivate(button);
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

        obgState.sportsbook.priceBoost.priceBoost = {
            ...obgState.sportsbook.priceBoost.priceBoost, [priceBoostObj.id]: priceBoostObj
        }
    }


    //by Tamas Czerjak
    function updateCategoryAndCompetitionForPbLobby(categoryId, competitionId) {

        let categoryObj = obgState.sportsbook.eventMarketWidget.skeleton.categories.find(cat => cat.id === categoryId);

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
            // const { label } = obgState.sportsbook.sportCatalog.competitions[competitionId];
            let label = getCompetitionLabelByCompetitionId(competitionId);
            competitionObj = {
                id: competitionId,
                label
            };
            categoryObj.competitions = [...categoryObj.competitions, competitionObj];
        }

        const actualCategoryIndex = obgState.sportsbook.eventMarketWidget.skeleton.categories.findIndex(el => el.id === categoryObj.id);

        if (actualCategoryIndex >= 0) {
            obgState.sportsbook.eventMarketWidget.skeleton.categories.splice(actualCategoryIndex, 1, categoryObj);
        } else {
            obgState.sportsbook.eventMarketWidget.skeleton.categories = [
                ...obgState.sportsbook.eventMarketWidget.skeleton.categories,
                categoryObj
            ]
        }

        obgState.sportsbook.eventMarketWidget = {
            ...obgState.sportsbook.eventMarketWidget,
            skeleton: {
                ...obgState.sportsbook.eventMarketWidget.skeleton
            }
        };

        // obgState.sportsbook.eventMarketWidget = {
        //     ...obgState.sportsbook.eventMarketWidget,
        //     skeleton: {
        //         ...obgState.sportsbook.eventMarketWidget.skeleton,
        //         categories: [
        //             ...obgState.sportsbook.eventMarketWidget.skeleton.categories,
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
        return obgState.sportsbook.sportCatalog.offering.categories;
        // return obgState.sportsbook.sportCatalog.categories || obgState.sportsbook.sportCatalog.offering.categories;
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
            window.open("http://sbpisaobg.sportsbook-prod.use1.betsson.tech/v2/" + segmentLegacyId + "/" + LANGUAGECODE + "/event?fixturetags=" + eventId) :
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
        for (var element of elements) {
            element.classList.add("displayInGreen");
            element.classList.remove("displayInRed");
            element.classList.remove("displayInOrange");
        }
    }

    function displayInRed(...elements) {
        for (var element of elements) {
            element.classList.add("displayInRed");
            element.classList.remove("displayInGreen");
            element.classList.remove("displayInOrange");
        }
    }

    function displayInOrange(...elements) {
        for (var element of elements) {
            element.classList.add("displayInOrange");
            element.classList.remove("displayInGreen");
            element.classList.remove("displayInRed");
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

    function getIsUserLoggedIn() {
        var aReducer = localStorage.authReducer;
        if (!aReducer) {
            if (IS_OBGSTATE_EXPOSED) {
                return obgState.auth.isAuthenticated;
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
        return !!JSON.parse(aReducer).token;
    }

    function getLastMarketIdFromBetslip() {
        try {
            return getMarketIdBySelectionId(getLastSelectionIdFromBetslip());

        } catch {
            return null;
        }
    }

    function getFirstMarketIdOfEvent(eventId) {
        return obgState.sportsbook.eventMarket.eventMap[eventId][0];
    }

    function getFirstSelectionIdOfMarket(marketId) {
        let selections = obgState.sportsbook.selection.marketMap[marketId];
        for (let sel of selections) {
            if (obgState.sportsbook.selection.selections[sel].isEnabled != false) {
                return sel;
            }
        }
        // return obgState.sportsbook.selection.marketMap[marketId][0];
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
        return obgState.sportsbook.eventMarket.markets[marketId].marketVersion;
    }

    function setSelectionOdds(selectionId, odds) {
        eventId = getEventIdBySelectionId(selectionId);
        marketId = getMarketIdBySelectionId(selectionId);
        marketVersion = getMarketVersion(marketId);
        marketTemplateId = getMarketTemplateId(marketId);

        ///
        let params = {
            msi: selectionId,
            o: Number(odds),
            ei: eventId,
            mv: marketVersion,
            mti: marketTemplateId
        }
        // if (!getIsAndreasChangeOnSelectionsStatusesDeployed()) {
        //     delete params.mti;
        // }

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

    function triggerChangeDetection(eventId = Object.values(obgState.sportsbook.event.events)[0].id, delay = 0) {
        let currentEventPhase = obgState.sportsbook.event.events[eventId].phase;
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
        var scoreBoard = obgState.sportsbook.scoreboard[eventId];
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
        var usersCurrency;
        var separatorArrow = "&emsp;&#10132;&emsp;"

        var acca;
        var accaCategoriesArray;
        var accaSelectionOddsLimitMin;
        var accaTotalOddsLimitMin;
        var accaMinStake;
        var accaMaxStake;
        previousAcca = null;

        const loginToSeeAcca = getElementById("loginToSeeAcca");
        const noAccaFound = getElementById("noAccaFound");
        const accaDetailsLayout = getElementById("accaDetailsLayout");
        const accaNameField = getElementById("accaNameField");
        const accaIdField = getElementById("accaIdField");
        const accaCategoriesSection = getElementById("accaCategoriesSection");
        const accaCategoriesSpan = getElementById("accaCategoriesSpan");
        const accaCompetitionsRow = getElementById("accaCompetitionsRow");
        const accaCompetitionsSpan = getElementById("accaCompetitionsSpan");
        const accaMarketTemplatesRow = getElementById("accaMarketTemplatesRow");
        const accaMarketTemplatesSpan = getElementById("accaMarketTemplatesSpan");
        const accaEventPhaseRow = getElementById("accaEventPhaseRow");
        const accaEventPhaseSpan = getElementById("accaEventPhaseSpan");
        const accaMinimumNumberOfSelectionsSpan = getElementById("accaMinimumNumberOfSelectionsSpan");
        const accaSelectionOddsLimitMinSpan = getElementById("accaSelectionOddsLimitMinSpan");
        const accaTotalOddsLimitMinRow = getElementById("accaTotalOddsLimitMinRow");
        // const accaTotalOddsLimitMin = getElementById("accaTotalOddsLimitMin");
        const accaTotalOddsLimitMinSpan = getElementById("accaTotalOddsLimitMinSpan");
        const accaMinMaxStakeSpan = getElementById("accaMinMaxStakeSpan");
        const accaExpiryDateSpan = getElementById("accaExpiryDateSpan");


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
        const freeBetStake = getElementById("freeBetStake");
        const freeBetBetTypes = getElementById("freeBetBetTypes");
        const freeBetEventPhases = getElementById("freeBetEventPhases");
        const freeBetNoOfSelectionsDiv = getElementById("freeBetNoOfSelectionsDiv");
        const freeBetNoOfSelections = getElementById("freeBetNoOfSelections");
        const freeBetExpiryDate = getElementById("freeBetExpiryDate");

        var profitBoostsArray;
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
        const profitBoostMaxBoostedWinningsInEuro = getElementById("profitBoostMaxBoostedWinningsInEuro");
        const profitBoostStake = getElementById("profitBoostStake");
        const profitBoostMinMaxOdds = getElementById("profitBoostMinMaxOdds");
        const profitBoostBetTypes = getElementById("profitBoostBetTypes");
        const profitBoostEventPhases = getElementById("profitBoostEventPhases");
        const profitBoostNoOfSelectionsDiv = getElementById("profitBoostNoOfSelectionsDiv");
        const profitBoostNoOfSelections = getElementById("profitBoostNoOfSelections");
        const profitBoostExpiryDate = getElementById("profitBoostExpiryDate");


        intervalIdForPolling = setInterval(listenerForAccaDetails, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForPriceBoostDetails, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForProfitBoostDetails, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForFreeBetDetails, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForSelectedPriceBoost, POLLING_INTERVAL);
        intervalIdsForPolling.push(intervalIdForPolling);

        intervalIdForPolling = setInterval(listenerForAddPbToCarouselOrCards, POLLING_INTERVAL); //
        intervalIdsForPolling.push(intervalIdForPolling);

        window.closePbLegend = () => {
            hide(pbLegendCloseable);
        }

        function listenerForAccaDetails() {

            if (!getIsUserLoggedIn()) {
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
                    categoryInSportCatalog = getCategories()[categoryId];
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

            accaMinStake = checkIfZero(acca.conditions.minimumStake);
            accaMaxStake = checkIfZero(acca.conditions.maximumStake);
            accaMinMaxStakeSpan.innerText = accaMinStake + " - " + accaMaxStake + " " + usersCurrency;
            accaExpiryDateSpan.innerText = getFriendlyDateFromIsoDate(acca.expiryDate);
        }

        ////////////////////////////////// PROFITBOOST ///////////////////////////////////////////

        function listenerForProfitBoostDetails() {
            if (!getIsUserLoggedIn()) {
                hide(profitBoostNotFound, profitBoostDetailsLayout);
                show(profitBoostLogin);
                return;
            } else {
                hide(profitBoostLogin);
            }

            profitBoosts = obgState.sportsbook.profitBoost.profitBoost;
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
                let min = checkIfZero(selectedProfitBoost.conditions.minimumNumberOfSelections);
                let max = checkIfZero(selectedProfitBoost.conditions.maximumNumberOfSelections);
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
                categoryName = getCategoryLabelByCategoryId(selectedProfitBoost.criteria.criteriaEntityDetails[0].categoryId)
                pathToCompetition = categoryName;
                competitionId = selectedProfitBoost.criteria.criteriaEntityDetails[0].competitionId;
                if (competitionId != undefined) {
                    pathToCompetition
                        += separatorArrow
                        + getRegionNameByCompetitionId(competitionId)
                        + separatorArrow + getCompetitionLabelByCompetitionId(competitionId);

                    eventId = selectedProfitBoost.criteria.criteriaEntityDetails[0].eventId;
                    if (eventId != undefined) {
                        if (!isEventInObgState(eventId)) {
                            return pathToCompetition += separatorArrow + "[EVENT DATA NOT YET IN OBGSTATE]";
                        }
                        pathToCompetition
                            += separatorArrow
                            + getEventDisplayLabel(eventId);
                        marketTemplateId = selectedProfitBoost.criteria.marketTemplateIds[0];
                        if (marketTemplateId != undefined) {
                            marketId = getMarketIdByEventIdAndMarketTemplateId(eventId, marketTemplateId);
                            if (marketId == undefined) {
                                return pathToCompetition += separatorArrow + "[MARKET DATA NOT YET IN OBGSTATE]";
                            }
                            pathToCompetition
                                += separatorArrow
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
            setOptionInBonusSelector(priceBoostId);
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
            var item = obgState.sportsbook.carousel.item;
            var carouselOrder = item.skeleton.carouselOrder;
            for (let element of carouselOrder) {
                element.sortOrder++;
            }
            let carouselOrderElement = {
                id: priceBoostId,
                sortOrder: 0,
                type: "Boost"
            }
            item.skeleton.carouselOrder.unshift(carouselOrderElement);
            delete obgState.sportsbook.priceBoost.priceBoost[priceBoostId];

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
            return obgState.sportsbook.priceBoost.priceBoost;
        }

        function setOptionInBonusSelector(bonusId) {
            for (let i = 0; i < pbSelector.options.length; i++) {
                if (pbSelector.options[i].value == bonusId) {
                    pbSelector.options[i].selected = true;
                    return;
                }
            }
        }

        function getIsCombinationPriceBoost(pbId) {
            return obgState.sportsbook.priceBoost.priceBoost[pbId].criteria.criteriaEntityDetails.length > 1;
        }

        function getIsOddsOutOfRange(pbId) {
            let minOdds = obgState.sportsbook.priceBoost.priceBoost[pbId].conditions.oddsLimit.minOdds;
            let maxOdds = obgState.sportsbook.priceBoost.priceBoost[pbId].conditions.oddsLimit.maxOdds;
            // let criteriaEntityDetails = obgState.sportsbook.priceBoost.priceBoost[pbId].criteria.criteriaEntityDetails;

            // let marketSelectionId;
            // let selectionOdds = 1;
            // for (let detail of criteriaEntityDetails) {
            //     marketSelectionId = detail.marketSelectionId;
            //     selectionOdds *= obgState.sportsbook.selection.selections[marketSelectionId].odds;
            // }
            // if (selectionOdds < minOdds || selectionOdds > maxOdds) {
            //     return true;
            // }
            let computedPriceBoostOdds = getComputedActualOddsOfBoostedSelections(pbId);
            if (computedPriceBoostOdds < minOdds || computedPriceBoostOdds > maxOdds) {
                return true;
            }
            return false;
        }

        function getComputedActualOddsOfBoostedSelections(pbId) {
            let computedOdds = 1;
            let criteriaEntityDetails = obgState.sportsbook.priceBoost.priceBoost[pbId].criteria.criteriaEntityDetails;
            for (let detail of criteriaEntityDetails) {
                computedOdds *= obgState.sportsbook.selection.selections[detail.marketSelectionId].odds;
            }
            return computedOdds;
        }

        function getIsEventPhaseNotMatching(pbId) {
            let eventPhasesOfPb = obgState.sportsbook.priceBoost.priceBoost[pbId].criteria.eventPhases;
            let criteriaEntityDetails = obgState.sportsbook.priceBoost.priceBoost[pbId].criteria.criteriaEntityDetails;
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
            let arrow = " &#9658;"
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
                    optionInnerHTML += arrow + " " + getMarketTemplateId(pb.criteria.criteriaEntityDetails[0].marketId);
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
            return obgState.sportsbook.priceBoost.priceBoost[priceBoostId].criteria.criteriaEntityDetails[0].eventId;
        }

        // function getCompetitionIdByPriceBoostId(priceBoostId) {
        //     return obgState.sportsbook.priceBoost.priceBoost[priceBoostId].criteria.criteriaEntityDetails[0].competitionId;
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
                        getCategoryNameByEventId(eventId) + separatorArrow
                        + getRegionNameByEventId(eventId) + separatorArrow
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
                    type += ", Super Boost " + pbSuperBoostIcon;
                }
                return type;
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
            if (!getIsUserLoggedIn()) {
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
                let min = checkIfZero(selectedFreebet.conditions.minimumNumberOfSelections);
                let max = checkIfZero(selectedFreebet.conditions.maximumNumberOfSelections);
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

    function getIsFeatureEnabled(featureName) {
        if (IS_OBGCLIENTENVIRONMENTCONFIG_EXPOSED) {
            return !!obgClientEnvironmentConfig.startupContext?.features?.[featureName];
        } else {
            return !!obgState.sportsbook.features?.[featureName];
        }
    }

    function checkIfZero(value) {
        if (value == undefined || value == 0) {
            return "...";
        } return value;
    }

    function getCurrencyForBonuses() {
        if (getIsUserLoggedIn()) {
            return getUsersCurrency();
        } return "EUR"
    }

    function getSelectedOddsFormat() {
        return obgState.sportsbook.userSettings.settings.oddsFormat;
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
        let categories = Object.values(getCategories());
        for (let cat of categories) {
            if (cat.id == categoryId) {
                return cat.label;
            }
        }
    }


    function getRegionLabelByRegionId(regionId) {
        var categories = Object.values(getCategories());
        var regions;
        for (let cat of categories) {
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

    function getSegmentGuid() {
        return segmentGuid = obgState.sportsbook.segment.segmentGuid.toLowerCase();
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
        obgState.sportsbook.segment.segmentGuid = newSegmentGuid;
        fdSegmentGuid.value = "";
    }

    window.setSegmentGuid = (guid) => {
        obgState.sportsbook.segment.segmentGuid = guid;
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
        return !!obgState.sportsbook.carousel.item;
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
            obgState.sportsbook.sportsbookBanner.content.splice(0, 1);
            triggerChangeDetection();
        }

        var sbBannerCounter = 1;
        var sbBannerBgImageCounter = 1;
        var sbBannerBgFileName;
        var sbBannerBgWidth;
        window.addSportsbookBanner = () => {
            chkBannerOverlay.checked ? imageOverlay = true : imageOverlay = false;
            var banners = obgState.sportsbook.sportsbookBanner.content;

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

            obgState.sportsbook.sportsbookBanner.content = [];
            obgState.sportsbook.sportsbookBanner.content.push(newBanner);
            for (var banner of banners) {
                obgState.sportsbook.sportsbookBanner.content.push(banner);
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
            var banners = obgState.sportsbook.carouselBanner.content;


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
            obgState.sportsbook.carouselBanner.content = [];
            obgState.sportsbook.carouselBanner.content.push(newBanner);
            for (let banner of banners) {
                obgState.sportsbook.carouselBanner.content.push(banner);
            }


            crlBannerCounter++;
            // var nextIndexOfCarouselOrder = obgState.sportsbook.carousel.item.skeleton.carouselOrder.length;
            // var banner = {
            //     "id": crlBannerKey,
            //     "sortOrder": nextIndexOfCarouselOrder,
            //     "type": "Banner"
            // }
            // obgState.sportsbook.carousel.item.skeleton.carouselOrder[nextIndexOfCarouselOrder] = banner;
            let carouselOrder = obgState.sportsbook.carousel.item.skeleton.carouselOrder;
            let banner = {
                "id": crlBannerKey,
                "sortOrder": 0,
                "type": "Banner"
            }
            for (let i = 0; i < carouselOrder.length; i++) {
                carouselOrder[i].sortOrder++;
            }
            carouselOrder.unshift(banner);
            obgState.sportsbook.carousel.item.skeleton.carouselOrder = carouselOrder;

            triggerChangeDetection();
        }

        window.removeCarouselBanner = () => {

            let carouselOrder = obgState.sportsbook.carousel.item.skeleton.carouselOrder;
            for (let i = 0; i < carouselOrder.length; i++) {
                if (carouselOrder[i].type == "Banner") {
                    carouselOrder.splice(i, 1);
                    break;
                }
            }
            for (let i = 0; i < carouselOrder.length; i++) {
                carouselOrder[i].sortOrder = i;
            }

            obgState.sportsbook.carousel.item.skeleton.carouselOrder = carouselOrder;
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
                ttPath = "bonus/" + accaId + "?serviceInstanceId=" + serviceInstanceId;
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


    function createScoreBoard(eventId, scoreBoardExtras) {
        categoryId = getCategoryIdByEventId(eventId);
        participants = getParticipants(eventId);
        lastDateTimeSet = new Date().toISOString();

        switch (categoryId) {
            case "1": return getFootballScoreBoard(participants, scoreBoardExtras);
            case "2": return getIceHockeyScoreBoard(participants, scoreBoardExtras);
            case "3": return getHandballScoreBoard(participants);
            case "4": return getBasketBallScoreBoard(participants);
            case "8": return getRugbyUnionScoreBoard(participants);
            case "9": return getVolleyBallScoreBoard(participants);
            case "10": return getAmericanFootballScoreBoard(participants);
            case "11": return getTennisScoreBoard(participants, scoreBoardExtras);
            case "17": return getSnookerScoreBoard(participants)
            case "19": return getBaseballScoreBoard(participants);
            case "34": return getDartsScoreBoard(participants, scoreBoardExtras);
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
        let isFirstHalf = getRandomBoolean();
        let isExtraTime = scoreBoardExtras.isExtraTime;

        let matchClockMinutes = isFirstHalf
            ? (isExtraTime ? 90 + getRandomInt(2, 17) : getRandomInt(47))
            : (isExtraTime ? 90 + getRandomInt(16, 33) : getRandomInt(46, 93));

        let phaseCategoryId = isFirstHalf
            ? (isExtraTime ? "3-1" : "1-1")
            : (isExtraTime ? "4-1" : "2-1");

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
                    corners: { value: getRandomInt(4), isActive: true },
                    goalsScored: { value: homeFinalScore, isActive: true },
                    penaltyShots: { value: getRandomInt(4), isActive: true },
                    redCards: { value: scoreBoardExtras.isHomeRedCardsActive ? getRandomInt(1, 2) : 0, isActive: true },
                    substitutions: { value: getRandomInt(2), isActive: false },
                    yellowCards: { value: getRandomInt(4), isActive: true },
                    isSecondLeg: { value: true, isActive: true },
                    aggregateScore: { value: homeFinalScore + getRandomInt(4), isActive: true }
                },
                [participants[1].id]: {
                    corners: { value: getRandomInt(4), isActive: true },
                    goalsScored: { value: awayFinalScore, isActive: true },
                    penaltyShots: { value: getRandomInt(4), isActive: true },
                    redCards: { value: scoreBoardExtras.isAwayRedCardsActive ? getRandomInt(1, 2) : 0, isActive: true },
                    substitutions: { value: getRandomInt(2), isActive: false },
                    yellowCards: { value: getRandomInt(4), isActive: true },
                    isSecondLeg: { value: true, isActive: true },
                    aggregateScore: { value: awayFinalScore + getRandomInt(4), isActive: true }
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
                seconds: getRandomInt(59),
                minutes: matchClockMinutes,
                gameClockMode: "RunningUp",
                lastDateTimeSet: lastDateTimeSet
            },
            varState: 0,
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
        let legPointsHome = getRandomInt(3);
        let legPointsAway = getRandomInt(3);
        let setPointsHome = 0;
        let setPointsAway = 0;
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
                    leftovers: { value: getRandomInt(1, 501), isActive: false },
                    legPoints: { value: legPointsHome, isActive: true },
                    setPoints: { value: setPointsHome, isActive: scoreBoardExtras.isSetPointsActive },
                    isServer: { value: isServer, isActive: true },
                    oneEighties: { value: scoreBoardExtras.isSetPointsActive ? getRandomInt((setPointsHome + 1) * getRandomInt(1, 3)) : getRandomInt(legPointsHome), isActive: scoreBoardExtras.is180sActive },
                    matchFormat: { value: scoreBoardExtras.isSetPointsActive ? "best7sets" : "legslimited", isActive: true },
                    matchFormatSummary: { value: "This is the match format summary", isActive: true }
                },
                [participants[1].id]: {
                    leftovers: { value: getRandomInt(1, 501), isActive: false },
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
            currentPhase: { id: isFirstHalf ? 1 : 2, },
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

        obgState.sportsbook.statistics = {
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