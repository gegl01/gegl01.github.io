javascript: (function() {

    insertTag("div", "sportsbookTool", "http://localhost:8080/sportsbookTool.html");
    setTimeout(function () {
        insertTag("script", "sportsbookToolScript", "http://localhost:8080/sportsbookTool.js");
    }, 500);
    
    // insertTag("script", "sportsbookToolScript", "http://localhost:8080/sportsbookTool.js");

    function insertTag(tag, id, sourceUrl) {
        var req = new XMLHttpRequest;
        req.open("GET", sourceUrl, true);
        req.send(null);
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    var elem = document.createElement(tag);
                    elem.id = id;
                    if (tag === "div") {
                        elem.innerHTML = req.response;
                        document.body.appendChild(elem)
                    } else {
                        elem.type = "text/javascript";
                        elem.src = sourceUrl;
                        elem.setAttribute("data-features", "gegl01");
                        document.head.appendChild(elem);
                    }
                } else {
                    alert("Sportsbook Tool not found on server.\nContact: gergely.glosz@betssongroup.com");
                }
            }
        }
    }
})();