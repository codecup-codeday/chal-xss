import jsdom from "jsdom";

export default function detectXSS(htmlSnippet, flag) {
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

	const dom = new jsdom.JSDOM(htmlSnippet, {
			runScripts: "dangerously",
			resources: "usable",
			cookieJar,
			virtualConsole,
			beforeParse(window) {
				window.alert = message => window.console.log(message);
			}
	});
	dom.window.close();

	return output.includes(flag);
}
