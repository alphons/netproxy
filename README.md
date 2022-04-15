# netproxy

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

For uploading ~~big~~ huge files

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

A .net core controller handling the upload request must have also some attributes set for huge uploads.

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

