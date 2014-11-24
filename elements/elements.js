'use strict';

var getElementInfo = function detectElement() {
    var selectedElement = $0;
    var data = Object.create(null); // sets __proto__ to undefined
    if (selectedElement && selectedElement.style != null && selectedElement.style.cssText != null) {
        data['Inline Style'] = selectedElement.style.cssText;
    }
    return data;
};

chrome.devtools.panels.elements.createSidebarPane('My Pane', function (sidebar) {
    var onSelectionChanged = function () {
        sidebar.setExpression('(' + getElementInfo.toString() + ')()');
    };
    onSelectionChanged();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(onSelectionChanged);
});
