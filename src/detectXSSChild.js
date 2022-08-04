import { NodeVM } from "vm2";

process.on("message", (data) => {
	const vm = new NodeVM({
		console: 'none',
		require: {
			external: true,
		}
	});
	let flagInfo = {requestID: data.requestID};
	try {
		flagInfo.exploited = vm.run(`const {detectXSS} = require("./detectXSS.cjs"); return detectXSS('${data.body.replaceAll(/\n/g, "\\n").replaceAll(/"/g, "\\'")}', "${data.flag}")`);
	} catch (err) {
		flagInfo.error = err.message;
	}
	process.send(flagInfo);
});
