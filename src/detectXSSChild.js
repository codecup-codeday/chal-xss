import detectXSS from "./detectXSS.js";

process.on("message", (data) => {
	process.send({exploited: detectXSS(data.body, data.flag), requestID: data.requestID});
});
