// Unfortunately, VM2 only works with CommonJS syntax.
const jsdom = require("jsdom");

const detectXSS = (htmlSnippet) => {
	let timeout = false;
	let cookieAccessed = false;
	const dom = new jsdom.JSDOM(htmlSnippet, {
			runScripts: "dangerously",
			resources: "usable",
			beforeParse(window) {
				window.Object.defineProperty(window.document, "cookie", {
					get: function () {
						cookieAccessed = true;
					}
				});

				window.setImmediate = () => {};
				window.setInterval = () => {};
				window.clearImmediate = () => {};
				window.clearInterval = () => {};
				window.clearTimeout = () => {};
				window.setTimeout(() => {timeout = true; window.close()}, 5000);
				window.setTimeout = () => {};
			}
	});
	dom.window.close();

	if (cookieAccessed) {
		return true;
	} else if (timeout) {
		throw(new Error("Timeout (Please make sure your code runs in under 5 seconds)"));
	} else {
		return false;
	}
}

module.exports = detectXSS;
module.exports.detectXSS = detectXSS;
