//
// For including script, always use defer for not blocking loading of the page
// Example: <script src="./netproxy.js" defer></script>
// 
(function ()
{
	PageEvents();
	Init();
})();

var result;

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
	result = $id('Result');
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
	result.innerText = "Uploading " + percent + "%";
}

async function StartUpload(e)
{
	var file = e.target.files[0];

	result.innerText = 'Uploading';

	var formData = new FormData();

 	formData.append("file", file, file.name);
	formData.append("Form1", "Value1"); // some extra Form data

	var res = await netproxyasync("/api/upload", formData, ErrorHandler, ProgressHandler);

	result.innerText = "Result:" + res.Length+" " + res.Form1;
}

function ErrorHandler(error, source, message)
{
	alert(error.message+" " + error.stack +" source:" + source + " message:" + message);
}
async function TestLongRunningAsync()
{
	try
	{
		r = await netproxyasync("./api/TestLongRunning", { TimeOut: 2000 } , ErrorHandler);

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
		r = await netproxyasync("./api/NotFound", null, ErrorHandler);

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

async function ServerErrorAsync()
{
	try
	{
		r = await netproxyasync("./api/ServerError", null, ErrorHandler);

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
