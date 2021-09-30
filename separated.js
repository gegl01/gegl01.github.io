javascript: (function() {

    insertTag("div", "http://localhost:8080/sportsbookTool.html");
    insertTag("script", "http://localhost:8080/sportsbookTool.js");


    function insertTag(tag, sourceUrl) {
        var req = new XMLHttpRequest;
        req.open("GET", sourceUrl, true);
        req.send(null);
        req.onreadystatechange = function() {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    var elem = document.createElement(tag);
                    if (tag === "div") {
                        elem.id = "sportsbookTool";
                        elem.innerHTML = req.response;
                        document.body.appendChild(elem)
                    } else {
                        elem.id = "sportsbookToolScript";
                        elem.type = "text/javascript";
                        elem.src = sourceUrl;
                        document.head.appendChild(elem);
                    }
                } else {
                    alert("OBG Tool not found on server.\nContact: gergely.glosz@betssongroup.com");
                }
            }
        }
    }
})();