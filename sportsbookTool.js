(function() {

    if (!isItBetssonSite()) return;


    // // ************** REMOTE ****************
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
    var eventLabel, previousEventLabel;
    var mockedEventPhase;
    var marketId, lockedMarketId, marketLabel;
    marketTemplateId;
    var selectionId, lockedSelectionId;
    var detectionResultText;
    var initialOdds, lockedInitialOdds;
    var accaIdToLookupInTradingTools;
    var bodyEventListeners = [];

    const SB_TOOL_VERSION = "1.1.10"
    const DEVICE_TYPE = getDeviceType();
    const ENVIRONMENT = getEnvironment();
    const IS_B2B = isB2B();
    const BRAND_NAME = getBrandName();
    const BROWSER_VERSION = getBrowserVersion();
    const OBG_VERSION = getObgVersion();
    const NOT_FOUND = "Not found.";
    const IS_OBGRT_EXPOSED = isExposed("obgRt");
    const IS_OBGSTATE_EXPOSED = isExposed("obgState");

    initHeader();
    initAccordions();
    initContext();
    initWindowMover();
    checkEnabledfeatures();

    function createWindow() {
        document.body.appendChild(sportsbookTool);
        var htmlContent =
            '<div id="sportsbookToolHeader"><div id="sportsbookToolHeaderTitle"><div id="sportsbookToolName">Sportsbook Tool v<span id="sportsbookToolVersion"></span></div><div id="sportsbookToolAuthorName">by gegl01@betssongroup.com</div></div><div id="sportsbookToolHeaderButtonRow" class="floatRight"><button id="btZoomInOut" class="sportsbookToolHeaderButtons" onclick="zoomInOut()">&#128475;</button><button id="btMinimizeAll" class="sportsbookToolHeaderButtons" onclick="toggleAllAccordionsVisibility()">&#128469;</button><button id="btMinimizeClosed" class="sportsbookToolHeaderButtons" onclick="toggleClosedAccordionsVisibility()">&#128469;</button><button id="btClose" class="sportsbookToolHeaderButtons" onclick="closePopup()">&#10006;</button></div></div><div id="sportsbookToolContent"><div id="sbToolsContext" class="accordion open"><button id="contextAccordion" class="accHeading" onclick="initContext()">Context<span id="limitedFunctionsMessage"></button><div class="accContent"><div id="obgStateAndRtSection" class="hide"><div id="obgStateAndRtLayout">Enable obgState and obgRt<button class="btSimple btGreen" id="exposeObgStateAndRt" onclick="exposeObgStateAndRt()">Enable</button></div><hr class="hRule"></div><div class="contextLayout"><div>Device Type:</div><div class="contextValue" id="deviceType"></div><div></div><div>Environment:</div><div class="contextValue" id="environment"></div><button class="btSimple extraCondensed noB2B" id="btSwitchToEnv" onclick="switchToEnv()"></button><div>Brand:</div><div class="contextValue truncatable" id="brandName"></div><div></div><div>Browser:</div><div class="contextValue truncatable" id="browserVersion"></div><button class="btSimple" id="btBrowserVersion" onclick=\'copyToClipboard("browserVersion")\'>Copy</button><div>App Version:</div><div class="contextValue truncatable" id="obgVersion"></div><button class="btSimple" id="btObgVersion" onclick=\'copyToClipboard("obgVersion")\'>Copy</button><div><hr class="hRule"></div><div><hr class="hRule"></div><div><hr class="hRule"></div><div>Jira QA Table</div><div class="displayInLightGrey contextValue">from the above data</div><button class="btSimple" id="btCreateJiraTable" onclick=\'copyToClipboard("jiraTemplate")\'>Copy</button><div class="noB2B">Deep Link</div><div class="displayInLightGrey contextValue noB2B">of the actual page & slip</div><button class="btSimple noB2B" id="btCreateDeepLink" onclick=\'copyToClipboard("deepLink")\'>Copy</button></div></div></div><div id="sbToolsSetEventPhase" class="accordion closed"><button id="setEventPhaseAccordion" class="accHeading" onclick="initSetEventPhase()">Event</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSetEventPhase">Detected event:</div><button class="infoButton" onclick=\'toggleInfo("setEventPhaseInfo")\'>&#128712;</button><div class="labelRow" id="eventLabelForSetEventPhase"></div><div id="lockEventSectionForSetEventPhase" class="lockSection">Lock <input type="checkbox" id="chkLockEventForSetEventPhase" class="chkSbTools" onclick=\'lockEvent("SetEventPhase")\'></div></div><div id="eventDetailsSection"><hr class="hRule"><div id="eventIdRowForEventDetails">ID:<span id="eventIdForEventDetails" class="labelRow"></span><span><button class="btSimple floatRight" id="btCopyEventId" onclick=\'copyToClipboard("eventId")\'>Copy</button></span></div><div>Start Date:<span id="startDateForEventDetails" class="labelRow"></span></div></div><div id="setEventPhaseButtonsSection"><div id="setEventPhaseButtonsLayout"><button id="btSetEventPhaseLive" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Live")\'>Live</button><button id="btSetEventPhasePrematch" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Prematch")\'>Prematch</button><button id="btSetEventPhaseOver" class="btSimple btSetEventPhase" onclick=\'setEventPhase("Over")\'>Over</button></div></div><div id="setEventPhaseInfo" class="hide"><hr class="hRule"><span class="infoSymbol">&#128712;</span>Event detection order:<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol></div></div></div><div id="sbToolsSetMarketState" class="accordion closed"><button id="setMarketStateAccordion" class="accHeading" onclick="initSetMarketState()">Market</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForSetMarketState">Detected market:</div><button class="infoButton" onclick=\'toggleInfo("setMarketStateInfo")\'>&#128712;</button><div class="labelRow" id="marketLabelForSetMarketState"></div><div id="lockMarketSection" class="lockSection">Lock <input type="checkbox" id="chkLockMarket" class="chkSbTools" onclick="lockMarket()"></div></div><div id="marketTemplateIdSection"><hr class="hRule">Template ID:<span id="marketTemplateIdForSetMarketState" class="labelRow"></span><span><button class="btSimple floatRight" id="marketTemplateId" onclick=\'copyToClipboard("marketTemplateId")\'>Copy</button></span></div><div id="setMarketStateButtonsSection" class="setMarketStateLayout"><button class="btSimple btSetMarketState" id="btSetMarketStateSuspended" onclick=\'setMarketState("Suspended")\'>Suspd.</button><button class="btSimple btSetMarketState" id="btSetMarketStateOpen" onclick=\'setMarketState("Open")\'>Open</button><button class="btSimple btSetMarketState" id="btSetMarketStateVoid" onclick=\'setMarketState("Void")\'>Void</button><button class="btSimple btSetMarketState" id="btSetMarketStateSettled" onclick=\'setMarketState("Settled")\'>Settled</button><button class="btSimple btSetMarketState" id="btSetMarketStateHold" onclick=\'setMarketState("Hold")\'>Hold</button></div><div id="setMarketStateInfo" class="hide"><hr class="hRule"><span class="infoSymbol">&#128712;</span>Market detection: parent market of the last selection from betslip.</div></div></div><div id="sbToolsCreateMarket" class="accordion closed"><button id="createMarketAccordion" class="accHeading" onclick="initCreateMarket()">Create Fast/PlayerProps Market</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForCreateMarket">Detected event:</div><button class="infoButton" onclick=\'toggleInfo("createMarketInfo")\'>&#128712;</button><div class="labelRow" id="eventLabelForCreateMarket"></div><div></div></div><hr class="hRule">Player Props<div class="createMarketLayout"><button class="btSimple playerProps" id="btCreatePlayerPropsMarket" onclick=\'createMarket("playerProps")\'>4 selections</button><div class="buttonLabelToRight" id="playerPropsMessage"></div><button class="btSimple playerProps" id="btCreatePlayerPropsDummyMarket" onclick=\'createMarket("playerPropsDummy")\'>15 dummy selections</button><div></div></div><hr class="hRule">Fast Markets<div class="createMarketLayout"><button class="btSimple" id="btCreateFastMarket" onclick=\'createMarket("fast")\'>Tennis</button><div class="buttonLabelToRight" id="tennisFastMarketMessage"></div></div><div id="createMarketInfo" class="hide"><hr class="hRule"><span class="infoSymbol">&#128712;</span>Event detection: Open event panel</div></div></div><div id="sbToolsChangeOdds" class="accordion closed"><button id="changeOddsAccordion" class="accHeading" onclick="initChangeOdds()">Change Odds</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForChangeOdds">Detected selection:</div><button class="infoButton" onclick=\'toggleInfo("changeOddsInfo")\'>&#128712;</button><div class="labelRow" id="selectionLabelForChangeOdds"></div><div id="lockSelectionSection" class="lockSection">Lock <input type="checkbox" id="chkLockSelection" class="chkSbTools verticalAlignMiddle" onclick="lockSelection()"></div></div><div id="newOddsRow" class="newOddsLayout"><label for="newOdds">New Odds:</label><input class="fdNumeric" type="number" id="newOdds" min="1" step="0.01" oninput=\'validity.valid||(value="")\'><button class="btSimple btSubmit" onclick="changeOdds()">Submit</button></div><div id="changeOddsInfo" class="hide"><hr class="hRule"><span class="infoSymbol">&#128712;</span>Selection detection: Last selection from betslip</div></div></div><div id="sbToolsAddToCarousel" class="accordion closed"><button id="addToCarouselAccordion" class="accHeading" onclick="initAddToCarousel()">Add Event to the Carousel</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForAddToCarousel">Detected event:</div><button class="infoButton" onclick=\'toggleInfo("addToCarouselInfo")\'>&#128712;</button><div class="labelRow" id="eventLabelForAddToCarousel"></div><div id="lockEventSectionForAddToCarousel" class="lockSection">Lock <input type="checkbox" id="chkLockEventForAddToCarousel" class="chkSbTools" onclick=\'lockEvent("AddToCarousel")\'></div></div><div id="notSportsbookHomePageMessage" class="displayInRed hide"><hr class="hRule">Current page is not Sportsbook Home</div><div id="carouselButtonsDiv"><div><button class="btSimple btCarousel" id="btAddToCarousel" onclick="addToCarousel()">Add to Carousel</button><span id="addToCarouselMessage"></span></div><div id="stopCarouselAutoPlayDiv"><button class="btSimple btCarousel" id="btStopCarouselAutoPlay" onclick="stopCarouselAutoPlay()">Stop Auto Play</button><span id="lblStopCarouselAutoPlay">Warning: page will be reloaded</span></div></div><div id="addToCarouselInfo" class="hide"><hr class="hRule"><span class="infoSymbol">&#128712;</span>"Stop Auto Play" prevents the carousel from auto-rotating. Has to be initiated before adding event to the carousel.<hr class="hRule"><span class="infoSymbol">&#128712;</span>Event detection order:<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol><hr class="hRule"><span class="infoSymbol">&#128712;</span>Steps to add event to carousel:<ol class="infoList"><li>Be on Sportsbook Home page</li><li>Click on the above "Add to Carousel" button</li><li>If not instantly visible on the Carousel, find the event by swiping the pages</li></ol></div></div></div><div id="sbToolsScoreBoard" class="accordion closed"><button id="scoreBoardAccordion" class="accHeading" onclick="initScoreBoard()">Football Scoreboard</button><div class="accContent"><div class="detectedEntitySection"><div id="detectedOrLockedRowForScoreBoard">Detected event:</div><button class="infoButton" onclick=\'toggleInfo("scoreBoardInfo")\'>&#128712;</button><div class="labelRow" id="eventLabelForScoreBoard"></div><div id="lockEventSectionForScoreBoard" class="lockSection">Lock <input type="checkbox" id="chkLockEventForScoreBoard" class="chkSbTools" onclick=\'lockEvent("ScoreBoard")\'></div></div><div id="notFootballScoreBoardMessage" class="hide displayInRed"><hr class="hRule">Not having Football Scoreboard</div><hr class="hRule"><div id="scoreBoardScores" class="scoreLayout"><div id="homeScoreLabel">Home Score</div><input class="fdNumeric fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="homeScoreInputField"><button id="btSubmitHomeScore" class="btSubmit btSimple" onclick=\'submitScore("home")\'>Submit</button><div id="awayScoreLabel">Away Score</div><input class="fdNumeric fdScoreBoardNumeric" type="number" min="0" oninput=\'validity.valid||(value="")\' id="awayScoreInputField"><button id="btSubmitAwayScore" class="btSubmit btSimple" onclick=\'submitScore("away")\'>Submit</button></div><div id="scoreBoardDetails"><div class="scoreBoardLayout"><div id="corners" class="vertical">Corners</div><div id="substitutions" class="vertical">Substitutions</div><div id="yellowCards" class="vertical">Yellow Cards</div><div id="redCards" class="vertical">Red Cards</div><div id="penalties" class="vertical">Penalties</div><input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeSubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homePenalties" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayCorners" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awaySubstitutions" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayYellowCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayRedCards" min="0" oninput=\'validity.valid||(value="")\'> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayPenalties" min="0" oninput=\'validity.valid||(value="")\'></div><button id="submitScoreBoard" class="btSubmit btSimple" onclick="submitScoreBoard()">Submit</button></div><div id="scoreBoardInfo" class="hide"><span class="infoSymbol">&#128712;</span>Event detection order (with Football Scoreboard):<ol class="infoList"><li>Open event panel</li><li>Last selection from betslip</li></ol></div></div></div><div id="sbToolsAccaDetails" class="accordion closed"><button id="accaDetailsAccordion" class="accHeading" onclick="initAccaDetails()">ACCA Insurance Details</button><div class="accContent"><div id="accaMessage"></div><div id="accaDetailsLayout"><div>Name:<span id="accaName" class="displayInGreen"></span></div><div>ID:<span id="accaId" class="displayInGreen"></span></div><div class="accaIdButtonsLayout"><button class="btSimple extraCondensed" id="btCopyAccaId" onclick=\'copyToClipboard("accaId")\'>Copy ID</button><button class="btSimple extraCondensed" id="btOpenAccaId" onclick="openInTradingTools()">Open in Trading Tools</button></div><hr class="hRule"><div id="accaCategoriesSection"><div id="accaCategoriesRow">Categories:<span id="accaCategories" class="displayInGreen"></span></div><div id="accaCompetitionsRow">Competitions:<span id="accaCompetitions" class="displayInLightGrey"></span></div><div id="accaMarketTemplatesRow">Market Templates:<span id="accaMarketTemplates" class="displayInLightGrey"></span></div><hr class="hRule"></div><div id="accaEventPhaseRow">Event Phase:<span id="accaEventPhase" class="displayInGreen"></span></div><div>Min Number of Selections:<span id="accaMinimumNumberOfSelections" class="displayInGreen"></span></div><div>Min Selection Odds:<span id="accaSelectionOddsLimitMin" class="displayInGreen"></span></div><div id="accaTotalOddsLimitMinRow">Min Total Odds:<span id="accaTotalOddsLimitMin" class="displayInGreen"></span></div><hr class="hRule"><div id="accaMinimumStakeRow">Min Stake:<span id="accaMinimumStake" class="displayInGreen"></span></div><div id="accaMaximumStakeRow">Max Stake:<span id="accaMaximumStake" class="displayInGreen"></span></div></div></div></div><div id="sbToolsStreamMappingHelper" class="accordion closed"><button id="streamMappingHelperAccordion" class="accHeading" onclick="initStreamMappingHelper()">IDs for stream mapping (probably YAGNI)</button><div class="accContent">Get LIVE Provider Event IDs for mapping:<div class="streamIdsLayout"><button id="getTwitchProviderIds" class="btSimple" onclick="getTwitchProviderIds()">Twitch</button><button id="getPerformProviderIds" class="btSimple" onclick="getPerformProviderIds()">Perform</button><div id="twitchResults" class="extraCondensed"></div><div id="performResults" class="extraCondensed"></div></div></div></div><style>#performResults,#twitchResults{margin-left:5px;margin-top:5px}.truncatable{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.contextValue{color:#00a000}.infoButton{font-size:20px;padding:0;border:none;background:0 0;cursor:pointer;justify-self:end}.infoSymbol{font-size:16px;margin-right:5px}.lockSection{display:flex;justify-content:flex-end;margin-right:2px;align-self:center}.infoList{margin:3px;padding-inline-start:25px}.detectedEntitySection{display:grid;grid-template-columns:auto 60px;grid-template-rows:auto auto}.streamIdsLayout{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.accaIdButtonsLayout{margin-top:10px;display:grid;grid-template-columns:1fr 1fr}.align-right{text-align:right}.buttonLabelToRight{margin-left:8px}.scoreLayout{margin-bottom:10px;display:grid;grid-template-columns:30% 18% 15%;grid-template-rows:1fr 1fr;align-items:center}#scoreBoardDetails{border:1px solid #ccc;margin-bottom:15px}.scoreBoardLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;grid-template-rows:auto auto auto;padding:10px;justify-items:center}.monoSpaceFont{font-family:monospace}#obgStateAndRtLayout{display:grid;grid-template-columns:auto 75px}.contextLayout{display:grid;grid-template-columns:auto auto 75px;grid-template-rows:1fr 1fr 1fr 1fr 1fr .8fr 1fr 1fr;align-items:center}#setEventPhaseButtonsLayout{padding-top:10px;display:grid;grid-template-columns:1fr 1fr 1fr}.setMarketStateLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;margin-top:10px}.createMarketLayout{display:grid;grid-template-columns:55% auto;align-items:center}.newOddsLayout{padding-top:10px;align-items:center;display:grid;grid-template-columns:30% 20% auto}.btSubmit{margin-left:3px;width:60px}.vertical{writing-mode:tb-rl;transform:rotate(-180deg);margin-bottom:5px}#submitScoreBoard{margin:10px}.fdNumeric{border:1px solid #444}.fdScoreBoardNumeric{width:45px}#sportsbookTool{background-color:#fff;color:#444;font-family:Arial;width:310px;height:auto;position:absolute;border:2px solid #d3d3d3;top:0;left:0;z-index:5000;filter:drop-shadow(0 0 1.5rem #000);font-size:12px;overflow:auto}#sportsbookToolHeader{font-weight:700;padding:3px;padding-bottom:5px;cursor:move;z-index:5000;background-color:#2196f3;color:#fff}#sportsbookToolHeaderTitle{display:inline-block;padding-top:3px;padding-left:4px}#sportsbookToolName{font-size:14px}#sportsbookToolAuthorName{font-size:8px;line-height:30%;font-weight:400}.btSimple{border:1px solid #444;border-radius:3px;box-shadow:0 1px #666;padding-inline:5px;margin:2px;cursor:pointer}.btSimple:hover{background-color:#fff}.btGreen{background-color:#00a000;color:#fff}.btGreen:hover{background-color:#32cd32}.btCarousel{width:110px;margin-bottom:5px}.extraCondensed{font-stretch:extra-condensed;padding-inline:1px}.btSimple:active{box-shadow:0 0 #666;transform:translateY(1px)}.sportsbookToolHeaderButtons{color:#fff;width:25px;height:20px}#carouselButtonsDiv{margin-top:10px;margin-bottom:10px}#btMinimizeAll,#btZoomInOut{background:#646464}#btMinimizeAll:hover,#btZoomInOut:hover{background:#1e1e1e}#btMinimizeClosed{background:#6464c8}#btMinimizeClosed:hover{background:#0000a0}#btClose{background:#c86464}#btClose:hover{background:#a00000}.displayInRed{color:#a00000}.displayInGreen{color:#00a000}.displayInLightGrey{color:#ccc}.hide{display:none}.show{display:block}.accHeading{border-radius:none;background-color:#eee;color:#444;cursor:pointer;padding:8px;width:100%;text-align:left;border:none;outline:0;transition:.4s}.accHeading:hover,.open .accHeading{background-color:#ccc}.accContent{margin:10px;background-color:#fff;overflow:hidden}.closed .accContent{display:none}.open .accContent{display:block}.inactivated{pointer-events:none;opacity:.4}.hRule{border-top:#ccc}.zoomOut{transform:scale(.7)}.floatRight{float:right}.carouselList{padding-left:15px}.visibilityHidden{visibility:hidden}.displayInGreenGlow{text-shadow:0 0 7px #fff,0 0 10px #fff,0 0 21px #fff,0 0 42px #00a000,0 0 82px #00a000,0 0 92px #00a000,0 0 102px #00a000,0 0 151px #00a000}#limitedFunctionsMessage{color:#a00000;font-weight:700;float:right;font-stretch:extra-condensed}.chkSbTools{margin-left:5px;align-self:center;cursor:pointer}</style>';

        sportsbookTool.innerHTML = htmlContent;
    }

    function isItBetssonSite() {
        try {
            obgNavigationSupported;
        } catch {
            try {
                obgClientEnvironmentConfig;
            } catch {
                try {
                    obgGlobalAppContext;
                } catch {
                    alert("You are not on a Betsson website.\nIf you think you are, please contact: gergely.glosz@betssongroup.com")
                    return false;
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

    function checkEnabledfeatures() {
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
            }
        } catch { return false; }
        return true;
    }

    function getObgVersion() {
        var obgVersion;
        try {
            obgVersion = obgClientEnvironmentConfig.startupContext.appContext.version;
        } catch {
            obgVersion = obgState.appContext.version;
        }
        return "OBGA-" + obgVersion;
    }

    function getDeviceType() {
        try {
            return obgClientEnvironmentConfig.startupContext.device.deviceType;
        } catch {
            try {
                return obgGlobalAppContext.deviceType;
            } catch {
                return obgState.appContext.device.deviceType;
            }
        }
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
        if (IS_B2B) {
            try {
                brandName = obgClientEnvironmentConfig.startupContext.brandName;                
            } catch {
                return "some B2B...";
            }
            if (brandName === "betsson" || brandName === "nordicbet"){
                brandName = brandName + " (B2B)"; 
            }
        } else {
            var hostName = window.location.hostname;
            brandName = hostName.substring(
                hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
            if (/mobilbahis\d{3}/.test(brandName)) {
                brandName = brandName.replace(/mobilbahis\d{3}/, "mobilbahis");
            } else if (/\d{3}bets10/.test(brandName)) {
                brandName = brandName.replace(/\d{3}bets10/, "bets10");
            } else if (brandName === "com.ar") {
                brandName = "betsson.com.ar";
            }
        }
        return brandName.charAt(0).toUpperCase() + brandName.slice(1);
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
        var btMinimizeAll = document.getElementById("btMinimizeAll");
        if (DEVICE_TYPE === "Desktop") {
            hide(btMinimizeAll);
        }
        if (!IS_OBGSTATE_EXPOSED) {
            hide(btMinimizeClosed);
        }
        document.getElementById("sportsbookToolVersion").innerText = SB_TOOL_VERSION;
    }

    function removeFeature(...features) {
        for (var feature of features) {
            try {
                document.getElementById("sbTools" + feature).remove();
            } catch {}
        }
    }

    function initAccordions() {

        for (var accHead of accHeadCollection) {
            accHead.addEventListener("click", toggleAccordion, false);
        }
        if (!IS_OBGSTATE_EXPOSED) {
            limitFeatures("obgState");
        } else if (!IS_OBGRT_EXPOSED) {
            limitFeatures("obgRt");
        }

        function limitFeatures(limitationCause) {
            var limitedFunctionsMessage = document.getElementById("limitedFunctionsMessage");
            limitedFunctionsMessage.innerText = "Features limited as " + limitationCause + " is disabled";

            switch (limitationCause) {
                case "obgState":
                    removeFeature(
                        "SetEventPhase",
                        "SetMarketState",
                        "CreateMarket",
                        "ChangeOdds",
                        "AddToCarousel",
                        "ScoreBoard",
                        "AccaDetails",
                        "EventDetails",
                    );
                    break;
                case "obgRt":
                    removeFeature(
                        "CreateMarket",
                        "ChangeOdds",
                        "AddToCarousel",
                        "ScoreBoard",
                    );
                    break;
            }
        }

        if (IS_B2B || ENVIRONMENT === "TEST (Local)") {
            var noB2Belements = document.getElementsByClassName("noB2B");
            for (elem of noB2Belements) {
                elem.classList.add("visibilityHidden");
            }
        }


        function toggleAccordion() {
            var accClass = this.parentNode.className;
            for (i = 0; i < accCollection.length; i++) {
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
        var obgStateAndRtSection = document.getElementById("obgStateAndRtSection");
        if (!IS_OBGSTATE_EXPOSED || !IS_OBGRT_EXPOSED) {
            show(obgStateAndRtSection);
        }

        // chkExposeObgStateAndRt.checked = true :
        // chkExposeObgStateAndRt.checked = false;


        document.getElementById("deviceType").innerText = DEVICE_TYPE;
        document.getElementById("environment").innerText = ENVIRONMENT;
        document.getElementById("brandName").innerText = BRAND_NAME;
        document.getElementById("browserVersion").innerText = BROWSER_VERSION;
        document.getElementById("obgVersion").innerText = OBG_VERSION;
        document.getElementById("btSwitchToEnv").innerHTML = "&#10132; " + getNewEnvToSwitchTo();

        replaceBodyEventListenersWith(null);
    }

    function getNewEnvToSwitchTo() {
        var newEnv;
        switch (ENVIRONMENT) {
            case "PROD":
                newEnv = "ALPHA";
                break;
            case "ALPHA":
                newEnv = "PROD";
                break;
            case "QA":
                newEnv = "TEST";
                break;
            case "TEST":
                newEnv = "QA";
                break;
            case "TEST (Local)":
                newEnv = "TEST";
                break;
        }
        return newEnv;
    }

    window.toggleInfo = (infoDiv) => {
        var info = document.getElementById(infoDiv);
        if (info.classList.contains("hide")) {
            show(info);
        } else {
            hide(info);
        };
    }

    class UrlParameter {
        constructor(key, value) {
            this.key = key;
            this.value = value;
        }
    }

    window.exposeObgStateAndRt = () => {
        // var exposeObgStateAndRt = document.getElementById("exposeObgStateAndRt");
        var obgStateAndRtLayout = document.getElementById("obgStateAndRtLayout");

        // exposeObgStateAndRt.checked ?
        //     reloadPageWithSearchParam(new UrlParameter("exposeObgState", "1"), new UrlParameter("exposeObgRt", "1")) :
        //     reloadPageWithSearchParam(new UrlParameter("exposeObgState", "0"), new UrlParameter("exposeObgRt", "0"));
        reloadPageWithSearchParam(new UrlParameter("exposeObgState", "1"), new UrlParameter("exposeObgRt", "1"))
        obgStateAndRtLayout.innerText = "Reloading...";

    }

    function reloadPageWithSearchParam(...urlQueryParameters) {
        var url = new URL(window.location.href);
        for (var param of urlQueryParameters) {
            url.searchParams.delete(param.key);
            url.searchParams.append(param.key, param.value);
        }
        window.open(url, "_self");
    }

    window.switchToEnv = () => {
        var deepLink = new URL(getDeepLink());
        switch (getNewEnvToSwitchTo()) {
            case "PROD":
                deepLink.searchParams.delete("alpha");
                deepLink.searchParams.append("alpha", "0");
                break;
            case "ALPHA":
                deepLink.searchParams.delete("alpha");
                deepLink.searchParams.append("alpha", "1");
                break;
            case "QA":
                deepLink = String(deepLink).replace("www.test.", "www.qa.");
                break;
            case "TEST":
                deepLink = String(deepLink).replace("www.qa.", "www.test.");
                break;
        }
        window.open(deepLink);
    }


    function getBetSlipReducer() {
        return JSON.parse(localStorage.getItem("betslipReducer"));
    }

    var closedAccordionsVisible = true;
    window.toggleClosedAccordionsVisibility = () => {
        var bt = document.getElementById("btMinimizeClosed");
        if (closedAccordionsVisible) {
            closedAccordionsVisible = false;
            bt.innerHTML = "&#128470;";
        } else {
            closedAccordionsVisible = true;
            bt.innerHTML = "&#128469;";
        }

        for (i = 0; i < accHeadCollection.length; i++) {
            accHead = accHeadCollection[i];
            accHead.parentNode.classList.contains("closed") && !accHead.classList.contains("hide") ?
                hide(accHead) :
                show(accHead);
        }
    }

    var allAccordionsVisible = true;
    window.toggleAllAccordionsVisibility = () => {
        var bt = document.getElementById("btMinimizeAll");
        if (allAccordionsVisible) {
            allAccordionsVisible = false;
            bt.innerHTML = "&#128470;";
        } else {
            allAccordionsVisible = true;
            bt.innerHTML = "&#128469;";
        }
        var sportsbookToolContent = document.getElementById("sportsbookToolContent");
        sportsbookToolContent.classList.contains("hide") ?
            show(sportsbookToolContent) :
            hide(sportsbookToolContent);
    }

    window.closePopup = () => {
        sportsbookTool.remove();
        sportsbookToolScript = document.getElementById("sportsbookToolScript");
        if (sportsbookToolScript !== null) {
            sportsbookToolScript.remove();
        }
    }

    var appWindowResized = false;
    window.zoomInOut = () => {
        if (!appWindowResized) {
            sportsbookTool.classList.add("zoomOut");
            appWindowResized = true;
        } else {
            sportsbookTool.classList.remove("zoomOut");
            appWindowResized = false;
        }
    }

    function initWindowMover() {
        if (DEVICE_TYPE === "Mobile") {

            var box = document.getElementById("sportsbookTool");
            var diffX;
            var diffY;

            box.addEventListener("touchstart", function(e) {
                let touchLocation = e.targetTouches[0];
                let boxStartLocationX = parseInt(box.style.left) || 0;
                let boxStartLocationY = parseInt(box.style.top) || 0;
                let touchStartLocationX = touchLocation.pageX || 0;
                let touchStartLocationY = touchLocation.pageY || 0;
                diffX = touchStartLocationX - boxStartLocationX;
                diffY = touchStartLocationY - boxStartLocationY;
            });

            box.addEventListener("touchmove", function(e) {
                // grab the location of touch
                var touchLocation = e.targetTouches[0];
                e.stopPropagation();
                e.preventDefault();

                // assign box new coordinates based on the touch.
                box.style.left = touchLocation.pageX - diffX + 'px';
                box.style.top = touchLocation.pageY - diffY + 'px';
            })
        } else {
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

    function getDeepLink() {
        var deepLink = new URL(window.location.origin + window.location.pathname);
        var paramsFromAddressBar = Object.entries(Object.fromEntries(new URLSearchParams(window.location.search).entries()));
        var name;
        var value;
        for (i = 0; i < paramsFromAddressBar.length; i++) {
            name = paramsFromAddressBar[i][0];
            value = paramsFromAddressBar[i][1];
            appendParam(name, value);
        }
        if (ENVIRONMENT === "ALPHA") {
            appendParam("alpha", 1);
        } else if (ENVIRONMENT === "PROD") {
            appendParam("alpha", 0);
        }

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
            appendParam("betslip_eventId_" + (i + 1), selections[i].eventId);
            appendParam("betslip_marketId_" + (i + 1), selections[i].marketId);
            appendParam("betslip_selectionId_" + (i + 1), selections[i].selectionId);
        }
        var couponType = betSlipReducer.couponType.toLowerCase();
        appendParam("type", couponType);
        if (couponType === "single") {
            for (var i = 0; i < numberOfSelections; i++) {
                appendParam("stake_" + (i + 1), Object.values(betSlipReducer.stakes.single)[i]);
            }
        } else if (couponType === "combi") {
            appendParam("stake_1", betSlipReducer.stakes.combi);
        }
        return deepLink;

        function appendParam(name, value) {
            if (value !== undefined) {
                deepLink.searchParams.delete(name);
                deepLink.searchParams.append(name, String(value));
            }
        }
    }

    window.copyToClipboard = (param) => {
        var text;
        switch (param) {
            case "obgVersion":
                text = OBG_VERSION;
                break;
            case "browserVersion":
                text = BROWSER_VERSION;
                break;
            case "jiraTemplate":
                text = getJiraTemplate();
                break;
            case "deepLink":
                text = getDeepLink();
                break;
            case "eventId":
                text = eventId;
                break;
            case "accaId":
                text = accaIdToLookupInTradingTools;
                break;
            case "marketTemplateId":
                text = marketTemplateId;
                break;
        }
        navigator.clipboard.writeText(text);
    }

    class BodyEventListener {
        constructor(type, handler) {
            this.type = type;
            this.handler = handler;
        }
    }

    function replaceBodyEventListenersWith(...newListeners) {

        for (var oldListener of bodyEventListeners) {
            document.body.removeEventListener(oldListener.type, oldListener.handler);
            // console.log("REMOVED: " + oldListener.type + ", " + String(oldListener.handler).split('\n')[0]);
        }
        bodyEventListeners = [];

        for (var newListener of newListeners) {
            if (newListener !== null) {
                document.body.addEventListener(newListener.type, newListener.handler);
                // console.log("ADDED: " + newListener.type + ", " + String(newListener.handler).split('\n')[0]);
                bodyEventListeners.push(newListener);
            }
        }
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
            detectedOrLockedRow.innerHTML = "&#128274; Locked event:";
            labelRow.classList.add("displayInGreenGlow");
            replaceBodyEventListenersWith(null);
            switch (parentAccordion) {
                case "AddToCarousel":
                    initAddToCarousel("currentPageCheckOnly");
                    break;
                case "SetEventPhase":
                    initSetEventPhase("buttonsOnly");
                    break;
            }
            inactivateAllAccordions();
        } else {
            lockedEventId = undefined;
            detectedOrLockedRow.innerText = "Detected event:";
            labelRow.classList.remove("displayInGreenGlow");
            switch (parentAccordion) {
                case "SetEventPhase":
                    initSetEventPhase();
                    break;
                case "AddToCarousel":
                    initAddToCarousel();
                    break;
                case "ScoreBoard":
                    initScoreBoard();
                    break;
            }
            activateAllAccordions();
        }
    }

    window.initSetMarketState = () => {
        initSetMarketState();
    }

    function initSetMarketState(scope) {
        var marketStateButtons = document.getElementsByClassName("btSetMarketState");
        var marketStateButtonsSection = document.getElementById("setMarketStateButtonsSection");
        var labelRow = document.getElementById("marketLabelForSetMarketState");
        var lockMarketSection = document.getElementById("lockMarketSection");
        var marketTemplateIdSection = document.getElementById("marketTemplateIdSection");
        var marketTemplateIdField = document.getElementById("marketTemplateIdForSetMarketState");

        scope === "buttonsOnly" ?
            replaceBodyEventListenersWith(new BodyEventListener("click", listenerForSetMarketStateButtonsOnly)) :
            replaceBodyEventListenersWith(new BodyEventListener("click", listenerForSetMarketState));

        function listenerForSetMarketState() {


            if (Object.values(getBetSlipByObgState().selections) == "") {
                hide(lockMarketSection, marketTemplateIdSection, marketStateButtonsSection); // new
                detectionResultText = NOT_FOUND;
                displayInRed(labelRow);
            } else {
                show(marketTemplateIdSection);
                var lastMarketIdFromBetSlip = getLastMarketIdFromBetslip();
                detectionResultText = getEventLabel(getLastEventIdFromBetslip()) + "<br><b>" + getMarketLabel(lastMarketIdFromBetSlip) + "</b>";
                displayInGreen(labelRow);

                if (IS_OBGRT_EXPOSED) {
                    show(lockMarketSection, marketStateButtonsSection);
                    listenerForSetMarketStateButtonsOnly();
                } else {
                    hide(lockMarketSection, marketStateButtonsSection);
                }
                displayInGreen(marketTemplateIdField);
                marketTemplateId = getMarketTemplateId(lastMarketIdFromBetSlip);
                marketTemplateIdField.innerText = marketTemplateId;
            }
            labelRow.innerHTML = detectionResultText;
        }


        function listenerForSetMarketStateButtonsOnly() {
            var marketStatus = obgState.sportsbook.eventMarket.markets[marketId].status;
            for (var button of marketStateButtons) {
                if (marketStatus === button.id.replace("btSetMarketState", "")) {
                    inactivate(button);
                } else {
                    activate(button);
                }
            }
        }
    }

    window.lockMarket = () => {
        var checkBox = document.getElementById("chkLockMarket");
        var detectedOrLockedRow = document.getElementById("detectedOrLockedRowForSetMarketState");
        var labelRow = document.getElementById("marketLabelForSetMarketState");
        if (checkBox.checked) {
            lockedMarketId = marketId;
            detectedOrLockedRow.innerHTML = "&#128274; Locked market:";
            labelRow.classList.add("displayInGreenGlow");
            replaceBodyEventListenersWith(null);
            initSetMarketState("buttonsOnly");
            inactivateAllAccordions();
        } else {
            lockedMarketId = undefined;
            detectedOrLockedRow.innerText = "Detected market:";
            labelRow.classList.remove("displayInGreenGlow");
            activateAllAccordions();
            initSetMarketState();
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

    function getEventWidgetActiveTabId(eventId) {
        return obgState.sportsbook.marketListWidget.items[eventId].marketTemplateGroupingId;
    }


    window.initCreateMarket = () => {
        var labelRow = document.getElementById("eventLabelForCreateMarket");
        var playerPropsMessage = document.getElementById("playerPropsMessage");
        var tennisFastMarketMessage = document.getElementById("tennisFastMarketMessage");
        var btCreateFastMarket = document.getElementById("btCreateFastMarket");
        var btCreatePlayerPropsMarket = document.getElementById("btCreatePlayerPropsMarket");
        var btCreatePlayerPropsDummyMarket = document.getElementById("btCreatePlayerPropsDummyMarket");


        replaceBodyEventListenersWith(new BodyEventListener("click", listenerForCreateMarket));

        function listenerForCreateMarket() {

            eventId = getUrlParam("eventId");

            if (eventId === undefined) {
                inactivate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket, btCreateFastMarket);
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                playerPropsMessage.innerText = null;
                tennisFastMarketMessage.innerText = null;

            } else {

                detectionResultText = getEventLabel(eventId);
                displayInGreen(labelRow);
                playerPropsMessage.innerText = null;
                activate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket);

                if (getCategoryId(eventId) !== "11") {
                    displayInRed(tennisFastMarketMessage);
                    tennisFastMarketMessage.innerText = "Not a tennis event"
                    inactivate(btCreateFastMarket);
                } else {
                    activate(btCreateFastMarket);
                    tennisFastMarketMessage.innerText = null;
                }

                // if (getEventWidgetActiveTabId(eventId) === "all") {
                //     activate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket);
                // } else {
                //     displayInRed(playerPropsMessage);
                //     playerPropsMessage.innerText = "\"All\" tab not selected";
                //     inactivate(btCreatePlayerPropsMarket, btCreatePlayerPropsDummyMarket);
                // }
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

    // function makeFontToExtraCondensed(...elements) {
    //     for (var element of elements) {
    //         element.classList.add("extraCondensed");
    //     }
    // }

    // function setFontToNormal(...elements) {
    //     for (var element of elements) {
    //         element.classList.remove("extraCondensed");
    //     }
    // }

    window.initChangeOdds = () => {
        var labelRow = document.getElementById("selectionLabelForChangeOdds");
        var selectionLabel;
        var lockSelectionSection = document.getElementById("lockSelectionSection");
        var newOddsRow = document.getElementById("newOddsRow");

        replaceBodyEventListenersWith(new BodyEventListener("click", listenerForChangeOdds));

        function listenerForChangeOdds() {
            eventLabel = getEventLabel(getLastEventIdFromBetslip());
            marketLabel = getMarketLabel(getLastMarketIdFromBetslip());
            selectionLabel = getSelectionLabel(getLastSelectionIdFromBetslip());
            odds = getLastInitialOddsFromBetslip();
            var detectionResultText;

            if (eventLabel === null || selectionLabel === null) {
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                if (lockedSelectionId === undefined) {
                    hide(lockSelectionSection);
                    inactivate(newOddsRow);
                }
            } else {
                displayInGreen(labelRow);
                activate(newOddsRow);
                show(lockSelectionSection);
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
        var detectedOrLockedRow = document.getElementById("detectedOrLockedRowForChangeOdds");
        var labelRow = document.getElementById("selectionLabelForChangeOdds");

        if (checkBox.checked) {
            lockedSelectionId = getLastSelectionIdFromBetslip();
            lockedInitialOdds = getLastInitialOddsFromBetslip();
            detectedOrLockedRow.innerHTML = "&#128274; Locked selection:";
            labelRow.classList.add("displayInGreenGlow");
            replaceBodyEventListenersWith(null);
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

    window.initAddToCarousel = () => {
        initAddToCarousel();
    }

    function initAddToCarousel(scope) {
        var labelRow = document.getElementById("eventLabelForAddToCarousel");
        var addToCarouselButton = document.getElementById("btAddToCarousel");
        var stopCarouselAutoPlayDiv = document.getElementById("stopCarouselAutoPlayDiv");
        var notSportsbookHomePageMessage = document.getElementById("notSportsbookHomePageMessage");
        var lockEventSection = document.getElementById("lockEventSectionForAddToCarousel");

        scope === "currentPageCheckOnly" ?
            replaceBodyEventListenersWith(new BodyEventListener("click", listenerForAddToCarouselCurrentPageCheckOnly)) :
            replaceBodyEventListenersWith(new BodyEventListener("click", listenerForAddToCarousel));

        var currentPage;

        if (IS_B2B || ENVIRONMENT === "PROD") {
            hide(stopCarouselAutoPlayDiv);
        }

        function listenerForAddToCarousel() {
            detectionResultText = getDetectedEventLabel();
            if (detectionResultText === null) {
                labelRow.innerText = NOT_FOUND;
                if (lockedEventId === undefined) {
                    hide(lockEventSection);
                }
                displayInRed(labelRow);
                inactivate(addToCarouselButton);
                hide(notSportsbookHomePageMessage);
            } else {
                listenerForAddToCarouselCurrentPageCheckOnly();
            }
        }

        function listenerForAddToCarouselCurrentPageCheckOnly() {
            show(lockEventSection);
            displayInGreen(labelRow);
            if (IS_B2B) {
                obgState.sportsbook.carousel.isBusy ?
                    currentPage = undefined :
                    currentPage = "sportsbook";
            } else {
                currentPage = obgState.page.current.documentKey;
            }
            if (currentPage === "sportsbook") {
                activate(addToCarouselButton);
                hide(notSportsbookHomePageMessage);
            } else {
                inactivate(addToCarouselButton);
                show(notSportsbookHomePageMessage);
            }
            labelRow.innerText = detectionResultText;
        }
    }

    window.initScoreBoard = () => {
        initScoreBoard();
    }

    function initScoreBoard() {
        var labelRow = document.getElementById("eventLabelForScoreBoard");
        var scoreBoardScores = document.getElementById("scoreBoardScores");
        var scoreBoardDetails = document.getElementById("scoreBoardDetails");
        var notFootballScoreBoardMessage = document.getElementById("notFootballScoreBoardMessage");
        var lockEventSection = document.getElementById("lockEventSectionForScoreBoard");
        var scoreBoardObjects;
        var itHasFootballScoreBoard;

        replaceBodyEventListenersWith(new BodyEventListener("click", listenerForScoreBoard));

        function listenerForScoreBoard() {
            hide(lockEventSection);
            scoreBoardObjects = Object.values(obgState.sportsbook.scoreboard);
            eventId = getDetectedEventId();
            detectionResultText = getDetectedEventLabel();
            itHasFootballScoreBoard = false;
            if (detectionResultText === null) {
                detectionResultText = NOT_FOUND;
                hide(notFootballScoreBoardMessage);
                inactivateScoreBoard();
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
                    activateScoreBoard();
                    show(lockEventSection);
                } else {
                    show(notFootballScoreBoardMessage);
                    inactivateScoreBoard();
                }
            }
            labelRow.innerText = detectionResultText;
        }

        function activateScoreBoard() {
            displayInGreen(labelRow);
            activate(scoreBoardScores, scoreBoardDetails);
        }

        function inactivateScoreBoard() {
            displayInRed(labelRow);
            inactivate(scoreBoardScores, scoreBoardDetails);
        }
    }

    // window.initEventDetails = () => {
    //     var eventLabelDiv = document.getElementById("eventLabelForEventDetails");
    //     var eventIdSpan = document.getElementById("eventIdForEventDetails");
    //     var startDateSpan = document.getElementById("startDateForEventDetails");
    //     var eventDetailsSection = document.getElementById("eventDetailsSection");

    //     replaceBodyEventListenersWith(new BodyEventListener("click", listenerForEventDetails));

    //     function listenerForEventDetails() {
    //         eventId = getDetectedEventId();
    //         if (eventId === undefined || eventId === null) {
    //             eventLabelDiv.innerText = NOT_FOUND;
    //             eventIdSpan.innerText = null;
    //             displayInRed(eventLabelDiv);
    //             hide(eventDetailsSection);
    //         } else {
    //             eventIdSpan.innerText = eventId;
    //             startDateSpan.innerText = getStartDate();
    //             eventLabelDiv.innerText = getEventLabel(eventId);
    //             displayInGreen(eventIdSpan, eventLabelDiv, startDateSpan);
    //             show(eventDetailsSection);
    //             // getEventPanelInfo();
    //         }
    //     }

    //     function getStartDate() {
    //         var dateObj = new Date(obgState.sportsbook.event.events[eventId].startDate);
    //         var day = dateObj.getDate();
    //         var month = (dateObj.toLocaleString('default', { month: 'short' })).toUpperCase();
    //         var year = dateObj.getFullYear();
    //         var hours = ("0" + dateObj.getHours()).slice(-2);
    //         var minutes = ("0" + dateObj.getMinutes()).slice(-2);
    //         return day + " " + month + " " + year + ", " + hours + ":" + minutes;
    //     }

    // function getEventPanelInfo() {
    //     var eventPanelTabsSection = document.getElementById("eventPanelTabsSection");
    //     var event = obgState.sportsbook.stream[eventId];
    //     var statisticsSection = document.getElementById("statisticsSection");
    //     if (event == undefined) {
    //         hide(eventPanelTabsSection);
    //         return;
    //     } else { show(eventPanelTabsSection) }

    //     if (event.liveStatistics !== undefined) {
    //         var statisticsType = document.getElementById("statisticsType");
    //         var statisticsProvider = document.getElementById("statisticsProvider");
    //         var statisticsProviderSourceId = document.getElementById("statisticsProviderSourceId");
    //         statisticsType.innerText = event.liveStatistics.type;
    //         statisticsProvider.innerText = event.liveStatistics.provider;
    //         statisticsProviderSourceId.innerText = event.liveStatistics.source;
    //         displayInGreen(statisticsType, statisticsProvider, statisticsProviderSourceId)
    //     } else {
    //         displayInRed(statisticsSection);
    //         statisticsSection.innerText = "Statistics " + NOT_FOUND;
    //     }
    // }
    // }

    window.initStreamMappingHelper = () => {
        replaceBodyEventListenersWith(null);
    }

    function getDetectedEventId() {
        eventId = getUrlParam("eventId");
        if (eventId === undefined) {
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
        return (eventId === undefined || eventId === null) ?
            null :
            getEventLabel(eventId);
    }

    function getEventLabel(eventId) {
        if (eventId === null || eventId === undefined) {
            return null;
        }
        return obgState.sportsbook.event.events[eventId].label;
    }

    var previousEventLabel;
    window.initSetEventPhase = () => {
        initSetEventPhase();
    }

    function initSetEventPhase(scope) {

        var labelRow = document.getElementById("eventLabelForSetEventPhase");
        var eventPhaseButtons = document.getElementsByClassName("btSetEventPhase");
        var lockEventSection = document.getElementById("lockEventSectionForSetEventPhase");
        var setEventPhaseButtonsSection = document.getElementById("setEventPhaseButtonsSection");
        var eventPhase;

        var eventDetailsSection = document.getElementById("eventDetailsSection");
        var eventIdSpan = document.getElementById("eventIdForEventDetails");
        var startDateSpan = document.getElementById("startDateForEventDetails");

        scope === "buttonsOnly" ?
            replaceBodyEventListenersWith(new BodyEventListener("click", listenerForSetEventPhaseButtonsOnly)) :
            replaceBodyEventListenersWith(new BodyEventListener("click", listenerForSetEventPhase));

        function listenerForSetEventPhase() {

            eventLabel = getDetectedEventLabel();

            if (eventLabel === null) {
                detectionResultText = NOT_FOUND;
                if (lockedEventId === undefined) {
                    hide(lockEventSection, eventDetailsSection, setEventPhaseButtonsSection);
                }
                displayInRed(labelRow);
            } else {
                show(eventDetailsSection);
                detectionResultText = eventLabel;
                eventIdSpan.innerText = eventId;
                startDateSpan.innerText = getStartDate();
                displayInGreen(labelRow, eventIdSpan, startDateSpan);

                if (IS_OBGRT_EXPOSED) {
                    show(lockEventSection, setEventPhaseButtonsSection);
                    listenerForSetEventPhaseButtonsOnly();
                } else {
                    hide(lockEventSection, setEventPhaseButtonsSection);
                }
            }
            labelRow.innerText = detectionResultText;
            previousEventLabel = eventLabel;
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

        function listenerForSetEventPhaseButtonsOnly() {

            if (mockedEventPhase == undefined) {
                mockedEventPhase = obgState.sportsbook.event.events[eventId].phase;
            }

            eventLabel !== previousEventLabel ?
                eventPhase = obgState.sportsbook.event.events[eventId].phase :
                eventPhase = mockedEventPhase;

            for (var button of eventPhaseButtons) {
                if (eventPhase === button.id.replace("btSetEventPhase", "")) {
                    inactivate(button);
                } else {
                    activate(button);
                }
            }
        }
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
                obgRt.setEventPhaseOver(eventId);
                break;
        }
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
                createFastmarket();
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
            obgRt.createMarketWithDummySelection(eventId, "m-" + eventId + "-28195615929", "N5MTTI", [6], "Fast Market Test | Something happened", 0, 2, 69, [{
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
                "group": "N5MTTI",
                sort: 6,
                "groupLevel": "2",
                groupType: 1
            }], ["Fast Market Test", "Something happened"]);
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

    window.addToCarousel = () => {
        if (lockedEventId !== undefined) {
            eventId = lockedEventId;
        }
        var item = obgState.sportsbook.carousel.item;
        var addToCarouselMessage = document.getElementById("addToCarouselMessage");

        item.skeleton.eventIds = [];
        item.skeleton.eventIds.push(eventId);

        // for 3-column markets
        categoryId = Number(getCategoryId(eventId));
        item.skeleton.marketGroups = {
            [categoryId]: {
                templateIds: [
                    ["2WHCPROLMID", "M2WHCPIO", "MHCPNOT"],
                    ["MW2W", "ML"],
                    ["MTG2WIO", "PTSOUROLMID", "TGOUOT"]
                ],
                key: "key",
                label: "label"
            }
        }

        obgState.sportsbook.carousel.item = {...obgState.sportsbook.carousel.item, item };
        displayInGreen(addToCarouselMessage);
        addToCarouselMessage.innerHTML = "&#10004;"
        triggerChangeDetection();

        setTimeout(function() {
            addToCarouselMessage.innerHTML = null;
        }, 3000);
    }

    window.stopCarouselAutoPlay = () => {
        var lblStopCarouselAutoPlay = document.getElementById("lblStopCarouselAutoPlay");
        lblStopCarouselAutoPlay.innerText = "Reloading page...";
        var searchParam = new UrlParameter("configOverride", "[(sportsbookUi.sportsbookCarousel.autoplayInterval,1000000,number)]")
        reloadPageWithSearchParam(searchParam);
    }

    function triggerChangeDetection() {
        var anyEventId = Object.values(obgState.sportsbook.event.events)[0].id;
        var eventPhase = obgState.sportsbook.event.events[anyEventId].phase;

        switch (eventPhase) {
            case "Live":
                obgRt.setEventPhaseLive(anyEventId);
                break;
            case "Prematch":
                obgRt.setEventPhasePrematch(anyEventId);
                break;
            case "Over":
                obgRt.setEventPhaseOver(anyEventId);
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
        xhr.onreadystatechange = function() {
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

        var url = "https://secure.betsson.performgroup.com/streaming/eventList";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                processResponse(xhr.responseXML);
            }
        }

        xhr.onerror = function() {
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
        var acca;
        var usersCurrency;
        var categories;
        var selectionOddsLimitMin;
        var totalOddsLimitMin;
        var minimumStake;
        var maximumStake;

        var accaMessage = document.getElementById("accaMessage");
        var accaDetailsLayout = document.getElementById("accaDetailsLayout");
        var accaName = document.getElementById("accaName");
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


        replaceBodyEventListenersWith(new BodyEventListener("click", listenerForAccaDetails));

        function listenerForAccaDetails() {
            if (!isUserLoggedIn()) {
                displayInRed(accaMessage);
                accaMessage.innerText = "Login to see ACCA.";
                hide(accaDetailsLayout);
                return;
            }

            acca = obgState.sportsbook.betInsurance.selectedBetInsurance;

            if (acca == undefined) {
                displayInRed(accaMessage);
                accaMessage.innerText = "No active ACCA insurance found";
                hide(accaDetailsLayout);
                return;
            } else {
                show(accaDetailsLayout);
                accaMessage.innerText = "";
            }
            usersCurrency = getUsersCurrency();
            accaName.innerText = acca.name;
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

    window.openInTradingTools = () => {
        var tradingToolsUrl;
        ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD" ?
            tradingToolsUrl = "https://tradingtools.ble.local/" :
            tradingToolsUrl = "https://tradingtools.qa.bde.local/";
        window.open(tradingToolsUrl + "bonus/" + accaIdToLookupInTradingTools)
    }
})();