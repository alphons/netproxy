﻿
using Microsoft.AspNetCore.Mvc;

namespace NetproxySolution.Web.Controllers;

public class DefaultController : ControllerBase
{

	[HttpGet]
	[Route("~/api/NoContent")]
	public async Task<IActionResult> NoContentAsync()
	{
		await Task.Yield();

		return Ok(null);

	}


	[HttpPost]
	[Route("~/api/HelloWorld")]
	public async Task<IActionResult> HelloWorld(string name)
	{
		await Task.Yield();

		return Ok(new
		{
			Message = $"{name} says Hello, World!"
		});

	}

	public class ModelClass
	{
		public string? User { get; set; }
	}

	[HttpPost]
	[Route("~/api/SomePost")]
	public async Task<IActionResult> SomePost(ModelClass Model)
	{
		await Task.Yield();

		var message = $"yess {Model.User}";
		return Ok(new
		{
			Message = message
		});

	}

	[HttpPost]
	[Route("~/api/TestLongRunning")]
	public async Task<IActionResult> TestLongRunning(int TimeOut)
	{
		await Task.Delay(TimeOut);

		return Ok(new
		{
			Message = $"This took {TimeOut}mS"
		});

	}

	/// <summary>
	/// Uploads have default a maximum of 30MByte presenting upload example of 2.5GB
	///
	/// For IIS Limit maxAllowedContentLength in Web.config (in the root of the app, not in wwwroot content folder!)
	/// 
	/// </summary>
	/// <param name="formFile"></param>
	/// <returns></returns>
	[HttpPost]
	[Route("~/api/Upload")]
	[RequestSizeLimit(2_500_000_000)]
	[RequestFormLimits(MultipartBodyLengthLimit = 2_500_000_000)]
	public async Task<IActionResult> Upload(IFormFile file, string Form1)
	{
		if (file == null || file.Length <= 0)
			return NotFound("File not uploaded");

		var Length = file.Length;
		using var ms = new MemoryStream(); // FileStream for production
		await file.CopyToAsync(ms);

		return Ok(new
		{
			Length,
			Form1
		});
	}

	[HttpGet]
	[Route("~/api/NotFound")]
	public async Task<IActionResult> CanYouFindIt()
	{
		await Task.Yield();

		return NotFound();

	}

	[HttpGet]
	[Route("~/api/ReturnServerError")]
	public async Task<IActionResult> ReturnServerErrorAsync()
	{
		await Task.Yield();

		try
		{
			var i = 0;
			var j = 1 / i;
			return Ok();
		}
		catch (Exception eee)
		{
			return StatusCode(500, new { eee.Message, eee.StackTrace } );
		}
	}

	[HttpGet]
	[Route("~/api/MakeServerError")]
	public async Task<IActionResult> MakeServerErrorAsync()
	{
		await Task.Yield();

		var i = 0;
		var j = 1 / i;
		return Ok();
	}

}

