// version 2.0.1 (last revision Nov, 2023)

window.netproxyerrorhandler = async function (error, source, message) 
{
	try
	{
		if (message.indexOf("exceeded") > 0)
			return;
		if (source.indexOf("api/errorlog") < 0)
			await window.netproxysync("./api/errorlog",
				{
					"message": message,
					"errormessage": error.message,
					"errorstack": error.stack,
					"referer": location.href,
					"source": source
				});
	}
	catch (err) { }
}


window.onerror = async function (message, source, lineno, colno, error)
{
	try
	{
		if (source.indexOf("api/errorlog") < 0)
			await window.netproxyasync("./api/errorlog",
				{
					"message": message,
					"errormessage" : error.message,
					"errorstack": error.stack,
					"referer": "line:" + lineno + " col:" + colno,
					"source": source
				});
	}
	catch (err) { }
}

