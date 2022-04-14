// simple webserver for hosting demo files
var app = WebApplication.CreateBuilder(args).Build();

app.MapGet("/api/helloworld", () => "{ \"Message\" : \"Hello, World\" }");

app.MapPost("/api/post", () => "{ \"Message\" : \"succes\" }" );

app.MapPost("/api/upload", (HttpContext ctx) =>
{
	return "{ \"Message\" : \"Length:"+ ctx.Request.Form.Files[0].Length + " Extra:" + ctx.Request.Form["Form1"] + "\" }";
});

app.UseDefaultFiles(new DefaultFilesOptions() { DefaultFileNames = new string[] { "netproxydemo.htm" } });

app.UseStaticFiles();

app.Run();

