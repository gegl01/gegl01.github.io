(function() {

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
                return;
            }
        }
    }

    var sportsbookTool = document.getElementById("sportsbookTool");
    // var sportsbookTool = document.createElement("div");
    // sportsbookTool.id = "sportsbookTool";
    // createWindow();

    var accCollection = document.getElementsByClassName("accordion");
    var accHeadCollection = document.getElementsByClassName("accHeading");
    var eventId;
    var eventLabel;
    var marketId;
    var marketLabel;
    var selectionId;
    var detectionResultText;

    const OBG_TOOL_VERSION = "1.0.0"
    const DEVICE_TYPE = getDeviceType();
    const ENVIRONMENT = getEnvironment();
    const IS_B2B = isB2B();
    const BRAND_NAME = getBrandName();
    const BROWSER_VERSION = getBrowserVersion();
    const OBG_VERSION = getObgVersion();
    const NOT_FOUND = "Not found.";
    const IS_OBGSTATE_EXPOSED = isObgRtExposed();

    initHeader();
    initAccordions();
    initContext();
    initWindowMover();

    function createWindow() {
        document.body.appendChild(sportsbookTool);
        var htmlContent =
            '<div id="sportsbookToolHeader"><div id="sportsbookToolHeaderTitle"><div id="sportsbookToolName">Sportsbook Tool v<span id="sportsbookToolVersion"></span></div><div id="sportsbookToolAuthorName">by gegl01@betssongroup.com</div></div><div id="sportsbookToolHeaderButtonRow" class="floatRight"> <button id="btZoomInOut" class="sportsbookToolHeaderButtons" onclick="zoomInOut()">&#128475;</button> <button id="btMinimizeAll" class="sportsbookToolHeaderButtons" onclick="toggleAllAccordionsVisibility()">&#128469;</button> <button id="btMinimizeClosed" class="sportsbookToolHeaderButtons" onclick="toggleClosedAccordionsVisibility()">&#128469;</button> <button id="btClose" class="sportsbookToolHeaderButtons" onclick="closePopup()">&#10006;</button></div></div><div id="sportsbookToolContent"><div class="accordion open"> <button class="accHeading">Context<span id="limitedFunctionsMessage"></span></button><div class="accContent"><div class="contextLayout"><div>Device Type:</div><div class="contextValue" id="deviceType"></div><div></div><div>Environment:</div><div class="contextValue" id="environment"></div> <button class="btSimple extraCondensed noB2B" id="btSwitchToEnv" onclick="switchToEnv()"></button><div>Brand:</div><div class="contextValue" id="brandName"></div><div></div><div>Browser:</div><div class="contextValue" id="browserVersion"></div> <button class="btSimple" id="btBrowserVersion" onclick="copyToClipboard(\'browserVersion\')">Copy</button><div>App Version:</div><div class="contextValue" id="obgVersion"></div> <button class="btSimple" id="btObgVersion" onclick="copyToClipboard(\'obgVersion\')">Copy</button><div><hr class="hRule"></div><div><hr class="hRule"></div><div><hr class="hRule"></div><div>Jira QA Table</div><div class="displayInLightGrey contextValue">from the above data</div> <button class="btSimple" id="btCreateJiraTable" onclick="copyToClipboard(\'jiraTemplate\')">Copy</button><div class="noB2B">Deep Link</div><div class="displayInLightGrey contextValue noB2B">of the actual page & slip</div> <button class="btSimple noB2B" id="btCreateDeepLink" onclick="copyToClipboard(\'deepLink\')">Copy</button></div></div></div><div class="accordion closed"> <button id="setEventPhaseAccordion" class="accHeading" onclick="initSetEventPhase()">Set Event Phase</button><div class="accContent"> Target event is from the open event widget, or last selection from the slip<hr class="hRule"> Detected event:<div class="labelRow" id="eventLabelForSetEventPhase"></div><div class="setEventPhaseLayout"> <button id="btSetsetEventPhaseLive" class="btSimple" onclick="setEventPhase(\'live\')">Live</button> <button id="btSetsetEventPhasePrematch" class="btSimple" onclick="setEventPhase(\'prematch\')">Prematch</button> <button id="btSetsetEventPhaseOver" class="btSimple" onclick="setEventPhase(\'over\')">Over</button></div></div></div><div class="accordion closed"> <button id="setMarketStateAccordion" class="accHeading" onclick="initSetMarketState()">Set Market State</button><div class="accContent"> Target market is the last from the betslip.<hr class="hRule">Detected Market:<div id="marketLabelForSetMarketState" class="labelRow"></div><div class="setMarketStateLayout"> <button class="btSimple" id="btSetMarketStateSuspended" onclick="setMarketState(\'suspended\')">Suspd.</button> <button class="btSimple" id="btSetMarketStateOpen" onclick="setMarketState(\'open\')">Open</button> <button class="btSimple" id="btSetMarketStateVoid" onclick="setMarketState(\'void\')">Void</button> <button class="btSimple" id="btSetMarketStateSettled" onclick="setMarketState(\'settled\')">Settled</button> <button class="btSimple" id="btSetMarketStateHold" onclick="setMarketState(\'hold\')">Hold</button></div><div id="marketStateMessage"></div></div></div><div class="accordion closed"> <button id="createMarketAccordion" class="accHeading" onclick="initCreateMarket()">Create Market</button><div class="accContent"> Target event is from the open event widget.<hr class="hRule"> Detected event:<div class="labelRow" id="eventLabelForCreateMarket"></div><hr class="hRule"> Player Props<div class="createMarketLayout" id="playerPropsSection"> <button class="btSimple playerProps" id="btCreatePlayerPropsMarket" onclick="createMarket(\'playerProps\')">4 selections</button><div class="buttonLabelToRight" id="playerPropsMessage"></div> <button class="btSimple playerProps" id="btCreatePlayerPropsDummyMarket" onclick="createMarket(\'playerPropsDummy\')">15 dummy selections</button><div></div></div><hr class="hRule">Fast Markets<div class="createMarketLayout" id="fastMarketSection"> <button class="btSimple" id="btCreateFastMarket" onclick="createMarket(\'fast\')">Tennis</button><div class="buttonLabelToRight" id="tennisFastMarketMessage"></div></div></div></div><div class="accordion closed"> <button id="changeOddsAccordion" class="accHeading" onclick="initChangeOdds()">Change Odds</button><div class="accContent"> The new odds applied either to:<br> - the last selection on the slip<br> - a locked selection (to test unselected odds change)<hr class="hRule"><div> <span id="detectedOrLockedRowForChangeOdds">Detected selection:</span> <span id="lockSelectionSection" class="floatRight"> <label id="lblLockSelection" for="chkLockSelection">Lock</label> <input type="checkbox" id="chkLockSelection" onclick="lockSelection()"> </span></div><div class="labelRow" id="selectionLabelForChangeOdds"></div><div id="newOddsRow" class="newOddsLayout"> <label for="newOdds">New Odds:</label> <input class="fdNumeric" type="number" id="newOdds"> <button class="btSimple btSubmit" class="btSubmit" onclick="changeOdds()">Submit</button></div></div></div><div class="accordion closed"> <button id="addToCarouselAccordion" class="accHeading" onclick="initAddToCarousel()">Add Event to the Carousel</button><div class="accContent"><ol class="carouselList"><li id="deviceDependentCarouselMessage"></li><li>Go to Sportsbook Home</li><hr class="hRule">Detected event:<div class="labelRow" id="eventLabelForAddToCarousel"></div><hr class="hRule"><li>Click: <button class="btSimple" id="btAddToCarousel" onclick="addToCarousel()">Add to Carousel</button> <span id="addToCarouselMessage"></span></li><li>Find the event on the Carousel using its arrow buttons</li></ol></div></div><div class="accordion closed"> <button id="scoreBoardAccordion" class="accHeading" onclick="initScoreBoard()">Football Scoreboard</button><div class="accContent"> Open an event panel with scoreboard or put it\'s selection to the slip.<hr class="hRule"> Detected event:<div class="labelRow" id="eventLabelForScoreBoard"></div><hr class="hRule"><div id="scoreBoardScores" class="scoreLayout"><div id="homeScoreLabel">Home Score</div> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeScoreInputField"> <button id="btSubmitHomeScore" class="btSubmit btSimple" onclick="submitScore(\'home\')">Submit</button><div id="awayScoreLabel">Away Score</div> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayScoreInputField"> <button id="btSubmitAwayScore" class="btSubmit btSimple" onclick="submitScore(\'away\')">Submit</button></div><div id="scoreBoardDetails"><div class="scoreBoardLayout"><div id="corners" class="vertical">Corners</div><div id="substitutions" class="vertical">Substitutions</div><div id="yellowCards" class="vertical">Yellow Cards</div><div id="redCards" class="vertical">Red Cards</div><div id="penalties" class="vertical">Penalties</div> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeCorners"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeSubstitutions"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeYellowCards"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homeRedCards"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="homePenalties"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayCorners"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awaySubstitutions"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayYellowCards"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayRedCards"> <input class="fdNumeric fdScoreBoardNumeric" type="number" id="awayPenalties"></div> <button id="submitScoreBoard" class="btSubmit btSimple" onclick="submitScoreBoard()">Submit</button></div></div></div><div class="accordion closed"> <button id="streamMappingHelperAccordion" class="accHeading" onclick="initStreamMappingHelper()">Stream mapping IDs</button><div class="accContent"><div class="labelRow">Detected event: <span id="eventLabelForStreamMappingHelper"></span></div><div id="eventIdRowForStreamMappingHelper" class="labelRow">EventId: <span id="eventIdForStreamMappingHelper"></span> <span> <button class="btSimple floatRight" id="btCopyEventId" onclick="copyToClipboard(\'eventId\')">Copy</button> </span></div><hr class="hRule"> Get Provider Event Ids to use in Trading Tools:<div class="streamIdsLayout"> <button id="getPerformProviderIds" class="btSimple" onclick="getPerformProviderIds()">Perform</button> <button id="getTwitchProviderIds" class="btSimple" onclick="getTwitchProviderIds()">Twitch</button><div id="performResults" class="extraCondensed"></div><div id="twitchResults" class="extraCondensed"></div></div></div></div></div></div><style>#twitchResults,#performResults{margin-left:5px;margin-top:5px}.streamIdsLayout{margin-top:10px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.align-right{text-align:right}.buttonLabelToRight{margin-left:8px}.scoreLayout{margin-bottom:10px;display:grid;grid-template-columns:30% 18% 15%;grid-template-rows:1fr 1fr;align-items:center}#scoreBoardDetails{border:1px solid #ccc}.scoreBoardLayout{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;grid-template-rows:auto auto auto;padding:10px;justify-items:center}.contextLayout{display:grid;grid-template-columns:auto auto 65px;grid-template-rows:1fr 1fr 1fr 1fr 1fr .8fr 1fr 1fr;align-items:center}.setEventPhaseLayout{padding-top:10px;display:grid;grid-template-columns:1fr 1fr 1fr}.setMarketStateLayout{padding-top:10px;display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr}.createMarketLayout{display:grid;grid-template-columns:50% auto;align-items:center}.newOddsLayout{padding-top:10px;align-items:center;display:grid;grid-template-columns:30% 20% auto}.btSubmit{margin-left:3px;width:60px}.vertical{writing-mode:tb-rl;transform:rotate(-180deg);margin-bottom:5px}#submitScoreBoard{margin:10px}.fdNumeric{border:1px solid #444}.fdScoreBoardNumeric{width:45px}#sportsbookTool{background-color:white;color:#444;font-family:\'Arial\';width:300px;height:auto;position:absolute;border:2px solid #d3d3d3;top:0px;left:0px;z-index:5000;filter:drop-shadow(0 0 1.5rem black);font-size:12px;overflow:auto}#sportsbookToolHeader{font-weight:bold;padding:3px;padding-bottom:5px;cursor:move;z-index:5000;background-color:#2196F3;color:#fff}#sportsbookToolHeaderTitle{display:inline-block;padding-top:3px;padding-left:4px}#sportsbookToolName{font-size:14px}#sportsbookToolAuthorName{font-size:8px;line-height:30%;font-weight:normal}.btSimple{border:1px solid #444;border-radius:3px;box-shadow:0 1px #666;padding-inline:5px;margin:2px}.extraCondensed{font-stretch:extra-condensed;padding-inline:1px}.btSimple:hover{background-color:#fff}.btSimple:active{box-shadow:0 0px #666;transform:translateY(1px)}.sportsbookToolHeaderButtons{color:#fff;width:25px;height:20px}#btZoomInOut,#btMinimizeAll{background:rgb(100,100,100)}#btZoomInOut:hover,#btMinimizeAll:hover{background:rgb(30,30,30)}#btMinimizeClosed{background:rgb(100,100,200)}#btMinimizeClosed:hover{background:rgb(0,0,160)}#btClose{background:rgb(200,100,100)}#btClose:hover{background:rgb(160,0,0)}.displayInRed{color:rgb(160,0,0)}.displayInGreen{color:rgb(0,160,0)}.displayInLightGrey{color:#ccc}.hide{display:none}.show{display:block}.accHeading{border-radius:none;background-color:#eee;color:#444;cursor:pointer;padding:8px;width:100%;text-align:left;border:none;outline:none;transition:0.4s}.open .accHeading,.accHeading:hover{background-color:#ccc}.accContent{padding:10px;background-color:white;overflow:hidden}.closed .accContent{display:none}.open .accContent{display:block}.inactivated{pointer-events:none;opacity:0.4}.hRule{border-top:#ccc}.zoomOut{transform:scale(0.7)}#chkLockSelection{vertical-align:middle}.floatRight{float:right}.carouselList{padding-left:15px}.visibilityHidden{visibility:hidden}.displayInGreenGlow{text-shadow:0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #00A000, 0 0 82px #00A000, 0 0 92px #00A000, 0 0 102px #00A000, 0 0 151px #00A000}#limitedFunctionsMessage{color:rgb(160, 0, 0);font-weight:bold;float:right;font-stretch:extra-condensed}</style>';

        sportsbookTool.innerHTML = htmlContent;
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

    function isObgRtExposed() {
        try {
            obgRt;
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
        } else {
            var hostName = window.location.hostname;
            brandName = hostName.substring(hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
            if (/mobilbahis\d{3}/.test(brandName)) {
                brandName = brandName.replace(/mobilbahis\d{3}/, "mobilbahis")
            } else if (/\d{3}bets10/.test(brandName)) {
                brandName = brandName.replace(/\d{3}bets10/, "bets10")
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
        var btZoomInOut = document.getElementById("btZoomInOut");

        if (DEVICE_TYPE === "Desktop") {
            btMinimizeAll.classList.add("hide");
            btZoomInOut.classList.add("hide");
        }
        if (ENVIRONMENT === "ALPHA" || ENVIRONMENT === "PROD" || !IS_OBGSTATE_EXPOSED) {
            btMinimizeClosed.classList.add("hide");
            btMinimizeAll.classList.add("hide");
        }

        document.getElementById("sportsbookToolVersion").innerText = OBG_TOOL_VERSION;

    }

    function initAccordions() {

        for (i = 0; i < accHeadCollection.length; i++) {
            accHeadCollection[i].addEventListener("click", toggleAccordion, false);
        }

        var limitationCause;
        if (ENVIRONMENT === "ALPHA") {
            limitationCause = "env is ALPHA";
            limitFeatures();
        } else if (ENVIRONMENT === "PROD") {
            limitationCause = "env is PROD";
            limitFeatures();
        } else if (!IS_OBGSTATE_EXPOSED) {
            limitationCause = "obgRt not exposed";
            limitFeatures();
        }

        function limitFeatures() {
            document.getElementById("limitedFunctionsMessage").innerText = "Features limited as " + limitationCause;

            var accContents = document.getElementsByClassName("accContent");
            for (var i = 1; i < accContents.length; i++) {
                accHead = accHeadCollection[i];
                accHeadClassList = accHead.classList;
                accHeadClassList.add("hide");
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

    function initContext() {
        document.getElementById("deviceType").innerText = DEVICE_TYPE;
        document.getElementById("environment").innerText = ENVIRONMENT;
        document.getElementById("brandName").innerText = BRAND_NAME;
        document.getElementById("browserVersion").innerText = BROWSER_VERSION;
        document.getElementById("obgVersion").innerText = OBG_VERSION;
        document.getElementById("btSwitchToEnv").innerHTML = "&#10132; " + getNewEnvToSwitchTo();
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
            accHeadClassList = accHead.classList;
            (accHead.parentNode.classList.contains("closed") && !accHeadClassList.contains("hide")) ? accHeadClassList.add("hide"): accHeadClassList.remove("hide");
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
        var sportsbookToolContentClasslist = document.getElementById("sportsbookToolContent").classList;
        sportsbookToolContentClasslist.contains("hide") ? sportsbookToolContentClasslist.remove("hide") : sportsbookToolContentClasslist.add("hide");
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
            "|Version|" + OBG_VERSION + "|" + OBG_VERSION + "|";
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
            console.log("DL: " + deepLink);
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
                deepLink.searchParams.append(name, String(value));
                console.log(deepLink);
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
        }
        navigator.clipboard.writeText(text);
    }

    var BodyEventListeners = [];

    function replaceBodyEventListenersWith(newListener) {
        for (const oldListener of BodyEventListeners) {
            document.body.removeEventListener("click", oldListener)
        }
        BodyEventListeners = [];
        if (newListener === null) return;
        document.body.addEventListener("click", newListener);
        BodyEventListeners.push(newListener);

    }

    window.initSetEventPhase = () => {
        var labelRow = document.getElementById("eventLabelForSetEventPhase");
        var eventPhaseButtons = document.getElementsByClassName("setEventPhaseLayout")[0];

        replaceBodyEventListenersWith(listenerForSetEventPhase);

        function listenerForSetEventPhase() {
            eventLabel = getDetectedEventLabel();
            if (eventLabel === null) {
                detectionResultText = NOT_FOUND;
                displayInRed(labelRow);
                inactivate(eventPhaseButtons);
            } else {
                detectionResultText = eventLabel;
                displayInGreen(labelRow);
                activate(eventPhaseButtons);

            }
            labelRow.innerText = detectionResultText;
        }
    }

    window.initSetMarketState = () => {
        var marketStateButtons = document.getElementsByClassName("setMarketStateLayout")[0];
        var labelRow = document.getElementById("marketLabelForSetMarketState");

        replaceBodyEventListenersWith(listenerForSetMarketState);

        function listenerForSetMarketState() {
            if (Object.values(getBetSlipByObgState().selections) == "") {
                inactivate(marketStateButtons);
                detectionResultText = NOT_FOUND;
                displayInRed(labelRow);
            } else {
                activate(marketStateButtons);
                detectionResultText = getEventLabel(getLastEventIdFromBetslip()) + " /<br><b>" + getMarketLabel(getLastMarketIdFromBetslip()) + "</b>";
                displayInGreen(labelRow);
            }
            labelRow.innerHTML = detectionResultText;
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
        var playerPropsSection = document.getElementById("playerPropsSection");
        var fastMarketSection = document.getElementById("fastMarketSection");
        var labelRow = document.getElementById("eventLabelForCreateMarket");
        var playerPropsMessage = document.getElementById("playerPropsMessage");
        var tennisFastMarketMessage = document.getElementById("tennisFastMarketMessage");

        replaceBodyEventListenersWith(listenerForCreateMarket);

        function listenerForCreateMarket() {
            eventId = getUrlParam("eventId");
            if (eventId === undefined) {
                inactivate(playerPropsSection, fastMarketSection);
                displayInRed(labelRow);
                detectionResultText = NOT_FOUND;
                playerPropsMessage.innerText = null;
                tennisFastMarketMessage.innerText = null;
            } else {
                detectionResultText = getEventLabel(eventId);
                displayInGreen(labelRow);
                playerPropsMessage.innerText = null;

                if (getCategoryId(eventId) !== "11") {
                    tennisFastMarketMessage.innerText = "Not a tennis event"
                    inactivate(fastMarketSection);
                } else {
                    activate(fastMarketSection);
                    tennisFastMarketMessage.innerText = null;
                }

                if (getEventWidgetActiveTabId(eventId) === "all") {
                    activate(playerPropsSection);
                } else {
                    playerPropsMessage.innerText = "\"All\" tab not selected";
                    inactivate(playerPropsSection);
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
        var labelRow = document.getElementById("selectionLabelForChangeOdds");
        var selectionLabel;
        var lockSelectionSection = document.getElementById("lockSelectionSection");
        var newOddsRow = document.getElementById("newOddsRow");

        replaceBodyEventListenersWith(listenerForChangeOdds);

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
                    inactivate(lockSelectionSection, newOddsRow);
                }
            } else {
                displayInGreen(labelRow);
                activate(lockSelectionSection, newOddsRow);
                detectionResultText = eventLabel + " / <br>" + marketLabel + " : <br><b>" + selectionLabel + "</b> (init. odds: " + odds.toFixed(2) + ")</b>";
            }
            labelRow.innerHTML = detectionResultText;
        }
    }

    var lockedSelectionId;
    var savedInitialOdds;
    var initialOdds;
    window.changeOdds = () => {
        var newOdds = document.getElementById("newOdds").value;
        if (lockedSelectionId === undefined || savedInitialOdds === undefined) {
            selectionId = getLastSelectionIdFromBetslip();
            initialOdds = getLastInitialOddsFromBetslip();
        } else {
            selectionId = lockedSelectionId;
            initialOdds = savedInitialOdds;
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
            savedInitialOdds = getLastInitialOddsFromBetslip();
            detectedOrLockedRow.innerHTML = "&#128274; Locked selection:";
            labelRow.classList.add("displayInGreenGlow");
            replaceBodyEventListenersWith(null);

        } else {
            lockedSelectionId = undefined;
            savedInitialOdds = undefined;
            detectedOrLockedRow.innerText = "Detected selection:";
            labelRow.classList.remove("displayInGreenGlow");
            window.initChangeOdds();
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
        var labelRow = document.getElementById("eventLabelForAddToCarousel");
        var addToCarouselButton = document.getElementById("btAddToCarousel");
        var deviceDependentCarouselMessage = document.getElementById("deviceDependentCarouselMessage");

        replaceBodyEventListenersWith(listenerForAddToCarousel);
        var currentPage;

        function listenerForAddToCarousel() {
            if (DEVICE_TYPE === "Mobile") {
                deviceDependentCarouselMessage.innerText = "MOBILE: Add a selection to the betslip"
                detectionResultText = getEventLabel(getLastEventIdFromBetslip());
            } else {
                deviceDependentCarouselMessage.innerText = "DESKOP: Open an event panel or add a selection to the betslip"
                detectionResultText = getDetectedEventLabel();
            }
            if (detectionResultText === null) {
                labelRow.innerText = NOT_FOUND;
                displayInRed(labelRow);
                inactivate(addToCarouselButton);
            } else {
                if (IS_B2B) {
                    obgState.sportsbook.carousel.isBusy ? currentPage = undefined : currentPage = "sportsbook";
                } else currentPage = obgState.page.current.documentKey;
                if (currentPage === "sportsbook") {
                    displayInGreen(labelRow);
                    activate(addToCarouselButton);
                } else {
                    displayInRed(labelRow);
                    inactivate(addToCarouselButton);
                    detectionResultText += "\nCurrent page is not Sportsbook Home.";
                }
                labelRow.innerText = detectionResultText;
            }
        }
    }

    window.initScoreBoard = () => {
        var labelRow = document.getElementById("eventLabelForScoreBoard");
        var scoreBoardScores = document.getElementById("scoreBoardScores");
        var scoreBoardDetails = document.getElementById("scoreBoardDetails");
        var scoreBoardObjects = Object.values(obgState.sportsbook.scoreboard);
        var itHasScoreBoard;

        replaceBodyEventListenersWith(listenerForScoreBoard);

        function listenerForScoreBoard() {
            eventId = getDetectedEventId();
            detectionResultText = getDetectedEventLabel();
            itHasScoreBoard = false;
            if (detectionResultText === null) {
                detectionResultText = NOT_FOUND;
                inactivateScoreBoard();
            } else {
                for (i = 0; i < scoreBoardObjects.length; i++) {
                    if (eventId == scoreBoardObjects[i].eventId) {
                        itHasScoreBoard = true;
                        break;
                    }
                }
                if (itHasScoreBoard) {
                    activateScoreBoard();
                } else {
                    detectionResultText += "\nNot having scoreboard.";
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

    window.initStreamMappingHelper = () => {
        var eventIdRow = document.getElementById("eventIdRowForStreamMappingHelper");
        var eventLabelSpan = document.getElementById("eventLabelForStreamMappingHelper");
        var eventIdSpan = document.getElementById("eventIdForStreamMappingHelper");
        var btCopyEventId = document.getElementById("btCopyEventId");

        replaceBodyEventListenersWith(listenerForStreamMappingHelper);

        function listenerForStreamMappingHelper() {
            eventId = getUrlParam("eventId");
            if (eventId === undefined) {
                eventLabelSpan.innerText = NOT_FOUND;
                eventIdSpan.innerText = null;
                displayInRed(eventLabelSpan);
                inactivate(eventIdRow, btCopyEventId);
            } else {
                eventIdSpan.innerText = eventId;
                eventLabelSpan.innerText = getEventLabel(eventId);
                displayInGreen(eventIdSpan, eventLabelSpan);
                activate(eventIdRow, btCopyEventId);
            }
        }
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
        return ((eventId === undefined || eventId === null) ? null : getEventLabel(eventId));
    }

    function getEventLabel(eventId) {
        if (eventId === null || eventId === undefined) {
            return null;
        }
        return obgState.sportsbook.event.events[eventId].label;
    }

    window.setEventPhase = (phase) => {
        eventId = getDetectedEventId();
        switch (phase) {
            case "prematch":
                obgRt.setEventPhasePrematch(eventId);
                break;
            case "live":
                obgRt.setEventPhaseLive(eventId);
                break;
            case "over":
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
        marketId = getLastMarketIdFromBetslip();
        switch (state) {
            case "suspended":
                obgRt.setMarketStateSuspended(marketId);
                break;
            case "open":
                obgRt.setMarketStateOpen(marketId);
                break;
            case "void":
                obgRt.setMarketStateVoid(marketId);
                break;
            case "settled":
                obgRt.setMarketStateSettled(marketId);
                break;
            case "hold":
                obgRt.setMarketStateHold(marketId);
                break;
        }
    }

    window.createMarket = (marketType) => {
        eventId = getUrlParam("eventId");
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
            var players = ["Christiano Ronaldo - Juventus", "Douglas Costa - Juventus", "Nicolas Pépé - Arsenal F.C.", "Bukayo Saka - Arsenal F.C."];
            var marketId;
            var selectionId;
            var selectionLabel;

            for (var i = 0; i < players.length; i++) {
                marketId = "m-" + eventId + "-test" + String(i + 1);
                obgRt.createMarket(eventId, marketId, "N1MGKA", [2], playerPropsMarketName + " | " + players[i], "", 2, 88, [{
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
                            o: i + k + j / 10 * 2
                        }]);
                    }
                }
            }
        }

        function createPlayerPropsDummyMarket() {
            var playerPropsMarketName = "(Player Props Test) Player Total Shots";
            for (var i = 5; i < 20; i++) {
                obgRt.createMarketWithDummySelection(eventId, "m-" + eventId + "-test-" + String(i), "N1MGKA", [2], playerPropsMarketName + " | Dummy Player - Arsenal F.C.", "", 2, 88, [{
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
    }

    function getBetSlipByObgState() {
        return obgState.sportsbook.betslip;
    }

    window.submitScore = (participant) => {
        var scoreBoard = obgState.sportsbook.scoreboard[eventId];
        var participantId;
        var score;
        if (participant === "home") {
            participantId = scoreBoard.participants[0].id;
            score = document.getElementById("homeScoreInputField").value;
            setValues(participantId, score);
        } else {
            participantId = scoreBoard.participants[1].id;
            score = document.getElementById("awayScoreInputField").value;
            setValues(participantId, score);
        }

        function setValues(participantId, score) {
            if (score !== "") {
                obgRt.setFootballParticipantScore(eventId, participantId, score);
            }
        }
    }

    window.addToCarousel = () => {
        eventId = getDetectedEventId();
        var item = obgState.sportsbook.carousel.item;
        var addToCarouselMessage = document.getElementById("addToCarouselMessage");

        item.skeleton.eventIds = [];
        item.skeleton.eventIds.push(eventId);
        obgState.sportsbook.carousel.item = {...obgState.sportsbook.carousel.item, item };
        displayInGreen(addToCarouselMessage);
        addToCarouselMessage.innerHTML = "&#10004;"
        triggerChangeDetection(eventId);

        setTimeout(function() {
            addToCarouselMessage.innerHTML = null;
        }, 3000);
    }

    function triggerChangeDetection(eventId) {
        var eventPhase = obgState.sportsbook.event.events[eventId].phase;
        switch (eventPhase) {
            case "Live":
                obgRt.setEventPhasePrematch(eventId);
                obgRt.setEventPhaseLive(eventId);
                break;
            case "Prematch":
                obgRt.setEventPhaseLive(eventId);
                obgRt.setEventPhasePrematch(eventId);
                break;
            case "Over":
                obgRt.setEventPhasePrematch(eventId);
                obgRt.setEventPhaseOver(eventId);
                break;
        }
    }

    window.submitScoreBoard = () => {

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
            if (value === "") {
                return;
            }
            switch (scoreBoardItem) {
                case "corners":
                    obgRt.setFootballParticipantCorners(eventId, participantId, value);
                    break;
                case "substitutions":
                    obgRt.setFootballParticipantSubstitutions(eventId, participantId, value);
                    break;
                case "yellowCards":
                    obgRt.setFootballParticipantYellowCards(eventId, participantId, value);
                    break;
                case "redCards":
                    obgRt.setFootballParticipantRedCards(eventId, participantId, value);
                    break;
                case "penalties":
                    obgRt.setFootballParticipantPenalties(eventId, participantId, value);
                    break;
            }
        }
    }

    window.getTwitchProviderIds = () => {
        var twitchResultSection = document.getElementById("twitchResults");
        twitchResultSection.innerHTML = null;
        displayInGreen(twitchResultSection);

        var url = "https://gql.twitch.tv/gql";
        var response;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, false);

        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Client-Id", "kimne78kx3ncx6brgo4mv6wki5h1ko");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                response = xhr.responseText;
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

        var obj = JSON.parse(response);
        for (i = 0; i < numberOfResults; i++) {
            var twitchId = obj.data.featuredStreams[i].stream.broadcaster.login;
            twitchResultSection.innerHTML += twitchId + ", ";
        }
        twitchResultSection.innerHTML = (twitchResultSection.innerHTML.slice(0, -2));
    }




    window.getPerformProviderIds = () => {
        var performResultSection = document.getElementById("performResults");
        performResultSection.innerHTML = null;
        displayInGreen(performResultSection);

        var url = "https://secure.betsson.performgroup.com/streaming/eventList";
        var response;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.setRequestHeader("Access-Control-Allow-Origin", "https://secure.betsson.performgroup.com")
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                response = xhr.responseXML;
            }
        }

        xhr.send();
        var events = response.getElementsByTagName("event");
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
})();