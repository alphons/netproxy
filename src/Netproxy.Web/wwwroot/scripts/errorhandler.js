// version 2.0.2 (last revision Mar, 2024)

/*
 * Copyright (C) 2024-2026 Alphons van der Heijden
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


window.addEventListener("unhandledrejection", async function (event) 
{
	event.preventDefault();
	try
	{
		await window.netproxyasync("./api/errorlog",
		{
			"event": "-",
			"errormessage": event.reason.message,
			"errorstack": event.reason.stack,
			"path": event.reason.path,
			"source": event.type
		});
	}
	catch (err)
	{
		console.error(err);
	}
});


window.onerror = async function (message, source, lineno, colno, error)
{
	try
	{
		if (source.indexOf("api/errorlog") < 0)
			await window.netproxyasync("./api/errorlog",
			{
				"event": message,
				"errormessage" : error.message,
				"errorstack": error.stack,
				"path": source,
				"source": "line:" + lineno + " col:" + colno
			});
	}
	catch (err)
	{
		console.error(err);
	}
	return true;
}

