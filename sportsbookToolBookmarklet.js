javascript: (function() {
    var sportsbookToolURL = "https://betssongroup.github.io/sportsbook/qa/sportsbook-tool/sportsbookTool.min.js";
    var request = new XMLHttpRequest();
    var contactAuthor = "\nContact: gergely.glosz@betssongroup.com";
    request.open("GET", sportsbookToolURL, true);
    request.send(null);
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status === 200) {
                var s = document.getElementById("sportsbookToolScript");    
                if (s !== null){
                    s.remove();
                }
                var script = document.createElement("script");
                script.id = "sportsbookToolScript";
                script.type = "text/javascript";
                script.src = sportsbookToolURL;
                // script.setAttribute("data-features", "gegl01");
                document.head.appendChild(script);
            } else {
                if (request.status === 404) {
                    alert("Sportsbook Tool not found on server." + contactAuthor);
                } else alert("Something went wrong." + contactAuthor);
            }
        }
    };
})();