import Koa from "koa";
import path from "path";
import fs from 'fs';
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import genWeb from "@srnd/codecup-genericwebsite";
import vulnerableHTMLSnippet from "./vulnerableHTMLSnippet.js";
import { fork } from "child_process";

const flag = process.env.FLAG || 'test';
const seed = process.env.SEED || flag;
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8080;
const tpl = genWeb.randomTemplate(seed);
let requestID = 0n;

const launchXSSDetect = () => {
	return fork("detectXSSChild.js");
};
let child = launchXSSDetect();

const runXSSDetect = (body, flag) => {
	return new Promise((resolve, reject) => {
		const currID = (requestID++).toString();
		const exitRecieved = () => {
			reject(new Error("Exited"));
		};
		const timeout = setTimeout(() => {
			child.off("exit", exitRecieved);
			child.kill();
			child = launchXSSDetect();
			reject(new Error("Timeout"));
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
		child.send({body: body, flag: flag, requestID: currID});
	});
};

app.use(bodyParser());

router.get('/', async (ctx) => {
	ctx.body = tpl('Login', vulnerableHTMLSnippet("user"));
});

router.get('/template', async (ctx) => {
	ctx.body = tpl('hint',fs.readFileSync(path.join(process.cwd(), "/public", 'template.html'), 'utf8')); // idk if this is needed
});

router.post('/', async (ctx) => {
	ctx.body = tpl('Login', vulnerableHTMLSnippet(ctx.request.body.search));
	try {
		if (await runXSSDetect(ctx.body, flag)) {
			ctx.cookies.set("flag", flag, {secure: false, httpOnly: false, overwrite: true});
		}
	} catch(err) {
		ctx.body = tpl('Login', vulnerableHTMLSnippet(`<strong>${err}</strong>`));
	}
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on http://0.0.0.0:${port}/`));
