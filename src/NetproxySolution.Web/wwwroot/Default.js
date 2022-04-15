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

function Test()
{
	result.innerText = '';

	netproxy("./api/helloworld", null, function ()
	{
		result.innerText = "Result:" + this.Message;
	});
}


async function TestAsync()
{
	result.innerText = '';

	r = await netproxyasync("./api/post", { model: { user: 'alphons' } });

	result.innerText = "Result:" + r.Message;
}


function ProgressHandler(event)
{
	var percent = 0;
	var position = event.loaded || event.position;
	var total = event.total;
	if (event.lengthComputable)
		percent = Math.ceil(position / total * 100);
	$id("Result").innerText = "Uploading " + percent + "%";
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
		result.innerText = "Result:" + this.Message;
	}, window.NetProxyErrorHandler, ProgressHandler);
}
