import {getIngredientsFromUrls} from '../getters';
import {isLeft, reduce,
	pipe, map,
	sortBy,
} from 'sanctuary';
import {nouns} from '../bunchers';

const uniq = a => [...new Set(a)];
const sortIntoLeftsAndRights = ({lefts, rights}) => e =>
	isLeft (e) ? {lefts: [...lefts, e.value], rights} : {rights: [...rights, ...e.value], lefts};

export default (req, res) => {
	const urls = req.body;
	const doAllTheStuff = pipe([
		reduce (sortIntoLeftsAndRights) ({lefts: [], rights: []}),
		map (uniq),
		map (sortBy (nouns)),
	]);
	getIngredientsFromUrls (urls)
		.then(doAllTheStuff)
		.then(json => res.status(200).json(json));
};
