import { NodeVM, VMScript } from "vm2";
import fs from "fs";

const script = new VMScript(fs.readFileSync("./detectXSS.cjs"));

process.on("message", (data) => {
	const vm = new NodeVM({
		console: 'none',
		require: {
			external: ["jsdom"],
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
