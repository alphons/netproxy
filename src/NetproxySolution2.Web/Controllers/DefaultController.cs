using Microsoft.AspNetCore.Mvc;

namespace NetproxySolution.WevTest.Controllers;

public class DefaultController : ControllerBase
{
	[HttpGet]
	[Route("~/api/HelloWorld")]
	public async Task<IActionResult> HelloWorld(string name)
	{
		await Task.Yield();

		return Ok(new
		{
			Message = $"{name} says Hello, World!"
		});

	}

	[HttpPost]
	[Route("~/api/SomePost")]
	public async Task<IActionResult> SomePost(object model)
	{
		await Task.Yield();

		return Ok(new
		{
			Message = "yess"
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

	[HttpPost]
	[Route("~/api/NotFound")]
	public async Task<IActionResult> CanYouFindIt()
	{
		await Task.Yield();

		return NotFound();

	}

	[HttpPost]
	[Route("~/api/ServerError")]
	public async Task<IActionResult> ServerError()
	{
		await Task.Yield();

		try
		{
			var i = 0;
			var j = 1 / i;
			return Ok();
		}
		catch(Exception eee)
		{
			return NotFound(eee);
		}
	}



}


