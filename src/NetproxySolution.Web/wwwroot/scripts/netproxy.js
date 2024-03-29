/**
 * 
 *	@name		pure-dom netproxy and template and api
 * 
 *	@author     Alphons van der Heijden <alphons@heijden.com>
 *	@version    2.1.0 (last revision Mar, 2024)
 *	@copyright  (c) 2019-2024 Alphons van der Heijden
 *	@alias      netproxy, netproxyasync
 * 
 */

// please use defer in script tag
(function ()
{
	'use strict';

	window.netproxy = function (url, data, onsuccess, onerror, onprogress)
	{
		if (typeof window.XMLHttpRequest === 'undefined')
			return;

		var spinner = document.getElementById("netproxyspinner");

		if (typeof remote !== 'undefined')
			url = remote + url;

		var httpRequest;

		var defaults =
		{
			url: url,
			onsuccess: onsuccess,
			onerror: onerror,
			spinner: spinner,
			timeoutSpinner: spinner ? window.setTimeout(function () { spinner.style.display = 'block'; }, 1000) : null
		};

		var timeouthandler = function ()
		{
			if (typeof defaults.onerror === 'function')
			{
				var error = new Error("TimeOut");
				error.stack = defaults.url + " " + httpRequest.timeout + "mS (client timeout)";
				defaults.onerror.call(error, error);// defaults.url, "netproxy");
			}
		};

		var loadendhandler = function () 
		{
			var response;

			if (defaults.timeoutSpinner !== null)
				window.clearTimeout(defaults.timeoutSpinner);

			if (defaults.spinner)
				defaults.spinner.style.display = 'none';

			try
			{
				response = JSON.parse(httpRequest.response);
				if (typeof response !== "object")
					response = httpRequest.response;
			}
			catch (e)
			{
				response = httpRequest.response;
			}

			if (httpRequest.status >= 200 && httpRequest.status <= 299)
			{
				var header = httpRequest.getResponseHeader('Content-Disposition');
				if (header)
				{
					var a = document.createElement('a');
					a.download = header.split('filename="')[1].split('"')[0];
					a.rel = 'noopener' // tabnabbing
					// a.target = '_blank'
					const blob = new Blob([httpRequest.response], { type: 'application/octet-stream' });
					a.href = URL.createObjectURL(blob)
					setTimeout(function () { URL.revokeObjectURL(a.href) }, 4E4) // 40s
					setTimeout(function () { a.click(); }, 0)
					return;
				}

				if (typeof defaults.onsuccess === 'function')
				{
					if (httpRequest.status === 204)
					{
						defaults.onsuccess.call(null, null);
					}
					else
					{
						if (response.d)
							defaults.onsuccess.call(response.d, response.d);
						else
							defaults.onsuccess.call(response, response);
					}
				}
			}
			else // != 200
			{
				var error = new Error("netproxy");
				error.stack = defaults.url + " " + httpRequest.status + " (" + response + ")";

				if (typeof defaults.onerror === 'function')
					defaults.onerror.call(error, error);
				else
					throw error;
			}
		};

		httpRequest = new XMLHttpRequest();
		httpRequest.timeout = data instanceof FormData ? 0 : 30000;
		httpRequest.ontimeout = timeouthandler;
		httpRequest.onloadend = loadendhandler;
		httpRequest.open(data ? 'POST' : 'GET', url, true);
		httpRequest.withCredentials = url.indexOf(window.location.host) < 0 && url[0] !== '/';
		if (onprogress)
		{
			httpRequest.addEventListener('progress', onprogress, false);
			httpRequest.upload.addEventListener('progress', onprogress, false);
		}
		if (!(data instanceof FormData))
			httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		httpRequest.send(data instanceof FormData ? data : JSON.stringify(data));
		return this;
	};

	window.netproxyasync = function (url, data, onprogress)
	{
		const promis = new Promise(function (resolve, reject)
		{
			netproxy(url, data, resolve, reject, onprogress);
		});
		return promis;
	};

	Element.prototype.Template = function (template, data, append)
	{
		var strHtml = window.TemplateHtml(template, data);
		if (append)
		{
			var temp = document.createElement("span");
			this.insertAdjacentElement('beforeend', temp);
			temp.outerHTML = strHtml;
			return this;
		}
		else
			return this.innerHTML = strHtml;
	};

	window.TemplateHtml = function (template, data)
	{
		try
		{
			var element = typeof template === "string" ?
				document.getElementById(template) : template;
			if (!element)
				return null;
			if (!element.jscache)
			{
				var html = element.innerHTML.replace(/[\t\r\n]/g, " ");
				var js = "var _='';";
				var direct, intI, intJ = 0;
				while (intJ < html.length)
				{
					intI = html.indexOf("{{", intJ);
					if (intI < 0)
						break;
					js += "_+='" + html.substring(intJ, intI).replace(/\'/g, "\\'") + "';";
					intJ = intI + 2;
					direct = (html[intJ] === "=");
					if (direct)
						intJ++;
					intI = html.indexOf("}}", intJ);
					if (intI < 0)
						break;
					if (direct)
						js += "_+=";
					js += html.substring(intJ, intI).trim() + ";";
					intJ = intI + 2;
				}
				js += "_+='" + html.substring(intJ).replace(/\'/g, "\\'") + "'; return _;";
				element.jscache = new Function(js);
				element.innerHTML = '';
			}
			return element.jscache.call(data);
		}
		catch (err)
		{
			if (console)
				console.log("Error: " + element.outerHTML + ": " + err.message);
			return "";
		}
	};

})();