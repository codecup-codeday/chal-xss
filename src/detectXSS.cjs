// Unfortunately, VM2 only works with CommonJS syntax.
const jsdom = require("jsdom");

const detectXSS = (htmlSnippet, flag) => {
	let output = "";

	const cookieJar = new jsdom.CookieJar();
	cookieJar.setCookieSync(new jsdom.toughCookie.Cookie({key: "flag", value: flag}), "about:blank");

	const virtualConsole = new jsdom.VirtualConsole();
	virtualConsole.on("error", message => output += message)
			.on("warn", message => output += message)
			.on("info", message => output += message)
			.on("log", message => output += message)
			.on("debug", message => output += message)
			.on("table", message => output += message)
			.on("dir", message => output += message)
			.on("dirxml", message => output += message);

	let timeout = false;
	const dom = new jsdom.JSDOM(htmlSnippet, {
			runScripts: "dangerously",
			resources: "usable",
			cookieJar,
			virtualConsole,
			beforeParse(window) {
				window.alert = message => window.console.log(message);
				window.setImmediate = () => {};
				window.setInterval = () => {};
				window.clearImmediate = () => {};
				window.clearInterval = () => {};
				window.clearTimeout = () => {};
				window.setTimeout(() => {timeout = true; window.close()}, 5000);
				window.setTimeout = () => {};
			}
	});

	if (timeout) {
		throw(new Error("Timeout"));
	}
	dom.window.close();
	return output.includes(flag);
}

module.exports = detectXSS;
module.exports.detectXSS = detectXSS;
