// https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/

function OnReceiveMessageFromBackgroundPage(msg) {
    console.log('received msg from bg: ', msg);

    if (msg && msg.command == 'reload')
    {
        update();
    }

}

var update = function()
{
    chrome.devtools.inspectedWindow.eval('(' + content_eval.toString() + ')()', {}, function(result, exceptionInfo)
    {
        console.log(result, exceptionInfo);
        if (result)
        {
            try {
                viewModel.displaylist(JSON.parse(result));
            }
            catch (e)
            {
                console.error(e);
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', function()
{
    setTimeout(function()
    {
        update();
    }, 1000);

    chrome.devtools.panels.elements.onSelectionChanged.addListener(update);

    // TODO reload when:
    // https://developer.chrome.com/extensions/tabs#method-executeScript
    // chrome.tabs.onUpdated.addListener --- changeInfo
    // via background.js
});

ko.punches.interpolationMarkup.enable();
ko.punches.attributeInterpolationMarkup.enable();
ko.punches.textFilter.enableForBinding('text');
ko.punches.textFilter.enableForBinding('foreach');

var demo = [];//JSON.parse('[{"id":10,"_matrix":{"a":1,"b":0,"c":0,"d":1,"tx":0,"ty":0,"alpha":1,"compositeOperation":null,"shadow":null},"_rectangle":{"x":0,"y":0,"width":0,"height":0},"children":[{"id":11,"_matrix":{"a":1,"b":0,"c":0,"d":1,"tx":0,"ty":0,"alpha":1,"compositeOperation":null,"shadow":null},"_rectangle":{"x":0,"y":0,"width":0,"height":0},"children":[{"id":12,"_matrix":{"a":1,"b":0,"c":0,"d":1,"tx":0,"ty":0,"alpha":1,"compositeOperation":null,"shadow":null},"_rectangle":{"x":0,"y":0,"width":0,"height":0},"graphics":{"_instructions":[{"params":[],"path":false},{"params":["fillStyle","#FF0000"],"path":false},{"params":[0,0,100,100],"path":true},{"params":[],"path":false}],"_oldInstructions":[{"params":[],"path":false},{"params":["fillStyle","#FF0000"],"path":false},{"params":[0,0,100,100],"path":true},{"params":[],"path":false}],"_activeInstructions":[],"_fillMatrix":null,"_fillInstructions":null,"_strokeInstructions":null,"_strokeStyleInstructions":null,"_strokeIgnoreScale":false,"_dirty":false,"_active":false,"_ctx":{"textBaseline":"alphabetic","textAlign":"start","font":"10px sans-serif","lineDashOffset":0,"miterLimit":10,"lineJoin":"miter","lineCap":"butt","lineWidth":1,"shadowColor":"rgba(0, 0, 0, 0)","shadowBlur":0,"shadowOffsetY":0,"shadowOffsetX":0,"fillStyle":"#000000","strokeStyle":"#000000","imageSmoothingEnabled":true,"webkitImageSmoothingEnabled":true,"globalCompositeOperation":"source-over","globalAlpha":1}}}]}],"_pointerData":{}}]');

var viewModel = {};
viewModel.getPropertyType = function(val)
{
    if (val === null)
    {
        return 'null';
    }
    else  if (val === undefined)
    {
        return 'undefined';
    }
    else if (typeof val == 'string')
    {
        return 'string';
    }
    else if (typeof val == 'number')
    {
        return 'number';
    }
    else if (typeof val == 'boolean')
    {
        return 'boolean';
    }
    return "object";
};
viewModel.displaylist = ko.observable();
viewModel.displaylist(demo);
viewModel.selectedItem = ko.observable(viewModel.displaylist()[0]);
viewModel.selectItem = function(vm)
{
    viewModel.selectedItem(vm);
};
viewModel.propertyList = ko.computed(function()
{
    var sel = viewModel.selectedItem();

    return sel ? Object.keys(sel).filter(function(key)
    {
        return key != 'children';
    }).map(function(key)
    {
        return {
            key: key,
            value: JSON.stringify(sel[key]),
            type: viewModel.getPropertyType(sel[key])
        }
    }) : [];
});

ko.applyBindings(viewModel, document.body);