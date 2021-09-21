javascript: (function() {
    var obgToolUrl = "https://gegl01.github.io/obgTool.min.js";
    var request = new XMLHttpRequest();
    request.open("GET", obgToolUrl, true);
    request.send(null);
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var script = document.createElement("script");
                script.id = "obgToolScript";
                script.type = "text/javascript";
                script.src = obgToolUrl;
                document.head.appendChild(script);
            } else {
                alert("OBG Tool not found on server.\nContact: gergely.glosz@betssongroup.com");
            }
        }
    };
})();