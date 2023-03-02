'use strict';

const http = require('http');
const user = require('./user');
const fs = require('fs')
const ejs = require('ejs');
const products = require('./products');
const IDENT_SALE = Math.floor(Math.random() * 10);

function getShowcase(user, products) {
	return products.map((product) => {
		const showcaseItem = {
			name: product.name
		};

		if (product.sale) {
			showcaseItem.price = product.price * (100 - product.sale) / 100;
		} else {
			showcaseItem.price = product.price;
		}
		if (user.status === 'ident') {
			showcaseItem.price = showcaseItem.price * (100 - IDENT_SALE) / 100;
		}

		return showcaseItem;
	});
}

function getBonuses(user, showcase) {
	const random = Math.floor(Math.random() * showcase.length);
	const randomProduct = showcase[random];

	return [randomProduct];
}

http.createServer((req, res) => {
	const showcase = user.status === 'anonym' ? [] : getShowcase(user, products);
	const bonuses = user.status === 'newbie' ? getBonuses(user, showcase) : [];

	const pageData = { showcase, bonuses };
	//console.log(pageData)
	let discount;
	switch (user.status) {
		case 'ident':
			discount = 5;
			break;
		case 'newbie':
			discount = 0;
			break;
		default:
			discount = 0;
	}
	fs.readFile('./index.ejs', 'utf8', (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.write('Not found');
			res.end();
			return;
		}
		const html = ejs.render(data, { ...pageData, user, discount })
		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
		res.write(html);
		res.end();
	})

}).listen(3000, () => {
	console.log('Ready on http://localhost:3000');
});
