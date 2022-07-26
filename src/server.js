import Koa from "koa";
import path from "path";
import fs from 'fs';
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import genWeb from "@srnd/codecup-genericwebsite";
import puppeteer from "puppeteer";

const flag = process.env.FLAG || 'test';
const seed = process.env.SEED || flag;
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8080;
const tpl = genWeb.randomTemplate(seed);
const browser = await puppeteer.launch({product: "firefox", executablePath: "/usr/bin/firefox"});
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

router.post('/', async (ctx) => {
	if (ctx.request.body.search.includes("admin")) {
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
	const page = await browser.newPage();
	page.setDefaultTimeout(10000);
	await page.setContent(body, {waitUntil: "domcontentloaded"});
	const elem = await page.$("#user");
	const innerText = await elem.evaluate(el => el.innerText);
	page.close();
	console.log(innerText);
	if (innerText === "admin") {
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
