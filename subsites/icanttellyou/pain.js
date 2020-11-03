function getStylesheet() {
	today = new Date();
	dd = today.getDate();
	mm = today.getMonth() + 1;
	yy = today.getFullYear();
	random = Math.floor(Math.random() * 100);
	if (04 == mm && 20 == dd) {
		if (random == 69) {
			document.write("<link rel='stylesheet' href='pain.net.css'>");
		}
	}
}
getStylesheet();