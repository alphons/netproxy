

namespace NetproxySolution.Web.DataModel;

public class Error
{
	public int Id { get; set; }
	public string? IpAdres { get; set; }
	public string? Referer { get; set; }
	public string? UserAgent { get; set; }
	public string? SessionId { get; set; }
	public string? Path { get; set; }
	public string? Message { get; set; }
	public int ErrorCode { get; set; }
}
