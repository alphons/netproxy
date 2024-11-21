using System.Text.Json;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics;

using NetproxySolution.Web.Converters;
using NetproxySolution.Web.DataModel;
using NetproxySolution.Web.Extensions;

namespace NetproxySolution.Web.LogicControllers;

public interface IErrorController
{
	Task<int> LogErrorAsync(int ErrorCode, string Path, string Message);
}

// ScopedRegistration, even it inherits Controller or ControllerBase (http error 405)
[ScopedRegistration]
public class ErrorController(
	IFakeDatabase fakeDatabase,
	IHttpContextAccessor httpContextAccessor) : Controller, IErrorController
{
	private readonly IFakeDatabase db = fakeDatabase;
	private readonly IHttpContextAccessor accessor = httpContextAccessor;

	public async Task<int> LogErrorAsync(int errorCode, string path, string message)
	{
		db.Errors.Add(new Error()
		{
			IpAdres = accessor.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0",
			SessionId = accessor.HttpContext?.Session.Id ?? "session-unknown",
			Referer = accessor.HttpContext?.Request.Headers.Referer.ToString() ?? "referer-unknown",
			UserAgent = accessor.HttpContext?.Request.Headers.UserAgent.ToString() ?? "user-agent-unknown",
			ErrorCode = errorCode,
			Path = path,
			Message = message
		});

		var status  = await db.SaveChangesAsync();

		return status;
	}

	[HttpGet("~/error/Internal")]
	[HttpGet("~/error/Internal/{statuscode}")]
	public async Task<IActionResult> InternalAsync(int? statuscode)
	{
		var errorCode = HttpContext.Response.StatusCode;
		var path = "/";
		var message = "unknown";

		//var exceptionHandlerPathFeature = HttpContext.Features.Get<IExceptionHandlerPathFeature>();

		var featureException = HttpContext.Features.Get<IExceptionHandlerFeature>();
		if (featureException != null)
		{
			JsonSerializerOptions options = new(JsonSerializerOptions.Default) { WriteIndented = true };

			options.Converters.Add(new DetailExceptionConverter());

			message = JsonSerializer.Serialize(featureException.Error, options);

			path = featureException.Path;
		}
		else
		{
			var featureStatusCode = HttpContext.Features.Get<IStatusCodeReExecuteFeature>();
			if (featureStatusCode != null)
			{
				//errorCode = featureStatusCode.OriginalStatusCode;
				message = "not found";
				path = featureStatusCode.OriginalPath;
			}
		}

		_ = await LogErrorAsync(errorCode, path, message);

		//var html = message.Replace(@"\\", @"\").Replace(@"\r\n", "<br/>");

		return StatusCode(errorCode, $"this error is submitted to the programmers");
	}


	// Client javascript error

	[HttpPost("~/api/errorlog")]
	public async Task<IActionResult> ErrorLogAsync(
	string @event,
	string errormessage,
	string errorstack,
	string referer,
	string source)
	{
		var message = JsonSerializer.Serialize(new
		{
			Event= @event,
			Message = errormessage,
			Stack = errorstack,
			Referer = referer
		});

		_ = await LogErrorAsync(1, source, message);

		return Ok();

	}

	[HttpPost("~/api/ListErrors")]

	public IActionResult ListErrors(string Search, int Page, int PageLength)
	{
		var list = db.Errors.Where(x => x.Message.Contains(Search)).Skip(Page *  PageLength).Take(PageLength).ToList();

		return Ok(new
		{
			List = list
		});
	}


}
