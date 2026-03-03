using System.Diagnostics;


namespace NetproxySolution.Web.Extensions;

[AttributeUsage(AttributeTargets.Class)]
public class ScopedRegistrationAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Class)]
public class SingletonRegistrationAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Class)]
public class TransientRegistrationAttribute : Attribute { }

public static class ServiceRegistrationHelper
{
	public static void RegisterServices(this IServiceCollection services)
	{
		var scopedRegistration = typeof(ScopedRegistrationAttribute);
		var singletonRegistration = typeof(SingletonRegistrationAttribute);
		var transientRegistration = typeof(TransientRegistrationAttribute);

		var types = AppDomain.CurrentDomain.GetAssemblies()
		   .SelectMany(s => s.GetTypes())
		   .Where(p =>
		   p.IsDefined(scopedRegistration, false) ||
		   p.IsDefined(transientRegistration, false) ||
		   p.IsDefined(singletonRegistration, false) && !p.IsInterface)
		   .Select(s => new
		   {
			   Service = s.GetInterface($"I{s.Name}"),
			   Implementation = s
		   })
		   .Where(x => x.Service != null); // only existing Services

		Debug.WriteLine(string.Join(',', types.Select(x => x.Service?.Name)));

		var countScoped = 0;
		var countTransient = 0;
		var countSingleton = 0;
		foreach (var type in types)
		{
			if (type.Service == null)
				continue;

			if (type.Implementation.IsDefined(scopedRegistration, false))
			{
				countScoped++;
				services.AddScoped(type.Service, type.Implementation);
				continue;
			}

			if (type.Implementation.IsDefined(transientRegistration, false))
			{
				countTransient++;
				services.AddTransient(type.Service, type.Implementation);
				continue;
			}

			if (type.Implementation.IsDefined(singletonRegistration, false))
			{
				countSingleton++;
				services.AddSingleton(type.Service, type.Implementation);
				continue;
			}
		}
		Debug.WriteLine($"Singleton-services:{countSingleton} Scoped-services:{countScoped} Transient-services:{countTransient}.");
	}
}
