
using NetproxySolution.Web.ErrorHandling;
using NetproxySolution.Web.Extensions;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
	ContentRootPath = AppDomain.CurrentDomain.BaseDirectory
});

var services = builder.Services;

services.AddSingleton(provider => new ErrorService());

services.AddControllersWithViews();
services.AddRazorPages(o => o.RootDirectory = "/wwwroot");

services.AddMvcCore().WithMultiParameterModelBinding();
services.RegisterServices();
services.AddHttpContextAccessor();
services.AddDistributedMemoryCache();
services.AddSession();

var app = builder.Build();

app.UseExceptionHandler("/error/internal");
app.UseStatusCodePagesWithReExecute("/error/internal/{0}");

//Uploads go via c:\windows\temp
app.Use(next => context =>
{
	context.Request.EnableBuffering(Int32.MaxValue);
	return next(context);
});


app.UseDefaultFiles();
app.UseStaticFiles();
app.UseSession();

app.MapControllers();
app.MapDefaultControllerRoute();
app.MapRazorPages();
app.Run();
