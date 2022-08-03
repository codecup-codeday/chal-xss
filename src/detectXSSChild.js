import { NodeVM } from "vm2";

process.on("message", (data) => {
	const vm = new NodeVM({
		console: 'none',
		require: {
			external: true,
		}
	});
	process.send({exploited: vm.run(`const {detectXSS} = require("./detectXSS.cjs"); return detectXSS('${data.body.replaceAll(/\n/g, "\\n").replaceAll(/"/g, "\\'")}', "${data.flag}")`), requestID: data.requestID});
});
