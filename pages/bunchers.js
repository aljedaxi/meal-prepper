const {
	pipe,
	toLower,
	head,
	fromMaybe,
	equals,
	fst,
	concat,
	Pair,
	snd,
	filter,
	zip,
	words,
	compose,
	isJust,
	reject,
	map,
	splitOn,
	elem,
	parseFloat,
	reduce,
	show,
} = require ('sanctuary');

const testData = [
  '1 pound red potatoes (about 3 large), cut into 1-inch cubes',
  '5 medium carrots, cut on the bias into 1-inch pieces',
  '2 tablespoons olive oil',
  '1 1/2 cups vegetable broth or water',
  '1 cup French green lentils or regular brown lentils, picked through to remove debris and rinsed',
  '1 bay leaf, optional',
  '1 1/2 cup fresh parsley, gently packed',
  '1 lemon, zested and juiced',
  '4 garlic cloves, roughly chopped',
  '1 3/4 teaspoon white miso',
  'Pinch red pepper flakes',
  '3 to 4 tablespoons olive oil',
  'Freshly ground black pepper and salt, to taste',
  '9 oz baby carrots ((about 250 g))',
  '9 oz baby onions ((about 250 g))',
  '1 ¾ lb mushrooms (cut into chunky pieces (I used chestnut-mushrooms &amp; mini-portobellos) (about 850 g))',
  '1 cup vegetable stock ((about 250 ml))',
  '¾ cup red wine ((about 185 ml))',
  '2 tbsp tomato puree or paste',
  '1  small bunch fresh-thyme',
  '2  bay leaves',
  'black pepper',
  '4 cloves garlic (minced)',
  '1 tbsp oil'
];

const units = ['cup', 'pound', 'small', 'medium', 'baby', 'oz', 'g', 'pinch', 'fresh', 'teaspoon', 'tablespoon', 'tsp', 'tbsp', 'lb', 'pinch'];
const elemOf = xs => x => elem (x) (xs);
const canParseFloat = compose (isJust) (parseFloat);
const removeFluff = s => s.split(',')[0];
const rejectIfAny = fs => reject(a => fs.some(f => f(a)));
const containsAnyOfTheFollowingCharacters = cs => pipe([
	splitOn (''), 
	a => cs.some(c => elem (c) (a))
]);
const getNouns = pipe([
	removeFluff,
	words,
	rejectIfAny ([
		elemOf (units), 
		canParseFloat, 
		containsAnyOfTheFollowingCharacters (['/', '(', ')']),
	]),
]);
const getUnits = pipe([
	words,
	filter (w => elemOf (units) (w) || canParseFloat (w)),
]);

// you can try to find the nouns in the word, and group anything that has similar nouns
const nounsEqual = x => y => equals (show (nouns (x))) (show (nouns (y)));
const anyIntersect = x => y => x.some (xs => elem (xs) (y)) || y.some (ys => elem (ys) (x));
// const bunchIngredients = pipe([
// 	a => zip (map (getNouns) (a)) (map (getUnits) (a)),
// 	both => both.reduce ((xs, x) => {
// 		let collectedIngredient = snd (x);
// 		both.forEach(b => {
// 			if (nounsEqual (b) (x)) return;
// 			if (anyIntersect (nouns (b)) (nouns (x))) {
// 				collectedIngredient = concat (ingredients (b)) (collectedIngredient);
// 			}
// 		});
// 		return [...xs, Pair (nouns (x)) (collectedIngredient)];
// 	}, [])
// ]);

const nouns = pipe([ 
	getNouns,
	head,
	map (toLower),
	fromMaybe (''),
]);

module.exports = {nouns};
