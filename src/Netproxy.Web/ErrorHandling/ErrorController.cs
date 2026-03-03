using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using NetproxySolution.Web.DataModel;
using NetproxySolution.Web.Extensions;
using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace NetproxySolution.Web.ErrorHandling;

public interface IErrorController
{
	int LogError(int errorCode,
		string path,
		string @event,
		string errormessage,
		string errorstack,
		string source);
}

// ScopedRegistration, even it inherits Controller or ControllerBase (http error 405)
//[ScopedRegistration]
public partial class ErrorController(ErrorService errorservice) : Controller, IErrorController
{
	public int LogError(int errorCode,
		string path,
		string @event,
		string errormessage,
		string errorstack,
		string source)
	{
		var weberrors = errorservice.DB;

		var id = weberrors.Count;

		weberrors.Add(new WebError()
		{
			Id = id,
			Time = DateTime.Now,
			IpAddress = HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "0.0.0.0",
			SessionId = HttpContext?.Session?.Id ?? string.Empty,
			Referer = HttpContext?.Request?.Headers.Referer.ToString() ?? "-",
			UserAgent = HttpContext?.Request?.Headers.UserAgent.ToString() ?? "-",
			ErrorCode = errorCode,
			Path = path,
			Event = @event,
			ErrorMessage = errormessage,
			ErrorStack = JsonSerializer.Serialize(errorstack).Trim('"').Trim(),
			Source = source
		});
		return id;
	}

	public static string EscapeJson(string s)
	{
		return MyRegex().Replace(s, match =>
		{
			return match.Value switch
			{
				"\\u0022" => "\"",
				"\\u0026" => "&",
				"\\u0027" => "'",
				"\\u003C" => "<",
				"\\u003E" => ">",
				"\\u0060" => "`",
				"\\r\\n" => "\n",
				"\\n" => "\n",
				"\\\\" => "\\",
				_ => match.Value // Laat onbekende escapes intact
			};
		});
	}

	[HttpGet("~/error/internal")]
	[HttpGet("~/error/internal/{statuscode}")]
	public IActionResult Internal(int? statuscode)
	{
		var errorCode = statuscode == null ? HttpContext.Response.StatusCode : statuscode.Value;
		var path = "/";
		var errormessage = "-";
		var errorstack = "-";
		var source = "-";
		var @event = "-";

		//var exceptionHandlerPathFeature = HttpContext.Features.Get<IExceptionHandlerPathFeature>();

		var featureException = HttpContext.Features.Get<IExceptionHandlerFeature>();
		if (featureException != null)
		{
			errormessage = featureException.Error.Message;
			errorstack = featureException.Error.StackTrace ?? "-";
			path = featureException.Path;
			source = featureException.Error.Source ?? "-";
		}
		else
		{
			var featureStatusCode = HttpContext.Features.Get<IStatusCodeReExecuteFeature>();
			if (featureStatusCode != null)
			{
				//errorCode = featureStatusCode.OriginalStatusCode;
				path = featureStatusCode.OriginalPath;
				errormessage = HttpContext.Response?.ToString() ?? "-";
			}
		}

		_ = LogError(errorCode, path, @event, errormessage, errorstack, source);

		if (HttpContext.Request.ContentType != null && HttpContext.Request.ContentType.Contains("json"))
			return StatusCode(errorCode, $"this error code '{errorCode}' is submitted to the programmers");

		var niceerror = string.Empty;

		if (Debugger.IsAttached)
			niceerror = $"<h3>{errormessage}</h3><pre>{errorstack}</pre";

		ViewData["ErrorCode"] = errorCode;

		return View("/wwwroot/error.cshtml", niceerror);
	}


	// Client javascript error

	[HttpPost("~/api/errorlog")]
	public IActionResult ErrorLog(
	string @event,
	string errormessage,
	string errorstack,
	string path,
	string source)
	{
		LogError(1, path, @event, errormessage, errorstack, source);

		return Ok();
	}

	[HttpPost("~/api/ListErrors")]
	public IActionResult ListErrors(string Search, int Page, int PageLength)
	{
		var weberrors = errorservice.DB;

		var list = weberrors.Where(x => x.ErrorMessage != null && x.ErrorMessage.Contains(Search))
			.Skip(Page * PageLength)
			.Take(PageLength)
			.ToList();

		return Ok(new
		{
			List = list
		});
	}

	[GeneratedRegex(@"\\u0022|\\u0026|\\u0027|\\u003C|\\u003E|\\u0060|\\r\\n|\\n|\\\\")]
	private static partial Regex MyRegex();
}