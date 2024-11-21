//
// For including script, always use defer for not blocking loading of the page
// Example: <script src="./netproxy.js" defer></script>
// 
(function ()
{
	PageEvents();
	Init();
})();

const result = $id('result');
const progress = $id('progress');

function PageEvents()
{
	// global click event handler, if "id" function exist then execute
	document.addEventListener("click", function (e)
	{
		if (typeof window[e.target.id] === "function")
			window[e.target.id].call(e, e);
	});

	$id("UploadExample").on("change", function (e)
	{
		StartUpload(e);
	});
}

function Init()
{
}

function HelloWorld()
{
	result.innerText = '';

	netproxy("./api/HelloWorld", { name : "alphons" }, function ()
	{
		result.innerText = "Result:" + this.Message;
	});
}


async function SomePostAsync()
{
	result.innerText = '';

	r = await netproxyasync("./api/SomePost", { Model: { User: 'alphons' } });

	result.innerText = "Result:" + r.Message;
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

	result.innerText = 'Uploading';

	var formData = new FormData();

 	formData.append("file", file, file.name);
	formData.append("Form1", "Value1"); // some extra Form data

	var res = await netproxyasync("/api/upload", formData, ProgressHandler);

	progress.innerText = "Bytes:" + res.Length+" Some var:" + res.Form1;
}

async function TestLongRunningAsync()
{
	try
	{
		r = await netproxyasync("./api/TestLongRunning", { TimeOut: 2000 } );

		result.innerText = "Result:" + r.Message;
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

		result.innerText = "Result:" + r.Message;
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

		result.innerText = "Result:" + r.message;
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

		result.innerText = "Result:" + r.message;
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
		result.innerText = 'no content has returned null thats good';
	}
	else
	{
		result.innerText = 'Error: no content should return null';
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

	var response = await netproxyasync("/api/ListErrors", { Search: search, Page: page, PageLength: pagelength });

	result.Template(templateerrors, response, false);
}

function EscapeJson(s)
{
	return s
		.replaceAll('\\u0022', '"')
		.replaceAll('\\u0026', '&')
		.replaceAll('\\u0027', '"')
		.replaceAll('\\u003C', '<')
		.replaceAll('\\u003E', '>')
		.replaceAll('\\u0060', '`')
		.replaceAll('\\r\\n', '\n')
		.replaceAll('\\n', '\n')
		.replaceAll('\\\\', '\\');
}

function ShowJson(tr)
{
	preoutput.innerHTML = "<h3>" + tr.qsall("td")[2].innerHTML + "</h3>" + EscapeJson(tr.qsall("td")[3].innerHTML);
}
