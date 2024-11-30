/**
 * 
 *	@name		pure-dom netproxy and template api
 * 
 *	@author     Alphons van der Heijden <alphons@heijden.com>
 *	@version    3.0.2 (last revision Nov, 2024)
 *	@copyright  (c) 2019-2024 Alphons van der Heijden
 *	@alias      netproxy, netproxyasync, Element.Template, TemplateHtml
 * 
 */

// please use defer in script tag
(function ()
{
	'use strict';

	// Escape functie om XSS te voorkomen
	function escapeHtml(unsafe)
	{
		if (Array.isArray(unsafe))
			return unsafe.map(item => escapeHtml(item)).join(', ');
		if (unsafe === null || unsafe === undefined)
			return '';
		return String(unsafe).replace(/[&<>"']/g, function (match)
		{
			return {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;'
			}[match];
		});
	}

	// netproxy functionaliteit
	window.netproxy = function (url, data, onsuccess, onerror, onprogress)
	{
		const spinner = document.getElementById("netproxyspinner");
		if (typeof remote !== 'undefined')
			url = remote + url;
		if(spinner)
			var timeoutSpinner = setTimeout(() => spinner.style.display = 'block', 1000);
		const xhr = new XMLHttpRequest();
		xhr.open(data ? 'POST' : 'GET', url, true);
		xhr.withCredentials = url.indexOf(window.location.host) < 0 && url[0] !== '/';
		if (!(data instanceof FormData))
		{
			xhr.timeout = 30000;
			xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		}
		xhr.onloadend = function ()
		{
			if (timeoutSpinner)
				clearTimeout(timeoutSpinner);
			if (spinner)
				spinner.style.display = 'none';
			if (xhr.status === 204)
			{
				if (typeof onsuccess === 'function')
					onsuccess.call(null, null);
				return;
			}
			if (xhr.status >= 200 && xhr.status < 300)
			{
				const contentDisposition = xhr.getResponseHeader('Content-Disposition');
				if (contentDisposition && contentDisposition.includes('attachment'))
				{
					const blob = new Blob([xhr.response], { type: xhr.getResponseHeader('Content-Type') });
					const filename = contentDisposition.split('filename="')[1]?.split('"')[0] || 'download';
					const a = document.createElement('a');
					a.href = URL.createObjectURL(blob);
					a.download = filename;
					a.rel = 'noopener';
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					setTimeout(() => URL.revokeObjectURL(a.href), 40000);
					return;
				}

				let response = xhr.response;
				try
				{
					response = JSON.parse(xhr.responseText);
				}
				catch (e)
				{
				}

				try
				{
					if (typeof onsuccess === 'function')
						onsuccess.call(response, response);
					return;
				}
				catch (error)
				{
					if (typeof onerror === 'function')
					{
						onerror.call(xhr, error);
						return;
					}
					throw error;
				}
			}
			if (xhr.status >= 400)
			{
				const error = new Error(`Http:${xhr.status}`);
				error.path = url;
				if (typeof onerror === 'function')
				{
					onerror.call(xhr, error);
					return;
				}
				throw error;
			}
			if (xhr.status === 0)
			{
				const error = xhr.timedout
					? new Error(`Timeout ${xhr.timeout}ms for ${url}`)
					: new Error(`Network error or request canceled for ${url}`);
				error.path = url;
				if (typeof onerror === 'function')
				{
					onerror.call(xhr, error);
					return;
				}
				throw error;
			}
		};
		if (onprogress)
		{
			xhr.upload.onprogress = onprogress;
			xhr.onprogress = onprogress;
		}
		xhr.send(data instanceof FormData
			? data
			: JSON.stringify(data));
	};

	window.netproxyasync = function (url, data, onprogress)
	{
		return new Promise((resolve, reject) =>
		{
			netproxy(url, data, resolve, reject, onprogress);
		});
	};

	// Template functionaliteit
	Element.prototype.Template = function (template, data, append)
	{
		var strHtml = window.TemplateHtml(template, data);
		if (append)
		{
			var temp = document.createElement("span");
			this.insertAdjacentElement('beforeend', temp);
			temp.outerHTML = strHtml;
		}
		else
		{
			this.innerHTML = strHtml;
		}
	};

	window.TemplateHtml = function (template, data)
	{
		try
		{
			var element = typeof template === "string" ? document.getElementById(template) : template;
			if (!element)
				throw new Error("Template niet gevonden.");
			if (!element.jscache)
			{
				var html = element.innerHTML.replace(/[\t\r\n]/g, " ");
				var js = "let _='';";
				var direct, intI, intJ = 0;
				while (intJ < html.length)
				{
					intI = html.indexOf("{{", intJ);
					if (intI < 0)
						break;
					js += `_+='${html.substring(intJ, intI).replace(/'/g, "\\'")}';`;
					intJ = intI + 2;
					direct = (html[intJ] === "=");
					if (direct)
						intJ++;
					intI = html.indexOf("}}", intJ);
					if (intI < 0)
						break;
					js += direct ? `_+=escapeHtml(${html.substring(intJ, intI).trim()});` : html.substring(intJ, intI).trim() + ";";
					intJ = intI + 2;
				}
				js += `_+='${html.substring(intJ).replace(/'/g, "\\'")}'; return _;`;
				element.jscache = new Function('escapeHtml', 'data', js);
				element.innerHTML = '';
			}
			return element.jscache.call(data, escapeHtml);
		}
		catch (err)
		{
			console.error("Template fout:", err.message);
			return "";
		}
	};
})();


