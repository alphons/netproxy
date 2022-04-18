# netproxy

The netproxy package consists of some small javascript macros and javascript methods to make json calls to .net core controllers.
There are no dependencies and is fully modern DOM compatible.

Synchronous calls:

```javascript
netproxy("./api/helloworld", null, function ()
{
  alert(this.Message);
});

netproxy("./api/post", 
{ 
  model: 
  {
    user: 'alphons' 
  } 
}, function()
{
  alert(this.Message);
});
```
Asynchronous calls:

```javascript
result = await netproxyasync("./api/helloworld", null);
alert(result.Message);

result = await netproxyasync("./api/post", 
{ 
  model: 
  {
    user: 'alphons' 
  } 
});
alert(result.Message);

```

Uploading file:

```javascript
var formData = new FormData();

formData.append("file", file, file.name);
formData.append("Form1", "Value1"); // some extra Form data

netproxy("/api/upload", formData, function ()
{
	alert("Result:" + this.Message);
}, window.NetProxyErrorHandler, ProgressHandler);
```

A .net core controller handling the upload request must have attributes set for huge uploads.

```c#
[HttpPost]
[Route("~/api/upload")]
[RequestSizeLimit(2_500_000_000)]
[RequestFormLimits(MultipartBodyLengthLimit = 2_500_000_000)]
public async Task<IActionResult> Upload(IFormFile file, string Form1)
{
  if (file.Length > 0)
  {
    using var ms = new MemoryStream();
    await file.CopyToAsync(ms); // some dummy operation
  }
  return Ok(new 
  { 
    file.Length,
    Form1
  });
}
```

For uploading ~~big~~ huge files and hosting inside IIS add requestLimits changes to web.config file are necessary.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <remove name="aspNetCore" />
      <add name="aspNetCore" path="*" verb="*" 
		   modules="AspNetCoreModuleV2" 
		   resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="%LAUNCHER_PATH%" 
				arguments="%LAUNCHER_ARGS%" 
				stdoutLogEnabled="false" 
				stdoutLogFile=".\logs\stdout" 
				hostingModel="InProcess" />
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="2500000000" />
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

To add multiparameter model binding to MVC Core the nuget package [Mvc.ModelBinding.MultiParameter](https://www.nuget.org/packages/Mvc.ModelBinding.MultiParameter/) can be used.

```javascript
result = await netproxyasync("./api/SomeMethod/two?SomeParameter3=three&SomeParameter6=six",
{
  "SomeParameter4": // Now the beast has a name
  {
    Name: "four",
    "Users":
    [
      [{ Name: "User00", Alias: ['aliasa', 'aliasb', 'aliasc'] }, { Name: "User01" }],
      [{ Name: "User10" }, { Name: "User11" }],
      [{ Name: "User20" }, { Name: "User21" }]
    ]
  },
  "SomeParameter5": "five" // double binder
});
alert(result.SomeParameter4.Users[0][0].Alias[1]); // 'aliasb'
```


```c#
[HttpPost]
[Route("~/api/SomeMethod/{SomeParameter2}")]
public async Task<IActionResult> DemoMethod(
	[FromCooky(Name = ".AspNetCore.Session")] string SomeParameter0,
	[FromHeader(Name = "Referer")] string SomeParameter1,
	[FromRoute] string SomeParameter2,
	[FromQuery] string SomeParameter3,
	[FromBody] ApiModel SomeParameter4,
	[FromBody] string SomeParameter5,
	[FromQuery]string SomeParameter6)
{
	await Task.Yield();
	return Ok(new
	{
		SomeParameter0,
		SomeParameter1,
		SomeParameter2,
		SomeParameter3,
		SomeParameter4,
		SomeParameter5,
		SomeParameter6
	);
}

[HttpPost]
[Route("~/api/SomeMethod2/{SomeParameter2}")]
public async Task<IActionResult> DemoMethod2(
	string Referer,
	string SomeParameter2,
	string SomeParameter3,
	ApiModel SomeParameter4,
	string SomeParameter5,
	string SomeParameter6)
{
	await Task.Yield();
	return Ok(new
	{
		Referer,
		SomeParameter2,
		SomeParameter3,
		SomeParameter4,
		SomeParameter5,
		SomeParameter6
	);
}
```

For more tests see the [Mvc.ModelBinding.MultiParameter](https://github.com/alphons/Mvc.ModelBinding.MultiParameter) project on github.

