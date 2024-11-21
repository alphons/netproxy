(function()
{
    'use strict';
    window.netproxy = function(url, data, onsuccess, onerror, onprogress)
    {
        var spinner = document.getElementById("netproxyspinner");
        if (typeof remote !== 'undefined')
            url = remote + url;
        if (spinner)
            var timeoutSpinner = setTimeout(() =>
            {
                spinner.style.display = 'block';
            }, 1000);
        const options =
        {
            method: data ? 'POST' : 'GET',
            headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json; charset=utf-8' },
            body: data instanceof FormData ? data : JSON.stringify(data)
        };
        const timeout = 30000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        options.signal = controller.signal;
        fetch(url, options)
        .then(async response =>
        {
            clearTimeout(id);
            if (timeoutSpinner)
                clearTimeout(timeoutSpinner);
            if (spinner)
                spinner.style.display = 'none';
            if (!response.ok)
            {
                const error = new Error(`HTTP error! Status: ${response.status}`);
                if (typeof onerror === 'function')
                    onerror(error);
                else
                    throw error;
            }
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition && contentDisposition.includes('attachment'))
            {
                const blob = await response.blob();
                const filename = contentDisposition.split('filename="')[1]?.split('"')[0] || 'download';
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                a.rel = 'noopener';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(a.href), 40000);
                return;
            }
            return response.json();
        })
        .then(data =>
        {
            if (typeof onsuccess === 'function')
                onsuccess(data);
        })
        .catch(error =>
        {
            if (timeoutSpinner)
                clearTimeout(timeoutSpinner);
            if (spinner)
                spinner.style.display = 'none';
            if (error.name === 'AbortError')
                error.message = `Timeout van ${timeout}ms overschreden`;
            if (typeof onerror === 'function')
                onerror(error);
            else
                console.error('netproxy fout:', error);
        });
    };
    window.netproxyasync = function(url, data, onprogress)
    {
        return new Promise((resolve, reject) =>
        {
            netproxy(url, data, resolve, reject, onprogress);
        });
    };
})();
