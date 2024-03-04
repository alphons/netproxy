
using NetproxySolution.Web.Extensions;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
	ContentRootPath = AppDomain.CurrentDomain.BaseDirectory
});

var services = builder.Services;

services.AddMvcCore().WithMultiParameterModelBinding();
services.RegisterServices();
services.AddHttpContextAccessor();
services.AddDistributedMemoryCache();
services.AddSession();

var app = builder.Build();

app.UseExceptionHandler("/error/Internal");
app.UseStatusCodePagesWithReExecute("/error/Internal/{0}");
app.UseSession();
app.UseRouting();
app.MapControllers();
app.UseDefaultFiles();
app.UseStaticFiles();
app.Run();
