using NetproxySolution.Web.DataModel;

namespace NetproxySolution.Web.ErrorHandling;


public class ErrorService
{
	public List<WebError> DB { get; set; } = [];
	public async Task<int> SaveChangesAsync()
	{
		await Task.Yield();

		var id = DB.Count;
		var list = DB.Where(x => x.Id == 0).ToList();
		foreach (var error in list)
			error.Id = id++;

		return list.Count;
	}
}