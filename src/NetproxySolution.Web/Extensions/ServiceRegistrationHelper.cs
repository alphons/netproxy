
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

        var count = 0;
        foreach (var type in types)
        {
            if (type.Service == null)
                continue;

            if (type.Implementation.IsDefined(scopedRegistration, false))
            {
                count++;
                services.AddScoped(type.Service, type.Implementation);
                continue;
            }

            if (type.Implementation.IsDefined(transientRegistration, false))
            {
                services.AddTransient(type.Service, type.Implementation);
                continue;
            }

            if (type.Implementation.IsDefined(singletonRegistration, false))
            {
                services.AddSingleton(type.Service, type.Implementation);
                continue;
            }
        }
        Debug.WriteLine($"Number of services: {count}.");
    }
}
