namespace NetproxySolution.Web.DataModel;

public class WebError
{
	public int Id { get; set; }
	public DateTime Time { get; set; }
	public string? IpAddress { get; set; }
	public string? Referer { get; set; }
	public string? UserAgent { get; set; }
	public string? SessionId { get; set; }

	public int ErrorCode { get; set; }
	public string? Event { get; set; }
	public string? Path { get; set; }
	public string? ErrorMessage { get; set; }
	public string? ErrorStack { get; set; }
	public string? Source { get; set; }

}
