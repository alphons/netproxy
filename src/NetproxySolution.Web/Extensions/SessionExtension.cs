
using System.Text.Json;

namespace NetproxySolution.Web.Extensions;

public static class SessionExtension
{
	public static T? GetCreateObject<T>(this ISession session, string name) where T : new()
	{
		var json = session.GetString(name);
		if (json == null)
		{
			T val = new();
			session.SetObject(name, val);
			return val;
		}
		return JsonSerializer.Deserialize<T>(json);
	}

	public static T? GetObject<T>(this ISession session, string name)
	{
		var json = session.GetString(name);
		if (json == null)
			return default;

		return JsonSerializer.Deserialize<T>(json);
	}

	public static void SetObject(this ISession session, string name, object? val)
	{
		if (val == null)
			session.Remove(name);
		else
			session.SetString(name, JsonSerializer.Serialize(val));
	}

	// Async functions

	public async static Task<string?> GetStringAsync(this ISession session, string name)
	{
		await session.LoadAsync();

		var val = session.GetString(name);

		return val;
	}

	public async static Task SetStringAsync(this ISession session, string name, string? val)
	{
		if (val == null)
			session.Remove(name);
		else
			session.SetString(name, val);

		await session.CommitAsync();
	}

	public async static Task<T?> GetObjectAsync<T>(this ISession session, string name)
	{
		await session.LoadAsync();

		var json = session.GetString(name);
		if (json == null)
			return default;

		return JsonSerializer.Deserialize<T>(json);
	}

	public async static Task SetObjectAsync(this ISession session, string name, object? val)
	{
		if (val == null)
			session.Remove(name);
		else
			session.SetString(name, JsonSerializer.Serialize(val));

		await session.CommitAsync();
	}
}
