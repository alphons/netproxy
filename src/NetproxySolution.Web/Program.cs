using NetproxySolution.Web.Helpers;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
	ContentRootPath = AppDomain.CurrentDomain.BaseDirectory
});

builder.Services.AddMvcCore().WithMultiParameterModelBinding();

builder.Services.RegisterServices();

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

app.UseExceptionHandler("/error/Internal");
app.UseStatusCodePagesWithReExecute("/error/Internal/{0}");
app.UseRouting();
app.MapControllers();
app.UseDefaultFiles();
app.UseStaticFiles();
app.Run();
