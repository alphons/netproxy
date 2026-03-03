// Templater 3.0 AAB van der Heijden 2025-08-30
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
						concatParts = []; // Clear concatParts after pushing final segment
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
				concatParts = []; // Clear concatParts after final push
			}
			jsParts.push('return _;');
			var js = jsParts.join('');
			jsParts = []; // Clear jsParts after creating js string
			// Wrap script in a function to allow return statement
			element.jscache = function (data)
			{
				var context = { ...data, XSS };
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
