import { NodeVM, VMScript } from "vm2";
import fs from "fs";

const script = new VMScript(fs.readFileSync(new URL("./detectXSS.cjs", import.meta.url), "utf8"));

process.on("message", (data) => {
	const vm = new NodeVM({
		console: "none",
		require: {
			external: ["jsdom"]
		}
	});
	let flagInfo = {requestID: data.requestID};
	try {
		const detectXSS = vm.run(script);
		flagInfo.exploited = detectXSS(data.body);
	} catch (err) {
		flagInfo.error = err.message;
	}
	process.send(flagInfo);
});
