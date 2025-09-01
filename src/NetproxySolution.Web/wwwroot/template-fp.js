function XSS(unsafe)
{
	if (Array.isArray(unsafe))
	{
		return unsafe.map(item => XSS(item)).join(', ');
	}
	if (unsafe === null || unsafe === undefined)
	{
		return '';
	}
	return String(unsafe).replace(/[&<>"']/g, match =>
	({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	}[match]));
}

// Template functionality
Element.prototype.Template = function (template, data, append)
{
	var strHtml = window.TemplateHtml(template, data);
	if (append)
	{
		var temp = document.createElement("span");
		temp.innerHTML = strHtml;
		this.insertAdjacentElement('beforeend', temp);
	}
	else
	{
		this.innerHTML = strHtml;
	}
};

function TemplateHtml(template, data)
{
	try
	{
		var element = typeof template === "string" ? document.getElementById(template) : template;
		if (!element)
			throw new Error("Template not found.");
		if (!element.jscache)
		{
			var html = element.textContent.replace(/\s+/g, ' ').trim();
			var jsParts = ["let _='';"];
			var concatParts = [];
			var index = 0;
			while (index < html.length)
			{
				var start = html.indexOf('<%', index);
				if (start < 0)
				{
					concatParts.push("'" + html.slice(index).replace(/'/g, "\\'") + "'");
					if (concatParts.length > 0)
					{
						jsParts.push("_+=" + concatParts.join('+') + ";");
						concatParts = [];
					}
					break;
				}
				if (start > index)
				{
					concatParts.push("'" + html.slice(index, start).replace(/'/g, "\\'") + "'");
				}
				index = start + 2;
				var is_ = html[index] === '=';
				if (is_)
					index++;
				var end = html.indexOf('%>', index);
				if (end < 0)
					throw new Error("Unclosed template tag.");
				var code = html.slice(index, end).trim();
				if (is_)
				{
					concatParts.push("XSS(" + code + ")");
				}
				else
				{
					if (concatParts.length > 0)
					{
						jsParts.push("_+=" + concatParts.join('+') + ";");
						concatParts = [];
					}
					jsParts.push(code + ";");
				}
				index = end + 2;
			}
			if (concatParts.length > 0)
			{
				jsParts.push("_+=" + concatParts.join('+') + ";");
				concatParts = [];
			}
			jsParts.push('return _;');
			var js = jsParts.join('');
			jsParts = [];
			element.jscache = function (data)
			{
				var context = { data, XSS };
				for (var key in data)
				{
					if (typeof data[key] === 'function')
					{
						try
						{
							context.data[key] = data[key]();
						}
						catch (err)
						{
							console.error(`Error executing function ${key}: ${err.message}`);
							context.data[key] = '';
						}
					}
				}
				try
				{
					return (function (ctx) { with (ctx) { return eval('(function() {' + js + '})()'); } })(context);
				}
				catch (err)
				{
					console.error(`Template execution error: ${err.message}`);
					return '';
				}
			};
		}
		return element.jscache(data);
	}
	catch (err)
	{
		console.error("Template error:", err.message);
		return "";
	}
}