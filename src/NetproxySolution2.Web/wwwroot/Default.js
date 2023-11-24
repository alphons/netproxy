//
// For including script, always use defer for not blocking loading of the page
// Example: <script src="./netproxydemo.js" defer></script>
// 
(function ()
{
	PageEvents();
	Init();
})();

var result;

function PageEvents()
{
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

	netproxy("./api/HelloWorld", null, function ()
	{
		result.innerText = "Result:" + this.Message;
	});
}


async function SomePostAsync()
{
	result.innerText = '';

	r = await netproxyasync("./api/SomePost", { model: { user: 'alphons' } });

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

function StartUpload(e)
{
	var file = e.target.files[0];

	result.innerText = 'Uploading';

	var formData = new FormData();

 	formData.append("file", file, file.name);
	formData.append("Form1", "Value1"); // some extra Form data

	netproxy("/api/upload", formData, function ()
	{
		result.innerText = "Result:" + this.message;
	}, window.NetProxyErrorHandler, ProgressHandler);
}

function ErrorHandler(error, source, message)
{
	alert(error.message+" " + error.stack + " source:" + source + " message:" + message);
}
async function TestLongRunningAsync()
{
	try
	{
		r = await netproxyasync("./api/TestLongRunning", { TimeOut: 1000 } , ErrorHandler);

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

