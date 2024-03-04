using Microsoft.Extensions.Caching.Distributed;

using System.Text.Json;


namespace NetproxySolution.Web.Extensions;

public static class DistributedCacheExtension
{
	public async static Task SetObjectAsync(this IDistributedCache cache, string cacheKey, object data, DateTimeOffset dtm)
	{
		var cachedData = JsonSerializer.Serialize(data);
		var cacheOptions = new DistributedCacheEntryOptions()
			.SetAbsoluteExpiration(dtm);
		await cache.SetStringAsync(cacheKey, cachedData, cacheOptions);
	}

	public async static Task<T?> GetObjectAsync<T>(this IDistributedCache cache, string cacheKey)
	{
		var json = await cache.GetStringAsync(cacheKey);
		if (json != null)
			return JsonSerializer.Deserialize<T>(json);
		else
			return default;
	}

	public async static Task SetStringAsync(this IDistributedCache cache, string cacheKey, string data, DateTimeOffset dtm)
	{
		var cacheOptions = new DistributedCacheEntryOptions()
			.SetAbsoluteExpiration(dtm);
		await cache.SetStringAsync(cacheKey, data, cacheOptions);
	}
}

