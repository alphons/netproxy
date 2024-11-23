//
// For including script, always use defer for not blocking loading of the page
// Example: <script src="./netproxy.js" defer></script>
//
const output = $id('output');
const progress = $id('progress');

onReady(() =>
{
	PageEvents();
});

function PageEvents()
{
	// global click event handler, if "id" function exist then execute sync or async
	document.on("click", async function (e)
	{
		if (e.target.id && typeof window[e.target.id] === "function")
		{
			const result = window[e.target.id].call(e, e);
			if (result instanceof Promise)
				await result;
		}

		if (e.target.closest(".errortable"))
		{
			ShowJson(e.target.closest("tr"));
			return;
		}
	});

	$id("UploadExample").on("change", function (e)
	{
		StartUpload(e);
	});
}

function HelloWorld()
{
	output.innerText = '';

	netproxy("./api/HelloWorld", { name : "alphons" }, function ()
	{
		output.innerText = "Result:" + this.Message;
	});
}


async function SomePostAsync()
{
	output.innerText = '';

	r = await netproxyasync("./api/SomePost", { Model: { User: 'alphons' } });

	output.innerText = "Result:" + r.Message;
}


function ProgressHandler(event)
{
	var percent = 0;
	var position = event.loaded || event.position;
	var total = event.total;
	if (event.lengthComputable)
		percent = Math.ceil(position / total * 100);
	progress.innerText = "Uploading " + percent + "%";
}

async function StartUpload(e)
{
	var file = e.target.files[0];

	output.innerText = 'Uploading';

	var formData = new FormData();

 	formData.append("file", file, file.name);
	formData.append("Form1", "Value1"); // some extra Form data

	var res = await netproxyasync("./api/upload", formData, ProgressHandler);

	progress.innerText = "Bytes:" + res.Length+" Some var:" + res.Form1;
}

async function TestLongRunningAsync()
{
	try
	{
		r = await netproxyasync("./api/TestLongRunning", { TimeOut: 2000 } );

		output.innerText = "Result:" + r.Message;
	}
	catch (e)
	{
		console.log(e);
	}
	finally
	{
		console.log('We do cleanup here');
	}

}

async function NotFoundAsync()
{
	try
	{
		r = await netproxyasync("./api/NotFound");

		output.innerText = "Result:" + r.Message;
	}
	catch (e)
	{
		console.log(e);
	}
	finally
	{
		console.log('We do cleanup here');
	}

}

async function ReturnServerErrorAsync()
{
	try
	{
		r = await netproxyasync("./api/ReturnServerError");

		output.innerText = "Result:" + r.message;
	}
	catch (e)
	{
		console.log(e);
	}
	finally
	{
		console.log('We do cleanup here');
	}

}

async function MakeServerErrorAsync()
{
	try
	{
		r = await netproxyasync("./api/MakeServerError");

		output.innerText = "Result:" + r.message;
	}
	catch (e)
	{
		console.log(e);
	}
	finally
	{
		console.log('We do cleanup here');
	}

}


async function NoContentAsync()
{
	var nocontent = await netproxyasync("./api/NoContent");
	if (nocontent == null)
	{
		output.innerText = 'no content has returned null thats good';
	}
	else
	{
		output.innerText = 'Error: no content should return null';
	}
}

function ClientError()
{
	var i = j.RuntimeError;
}

async function ListErrors()
{
	var search = '';
	var page = 0;
	var pagelength = 10;

	var result = await netproxyasync("./api/ListErrors", { Search: search, Page: page, PageLength: pagelength });

	output.Template(templateerrors, result, false);
}

function EscapeJson(s)
{
	return s.replace(/\\u0022|\\u0026|\\u0027|\\u003C|\\u003E|\\u0060|\\r\\n|\\n|\\\\/g, match =>
	{
		switch (match)
		{
			case '\\u0022': return '"';
			case '\\u0026': return '&';
			case '\\u0027': return "'";
			case '\\u003C': return '<';
			case '\\u003E': return '>';
			case '\\u0060': return '`';
			case '\\r\\n': return '\n';
			case '\\n': return '\n';
			case '\\\\': return '\\';
			default: return match; // Onbekende escape laten staan
		}
	});
}

function ShowJson(tr)
{
	preoutput.innerHTML = "<h3>" + tr.$$("td")[2].innerHTML + "</h3>" + EscapeJson(tr.$$("td")[3].innerHTML);
}
