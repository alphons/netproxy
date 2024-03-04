/*
 * AAB:
 * HttpContext.Current is somewhat compatible with old ASP framework
 * therefore we use the old namespace System.Web for this
 * it contains only 1 property Current
 */

namespace NetproxySolution.Web.Extensions;

public static class HttpContext2
{
    private static IHttpContextAccessor? m_httpContextAccessor;

    public static void Configure(IHttpContextAccessor httpContextAccessor)
    {
        m_httpContextAccessor = httpContextAccessor;
    }

    public static HttpContext Current
    {
        get
        {
            if (m_httpContextAccessor == null || m_httpContextAccessor.HttpContext == null)
                throw new Exception("null HttpContextAccessor, use HttpContext2.Configure(httpContextAccessor)");

            return m_httpContextAccessor.HttpContext;
        }
    }

    public static string IpAddress => m_httpContextAccessor?.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";

    public static string SessionId => m_httpContextAccessor?.HttpContext?.Session.Id ?? "session-unknown";

    public static string Referer => m_httpContextAccessor?.HttpContext?.Request.Headers.Referer.ToString() ?? "referer-unknown";

	public static string UserAgent => m_httpContextAccessor?.HttpContext?.Request.Headers.UserAgent.ToString() ?? "user-agent-unknown";
	
}
