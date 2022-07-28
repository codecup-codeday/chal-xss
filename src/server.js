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
	console.log(ctx.request.body.search);
	ctx.body = tpl('Login',`<p>Currently: ${ctx.request.body.search}</p>
	<form action = "/" method = "POST">
	<input type = "text" name = "search" align = "justify"/><br><br>
	<input type = "submit" value="Search" />
	</form>
	<footer>
  	<p><a href="/template">hint</a></p>
  	</footer>`);

	// TODO: sandbox
	let output = "";
	const virtualConsole = new jsdom.VirtualConsole();
	virtualConsole.on("error", message => output += message);
	virtualConsole.on("warn", message => output += message);
	virtualConsole.on("info", message => output += message);
	virtualConsole.on("log", message => output += message);
	virtualConsole.on("debug", message => output += message);
	virtualConsole.on("table", message => output += message);
	virtualConsole.on("dir", message => output += message);
	virtualConsole.on("dirxml", message => output += message);

	const cookieJar = new jsdom.CookieJar();
	cookieJar.setCookieSync(new jsdom.toughCookie.Cookie({key: "flag", value: flag}), "about:blank");

	const dom = new JSDOM(ctx.body, {
			runScripts: "dangerously",
			resources: "usable",
			virtualConsole,
			cookieJar,
			beforeParse(window) {
				window.alert = message => window.console.log(message);
			}
	});
	dom.window.close();

	console.log(output);

	if (output.includes(flag)) {
		ctx.cookies.set("flag", flag, {secure: false, httpOnly: false, overwrite: true});
	}
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on http://0.0.0.0:${port}/`));
