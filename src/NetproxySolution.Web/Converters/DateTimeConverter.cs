

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace NetproxySolution.Web.Converters;
public class DateTimeConverter : JsonConverter<DateTime>
{
	public override DateTime Read(
	ref Utf8JsonReader reader,
	Type typeToConvert,
	JsonSerializerOptions options) =>
		DateTime.Parse(reader.GetString() ?? string.Empty);
	//DateTime.ParseExact(reader.GetString()!,
	//    "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);

	public override void Write(
		Utf8JsonWriter writer,
		DateTime dateTimeValue,
		JsonSerializerOptions options) =>
			writer.WriteStringValue(dateTimeValue.ToString(
				"yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture));
}
