import Koa from "koa";
import path from "path";
import fs from 'fs';
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import genWeb from "@srnd/codecup-genericwebsite";
import jsdom from "jsdom";

const flag = process.env.FLAG || 'test';
const seed = process.env.SEED || flag;
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8080;
const tpl = genWeb.randomTemplate(seed);
const { JSDOM } = jsdom;
app.use(bodyParser());

router.get('/', (ctx) => {
    ctx.body = tpl('Login',`
	<p>Currently: User</p>
	<form action = "/" method = "POST">
	<input type = "text" name = "search" align = "justify"/><br><br>
	<input type = "submit" value="Search" />
	</form>
	<footer>
  	<p><a href="/template">hint</a></p>
  	</footer>`);
});

router.get('/template', (ctx) => {
	ctx.body = tpl('hint',fs.readFileSync(path.join(process.cwd(), "/public", 'template.html'), 'utf8')); // idk if this is needed
});

router.post('/', (ctx) => {
	if (ctx.request.body.search == "admin") {
		ctx.request.body.search = "not admin (nice try)";
	}
	console.log(ctx.request.body.search);
	let body = tpl('Login',`<p>Currently: <span id="user">${ctx.request.body.search}</span></p>
	<form action = "/" method = "POST">
	<input type = "text" name = "search" align = "justify"/><br><br>
	<input type = "submit" value="Search" />
	</form>
	<footer>
  	<p><a href="/template">hint</a></p>
  	</footer>`);
	// TODO: sandbox
	const dom = new JSDOM(body, { runScripts: "dangerously", pretendToBeVisual: true, resources: "usable"});
	if (dom.window.document.getElementById("user").textContent === "admin") {
		body = tpl('Success!',`<p>Currently: <span id="user">${ctx.request.body.search}</span></p>
				<p>Flag: ${flag}</p>
				<form action = "/" method = "POST">
				<input type = "text" name = "search" align = "justify"/><br><br>
				<input type = "submit" value="Search" />
				</form>
				<footer>
				<p><a href="/template">hint</a></p>
				</footer>`);
	}
	ctx.body = body;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on http://0.0.0.0:${port}/`));
