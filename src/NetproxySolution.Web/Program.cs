// simple webserver for hosting demo files

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    // the 'real' root of the application
    ContentRootPath = AppDomain.CurrentDomain.BaseDirectory
});

var app = builder.Build();

app.MapGet("/api/helloworld", () => "{ \"Message\" : \"Hello, World\" }");

app.MapPost("/api/post", () => "{ \"Message\" : \"succes\" }" );

app.MapPost("/api/upload", (HttpContext ctx) =>
{
	return "{ \"Message\" : \"Length:"+ ctx.Request.Form.Files[0].Length + " Extra:" + ctx.Request.Form["Form1"] + "\" }";
});

app.UseDefaultFiles();

app.UseStaticFiles();

app.Run();

