const {
	elem,
	K,
	pipe,
	fromMaybe,
	map,
	get,
	chain,
	find,
	filter,
} = require ('sanctuary');

const getListId = listToGetRecipesFrom => pipe([
	get (K (true)) ('lists'),
	map (filter (o => !o.closed)),
	chain (find (o => o.name === listToGetRecipesFrom)),
	chain (get (K (true)) ('id')),
	fromMaybe (''),
]);

const prop = p => o => o[p];
const trace = s => {console.log(s); return s;};
const getUrls = listNames => o => {
	const listIds = map (l => getListId (l) (o)) (listNames)
	return pipe([
		prop ('cards'),
		filter (p => elem (p.idList) (listIds)),
		filter (p => !p.closed),
		chain (prop ('attachments')),
		filter (p => p.mimeType === ''),
		map (prop ('url')),
	]) (o);
};

module.exports = {getUrls};
