// Unfortunately, VM2 only works with CommonJS syntax.
const jsdom = require("jsdom");

const detectXSS = (htmlSnippet) => {
	let output = "";

	let timeout = false;
	let cookieAccessed = false;
	const dom = new jsdom.JSDOM(htmlSnippet, {
			runScripts: "dangerously",
			resources: "usable",
			beforeParse(window) {
				window.Object.defineProperty(window.document, "cookie", {
					get: function () {
						cookieAccessed = true;
						window.close();
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
	console.log(cookieAccessed);
	if (cookieAccessed) {
		return true;
	}
	if (timeout) {
		throw(new Error("Timeout"));
	}
	dom.window.close();
	return false;
}

module.exports = detectXSS;
module.exports.detectXSS = detectXSS;
