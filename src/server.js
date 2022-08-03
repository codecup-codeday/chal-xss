import Koa from "koa";
import path from "path";
import fs from 'fs';
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import genWeb from "@srnd/codecup-genericwebsite";
import vulnerableHTMLSnippet from "./vulnerableHTMLSnippet.js";
import detectXSS from "./detectXSS.js";

const flag = process.env.FLAG || 'test';
const seed = process.env.SEED || flag;
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8080;
const tpl = genWeb.randomTemplate(seed);
app.use(bodyParser());

router.get('/', (ctx) => {
	ctx.body = tpl('Login', vulnerableHTMLSnippet("user"));
});

router.get('/template', (ctx) => {
	ctx.body = tpl('hint',fs.readFileSync(path.join(process.cwd(), "/public", 'template.html'), 'utf8')); // idk if this is needed
});

router.post('/', (ctx) => {
	ctx.body = tpl('Login', vulnerableHTMLSnippet(ctx.request.body.search));

	// TODO: sandbox
	if (detectXSS(ctx.body, flag)) {
		ctx.cookies.set("flag", flag, {secure: false, httpOnly: false, overwrite: true});
	}
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on http://0.0.0.0:${port}/`));
