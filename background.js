var panelPort = null;

// Listen for connections from devtools panel instances:
chrome.runtime.onConnect.addListener(function (port)
{

	if (port.name === "panel")
	{
		panelPort = port;

		// Listen for messages from the panel,
		// execute the requested command and post a reply:
		port.onMessage.addListener(function (msg)
		{
			console.log('message from panel", msg');
			if (msg.command === 'hello')
			{
				port.postMessage('Hello from my background page!');
			}
			else if (msg.command === 'inject')
			{
				// TODO: don't inject multiple times!
				chrome.tabs.executeScript(msg.tabId, {
					file: msg.scriptFileToInject,
					runAt: 'document_end'
				}, function ()
				{
					contentScriptInjected = true;
				});
				chrome.tabs.insertCSS(msg.tabId, {
					file: msg.cssFileToInject,
					runAt: 'document_end'
				});
				port.postMessage('My content script ' + msg.scriptFileToInject + ' and css file ' + msg.cssFileToInject + ' have been injected.');
			}
			else if (msg.command === 'get-easeljs-canvas-list')
			{
				chrome.tabs.query({active: true, currentWindow: true}, function (tabs)
				{
					port.postMessage('queried tab: ' + tabs[0].id);
					port.postMessage('queried tab length: ' + tabs.length);
					chrome.tabs.sendMessage(tabs[0].id, {
						command: 'get-easeljs-canvas-list'
					}, function (reply)
					{
						if (reply)
						{
							console.log('reply in background from content');
							port.postMessage(reply);
						}
						else
						{
							port.postMessage('Content script is not injected!');
						}
					});
				});
			}
			else
			{
				port.postMessage('Command "' + msg.command + '" not recognized.');
			}
		});
	}
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab)
{
	console.log(changeInfo);
	if (panelPort && changeInfo.status == 'complete')
	{
		panelPort.postMessage({command: 'reload'});
	}
});