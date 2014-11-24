var content_eval = function()
{
	var easelCanvasList = [];

	[].forEach.call(document.querySelectorAll('canvas'), function (canvas)
	{
		if (canvas.hasOwnProperty('_stage'))
		{
			easelCanvasList.push(canvas._stage);
		}
	});

	var getKeys = function(obj)
	{
		var map = [];
		for (var prop in obj)
		{
			if (typeof obj[prop] == 'function') continue;

			//console.log(prop, obj.hasOwnProperty(prop));
			map.push(prop);
		}
		return map;
	};

	var copy = function(item)
	{
		var obj = {};

		// do keys
		getKeys(item).forEach(function (prop)
		{
			//console.log(prop, item.hasOwnProperty(prop));
			switch(prop)
			{
				case 'canvas':
				case '_eventListeners':
				case 'parent':
				case '_pointerData':
					// skip
					break;

				case '_ctx':
				case 'graphics':
					// recurse obj
					obj[prop] = copy(item[prop]);
					break;

				case 'children':
					// recurse list
					obj[prop] = item[prop].map(function(child)
					{
						return copy(child);
					});
					break;

				default:
					obj[prop] = item[prop];
			}
		});

		return obj;

	};
	easelCanvasList = easelCanvasList.map(function(canvas)
	{
		return copy(canvas);
	});

	//console.log(easelCanvasList);

	return JSON.stringify(easelCanvasList);
};