import Koa from "koa";
import path from "path";
import fs from "fs";
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import genWeb from "@srnd/codecup-genericwebsite";
import vulnerableHTMLSnippet from "./vulnerableHTMLSnippet.js";
import { fork } from "child_process";

const childScript = new URL("./detectXSSChild.js", import.meta.url);
const flag = process.env.FLAG || "test";
const seed = process.env.SEED || flag;
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8080;
const tpl = genWeb.randomTemplate(seed);

let requestID = 0n;
let child = fork(childScript);

const runXSSDetect = (body) => {
	return new Promise((resolve, reject) => {
		const currID = (requestID++).toString();
		const exitRecieved = () => {
			reject(new Error("Exited (Sorry, please try again)"));
		};
		const timeout = setTimeout(() => {
			child.off("exit", exitRecieved);
			child.kill();
			child = fork(childScript);
			reject(new Error("Timeout (Please make sure your code runs in under 5 seconds)"));
		}, 7500);
		const flagRecieved = (flagInfo) => {
			if (flagInfo.requestID === currID) {
				clearTimeout(timeout);
				child.off("exit", exitRecieved);
				child.off("message", flagRecieved);
				if (flagInfo.error) {
					reject(new Error(flagInfo.error));
				} else {
					resolve(flagInfo.exploited);
				}
			}
		};
		child.once("exit", exitRecieved);
		child.on("message", flagRecieved);
		child.send({body: body, requestID: currID});
	});
};

const initialPage = vulnerableHTMLSnippet("user");
router.get("/", async (ctx) => {
	ctx.body = tpl("Login", initialPage);
});

router.get("/template", async (ctx) => {
	ctx.body = tpl("hint",fs.readFileSync(new URL("../public/template.html", import.meta.url), "utf8"));
});

router.post("/", async (ctx) => {
	ctx.body = tpl("Login", vulnerableHTMLSnippet(ctx.request.body.search));
	try {
		if (await runXSSDetect(ctx.body)) {
			ctx.cookies.set("flag", flag, {secure: false, httpOnly: false, overwrite: true});
		}
	} catch(err) {
		ctx.body = tpl("Login", vulnerableHTMLSnippet(`<strong>${err}</strong>`));
	}
});

app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on http://0.0.0.0:${port}/`));
