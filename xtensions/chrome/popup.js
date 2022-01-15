var port = chrome.extension.connect({
    name: "tidi Communication"
});

port.onMessage.addListener(function(msg) {
    console.log("Message recieved: " + msg);
});

var popupWindow = window.open(
    chrome.extension.getURL("component.html"),
    "tidiCore",
    "width=305,height=630,screenX=200,screenY=200"
);
window.close();
