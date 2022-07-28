import Koa from "koa";
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

let browser;
const launchCrashResistant = async () => {
	browser = await puppeteer.launch({product: "firefox", executablePath: "/usr/bin/firefox"});
	browser.on("disconnected", () => {
		if (browser.process()) {
			browser.process().kill();
		}
		launchCrashResistant();
	});
};
await launchCrashResistant();

app.use(bodyParser());

router.get('/', (ctx) => {
    ctx.body = tpl('Login',`
	<p>Currently: User</p>
	<form action = "/" method = "POST">
	<input type = "text" name = "search" align = "justify"/><br><br>
	<input type = "submit" value="Search" />
	</form>
	<footer>
	<div style="height: 50px"></div>
	<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <button onclick='swal( "Hint" ,  "Someone took away our admin privileges! Help us get them back." )'>hint</button>
  	</footer>`);
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
	<div style="height: 50px"></div>
	<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <button onclick='swal( "Hint" ,  "Someone took away our admin privileges! Help us get them back." )'>hint</button>
  	</footer>`);
	const page = await browser.newPage();
	page.setDefaultTimeout(5000);
	await page.setContent(body, {waitUntil: "domcontentloaded"});
	const elems = await page.$$("#user");
	if (elems.length !== 1) {
		body = tpl('Login',`<p>ERROR: There must be exactly one element with ID user.</p>
				<p>Flag: ${flag}</p>
				<form action = "/" method = "POST">
				<input type = "text" name = "search" align = "justify"/><br><br>
				<input type = "submit" value="Search" />
				<footer>
				<div style="height: 50px"></div>
				<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    			<button onclick='swal( "Hint" ,  "Someone took away our admin privileges! Help us get them back." )'>hint</button>
				</footer>`);
		page.close();
	} else {
		const innerText = await elems[0].evaluate(el => el.innerText);
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
					<div style="height: 50px"></div>
					<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    				<button onclick='swal( "Hint" ,  "Someone took away our admin privileges! Help us get them back." )'>hint</button>
					</footer>`);
		}
	}
	ctx.body = body;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log(`Listening on http://0.0.0.0:${port}/`));
