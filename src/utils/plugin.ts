export function loadJsPlugin(pluginUrl: string) {
    return new Promise((resolve, reject) => {
        const scriptEle = document.createElement("script");

        scriptEle.setAttribute("src", pluginUrl);
        scriptEle.setAttribute("type", "text/javascript");
        scriptEle.setAttribute("async", "false");
        scriptEle.setAttribute("defer", "false");

        document.head.appendChild(scriptEle);

        scriptEle.addEventListener("load", resolve);
        scriptEle.addEventListener("error", reject);
    });
}

export async function loadPluginsByVersion(version: string) {
    const pluginsFilesNames = [
        "reporttable.min.js",
        "chart.min.js",
        "map.min.js",
        "eventchart.min.js",
        "eventreport.min.js",
    ];
    return Promise.all(pluginsFilesNames.map(fileName => loadJsPlugin(`${version}/${fileName}`)));
}
