const loadedScripts = new Map<string, Promise<void>>();

export function loadJsPlugin(pluginUrl: string) {
    if (loadedScripts.has(pluginUrl)) {
        return loadedScripts.get(pluginUrl) as Promise<void>;
    }
    const promise = new Promise<void>((resolve, reject) => {
        const scriptEle = document.createElement("script");

        scriptEle.setAttribute("src", pluginUrl);
        scriptEle.setAttribute("type", "text/javascript");
        scriptEle.setAttribute("async", "false");
        scriptEle.setAttribute("defer", "false");

        document.head.appendChild(scriptEle);

        scriptEle.addEventListener("load", () => resolve());
        scriptEle.addEventListener("error", () => {
            reject(new Error(`Error loading script ${pluginUrl}`));
            loadedScripts.delete(pluginUrl);
        });
    });

    loadedScripts.set(pluginUrl, promise);
    return promise;
}
