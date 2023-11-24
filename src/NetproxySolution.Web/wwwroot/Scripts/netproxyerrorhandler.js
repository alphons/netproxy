// version 0.2.5 (last revision Nov, 2023)

window.netproxyerrorhandler = function (error, source, message) 
{
	try
	{
		if (message.indexOf("exceeded") > 0)
			return;
		if (source.indexOf("api/errorlog") < 0)
			window.netproxy("./api/errorlog",
				{
					"error": error,
					"message": message,
					"referer": location.href,
					"source": source
				});
	}
	catch (err) { }
}


window.onerror = function (message, source, lineno, colno, error)
{
	try
	{
		if (source.indexOf("api/errorlog") < 0)
			window.netproxy("./api/errorlog",
				{
					"error": error,
					"message": message,
					"referer": "line:" + lineno + " col:" + colno,
					"source": source
				});
	}
	catch (err) { }
}

