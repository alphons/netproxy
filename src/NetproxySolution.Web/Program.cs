// simple webserver for hosting demo files

using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    // the 'real' root of the application
    ContentRootPath = AppDomain.CurrentDomain.BaseDirectory
});

var app = builder.Build();

app.MapGet("/api/helloworld", () => "{ \"message\" : \"Hello, World\" }");

app.MapPost("/api/post", () => "{ \"message\" : \"succes\" }" );

app.MapGet("/api/longrunning", async context => 
{ 
    await Task.Delay(2000);
	await context.Response.WriteAsJsonAsync(new { message = "long waiting succes" });
});

app.MapGet("/api/servererror", async context =>
{
	throw new Exception("This is a server exception");
});

app.MapGet("/api/notfound", async () =>
{
	await Task.Yield();
	try
	{
		var k = 0;
		var l = 1 / k;
	}
	catch (Exception eee)
	{
		return Results.NotFound(new Exception("abc"));
	}
	return Results.NotFound();
});

app.MapPost("/api/upload", (HttpContext ctx) =>
{
	return "{ \"message\" : \"Length:"+ ctx.Request.Form.Files[0].Length + " Extra:" + ctx.Request.Form["Form1"] + "\" }";
});

app.UseDefaultFiles();

app.UseStaticFiles();

app.Run();

