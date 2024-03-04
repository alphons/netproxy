

using NetproxySolution.Web.Extensions;

namespace NetproxySolution.Web.DataModel;

public interface IFakeDatabase
{
	List<Error> Errors { get; set; }
	Task<int> SaveChangesAsync();
}

[SingletonRegistration]
public class FakeDatabase : IFakeDatabase
{
	public List<Error> Errors { get; set; } = [];
	public async Task<int> SaveChangesAsync()
	{
		await Task.Yield();

		var id = this.Errors.Count;
		var list = this.Errors.Where(x => x.Id == 0).ToList();
		foreach(var error in list)
			error.Id = id++;

		return list.Count;
	}
}
