export default function vulnerableHTMLSnippet(user) {
	return `<p>Currently: ${user}</p>
				<form action = "/" method = "POST">
					<input type = "text" name = "search" align = "justify"/><br><br>
					<input type = "submit" value="Search" />
				</form>
				<footer>
					<p><a href="/template">hint</a></p>
				</footer>`
}
