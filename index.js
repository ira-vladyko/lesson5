'use strict';

const express = require('express');
const ejs = require('ejs');
const user = require('./user');
const products = require('./products');
const fs = require('fs');
const IDENT_SALE = Math.floor(Math.random() * 10);

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	const showcase = user.status === 'anonym' ? [] : getShowcase(user, products);
	const bonuses = user.status === 'newbie' ? getBonuses(user, showcase) : [];

	const pageData = { showcase, bonuses };
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
			res.status(404).send('Not found');
			return;
		}
		const html = ejs.render(data, { ...pageData, user, discount });
		res.status(200).send(html);
	});
});

app.listen(port, () => {
	console.log(`Ready on http://localhost:${port}`);
});

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
