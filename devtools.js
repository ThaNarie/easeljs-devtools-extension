chrome.devtools.panels.create('EaselJS', /* icon */ undefined, 'panel/panel.html', function(panel) {

    var _panelWindow;
    var queuedMessagesForPanel = [];

    // Establish connection to background page:
    var port = chrome.runtime.connect({
    	name: 'panel'
    });

    // Pass received messages from the background page directly to the panel if existing,
    // otherwise queue messages and pass them to the panel when it becomes available.
    port.onMessage.addListener(function(msg) {
        if (_panelWindow) {
            _panelWindow.OnReceiveMessageFromBackgroundPage(msg);
        } else {
            queuedMessagesForPanel.push(msg);
        }
    });

    // When the panel becomes available, grab a reference to the panel window
    // and pass it the queued messages; also define messaging API for use by the panel.
    panel.onShown.addListener(function tmp(panelWindow) {
        panel.onShown.removeListener(tmp);

        _panelWindow = panelWindow;

        var msg;
        while (msg = queuedMessagesForPanel.shift()) {
            _panelWindow.OnReceiveMessageFromBackgroundPage(msg);
        }

        _panelWindow.sendMessageToBackgroundPage = function(msg) {
            port.postMessage(msg);
        };
    });
});
