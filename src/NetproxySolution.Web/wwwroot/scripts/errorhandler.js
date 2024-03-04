// version 2.1.0 (last revision Mar, 2024)

window.addEventListener("unhandledrejection", async function (event) 
{
	event.preventDefault();
	try
	{
		await window.netproxyasync("./api/errorlog",
		{
			"event": event.constructor.name,
			"errormessage": event.reason.message,
			"errorstack": event.reason.stack,
			"referer": event.type,
			"source": location.href
		});
	}
	catch (err)
	{
		console.error(err);
	}
});


window.onerror = async function (event, source, lineno, colno, error)
{
	try
	{
		if (source.indexOf("api/errorlog") < 0)
			await window.netproxyasync("./api/errorlog",
			{
				"event": event,
				"errormessage" : error.message,
				"errorstack": error.stack,
				"referer": "line:" + lineno + " col:" + colno,
				"source": source
			});
	}
	catch (err)
	{
		console.error(err);
	}
}

