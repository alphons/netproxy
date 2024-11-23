# Pure-DOM Netproxy 3.0 and Template API

Nuget package https://www.nuget.org/packages/netproxy/

This package works seamlessly with the NuGet package https://www.nuget.org/packages/Mvc.ModelBinding.MultiParameter/


## The Ultimate Bridge Between Client and Server

At the heart of this script lies **netproxy**, the ultimate **bridge** between client-side scripting and server-side API controllers. It elegantly handles **complex parameter inputs**, whether you’re sending JSON payloads, uploading files, or making precise HTTP calls. With **netproxy**, the days of juggling verbose AJAX code are over—this script transforms **API communication into a seamless, flexible, and highly intuitive experience**.

---

## Features

### 1. A Networking Powerhouse
- The **netproxy** function is the backbone of your API interactions:
  - Supports **multiple parameter types**, from JSON objects to `FormData`.
  - Includes advanced **file upload capabilities**, catering to modern web apps.
  - Handles **cross-origin requests (CORS)**, bridging client and server worlds.
  - Automatically displays a **spinner for long-running requests**, keeping users informed.

---

### 2. Asynchronous Brilliance
- Modern web development demands modern solutions, and `netproxyasync` delivers:
  - Fully supports **Promises**, allowing for intuitive `async/await` workflows.
  - Cleanly integrates with existing applications, eliminating callback clutter.

---

### 3. Intelligent API Response Handling
- Effortlessly manage complex API responses with:
  - **No-Content (204)** handling for operations that succeed without payloads.
  - Automatic **JSON parsing**, with fallback error handling for malformed responses.

---

### 4. File Downloads Made Effortless
- The script’s **file download support** is second to none:
  - Automatically detects `Content-Disposition` headers to retrieve filenames.
  - Dynamically creates secure download links for a flawless user experience.

---

### 5. Dynamic HTML Rendering, Redefined
- Templates are no longer static or cumbersome. With **TemplateHtml**, you get:
  - **Dynamic HTML rendering** from reusable templates.
  - Secure output via **HTML escaping**, ensuring safe integration of user data.
  - Optimized **performance through caching**, making repeated rendering lightning fast.

---

### 6. Total Control Over Progress
- Never leave users in the dark. With **upload and download progress tracking**, the script allows for:
  - Visual indicators of data transfer.
  - Real-time updates, keeping users informed and engaged.

---

### 7. Uncompromising Security
- XSS attacks are a thing of the past. With the **escapeHtml** utility:
  - User input and external data are safely sanitized.
  - Your app remains secure, no matter the source of the data.

---

### 8. Built for Any Data Format
- Whether it’s a **JSON payload** or a **multipart FormData request**, this script handles it with grace. It adapts effortlessly to the demands of modern applications.

---

### 9. Optimized for Developers
- From its **declarative style** to its robust error handling, the script saves time and headaches:
  - Clear separation of concerns between client-side logic and server-side APIs.
  - Minimized boilerplate code, letting developers focus on functionality.

---

### 10. Future-Proof Design
- Built with the **latest JavaScript standards**, this script is ready for whatever the future holds. It’s not just a tool—it’s a **developer’s ally**.

---

## Why Use This Script?

In essence, **"Pure-DOM Netproxy and Template API"** isn’t just a script. It’s a **revolutionary enabler**, a tool that doesn’t just solve problems but **sets new standards**. With its unparalleled versatility and power, it transforms the way developers interact with APIs and the DOM.

---

## Usage

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
result = await netproxyasync("./api/helloworld");
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

var result = await netproxyasync("/api/upload", formData, window.NetProxyErrorHandler, ProgressHandler);
alert("Result:" + result.Message);
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

The multiparameter model binding to MVC Core using nuget package 
[Mvc.ModelBinding.MultiParameter](https://www.nuget.org/packages/Mvc.ModelBinding.MultiParameter/) 
is part of netproxy as of version 1.1.0 and later.

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
```
When parameters have unique names this can be simplified to:
```c#
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

## Using template functionality

```c#
const output = $id('output');

var result = await netproxyasync("/api/ListErrors", 
  { 
    Search: "", 
	Page: 0, 
	PageLength: 10 
  });

output.Template(templateerrors, result, false);
```

```html
<script type="text/template" id="templateerrors">
		<table class="errortable">
			<thead>
				<tr>
					<th>Time</th>
					<th>Code</th>
					<th>ErrorMessage</th>
					<th>ErrorStack</th>
					<th>Event</th>
					<th>Path</th>
					<th>Source</th>
					<th>IpAddress</th>
					<th>Referer</th>
					<th>UserAgent</th>
					<th>SessionId</th>
				</tr>
			</thead>
			<tbody>
				{{ for(i=0;i<this.List.length;i++) { }}
				{{ var item = this.List[i]; }}
				<tr data-id="{{=item.Id}}">
					<td>{{=item.Time}}</td>
					<td>{{=item.ErrorCode}}</td>
					<td>{{=item.ErrorMessage}}</td>
					<td>{{=item.ErrorStack}}</td>
					<td>{{=item.Event}}</td>
					<td>{{=item.Path}}</td>
					<td>{{=item.Source}}</td>
					<td>{{=item.IpAddress}}</td>
					<td>{{=item.Referer}}</td>
					<td>{{=item.UserAgent}}</td>
					<td>{{=item.SessionId}}</td>
				</tr>
				{{ } }}
			</tbody>
		</table>
	</script>
```

For more tests see the [Mvc.ModelBinding.MultiParameter](https://github.com/alphons/Mvc.ModelBinding.MultiParameter) project on github.

### Credits

- **Author**: Alphons van der Heijden  
- **Version**: 3.0.0 (Last updated: November 2024)  
- **License**: © 2019-2024 Alphons van der Heijden  

---

Alphons created **the Swiss Army Knife of front-end development**. This script isn’t just functional—it’s downright legendary. 🎉
