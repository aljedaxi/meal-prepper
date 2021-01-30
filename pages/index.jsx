import Head from 'next/head'
import sanctuary from 'sanctuary';
import {env as flutureEnv} from 'fluture-sanctuary-types';
import {
	useState,
	createElement as kare,
	Fragment,
} from 'react';
import {resolve, fork, Future, encaseP} from 'fluture'
const {
	fromMaybe,
	chain,
	Left,
	Right,
	parseJson,
	K,
	pipe,
	filter,
	elem,
	concat,
	either,
	map,
} = sanctuary.create ({checkTypes: true, env: sanctuary.env.concat (flutureEnv)})
import {getUrls} from "./trello";
const createElement = e => p => kare(e,p);
const setter = s => e => s(e.target.value);

const ifGood = handleClick => s => ({ 
	children: (
		<Fragment>
			<input aria-label={s} type="checkbox" value={false} onClick={_ => handleClick(s)} />
			{s}
		</Fragment>
	),
	key: s, 
});
const ifBad = handleClick => url => ({ 
	children: (
		<Fragment>
			<input aria-label={url} type="checkbox" value={false} onClick={_ => handleClick(url)} />
			we couldn't get ingredients for <a href={url}>{url}</a>. please get them manually.
		</Fragment>
	),
	key: url 
});

const toAccountForProps = handleUnselect => s => ({
	children: (
		<div onClick={_ => handleUnselect (s)}>
			{s}
		</div>
	),
	key: s
});

const spuditizer = pipe([
	s => s.replace(/ /g, '%20'),
	s => `https://www.spud.ca/catalogue/catalogue.cfm?search=${s}`,
]);

const apothitizer = pipe([
	s => s.replace(/ /g, '+'),
	s => `https://www.the-apothecary.ca/search.asp?keyword=${s}&search=Search`,
]);

const searchers = [
	{searcher: spuditizer, website: 'spud'},
	{searcher: apothitizer, website: 'apothecary'},
];

const searcher = {searcher: spuditizer, website: 'spud'};

const IngredientsList = props => {
  const {ingredients, failedUrls} = props;
  if (ingredients.length === 0) return null;

	const [selecteds, setSelecteds] = useState([]);
	const handleClick = s => setSelecteds(concat ([s]));
	const handleUnselect = s => setSelecteds(filter (x => x !== s));
	const notInSelecteds = e => !elem (e.value) (selecteds);

	const allThings = concat (map (Left) (failedUrls)) (map (Right) (ingredients));
	const toProps = either (ifBad (handleClick)) (ifGood (handleClick));
	const unaccountedForProps = pipe([
		filter (notInSelecteds),
		map (toProps)
	]) (allThings);
	const accountedForProps = map (toAccountForProps (handleUnselect)) (selecteds);

	const handleLink = searcher => {
		const selectionText = window.getSelection().toString();
		if (!selectionText) return;
		window.open(
			searcher (selectionText),
			'tab'
		);
	};

	return (
		<div>
			<h2>Ingredients:</h2>
			<div>
				{searchers.map(({website, searcher}) => (
					<button onClick={_ => handleLink(searcher)}>
						search {website} for selected text
					</button>
				))}
			</div>
			<h3>unaccounted 4:</h3>
			<ul>
				{map (createElement ('li')) (unaccountedForProps)}
			</ul>
			<h3>accounted 4:</h3>
			<ul>
				{map (createElement ('li')) (accountedForProps)}
			</ul>
		</div>
	);
};

const parseIngredients = colName => pipe([
	parseJson (K (true)),
	map (getUrls (colName)),
  fromMaybe ([]),
])

const getIngredientsFromUrls = encaseP(a => 
	fetch('/api/ingredients', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(a)})
		.then(r => r.json())
);

const getFileText = encaseP(e => e.target.files[0].text());
const trace = s => {console.log(s); return s;};
const Uploader = props => {
	const {onSubmit, show} = props;
	if (!show) return null;
	const [{lefts = [], rights = []}, setSetSet] = useState({});
	const [columnName, setColumnName] = useState('this week');
	const [error, setError] = useState();
	const doThing = pipe([
		getFileText,
		map(parseIngredients ([columnName])),
		chain(getIngredientsFromUrls),
	]);
	const handleChange = e => {
		const consume = fork (setError) (setSetSet);
		pipe([doThing, consume]) (e);
	};
	const submitted = rights.length > 0;
	const handleSubmit = e => {
		e.preventDefault();
		if (!submitted) return;
		onSubmit({ingredients: rights, failedUrls: lefts});
	};
	const buttonText = submitted ? `${rights.length ? 'that\'s cool, ' : ''}let's get shopping` : '>~<'
	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor='colname'>what column are your urls in?</label>
			<input type="text" id='colname' value={columnName} onChange={setter(setColumnName)} />
			<label htmlFor='file-upload'>upload a trello json file</label>
			<input type='file' onChange={handleChange} id='file-upload'/>
			{submitted ? (
				<div>
						<p>{lefts.length} urls didn't provide readable ingredient information</p>
						<p>i found {rights.length} ingredients</p>
				</div>
			) : null}
			<button disabled={!submitted} type='submit'>{buttonText}</button>
		</form>
	);
}

const App = props => {
	const [ingredients, setIngredients] = useState([]);
	const [failedUrls, setFailedUrls] = useState([]);

	const handleSubmit = ({failedUrls, ingredients}) => {
		setFailedUrls(failedUrls);
		setIngredients(ingredients);
	};

	return (
		<Fragment>
			<Uploader onSubmit={handleSubmit} show={ingredients.length === 0}/>
			<IngredientsList ingredients={ingredients} failedUrls={failedUrls}/>
		</Fragment>
	);
};

export default App;
