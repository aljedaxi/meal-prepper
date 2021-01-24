const HTML = require('html-parse-stringify2');
const {
	eitherToMaybe,
	sortBy,
	encase,
	maybeToEither,
	chain,
	pipe, 
	pipeK,
	compose,
	K,
	parseJson,
	is,
	find,
	get,
} = require('sanctuary');
const {
	nouns
} = require('./bunchers');
const $ = require ('sanctuary-def');
const parse = s => HTML.parse(s);

const head = a => a[0];
const prop = p => o => o[p];
const filter = f => a => a.filter(f);
const eq = a => b => a === b;

const childWithName = name => pipe([
	prop('children'),
	a => a.find(o => eq (name) (prop('name') (o))),
]);

const getToRecipe = pipe([
	head,
	childWithName ('html'),
	childWithName ('head'),
	compose (filter (o => o?.attrs?.type === 'application/ld+json')) (prop ('children')),
	head,
	prop ('children'),
	head,
	prop ('content'),
	parseJson (K (true)),
]);

const getToIngredients = pipeK([
	get (K (true)) ('@graph'),
	find (o => prop('@type') (o) === 'Recipe'),
	get (is ($.Array ($.String))) ('recipeIngredient'),
]);

const getIngredients = pipe([
	parse,
	encase (getToRecipe),
	eitherToMaybe,
	chain (getToIngredients),
]);

// getIngredientsFromUrl :: String -> Either Array String
const getIngredientsFromUrl = url => 
	fetch(url, {method: 'GET', mode: 'no-cors'})
		.then(r => r.text())
		.then(getIngredients)
		.then(maybeToEither (url));

const getIngredientsFromUrls = a =>
	Promise.all(a.map(getIngredientsFromUrl));

module.exports = {getIngredientsFromUrls};
