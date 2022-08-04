export default function vulnerableHTMLSnippet(user) {
	return `<p>Currently: ${user}</p>
				<form action = "/" method = "POST">
					<input type = "text" name = "search" align = "justify"/><br><br>
					<input type = "submit" value="Search" />
				</form>
				<footer>
					<p><a href="/template">Hint 1</a></p>
					<!-- The following script is MIT Licensed by Tristan Edwards (see https://unpkg.com/sweetalert@2.1.2/LICENSE.md) -->
					<script src="https://unpkg.com/sweetalert@2.1.2/dist/sweetalert.min.js"></script>
 					<button onclick='swal( "Hint 2" ,  "Someone took away our admin privileges! \\n They left us a Xtremely Sus Site and a empty bag of Chips Ahoy. \\n ARRRGG!" )'>Hint 2</button>
				</footer>
				<div style="height: 150px"></div>`
}
