using System.Text.Json;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics;

using NetproxySolution.Web.Converters;
using NetproxySolution.Web.DataModel;
using NetproxySolution.Web.Helpers;
using NetproxySolution.Web.Extensions;

namespace NetproxySolution.Web.LogicControllers;

public interface IErrorController
{
	Task<int> LogErrorAsync(int ErrorCode, string Path, string Message);
}

// ScopedRegistration, even it inherits Controller or ControllerBase (http error 405)
[ScopedRegistration]
public class ErrorController(IFakeDatabase fakeDatabase) : Controller, IErrorController
{
	private readonly IFakeDatabase db = fakeDatabase;
	public async Task<int> LogErrorAsync(int errorCode, string path, string message)
	{
		db.Errors.Add(new Error()
		{
			IpAdres = HttpContext2.IpAddress,
			SessionId = HttpContext2.SessionId,
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

		var status = await LogErrorAsync(errorCode, path, message);

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

		var status = await LogErrorAsync(1, source, message);

		return Ok();

	}

}
